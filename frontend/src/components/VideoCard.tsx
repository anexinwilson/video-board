import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteVideo, setEditVideo, type IVideo } from "../reducers/video/videoReducer";
import parse from "html-react-parser";
import { FaDownload } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import MuxPlayer from "@mux/mux-player-react";
import type { ConfigWithJWT } from "../types";
import backendApi from "../api/backendApi";
import { selectLoggedInUser } from "../reducers/auth/authReducer";

interface Props {
  video: IVideo;
  showEdit?: boolean;
  configWithJWT?: ConfigWithJWT;
}

const VideoCard = ({ video, showEdit, configWithJWT }: Props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loggedInUser = useSelector(selectLoggedInUser);

  const handleShare = () => {
    const url = `http://localhost:5173/video/${video._id}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Link copied"));
  };

  const handleDownload = async () => {
    try {
      backendApi.post(`/api/v1/video/${video._id}/track-download`, {
        userId: (loggedInUser as any)?._id,
      }).catch(() => {});
      const res = await fetch(video.path, { mode: "cors" });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (video.title || "video") + ".mp4";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed");
    }
  };

  const handleVideoEdit = () => {
    dispatch(setEditVideo(video));
    navigate("/user/edit/my-video");
  };

  const handleDelete = async () => {
    if (!configWithJWT) return toast.error("Authentication required");
    try {
      await dispatch(deleteVideo({ id: video._id, configWithJWT }) as any);
      toast.success("Video deleted successfully");
    } catch {
      toast.error("Failed to delete video");
    }
  };

  const uploaderName =
    (video as any)?.uploadedBy?.name?.trim() ||
    ((video as any)?.uploadedBy?.email ? "Unknown" : "Unknown");

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="w-full aspect-video overflow-hidden">
        <MuxPlayer
          src={video.path}
          poster={video.thumbNail || undefined}
          streamType="on-demand"
          preload="metadata"
          playsInline
          crossOrigin="anonymous"
          className="w-full h-full"
          onError={() => toast.error("Could not play this video.")}
        />
      </div>

      <div className="flex items-center gap-2 px-2 py-1">
        <Link to={`/video/${video._id}`} className="text-xs bg-black/70 text-white px-2 py-1 rounded">Open</Link>
        <button onClick={handleShare} className="text-xs bg-black/70 text-white px-2 py-1 rounded">Share</button>
        <button onClick={handleDownload} className="flex items-center gap-1 text-xs bg-black/70 text-white px-2 py-1 rounded" title="Download">
          <FaDownload /> Download
        </button>
        {showEdit && (
          <>
            <button onClick={handleVideoEdit} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Edit</button>
            {configWithJWT && (
              <button onClick={handleDelete} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Delete</button>
            )}
          </>
        )}
      </div>

      <div className="px-2 pb-3 mt-auto">
        <h2 className="text-base font-semibold line-clamp-2">{video.title}</h2>
        <div className="text-gray-600 text-xs">
          <div className="line-clamp-2">
            {video?.description ? <>{parse((video.description as string).substring(0, 140))}</> : "default"}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">by {uploaderName} • {(video as any).viewCount ?? 0} views</p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
