import React, { useEffect } from "react";
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

const MyVideos = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { configWithJWT } = useConfig();
  const isLoading = useSelector(selectVideoLoading);
  const videos = useSelector(selectUserVideos);

  useEffect(() => {
    if (configWithJWT) {
      dispatch(fetchVideosForUser({ configWithJwt: configWithJWT }));
    }
  }, [dispatch]);

  return (
    <div className="flex w-full gap-2">
      <SideBar />
      <main className="flex-1 lg:ml-64">
        <section className="p-4 mt-3">
          {isLoading ? (
            <Loader />
          ) : (
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
              {videos?.map((video) => (
                <VideoCard 
                  key={video._id} 
                  video={video} 
                  showEdit 
                  configWithJWT={configWithJWT} 
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MyVideos;