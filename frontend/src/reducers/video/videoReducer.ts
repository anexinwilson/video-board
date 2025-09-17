import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ConfigWithJWT } from "../../types";
import { toast } from "sonner";
import type { RootState } from "../store";
import backendApi from "../../api/backendApi";

export interface IVideo {
  _id: string;
  path: string;
  title?: string;
  description?: string;
  uploadedBy: {
    email: string;
    name?: string;
  };
  isPrivate: boolean;
  thumbNail: string;
}

export interface EditVideo {
  _id: string;
  path: File | string;
  title?: string;
  description?: string;
  uploadedBy: {
    email: string;
    name?: string;
  };
  isPrivate: boolean | string;
  thumbNail: File | string;
}

export interface VideoState {
  videos: IVideo[] | null;
  publicVideos: IVideo[] | null;
  searchResults: IVideo[] | null;
  isLoading: boolean;
  editVideo: IVideo | null;
}

// payload types
interface FileFetchPayload {
  configWithJwt: ConfigWithJWT;
}

interface FileResponse {
  success: boolean;
  message: string;
  videos?: IVideo[];
}

interface SingleFileResponse {
  success: boolean;
  message: string;
  video?: IVideo;
}

const initialState: VideoState = {
  videos: [],
  publicVideos: [],
  searchResults: [],
  isLoading: false,
  editVideo: null,
};

export const fetchVideosForUser = createAsyncThunk<
  IVideo[],
  FileFetchPayload,
  { rejectValue: String }
>("/video/fetch-user-videos", async (payload, thunkapi) => {
  try {
    const { configWithJwt } = payload;
    const { data } = await backendApi.get<FileResponse>(
      "/api/v1/aws/videos",
      configWithJwt
    );
    if (data.success) {
      return data.videos || [];
    }
    return thunkapi.rejectWithValue(data.message);
  } catch (error: any) {
    const errMessage = error.response?.data?.message || "Something went wrong";
    return thunkapi.rejectWithValue(errMessage);
  }
});

export const fetchVideosForPublic = createAsyncThunk<
  IVideo[],
  void,
  { rejectValue: string }
>("/videos/fetch-public-videos", async (_, thunkAPI) => {
  try {
    const { data } = await backendApi.get<FileResponse>("/api/v1/videos");
    if (data.success) {
      return data.videos || [];
    }
    return thunkAPI.rejectWithValue(data.message);
  } catch (error: any) {
    const errMessage = error.response?.data?.message || "Something went wrong";
    toast.error(errMessage);
    return thunkAPI.rejectWithValue(errMessage);
  }
});

export const deleteVideo = createAsyncThunk<
  { id: string },
  { id: string; configWithJWT: ConfigWithJWT },
  { rejectValue: string }
>("video/delete", async ({ id, configWithJWT }, thunkApi) => {
  try {
    const { data } = await backendApi.delete<FileResponse>(
      `/api/v1/aws/video/${id}`,
      configWithJWT
    );
    if (data.success) {
      return { id };
    }
    return thunkApi.rejectWithValue(data.message);
  } catch (error: any) {
    return thunkApi.rejectWithValue(error);
  }
});

export const updateVideo = createAsyncThunk<
  IVideo,
  {
    id: string;
    updateData: Partial<EditVideo>;
    configWithJwt: ConfigWithJWT;
  },
  { rejectValue: string }
>("video/update", async ({ id, updateData, configWithJwt }, thunkAPI) => {
  try {
    const formData = new FormData();
    if (updateData.path instanceof File) {
      formData.append("video", updateData.path);
    }
    if (updateData.thumbNail instanceof File) {
      formData.append("thumbnail", updateData.thumbNail);
    }
    if (updateData.title) formData.append("title", updateData.title);
    if (updateData.description)
      formData.append("description", updateData.description);
    formData.append("isPrivate", String(updateData.isPrivate));
    const { data } = await backendApi.put<SingleFileResponse>(
      `/api/v1/aws/video/${id}`,
      formData,
      {
        ...configWithJwt,
        headers: {
          ...configWithJwt.headers,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (data.success && data.video) {
      toast.success(data.message);
    }
    return thunkAPI.rejectWithValue(data.message);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const getSearchResults = createAsyncThunk<
  IVideo[],
  string,
  { rejectValue: string; state: RootState }
>("video/search", async (query, thunkApi) => {
  try {
    const { publicVideos, videos } = thunkApi.getState().video;
    const combinedVideos = [...(publicVideos || []), ...(videos || [])];
    const filteredVideos = combinedVideos.filter(
      (video) =>
        video.title?.toLowerCase().includes(query.toLowerCase()) ||
        video.description?.toLowerCase().includes(query.toLowerCase())
    );
    return filteredVideos;
  } catch (error: any) {
    return thunkApi.rejectWithValue(error);
  }
});

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    setEditVideo: (state, action) => {
      state.editVideo = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideosForPublic.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchVideosForPublic.fulfilled, (state, action) => {
        state.publicVideos = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchVideosForPublic.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchVideosForUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchVideosForUser.fulfilled, (state, action) => {
        state.videos = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchVideosForUser.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.videos =
          state.videos?.filter((video) => video._id !== action.payload.id) ||
          null;
      })
      .addCase(getSearchResults.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      });
  },
});

export const videoReducer = videoSlice.reducer;
export const { setEditVideo } = videoSlice.actions;
export const selectPublicVideos = (state: RootState) =>
  state.video.publicVideos;
export const selectUserVideos = (state: RootState) => state.video.videos;
export const selectVideoLoading = (state: RootState) => state.video.isLoading;
export const selectEditingVideo = (state: RootState) => state.video.editVideo;
export const selectSearchResults = (state: RootState) =>
  state.video.searchResults;
