import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../reducers/store";
import VideoCard from "../../components/VideoCard";
import {
  fetchVideosForPublic,
  getSearchResults,
  selectPublicVideos,
  selectSearchResults,
  selectVideoLoading,
} from "../../reducers/video/videoReducer";
import Skeleton from "react-loading-skeleton";

const AllVideos = () => {
  const [query, setQuery] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const searchResults = useSelector(selectSearchResults);
  const publicVideos = useSelector(selectPublicVideos);
  const isLoading = useSelector(selectVideoLoading);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (searchTerm) {
      dispatch(getSearchResults(searchTerm));
    }
    dispatch(fetchVideosForPublic());
  }, [searchTerm, dispatch]);

  const handleSearch = () => {
    setSearchTerm(query);
  };

  return (
    <Layout>
      <div className="w-full p-6 flex flex-col items-center">
        <main className="w-full max-w-6xl">
          <div className="w-full flex justify-center my-6">
            <div className="w-full max-w-2xl flex items-center gap-3">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search videos"
                className="flex-1 rounded-full px-5 py-3 text-lg bg-gray-50 border border-gray-300 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-300"
                aria-label="Search videos"
              />
              <button
                onClick={handleSearch}
                className="rounded-full px-6 py-3 text-lg font-medium bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 active:scale-[0.99] transition"
              >
                Search
              </button>
            </div>
          </div>

          <div className="mt-7">
            {searchTerm ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults?.map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>
            ) : isLoading ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(8)].map((_, index) => (
                  <Skeleton
                    key={index}
                    height={300}
                    width={200}
                    className="rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {publicVideos?.map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default AllVideos;
