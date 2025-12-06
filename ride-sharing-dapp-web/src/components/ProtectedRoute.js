import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../components/UserContext";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user } = useContext(UserContext);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    // Not logged in
    if (!user) {
      toast.warning("Please login to continue");
      setRedirect("/login");
      return;
    }

    // Check role
    const currentRole = user.currentRole || user.role;
    if (requiredRole && currentRole !== requiredRole) {
      toast.error(`Access denied: ${requiredRole} role required`);
      setRedirect("/");
    }
  }, [user, requiredRole]);

  if (redirect) {
    return <Navigate to={redirect} replace />;
  }

  return children;
}
