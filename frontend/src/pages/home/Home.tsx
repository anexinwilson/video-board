// Public landing page with search, "all videos", and a "recent" strip.
// All data comes from the video slice thunks to keep components dumb.
import React, { useEffect, useMemo, useState } from "react";
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

  // Initial fetch for public videos.
  useEffect(() => {
    dispatch(fetchVideosForPublic());
  }, [dispatch]);

  // Client-side search across the combined list (see slice).
  useEffect(() => {
    if (searchTerm) dispatch(getSearchResults(searchTerm));
  }, [searchTerm, dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch(e as any);
  };

  const clearSearch = () => {
    setQuery("");
    setSearchTerm("");
  };

  // Compute which videos to show and the "recent" subset.
  const { displayVideos, recentVideos, remainingVideos } = useMemo(() => {
    const videos = searchTerm && searchResults ? searchResults : publicVideos || [];
    if (searchTerm) return { displayVideos: videos, recentVideos: [], remainingVideos: [] };

    const sortedByDate = [...videos].sort(
      (a, b) => new Date((b as any)._id).getTime() - new Date((a as any)._id).getTime()
    );

    const displayCount = showMoreVideos ? videos.length : 20;
    return {
      displayVideos: videos.slice(0, displayCount),
      remainingVideos: videos.slice(20),
      recentVideos: sortedByDate.slice(0, 8),
    };
  }, [publicVideos, searchResults, searchTerm, showMoreVideos]);

  // Simple skeleton to avoid layout shift while loading.
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
      {/* Hide fullscreen button ONLY on Home (static CSS override) */}
      <style>{`
        .home-page mux-player::part(fullscreen-button),
        .home-page mux-player [part~="fullscreen-button"] { display: none !important; }
        .home-page mux-player { --fullscreen-button: none !important; }
      `}</style>

      <div className="min-h-screen bg-gray-50 home-page">
        {/* Hero + Search */}
        <div className="bg-white shadow-sm">
          <div className="max-w-[1400px] mx-auto px-6 py-12">
            <div className="text-center mb-10">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">Discover Amazing Videos</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Explore our collection of high-quality videos from creators around the world
              </p>
            </div>

            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="relative flex items-center gap-4">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search for videos, topics, creators..."
                    className="w-full pl-16 pr-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all bg-gray-50 focus:bg-white shadow-sm focus:shadow-lg"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl font-bold"
                      aria-label="Clear"
                      title="Clear"
                    >
                      ×
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="px-10 py-5 bg-blue-600 text-white font-semibold text-lg rounded-2xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  Search
                </button>
              </div>
            </form>

            {searchTerm && (
              <div className="mt-6 text-center">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-blue-100 text-blue-800 font-medium">
                  Showing results for: "{searchTerm}"
                  <button onClick={clearSearch} className="ml-3 hover:text-blue-900 font-bold">
                    ×
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Lists */}
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          {/* All / Search Results */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <FaPlay className="text-blue-600 text-xl" />
                </div>
                {searchTerm ? `Search Results` : "All Videos"}
              </h2>

              {!searchTerm && (displayVideos?.length ?? 0) > 0 && (
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                  Showing {displayVideos.length} of {publicVideos?.length || 0}
                </span>
              )}
            </div>

            {isLoading ? (
              <VideoGridSkeleton />
            ) : displayVideos.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                  {displayVideos.map((video) => (
                    <div key={video._id} className="h-full">
                      <div className="group h-full transition-transform duration-200 hover:scale-105">
                        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg h-full">
                          <VideoCard video={video as any} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {!searchTerm && remainingVideos.length > 0 && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowMoreVideos(!showMoreVideos)}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-md hover:shadow-lg"
                    >
                      {showMoreVideos ? (
                        <>
                          <FaChevronUp className="text-lg" /> Show Less
                        </>
                      ) : (
                        <>
                          <FaChevronDown className="text-lg" /> Show More ({remainingVideos.length} more videos)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="text-8xl mb-6">🎬</div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-3">
                  {searchTerm ? "No videos found" : "No videos available"}
                </h3>
                <p className="text-gray-500 text-lg">
                  {searchTerm ? "Try adjusting your search terms" : "Check back later for new content"}
                </p>
              </div>
            )}
          </div>

          {/* Recently Added */}
          {!searchTerm && recentVideos.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-green-100 rounded-xl">
                  <FaCalendar className="text-green-600 text-2xl" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Recently Added</h2>
                  <p className="text-gray-600 text-lg">Fresh content from our creators</p>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton height={160} className="rounded-xl" />
                      <Skeleton height={16} width="90%" />
                      <Skeleton height={12} width="70%" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {recentVideos.slice(0, 6).map((video) => (
                    <div key={(video as any)._id} className="h-full">
                      <div className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md h-full">
                        <VideoCard video={video as any} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
