// src/components/AuthWrapper.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useAuth';
import PropTypes from 'prop-types'; 


const AuthWrapper = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // USE THE HOOK INSTEAD
  const { isAuthenticated, isLoading } = useCurrentUser(); // ADD THIS

  useEffect(() => {
    // Only run checks after auth loading is complete
    if (isLoading) {
      return;
    }

    const protectedRoutes = [
      '/manage',
      '/admin_panel',
      '/create_exam',
      '/bulk',
      '/welcome',
      '/image_upload',
      '/create_exam',
      '/exam',
      '/course',
      '/profile',
      '/student',
      '/create_question',
      '/calculator',
      '/reports'
    ];

    // Protected route patterns (for routes with parameters)
    const protectedRoutePatterns = [
      /^\/student\/[^/]+$/,           // /student/:studentId
      /^\/student\/[^/]+\/edit$/,     // /student/:studentId/edit
      /^\/exam\/[^/]+$/,              // /exam/:examId
      /^\/exam\/[^/]+\/edit$/,        // /exam/:examId/edit
      /^\/courses\/[^/]+$/,           // /courses/:courseId
      /^\/courses\/[^/]+\/edit$/,     // /courses/:courseId/edit
    ];

    // Check if current path is protected
    const isProtectedRoute = protectedRoutes.includes(location.pathname) || 
                           protectedRoutePatterns.some(pattern => pattern.test(location.pathname));

    // UPDATED: Check using hook instead of utility function
    if (isProtectedRoute && !isAuthenticated) {
      navigate('/login', {
        state: {
          from: location.pathname,
          message: 'Please login to access this page'
        },
        replace: true
      });
    }
  }, [location, navigate, isAuthenticated, isLoading]); // ADD DEPENDENCIES

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return children;
};

AuthWrapper.propTypes = {
  children: PropTypes.node,
};
export default AuthWrapper;



/*
// src/components/AuthWrapper.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getAuthState } from '../utility/auth';

const AuthWrapper = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const protectedRoutes = [
      '/manage',
      '/admin_panel',
      '/create_exam',
      '/bulk',
      '/welcome',
      '/image_upload',
      '/create_exam',
      '/exam',
      '/course',
      '/profile',
      '/student',
      '/create_question',
      '/calculator',
      '/reports'
    ];

    // Protected route patterns (for routes with parameters)
    const protectedRoutePatterns = [
      /^\/student\/[^/]+$/,           // /student/:studentId
      /^\/student\/[^/]+\/edit$/,     // /student/:studentId/edit
      /^\/exam\/[^/]+$/,              // /exam/:examId
      /^\/exam\/[^/]+\/edit$/,        // /exam/:examId/edit
      /^\/courses\/[^/]+$/,           // /courses/:courseId
      /^\/courses\/[^/]+\/edit$/,     // /courses/:courseId/edit
    ];

    // Check if current path is protected
    const isProtectedRoute = protectedRoutes.includes(location.pathname) || 
                           protectedRoutePatterns.some(pattern => pattern.test(location.pathname));

    if (isProtectedRoute && !isAuthenticated()) {
      const authState = getAuthState();
      
      const message = authState === 'expired'
        ? 'Session expired, please login to continue'
        : "This page doesn't exist or you don't have permission to view it";

      navigate('/login', {
        state: {
          from: location.pathname,
          message: message
        },
        replace: true
      });
    }
  }, [location, navigate]);

  return children;
};

export default AuthWrapper;
*/