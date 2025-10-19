// Public video details page.
// Fetches video, tracks a view once per mount, allows download.
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { IVideo } from "../../reducers/video/videoReducer";
import backendApi from "../../api/backendApi";
import { toast } from "sonner";
import Layout from "../../components/Layout";
import parse from "html-react-parser";
import { FaDownload } from "react-icons/fa";
import MuxPlayer from "@mux/mux-player-react";
import { useSelector } from "react-redux";
import { selectLoggedInUser } from "../../reducers/auth/authReducer";

type SingleFileResponse = { success: boolean; message: string; video?: IVideo };

function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<IVideo | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const playerRef = useRef<any>(null);
  const loggedInUser = useSelector(selectLoggedInUser);
  const hasTrackedViewRef = useRef(false);

  // Load video payload (auth optional)
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
        const { data } = await backendApi.get<SingleFileResponse>(`/api/v1/video/${id}`, cfg);
        if (data.success && data.video) setVideo(data.video);
        else toast.error(data.message || "Failed to fetch video");
      } catch {
        toast.error("Failed to fetch video");
      } finally {
        setLoading(false);
      }
    };
    if (id) run();
  }, [id]);

  // Increment view count once (best-effort)
  useEffect(() => {
    if (id && !hasTrackedViewRef.current) {
      hasTrackedViewRef.current = true;
      backendApi.post(`/api/v1/video/${id}/track-view`).catch(() => {});
    }
  }, [id]);

  const handleDownload = async () => {
    if (!video) return;
    try {
      setIsDownloading(true);

      // Fire-and-forget server metric
      backendApi
        .post(`/api/v1/video/${video._id}/track-download`, { userId: (loggedInUser as any)?._id })
        .catch(() => {});

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
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) return <p className="text-lg text-center">Loading....</p>;
  if (!video)
    return (
      <Layout>
        <div className="p-6">No video found.</div>
      </Layout>
    );

  const views = (video as any)?.viewCount ?? 0;

  return (
    <Layout>
      <div className="p-4">
        <div className="relative max-w-5xl mx-auto">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
            <MuxPlayer
              ref={playerRef}
              src={video.path}
              poster={video.thumbNail || undefined}
              streamType="on-demand"
              preload="metadata"
              playsInline
              crossOrigin="anonymous"
              className="w-full h-full"
              onError={() => toast.error("Could not play this video.")}
            />
            <button
              className={`absolute bottom-13 right-4 z-10 bg-green-500 text-white p-3 rounded-full shadow ${
                isDownloading ? "opacity-60 cursor-not-allowed" : ""
              }`}
              onClick={handleDownload}
              disabled={isDownloading}
              aria-label="Download"
              title="Download"
            >
              <FaDownload className="text-xl" />
            </button>
          </div>

          <div className="mt-4 px-1">
            <h1 className="text-2xl font-bold break-words">{video.title}</h1>
            <div className="text-sm text-gray-500 mt-1">
              {views} {views === 1 ? "view" : "views"}
            </div>
            <div className="text-gray-600 mt-2 text-sm">
              {video.description ? parse(video.description.substring(0, 300)) : "Default description"}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default VideoPage;
