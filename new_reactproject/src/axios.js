

import axios from 'axios';
//import { logout } from './components/ChasfatAcademy/utility/auth';
import { useAuthLogout } from './hooks/useAuth';

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
  '/exam/session/:sessionId/violations',

   '/api/student/session/:sessionId/start',
   '/api/exam/validate-access',
   '/api/auth/student/login',
   '/student/session/:sessionId/start'  // Without /api prefix too
];

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
});

//Using Cookies for all requests 
axiosInstance.defaults.withCredentials = true;

axiosInstance.interceptors.request.use(config => {

  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const isStudentRoute = studentEndpoints.some(endpoint => {
        const regex = new RegExp('^' + endpoint.replace(/:[\w]+/g, '[^/]+') + '$');
        return regex.test(error.config.url);
      });
      if (isStudentRoute) {

       // localStorage.removeItem('studentToken');
        window.location.href = '/student_exam_login';
      } else {
       // localStorage.removeItem('token');
       // logout(true); // For user/examiner routes
        useAuthLogout();
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

