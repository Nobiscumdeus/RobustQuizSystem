import axios from 'axios';

import { logout } from '../components/ChasfatAcademy/utility/auth';
// Define student-specific endpoints
const studentEndpoints = [
  '/exam/login',
  '/exam/:id/start',
  '/exam/:id/session',
  '/exam/:id/questions',
  '/exam/session/:sessionId/answer',
  '/exam/session/:sessionId/answers/batch',
  '/exam/session/:sessionId/submit',
  '/exam/session/:sessionId/auto-submit',
  '/exam/session/:sessionId/time',
  '/exam/session/:sessionId/heartbeat',
  '/exam/session/:sessionId/violation',
  '/exam/session/:sessionId/answers',
  '/exam/session/:sessionId/violations'
];

// Create axios instance
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const studentToken = localStorage.getItem('studentToken');
    const userToken = localStorage.getItem('token');
    // Check if the URL matches a student endpoint
    const isStudentRoute = studentEndpoints.some(endpoint => {
      const regex = new RegExp('^' + endpoint.replace(/:[\w]+/g, '[^/]+') + '$');
      return regex.test(config.url);
    });

    if (studentToken && isStudentRoute) {
      config.headers.Authorization = `Bearer ${studentToken}`;
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const isStudentRoute = studentEndpoints.some(endpoint => {
        const regex = new RegExp('^' + endpoint.replace(/:[\w]+/g, '[^/]+') + '$');
        return regex.test(error.config.url);
      });
      if (isStudentRoute) {
        localStorage.removeItem('studentToken');
        window.location.href = '/student/login';
      } else {
        localStorage.removeItem('token');
        logout(true);
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default apiClient;