import { Navigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: "user" | "admin" | "developer";
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  // If not authenticated or role doesn't match, redirect accordingly.
  if (!isAuthenticated || user?.role !== allowedRole) {
    // Redirect based on the allowed role
    switch (allowedRole) {
      case "admin":
        return <Navigate to="/admin/login" />;
      case "developer":
        return <Navigate to="/developer/login" />;
      default:
        return <Navigate to="/login" />;
    }
  }

  // Otherwise, render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
