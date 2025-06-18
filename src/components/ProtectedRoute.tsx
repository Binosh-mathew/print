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
    console.log(`ProtectedRoute (${allowedRole}) - Initial state:`, { 
      isAuthenticated, 
      userRole: user?.role,
      loading 
    });
    
    // Quick check first, then do deeper validation
    if (!isAuthenticated) {
      console.log(`ProtectedRoute (${allowedRole}) - Not authenticated, rechecking auth...`);
      const isValid = checkauth();
      console.log(`ProtectedRoute (${allowedRole}) - Auth recheck result:`, isValid);
    }
    
    // Mark as done checking
    setIsChecking(false);
  }, [checkauth, isAuthenticated, user, allowedRole, loading]);

  // Compute redirect path whenever auth state changes
  useEffect(() => {
    if (isChecking || loading) {
      return; // Don't make decisions while still loading
    }
    
    console.log(`ProtectedRoute (${allowedRole}) - Evaluating access:`, {
      isAuthenticated,
      userRole: user?.role,
      allowedRole,
      localStorage: !!localStorage.getItem("auth_data")
    });
    
    if (!isAuthenticated || user?.role !== allowedRole) {
      let path = "/login";
      
      if (user) {
        if (user.role === "admin") {
          path = "/admin/login";
        } else if (user.role === "developer") {
          path = "/developer/login";
        }
      }
      
      console.log(`ProtectedRoute (${allowedRole}) - Setting redirect to:`, path);
      setRedirectPath(path);
    } else {
      console.log(`ProtectedRoute (${allowedRole}) - Access granted`);
      setRedirectPath(null);
    }
  }, [isAuthenticated, user?.role, allowedRole, isChecking, loading]);

  // Show loading state while checking auth
  if (isChecking || loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
    </div>;
  }
  // If we need to redirect, do so
  if (redirectPath) {
    console.log(`ProtectedRoute (${allowedRole}) - Redirecting to:`, redirectPath);
    return <Navigate to={redirectPath} replace={true} />;
  }

  // Otherwise, render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
