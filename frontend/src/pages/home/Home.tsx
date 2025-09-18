import React, { useEffect, useState, useMemo } from "react";
import Layout from "../../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVideosForPublic,
  getSearchResults,
  selectPublicVideos,
  selectSearchResults,
  selectVideoLoading,
} from "../../reducers/video/videoReducer";
import type { AppDispatch } from "../../reducers/store";
import VideoCard from "../../components/VideoCard";
import Skeleton from "react-loading-skeleton";
import { FaSearch, FaPlay, FaCalendar, FaChevronDown, FaChevronUp } from "react-icons/fa";

const Home = () => {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMoreVideos, setShowMoreVideos] = useState(false);

  const publicVideos = useSelector(selectPublicVideos);
  const searchResults = useSelector(selectSearchResults);
  const isLoading = useSelector(selectVideoLoading);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => { dispatch(fetchVideosForPublic()); }, [dispatch]);
  useEffect(() => { if (searchTerm) dispatch(getSearchResults(searchTerm)); }, [searchTerm, dispatch]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearchTerm(query.trim()); };
  const clearSearch = () => { setQuery(""); setSearchTerm(""); };

  const { displayVideos, recentVideos, remainingVideos } = useMemo(() => {
    const videos = searchTerm && searchResults ? searchResults : publicVideos || [];
    if (searchTerm) return { displayVideos: videos, recentVideos: [], remainingVideos: [] };
    const sortedByDate = [...videos].sort((a, b) => new Date((b as any)._id).getTime() - new Date((a as any)._id).getTime());
    const displayCount = showMoreVideos ? videos.length : 20;
    return { displayVideos: videos.slice(0, displayCount), remainingVideos: videos.slice(20), recentVideos: sortedByDate.slice(0, 8) };
  }, [publicVideos, searchResults, searchTerm, showMoreVideos]);

  const VideoGridSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton height={160} className="rounded-xl" />
          <Skeleton height={16} width="90%" />
          <Skeleton height={12} width="70%" />
        </div>
      ))}
    </div>
  );

  return (
    <Layout>
      <style>{`
        .home mux-player::part(fullscreen-button),
        .home mux-player [part~="fullscreen-button"] { display: none !important; }
        .home mux-player { --fullscreen-button: none !important; }
      `}</style>

      <div className="min-h-screen bg-gray-50 home">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-xl"><FaPlay className="text-blue-600 text-xl" /></div>
                {searchTerm ? `Search Results` : "All Videos"}
              </h2>
            </div>

            {isLoading ? (
              <VideoGridSkeleton />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                {displayVideos.map((video) => (
                  <div key={video._id} className="h-full">
                    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg h-full">
                      <VideoCard video={video as any} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!searchTerm && remainingVideos.length > 0 && (
              <div className="text-center">
                <button
                  onClick={() => setShowMoreVideos(!showMoreVideos)}
                  className="px-8 py-4 bg-white border rounded-xl"
                >
                  {showMoreVideos ? "Show Less" : `Show More (${remainingVideos.length})`}
                </button>
              </div>
            )}
          </div>

          {!searchTerm && recentVideos.length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-100 rounded-xl"><FaCalendar className="text-green-600 text-2xl" /></div>
                <h2 className="text-2xl font-bold">Recently Added</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {recentVideos.slice(0, 6).map((video) => (
                  <VideoCard key={(video as any)._id} video={video as any} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
