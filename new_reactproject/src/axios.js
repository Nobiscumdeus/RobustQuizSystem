import axios from 'axios';
import { logout } from './components/ChasfatAcademy/utility/auth';


const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
});


// 1. Inject token into requests
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Handle expired tokens
/*
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If token expired (401) and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/refresh', { refreshToken });
        
        // Update stored tokens
        //localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        
        // Retry original request with new token
       // originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
       originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - nuclear option
        localStorage.clear();
        window.location.href = '/login?expired=true';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);]axiosInstance.interceptors.response.use(
  response=>response,
  async error=>{
    const originalRequest =error.config;
    //Token expired 
    if(error.response?.status === 401 && !originalRequest._retry){
      originalRequest._retry=true
      try{
        //Attempt token refresh 
        const refreshToken=localStorage.getItem('refreshToken');
        const { data }=await axios.post('/refresh',{refreshToken})

        //Update tokens 
        localStorage.setItem('token',data.token);
        localStorage.setItem('refreshToken',data.refreshToken);

        //Retry original request 
        return axiosInstance(originalRequest);

      }catch(refreshError){
        //Refresh failed , force logout
        logout()
        router.push('/login?session_expired=true&from=' + encodeURIComponent(window.location.pathname));
        //const navigate=useNavigate()
        //router.push('/login?session_expired=true')
        return Promise.reject(refreshError);

      }
    }
    return Promise.reject(error);
  }
)
*/



axiosInstance.interceptors.response.use(
  response => response,
  async error => {
      if (error.response?.status === 401) {
          // Immediately logout on any 401
          logout(true); // true indicates expired session
          return Promise.reject(error);
      }
      return Promise.reject(error);
  }
);



export default axiosInstance;