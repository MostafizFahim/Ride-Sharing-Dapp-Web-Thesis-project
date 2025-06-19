import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../components/UserContext"; // adjust if needed

export default function ProtectedRoute({ children, requiredRole }) {
  const { user } = useContext(UserContext);

  if (!user) {
    toast.warning("Please login to continue");
    return <Navigate to="/login" />;
  }

  // Support for both .role and .currentRole (dual role system)
  const currentRole = user.currentRole || user.role;

  if (requiredRole && currentRole !== requiredRole) {
    toast.error(`Access denied: ${requiredRole} role required`);
    return <Navigate to="/" />;
  }

  return children;
}
