// Edit flow for a single video.
// Uses FormData only when files are present; rest is text metadata.
import React, { useRef, useState } from "react";
import SideBar from "../../components/SideBar";
import { toast } from "sonner";
import { useConfig } from "../../customHooks/useConfigHook";
import { useDispatch, useSelector } from "react-redux";
import {
  selectEditingVideo,
  updateVideo,
} from "../../reducers/video/videoReducer";
import type { AppDispatch } from "../../reducers/store";
import TextEditor from "../../components/TextEditor";

const UpdateVideo = () => {
  const editVideo = useSelector(selectEditingVideo);
  const dispatch = useDispatch<AppDispatch>();
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbnailRef = useRef<HTMLInputElement>(null);

  // Local previews for selected files
  const [videoSrc, setVideoSrc] = useState<string | null>(
    editVideo?.path || ""
  );
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(
    editVideo?.thumbNail || ""
  );

  // Basic fields
  const [videoName, setVideoName] = useState<string>("");
  const [thumbName, setThumbName] = useState<string>("");
  const [title, setTitle] = useState<string>(editVideo?.title || "");
  const [description, setDescription] = useState<string>(
    editVideo?.description || ""
  );
  const [isPrivate, setIsPrivate] = useState<string>(
    editVideo?.isPrivate !== undefined ? String(editVideo.isPrivate) : "false"
  );

  const [loading, setLoading] = useState<boolean>(false);
  const { configWithJWT } = useConfig();

  // File pickers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("video")) {
        const videoUrl = URL.createObjectURL(file);
        setVideoSrc(videoUrl);
        setVideoName(file.name);
      } else {
        toast.warning("Please select a video file");
        return;
      }
    } else {
      setVideoName("");
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image")) {
        const thumbnailUrl = URL.createObjectURL(file);
        setThumbnailSrc(thumbnailUrl);
        setThumbName(file.name);
      }
    } else {
      setThumbName("");
    }
  };

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsPrivate(e.target.value);
  };

  // Submit updates
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const file = fileRef.current?.files?.[0];
    const thumbnail = thumbnailRef.current?.files?.[0];

    try {
      if (editVideo?._id) {
        await dispatch(
          updateVideo({
            id: editVideo._id,
            updateData: {
              title: title || editVideo.title,
              description: description || editVideo.description,
              _id: editVideo._id,
              uploadedBy: { email: editVideo.uploadedBy.email },
              isPrivate: isPrivate || editVideo.isPrivate,
              path: file || editVideo.path,
              thumbNail: thumbnail || editVideo.thumbNail,
            },
            configWithJwt: configWithJWT,
          })
        );
      }

      // Reset local state after success
      setVideoSrc(null);
      setThumbnailSrc(null);
      setTitle("");
      setDescription("");
      setVideoName("");
      setThumbName("");
      if (fileRef.current) fileRef.current.value = "";
      if (thumbnailRef.current) thumbnailRef.current.value = "";
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full">
      <SideBar />
      <main className="flex-1 p-4 mt-7 lg:ml-64 overflow-y-auto">
        <section className="flex flex-col items-center">
          <form
            className="w-full max-w-6xl flex flex-col gap-4 p-6 bg-white shadow-lg rounded-lg"
            onSubmit={handleSubmit}
          >
            {/* Video Upload */}
            <label className="text-gray-800 font-semibold">Video</label>

            <div className="relative">
              <div className="flex items-center justify-between gap-4 rounded-xl border-2 border-dashed border-gray-300 p-4 hover:border-blue-400 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Drag & drop your video here
                  </p>
                  <p className="text-xs text-gray-500">Supports MP4 and WebM</p>
                </div>
                <button
                  type="button"
                  className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Choose file
                </button>
              </div>

              <input
                id="video"
                type="file"
                ref={fileRef}
                onChange={handleFileChange}
                accept="video/*"
                className="absolute top-0 left-0 h-full w-full opacity-0 cursor-pointer"
              />
            </div>

            <div className="text-sm">
              {videoName ? (
                <span className="text-gray-700">{videoName}</span>
              ) : (
                <span className="text-gray-400 italic">No file chosen</span>
              )}
            </div>

            {videoSrc && (
              <div className="mt-2 flex flex-col items-center">
                <video
                  src={videoSrc}
                  controls
                  className="w-40 h-40 object-cover rounded-md shadow-md"
                />
              </div>
            )}

            {/* Thumbnail Upload */}
            <label className="text-gray-800 font-semibold">
              Thumbnail (Optional)
            </label>

            <div className="relative">
              <div className="flex items-center justify-between gap-4 rounded-xl border-2 border-dashed border-gray-300 p-4 hover:border-blue-400 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Drag & drop an image
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, WebP</p>
                </div>
                <button
                  type="button"
                  className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Choose file
                </button>
              </div>

              <input
                id="thumbnail"
                type="file"
                ref={thumbnailRef}
                onChange={handleThumbnailChange}
                accept="image/*"
                className="absolute top-0 left-0 h-full w-full opacity-0 cursor-pointer"
              />
            </div>

            <div className="text-sm">
              {thumbName ? (
                <span className="text-gray-700">{thumbName}</span>
              ) : (
                <span className="text-gray-400 italic">No file chosen</span>
              )}
            </div>

            {thumbnailSrc && (
              <div className="mt-2 flex flex-col items-center">
                <img
                  src={thumbnailSrc}
                  alt="Thumbnail Preview"
                  className="w-40 h-40 object-cover rounded-md shadow-md"
                />
              </div>
            )}

            {/* Title */}
            <label htmlFor="title" className="text-gray-800 font-semibold">
              Title (Optional)
            </label>
            <input
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title of your video"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* Description */}
            <label className="text-gray-800 font-semibold">Description</label>
            <TextEditor
              title={title}
              setTitle={setTitle}
              content={description}
              setContent={setDescription}
              hideTitle={true}
            />

            {/* Privacy */}
            <label htmlFor="privacy" className="text-gray-800 font-semibold">
              Privacy
            </label>
            <select
              name="privacy"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={isPrivate}
              onChange={handlePrivacyChange}
            >
              <option value="false">Public</option>
              <option value="true">Private</option>
            </select>

            {/* Submit */}
            <div className="flex items-center justify-center mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 rounded-md px-6 py-3 text-white text-lg hover:bg-blue-700 duration-300 capitalize w-full sm:w-auto flex items-center justify-center disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update video"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default UpdateVideo;
