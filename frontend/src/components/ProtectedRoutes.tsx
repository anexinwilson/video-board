// Small wrappers to protect pages at the router level.
// The goal is to keep route elements clean and avoid duplication.
import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface RouteProps {
  element: ReactNode;
}

// Require auth: if no token, send to sign-in.
export const ProtectedRouteHome = ({ element }: RouteProps) => {
  const token = localStorage.getItem("token");
  return token ? element : <Navigate to={"/sign-in"} />;
};

// Inverse: if already signed in, don't show public auth pages.
export const ProtectedRoute = ({ element }: RouteProps) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to={"/user/profile"} /> : element;
};
