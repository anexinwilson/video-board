// App router: declares public, auth-gated, and public-only routes.
import { createBrowserRouter } from "react-router-dom";
import SignUp from "./pages/auth/SignUp";
import SignIn from "./pages/auth/SignIn";
import UserProfile from "./pages/user/UserProfile";
import { ProtectedRoute, ProtectedRouteHome } from "./components/ProtectedRoutes";
import ResetPasswordEmail from "./pages/auth/ResetPasswordEmail";
import UpdatePassword from "./pages/auth/UpdatePassword";
import Upload from "./pages/user/Upload";
import Home from "./pages/home/Home";
import VideoPage from "./pages/video/VideoPage";
import MyVideos from "./pages/user/MyVideos";
import UpdateVideo from "./pages/user/UpdateVideo";
import Dashboard from "./pages/user/Dashboard";

export const router = createBrowserRouter([
  // Public home
  { path: "/", element: <Home /> },

  // Public video details (token optional; server decides visibility)
  { path: "/video/:id", element: <VideoPage /> },

  // Public-only: if logged in, redirect to dashboard
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

  // Auth-required: if not logged in, redirect to /sign-in
  { path: "/user/profile", element: <ProtectedRouteHome element={<UserProfile />} /> },
  { path: "/user/dashboard", element: <ProtectedRouteHome element={<Dashboard />} /> },
  { path: "/user/upload-video", element: <ProtectedRouteHome element={<Upload />} /> },
  { path: "/user/edit/my-videos", element: <ProtectedRouteHome element={<MyVideos />} /> },
  { path: "/user/edit/my-video", element: <ProtectedRouteHome element={<UpdateVideo />} /> },
]);
