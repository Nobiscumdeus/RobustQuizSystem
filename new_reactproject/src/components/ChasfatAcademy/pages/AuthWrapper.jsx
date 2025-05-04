// src/components/AuthWrapper.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utility/auth';

const AuthWrapper = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const protectedRoutes = [
      '/manage',
      '/admin_panel',
      '/create_exam',
      //'/monitor',
     // '/monitor_dashboard'
      // Add other protected routes here
    ];

    if (protectedRoutes.includes(location.pathname) && !isAuthenticated()) {
      navigate('/login', {
        state: { 
          from: location.pathname,
          message: 'Please login to access this page'
        },
        replace: true
      });
    }
  }, [location, navigate]);

  return children;
};

export default AuthWrapper;