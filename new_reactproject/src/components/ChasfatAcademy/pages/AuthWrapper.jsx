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