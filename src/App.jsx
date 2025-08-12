import { BrowserRouter, Routes, Route } from "react-router-dom";
import Start from "../front-end/start";
import Register from "../front-end/register";
import Login from "../front-end/login";
import AdminDashboard from "../front-end/AdminDashboard";
import UserDashboard from "../front-end/UserDashboard";
import PrivateRoute from "../front-end/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Start />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

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
          element={
            <PrivateRoute roleRequired="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
