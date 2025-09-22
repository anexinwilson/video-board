// Thin wrapper around react-slick to present a row of videos.
// Keep responsive counts small to avoid jank on mobile.
import Slider from "react-slick";
import VideoCard from "./VideoCard";
import type { IVideo } from "../reducers/video/videoReducer";

interface VideoSliderProps {
  videos: IVideo[] | null;
}

const VideoSlider = ({ videos }: VideoSliderProps) => {
  const sliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 5, slidesToScroll: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  return (
    <Slider {...(sliderSettings as any)}>
      {videos?.map((video) => <VideoCard key={video._id} video={video} />)}
    </Slider>
  );
};

export default VideoSlider;
