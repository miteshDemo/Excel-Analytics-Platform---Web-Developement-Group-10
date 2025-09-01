import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function PrivateRoute({ children, roleRequired }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roleRequired && role !== roleRequired) {
    if (role === "superadmin") return <Navigate to="/superadmin" />;
    if (role === "admin") return <Navigate to="/admin" />;
    return <Navigate to="/dashboard" />;
  }

  return children;
}
