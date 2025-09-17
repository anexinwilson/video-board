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
  };
  isPrivate: boolean | string;
  thumbnail: File | string;
}

export interface VideoState {
  videos: IVideo[] | null;
  publicVideos: IVideo[] | null;
  searchResults: IVideo[] | null;
  isLoading: boolean;
  editVideo: IVideo | null;
}

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
      });
  },
});

export const videoReducer = videoSlice.reducer;
export const selectPublicVideos = (state: RootState) =>
  state.video.publicVideos;
export const selectUserVideos = (state: RootState) => state.video.videos;
export const selectVideoLoading = (state: RootState) => state.video.isLoading;
