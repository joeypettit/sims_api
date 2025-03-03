import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../api/api';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
    retry: false
  });

  // Show loading state while checking auth
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // Only redirect to login if we're sure there's no user
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.userAccount?.role || 'USER')) {
    // Redirect to projects page if not authorized
    return <Navigate to="/projects" replace />;
  }

  return <>{children}</>;
} 