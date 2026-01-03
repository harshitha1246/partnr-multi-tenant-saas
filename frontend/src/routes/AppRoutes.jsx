// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import RegisterTenant from "../pages/RegisterTenant";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects";
import ProjectDetails from "../pages/ProjectDetails";
import Users from "../pages/Users";

// ✅ Import Profile and Settings pages
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";

const AppRoutes = () => {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      {/* Auth Pages */}
      <Route path="/register" element={<RegisterTenant />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={token ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/projects"
        element={token ? <Projects /> : <Navigate to="/login" />}
      />
      <Route
        path="/projects/:projectId"
        element={token ? <ProjectDetails /> : <Navigate to="/login" />}
      />

      {/* Users Page */}
      <Route path="/users" element={token ? <Users /> : <Navigate to="/login" />} />

      {/* ✅ Profile Page */}
      <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />

      {/* ✅ Settings Page */}
      <Route path="/settings" element={token ? <Settings /> : <Navigate to="/login" />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

export default AppRoutes;
