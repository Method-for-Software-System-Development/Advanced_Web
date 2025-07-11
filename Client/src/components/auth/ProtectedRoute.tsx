import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  excludedRoles?: string[];
  requireAuth?: boolean;
}

/**
 * ProtectedRoute component that restricts access based on authentication and role.
 * 
 * @param children - The component(s) to render if access is allowed
 * @param requiredRole - Optional role required to access the route (e.g., "secretary")
 * @param excludedRoles - Optional array of roles that should be excluded from this route
 * @param requireAuth - Whether authentication is required (default: true)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  excludedRoles = [],
  requireAuth = true 
}) => {  // Check if user is authenticated by looking for JWT token
  const token = sessionStorage.getItem('token');
  const isAuthenticated = !!token;
  
  // Get user role from sessionStorage
  const userRole = sessionStorage.getItem('role');

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to homepage with a message or login prompt
    return <Navigate to="/" replace />;
  }
  // If a specific role is required but user doesn't have it
  if (requiredRole && userRole !== requiredRole) {
    // If user is authenticated but doesn't have the right role,
    // redirect them to their appropriate dashboard
    if (isAuthenticated) {
      if (userRole === 'secretary') {
        return <Navigate to="/secretary" replace />;
      } else {
        return <Navigate to="/client" replace />;
      }
    }
    // If not authenticated, redirect to homepage
    return <Navigate to="/" replace />;
  }  // If user's role is in the excluded roles list
  if (excludedRoles.length > 0 && userRole && excludedRoles.includes(userRole)) {
    // Redirect them to their appropriate dashboard
    if (userRole === 'secretary') {
      return <Navigate to="/secretary" replace />;
    } else {
      return <Navigate to="/client" replace />;
    }
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
