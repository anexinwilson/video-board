import { createBrowserRouter } from "react-router-dom";
import SignUp from "./pages/auth/SignUp";
import SignIn from "./pages/auth/SignIn";
import UserProfile from "./pages/user/UserProfile";
import {
  ProtectedRoute,
  ProtectedRouteHome,
} from "./components/ProtectedRoutes";
import ResetPasswordEmail from "./pages/auth/ResetPasswordEmail";
import UpdatePassword from "./pages/auth/UpdatePassword";
import Upload from "./pages/user/Upload";
import AllVideos from "./pages/video/AllVideos";
import Home from "./pages/home/Home";
import VideoPage from "./pages/video/VideoPage";
import MyVideos from "./pages/user/MyVideos";
import UpdateVideo from "./pages/user/UpdateVideo";

export const router = createBrowserRouter([
  // Public-only routes: redirect to /user/profile if already logged in
  { path: "/", element: <Home /> },
  { path: "/video/:id", element: <VideoPage /> },
  { path: "/sign-up", element: <ProtectedRoute element={<SignUp />} /> },
  { path: "/sign-in", element: <ProtectedRoute element={<SignIn />} /> },
  {
    path: "/reset-password",
    element: <ProtectedRoute element={<ResetPasswordEmail />} />,
  },
  {
    path: "/reset-password/:token",
    element: <ProtectedRoute element={<UpdatePassword />} />,
  },

  // Auth-required routes: must be logged in
  {
    path: "/user/profile",
    element: <ProtectedRouteHome element={<UserProfile />} />,
  },
  {
    path: "/user/upload-video",
    element: <ProtectedRouteHome element={<Upload />} />,
  },
  {
    path: "/user/edit/my-videos",
    element: <ProtectedRouteHome element={<MyVideos />} />,
  },
  {
    path: "/user/edit/my-video",
    element: <ProtectedRouteHome element={<UpdateVideo />} />,
  },

  { path: "/all-videos", element: <AllVideos /> },
]);
