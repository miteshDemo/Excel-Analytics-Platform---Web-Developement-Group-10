import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Start from "../front-end/start";
import Register from "../front-end/register";
import Login from "../front-end/login";
import UserDashboard from "../front-end/UserDashboard";
import PrivateRoute from "../front-end/ProtectedRoute";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Start />} />
        <Route path="/register" element={<Register />} />

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

        {/* Protected User Route */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute roleRequired="user">
              <UserDashboard />
            </PrivateRoute>
          }
        />

        {/* Protected Admin Route */}
        <Route
          path="/admin"
          element={<PrivateRoute roleRequired="admin">  </PrivateRoute>}
        />

        {/* Catch-all: redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
