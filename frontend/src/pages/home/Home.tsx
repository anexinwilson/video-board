// src/pages/Home.tsx
import React, { useEffect } from "react";
import Layout from "../../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVideosForPublic,
  selectPublicVideos,
  selectVideoLoading,
} from "../../reducers/video/videoReducer";
import type { AppDispatch } from "../../reducers/store";
import VideoSlider from "../../components/Slider";
import Skeleton from "react-loading-skeleton";

const Home = () => {
  const publicVideos = useSelector(selectPublicVideos);
  const isLoading = useSelector(selectVideoLoading);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchVideosForPublic());
  }, [dispatch]);

  return (
    <Layout>
      <main className="w-[95vw]">
        <h2 className="capitalize text-textTwo text-lg sm:text-2xl md:text-3xl lg:text-4xl mt-2 p-4">
          Recently Added
        </h2>
        {isLoading ? (
          <div className="w-full flex justify-center">
            <Skeleton height={300} width={800} />
          </div>
        ) : (
          <div className="p-4">
            <VideoSlider videos={publicVideos} />
          </div>
        )}
      </main>
    </Layout>
  );
};

export default Home;
