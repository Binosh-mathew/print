
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'user' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Show loading spinner while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to={allowedRole === 'admin' ? '/admin/login' : '/login'} />;
  }

  // Check if user has the required role
  if (user.role !== allowedRole) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin" />;
    } else {
      return <Navigate to="/dashboard" />;
    }
  }

  // User is authenticated and has the allowed role
  return <>{children}</>;
};

export default ProtectedRoute;
