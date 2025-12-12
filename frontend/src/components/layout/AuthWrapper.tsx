import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  // Check if token exists in localStorage
  const isAuthenticated = !!localStorage.getItem("token");

  // If not logged in, redirect to Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the child component (Dashboard, etc.)
  return <Outlet />;
};

export const PublicRoute = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  // If already logged in, redirect to Dashboard (prevent access to Login/Signup)
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not logged in, allow access to Login/Signup
  return <Outlet />;
};