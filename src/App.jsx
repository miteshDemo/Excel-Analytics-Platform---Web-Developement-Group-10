import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Start from "../front-end/start";
import Register from "../front-end/register";
import Login from "../front-end/login";
import UserDashboard from "../front-end/UserDashboard";
import AdminDashboard from "../front-end/AdminDashboard";
import SuperAdminDashboard from "../front-end/SuperAdminDashboard";
import PrivateRoute from "../front-end/ProtectedRoute";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const getRedirectPath = () => {
    if (role === "admin") return "/admin";
    if (role === "superadmin") return "/superadmin";
    return "/dashboard";
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />} />

        <Route
          path="/register"
          element={token ? <Navigate to={getRedirectPath()} /> : <Register />}
        />
        <Route
          path="/login"
          element={token ? <Navigate to={getRedirectPath()} /> : <Login />}
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute roleRequired="user">
              <UserDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute roleRequired="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/superadmin"
          element={
            <PrivateRoute roleRequired="superadmin">
              <SuperAdminDashboard />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
