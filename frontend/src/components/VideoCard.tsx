import React from "react";
import { useDispatch } from "react-redux";
import { deleteVideo, setEditVideo, type IVideo } from "../reducers/video/videoReducer";
import parse from "html-react-parser";
import { FaDownload } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import MuxPlayer from "@mux/mux-player-react";
import type { ConfigWithJWT } from "../types";

interface Props {
  video: IVideo;
  showEdit?: boolean;
  configWithJWT?: ConfigWithJWT;
}

const VideoCard = ({ video, showEdit, configWithJWT }: Props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleShare = () => {
    const url = `http://localhost:5173/video/${(video as any)._id}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Link copied"));
  };

  const handleDownload = async () => {
    try {
      const response = await fetch((video as any).path, { mode: "cors" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${(video as any).title || "video"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error("Download failed");
    }
  };

  const handleVideoEdit = () => {
    dispatch(setEditVideo(video) as any);
    navigate("/user/edit/my-video");
  };

  const handleDelete = async () => {
    if (!configWithJWT) {
      toast.error("Authentication required");
      return;
    }
    try {
      await dispatch(deleteVideo({ id: (video as any)._id, configWithJWT }) as any);
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
      {/* Media: consistent 16:9 area */}
      <div className="w-full aspect-video overflow-hidden">
        <MuxPlayer
          src={(video as any).path}
          poster={(video as any).thumbNail || undefined}
          streamType="on-demand"
          preload="metadata"
          playsInline
          crossOrigin="anonymous"
          primaryColor="#e5e7eb"
          secondaryColor="#111827"
          accentColor="#2563eb"
          className="w-full h-full"
          onError={() => toast.error("Could not play this video.")}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex gap-2">
          <Link
            to={`/video/${(video as any)._id}`}
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
              <button
                onClick={handleVideoEdit}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
              >
                Edit
              </button>
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

      {/* Text content */}
      <div className="px-2 pb-3 mt-auto">
        <h2 className="text-base font-semibold line-clamp-2">{(video as any).title}</h2>
        <div className="flex justify-between items-center">
          <div className="text-gray-600 text-xs">
            {/* Clamp to prevent tall cards from long descriptions */}
            <div className="line-clamp-2">
              {(video as any)?.description ? (
                <>{parse(((video as any).description as string).substring(0, 140))}</>
              ) : (
                "default"
              )}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">by {uploaderName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
