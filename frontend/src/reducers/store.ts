// App store with two slices: auth + video.
// Exports RootState and AppDispatch helpers for typed hooks.
import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./auth/authReducer";
import { videoReducer } from "./video/videoReducer";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    video: videoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
