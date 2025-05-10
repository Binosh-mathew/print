import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'user' | 'admin' | 'developer';
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    // Redirect to appropriate login page based on role
    switch (allowedRole) {
      case 'admin':
        return <Navigate to="/admin/login" />;
      case 'developer':
        return <Navigate to="/developer/login" />;
      default:
        return <Navigate to="/login" />;
    }
  }

  if (user.role !== allowedRole) {
    // If user is logged in but doesn't have the right role
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
