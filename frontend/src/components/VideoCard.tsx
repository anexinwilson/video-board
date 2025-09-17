import React from "react";
import { useDispatch } from "react-redux";
import { deleteVideo, type IVideo } from "../reducers/video/videoReducer";
import parse from "html-react-parser";
import { FaDownload } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import MuxPlayer from "@mux/mux-player-react";
import type { ConfigWithJWT } from "../types";

interface Props {
  video: IVideo;
  showEdit?: boolean;
  configWithJWT?: ConfigWithJWT; // Add this prop for delete functionality
}

const VideoCard = ({ video, showEdit, configWithJWT }: Props) => {
  const dispatch = useDispatch();

  const handleShare = () => {
    const url = `http://localhost:5173/video/${video._id}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Link copied"));
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(video.path, { mode: "cors" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${video.title || "video"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error("Download failed");
    }
  };

  const handleDelete = async () => {
    if (!configWithJWT) {
      toast.error("Authentication required");
      return;
    }
    
    try {
      await dispatch(deleteVideo({ id: video._id, configWithJWT }) as any);
      toast.success("Video deleted successfully");
    } catch (error) {
      toast.error("Failed to delete video");
    }
  };

  const uploaderName =
    (video as any)?.uploadedBy?.name?.trim() ||
    ((video as any)?.uploadedBy?.email ? "Unknown" : "Unknown");

  return (
    <div className=" flex flex-col gap-2 bg-white rounded-md m-2">
      <div className="w-full overflow-hidden rounded-md" style={{ aspectRatio: "16/9" }}>
        <MuxPlayer
          src={video.path}
          poster={video.thumbNail || undefined}
          streamType="on-demand"
          preload="metadata"
          playsInline
          crossOrigin="anonymous"
          primaryColor="#e5e7eb"
          secondaryColor="#111827"
          accentColor="#2563eb"
          style={{ width: "100%", height: "100%" }}
          onError={() => toast.error("Could not play this video.")}
        />
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex gap-2">
          <Link
            to={`/video/${video._id}`}
            className="text-xs bg-black/70 text-white px-2 py-1 rounded hover:bg-black"
          >
            Open
          </Link>
          <button
            onClick={handleShare}
            className="text-xs bg-black/70 text-white px-2 py-1 rounded hover:bg-black"
          >
            Share
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 text-xs bg-black/70 text-white px-2 py-1 rounded hover:bg-black"
            title="Download"
          >
            <FaDownload /> Download
          </button>
          {showEdit && (
            <>
              <Link
                to={`/video/${video._id}/edit`}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
              >
                Edit
              </Link>
              {configWithJWT && (
                <button
                  onClick={handleDelete}
                  className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="px-2 pb-2">
        <h2 className="text-lg font-semibold">{video.title}</h2>
        <div className="flex justify-between items-center">
          <div className="text-gray-600 text-xs">
            {video?.description ? <p>{parse(video.description.substring(0, 100))}</p> : <p>default</p>}
            <p className="text-[11px] text-gray-500 mt-1">by {uploaderName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;