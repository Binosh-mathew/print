import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuthStore from "@/store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: "user" | "admin" | "developer";
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading, checkauth } = useAuthStore();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Re-validate auth on component mount
  useEffect(() => {
    // Quick check first, then do deeper validation
    if (!isAuthenticated) {
      checkauth();
    }
    setIsChecking(false);
  }, [checkauth, isAuthenticated, user, allowedRole, loading]);

  // Compute redirect path whenever auth state changes
  useEffect(() => {
    if (isChecking || loading) {
      return; // Don't make decisions while still loading
    }

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
  }, [isAuthenticated, user?.role, allowedRole, isChecking, loading]);

  // Show loading state while checking auth
  if (isChecking || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }
  // If we need to redirect, do so
  if (redirectPath) {
    return <Navigate to={redirectPath} replace={true} />;
  }

  // Otherwise, render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
