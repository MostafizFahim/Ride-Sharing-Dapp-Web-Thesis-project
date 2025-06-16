// components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ProtectedRoute({ children, requiredRole }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    toast.warning("Please login to continue");
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    toast.error(`Access denied: ${requiredRole} role required`);
    return <Navigate to="/" />;
  }

  return children;
}
