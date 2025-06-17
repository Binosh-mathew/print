import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuthStore from "@/store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: "user" | "admin" | "developer";
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    // Only compute redirectPath when auth state changes
    if (!isAuthenticated || user?.role !== allowedRole) {
      let path = "/login";
      
      if (user) {
        if (user.role === "admin") {
          path = "/admin/login";
        } else if (user.role === "developer") {
          path = "/developer/login";
        }
      }
      
      setRedirectPath(path);
    } else {
      setRedirectPath(null);
    }
  }, [isAuthenticated, user?.role, allowedRole]);

  // If we need to redirect, do so
  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  // Otherwise, render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
