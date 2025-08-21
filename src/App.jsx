import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Start from "../front-end/start";
import Register from "../front-end/register";
import Login from "../front-end/login";
import UserDashboard from "../front-end/UserDashboard";
import AdminDashboard from "../front-end/AdminDashboard";
import PrivateRoute from "../front-end/ProtectedRoute";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Start Page */}
        <Route path="/" element={<Start />} />

        {/* Register Route → block access if logged in */}
        <Route
          path="/register"
          element={
            token ? (
              role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Register />
            )
          }
        />

        {/* Login Route → block access if logged in */}
        <Route
          path="/login"
          element={
            token ? (
              role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Login />
            )
          }
        />

        {/* Protected User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute roleRequired="user">
              <UserDashboard />
            </PrivateRoute>
          }
        />

        {/* Protected Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <PrivateRoute roleRequired="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Catch-all → Redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
