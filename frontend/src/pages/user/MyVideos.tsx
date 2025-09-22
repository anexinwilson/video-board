// Auth-only listing of the user's own videos.
// Uses a ref to prevent duplicate fetches caused by React strict/dev behaviors.
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVideosForUser,
  selectUserVideos,
  selectVideoLoading,
} from "../../reducers/video/videoReducer";
import { useConfig } from "../../customHooks/useConfigHook";
import type { AppDispatch } from "../../reducers/store";
import SideBar from "../../components/SideBar";
import VideoCard from "../../components/VideoCard";
import Loader from "../../components/Loader";
import { FaPlay, FaCloudUploadAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const MyVideos = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { configWithJWT } = useConfig();
  const isLoading = useSelector(selectVideoLoading);
  const videos = useSelector(selectUserVideos);

  const didFetchRef = useRef(false);

  useEffect(() => {
    if (configWithJWT && !didFetchRef.current) {
      didFetchRef.current = true;
      dispatch(fetchVideosForUser({ configWithJwt: configWithJWT }));
    }
  }, [dispatch, configWithJWT]);

  const hasVideos = (videos?.length || 0) > 0;

  return (
    <div className="flex w-full gap-2">
      <SideBar />
      <main className="flex-1 lg:ml-64">
        <section className="p-4 mt-3">
          {isLoading ? (
            <Loader />
          ) : hasVideos ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="p-2 bg-blue-100 rounded-xl">
                    <FaPlay className="text-blue-600 text-lg" />
                  </span>
                  My Videos
                </h2>
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {videos!.length} total
                </span>
              </div>

              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {videos!.map((video) => (
                  <div
                    key={video._id}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
                  >
                    <VideoCard
                      video={video}
                      showEdit
                      configWithJWT={configWithJWT}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            // Empty state with a gentle nudge to upload
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10 text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-100">
                <FaCloudUploadAlt className="text-blue-600 text-2xl" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-gray-900">
                You haven’t uploaded any videos yet
              </h3>
              <p className="mt-2 text-gray-600">
                Upload your first video and it will appear here. You can edit,
                share, and track views and downloads.
              </p>
              <div className="mt-6">
                <Link
                  to="/user/upload"
                  className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  Upload a video
                </Link>
              </div>

              {/* Quick benefits */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="font-semibold text-gray-800">
                    High quality playback
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Smooth, on-demand streaming.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="font-semibold text-gray-800">Easy sharing</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Copy a link or open the video page.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="font-semibold text-gray-800">
                    Track performance
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Views update automatically.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MyVideos;
