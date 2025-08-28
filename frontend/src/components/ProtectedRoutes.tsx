import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface RouteProps {
  element: ReactNode;
}

 export const ProtectedRouteHome = ({ element }: RouteProps) => {
    const token = localStorage.getItem("token")
    return token ? element : <Navigate to={"/sign-in"}></Navigate>
};

 export const ProtectedRoute = ({ element }: RouteProps) => {
    const token = localStorage.getItem("token")
    return token ? <Navigate to={"/user/profile"}></Navigate> : element
};


