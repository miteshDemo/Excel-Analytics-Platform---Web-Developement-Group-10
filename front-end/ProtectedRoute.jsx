import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function PrivateRoute({ children, roleRequired }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  // If not logged in → send to login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If logged in but wrong role → redirect to their correct dashboard
  if (roleRequired && role !== roleRequired) {
    return role === "admin"
      ? <Navigate to="/admin" replace />
      : <Navigate to="/dashboard" replace />;
  }

  
  return children;
}
