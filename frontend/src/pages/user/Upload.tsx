import React, { useRef, useState } from "react";
import SideBar from "../../components/SideBar";
import { toast } from "sonner";
import backendApi from "../../api/backendApi";
import { useConfig } from "../../customHooks/useConfigHook";
import TextEditor from "../../components/TextEditor";

const Upload = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbnailRef = useRef<HTMLInputElement>(null);

  const [videoSrc, setVideoSrc] = useState<string | null>("");
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>("");
  const [videoName, setVideoName] = useState<string>("");
  const [thumbName, setThumbName] = useState<string>("");

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isPrivate, setIsPrivate] = useState<"false" | "true">("false");
  const [loading, setLoading] = useState<boolean>(false);
  const { configWithJWT } = useConfig();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("video")) {
        const url = URL.createObjectURL(file);
        setVideoSrc(url);
        setVideoName(file.name);
      } else {
        toast.warning("select the video");
      }
    } else {
      setVideoName("");
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image")) {
      const url = URL.createObjectURL(file);
      setThumbnailSrc(url);
      setThumbName(file.name);
    } else if (!file) {
      setThumbName("");
    }
  };

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsPrivate(e.target.value as "false" | "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    const thumbnail = thumbnailRef.current?.files?.[0];

    if (!file) {
      toast.warning("Please select a file");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title || "");
      formData.append("description", description || "");
      formData.append("video", file);
      formData.append("isPrivate", isPrivate);
      if (thumbnail) formData.append("thumbnail", thumbnail);

      const { data } = await backendApi.post(
        "/api/v1/aws/upload-file",
        formData,
        {
          ...configWithJWT,
          headers: { ...configWithJWT.headers, "Content-Type": "multipart/form-data" },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setTitle("");
        setDescription("");
        setIsPrivate("false");
        setVideoSrc(null);
        setThumbnailSrc(null);
        setVideoName("");
        setThumbName("");
        if (fileRef.current) fileRef.current.value = "";
        if (thumbnailRef.current) thumbnailRef.current.value = "";
      } else {
        toast.warning(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full">
      <SideBar />
      <main className="flex-1 p-4 mt-7 lg:ml-64">
        <section className="flex flex-col items-center">
          <form
            className="container flex flex-col gap-4 p-6 bg-white shadow-lg rounded-lg"
            onSubmit={handleSubmit}
          >
            {/* Video Upload */}
            <label className="text-textOne font-semibold">Video</label>

            {/* Dropzone tile */}
            <div className="relative">
              <div
                className="
                  flex items-center justify-between gap-4
                  rounded-xl border-2 border-dashed border-gray-300
                  p-4 hover:border-bgFive transition-colors
                "
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Drag & drop your video here
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports MP4 and WebM
                  </p>
                </div>
                <button
                  type="button"
                  className="px-3 py-2 rounded-md bg-bgFour text-white hover:bg-opacity-90"
                >
                  Choose file
                </button>
              </div>

              {/* Real input covers the tile, invisible but clickable everywhere */}
              <input
                id="video"
                type="file"
                ref={fileRef}
                onChange={handleFileChange}
                accept="video/*"
                className="absolute inset-0 z-10 opacity-0 cursor-pointer"
              />
            </div>

            {/* filename */}
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
                  src={videoSrc || undefined}
                  controls
                  className="w-40 h-40 object-cover rounded-md shadow-md"
                />
              </div>
            )}

            {/* Thumbnail Upload */}
            <label className="text-textOne font-semibold">
              Thumbnail (Optional)
            </label>

            <div className="relative">
              <div
                className="
                  flex items-center justify-between gap-4
                  rounded-xl border-2 border-dashed border-gray-300
                  p-4 hover:border-bgFive transition-colors
                "
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Drag & drop an image
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, WebP</p>
                </div>
                <button
                  type="button"
                  className="px-3 py-2 rounded-md bg-bgFour text-white hover:bg-opacity-90"
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
                className="absolute inset-0 z-10 opacity-0 cursor-pointer"
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
                  src={thumbnailSrc || undefined}
                  alt="Thumbnail Preview"
                  className="w-40 h-40 object-cover rounded-md shadow-md"
                />
              </div>
            )}

            {/* Title */}
            <label htmlFor="title" className="text-textOne font-semibold">
              Title (Optional)
            </label>
            <input
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title of your video"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bgFive"
            />

            {/* Description */}
            <label className="text-textOne font-semibold">Description</label>
            <TextEditor
              title={title}
              setTitle={setTitle}
              content={description}
              setContent={setDescription}
              hideTitle={true}
            />

            {/* Privacy */}
            <label htmlFor="privacy" className="text-textOne font-semibold">
              Privacy
            </label>
            <select
              name="privacy"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bgFive"
              value={isPrivate}
              onChange={handlePrivacyChange}
            >
              <option value="false">Public</option>
              <option value="true">Private</option>
            </select>

            {/* Submit */}
            <div className="flex items-center justify-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-bgFour rounded-md p-2 text-white text-lg mt-5 hover:bg-opacity-90 duration-300 capitalize w-full md:w-fit flex items-center justify-center disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                      ></path>
                    </svg>
                    uploading...
                  </>
                ) : (
                  "Upload video"
                )}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Upload;
