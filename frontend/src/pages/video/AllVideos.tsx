import React, { useEffect } from "react";
import Layout from "../../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../reducers/store";
import VideoCard from "../../components/VideoCard";
import {
  fetchVideosForPublic,
  selectPublicVideos,
} from "../../reducers/video/videoReducer";

const AllVideos: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const publicVideos = useSelector(selectPublicVideos);

  useEffect(() => {
    dispatch(fetchVideosForPublic());
  }, [dispatch]);

  return (
    <Layout>
      <div className="w-full p-4">
        <main className="w-[95vw]">
          <div className="mt-7">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              {publicVideos?.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default AllVideos;
