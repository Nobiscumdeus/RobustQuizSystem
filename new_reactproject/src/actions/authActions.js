import axios from 'axios';
import { loginStart, loginSuccess, loginFailure, logout, setUser } from '../features/ChasfatAcademy/auth/authSlice';

// User login
export const loginUser = (credentials) => async (dispatch) => {
  dispatch(loginStart());
  try {
    // ✅ Browser automatically sends cookies, backend returns NO token
    const { data } = await axios.post('/login', credentials, {
      withCredentials: true // Enable cookies
    });
    
    // ❌ REMOVE: localStorage.setItem('token', data.token);
    // Backend now sets HTTP-only cookie, data should NOT contain token
    
    // ✅ Backend returns user info only (check if this matches new API)
    dispatch(loginSuccess(data.user || data)); // Adjust based on response format
    dispatch(getUser()); // Fetch user info after login
  } catch (error) {
    dispatch(loginFailure(error.response?.data || error.message));
  }
};

// User logout
export const logoutUser = () => async (dispatch) => {
  try {
    // ✅ Call backend logout endpoint to clear HTTP-only cookies
    await axios.post('/logout', {}, {
      withCredentials: true
    });
    
    // ❌ REMOVE: localStorage.removeItem('token');
    // Backend clears the cookie
    
    dispatch(logout());
  } catch (error) {
    console.error('Logout error:', error);
    // Still dispatch logout even if API fails
    dispatch(logout());
  }
};

// Get user info
export const getUser = () => async (dispatch) => {
  try {
    // ✅ Cookies sent automatically, no Authorization header needed
    const { data } = await axios.get('/me', {
      withCredentials: true // Enable cookies
      // ❌ REMOVE: headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    
    dispatch(setUser(data));
  } catch (error) {
    console.error('Error fetching user info:', error);
  }
};


/*

import axios from 'axios';
import { loginStart,loginSuccess, loginFailure, logout, setUser } from '../features/ChasfatAcademy/auth/authSlice';

// User login
export const loginUser = (credentials) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const { data } = await axios.post('/login', credentials);
    localStorage.setItem('token', data.token);
    dispatch(loginSuccess(data));
    dispatch(getUser()); // Fetch user info after login
  } catch (error) {
    dispatch(loginFailure(error.response.data));
  }
};

// User logout
export const logoutUser = () => (dispatch) => {
  localStorage.removeItem('token');
  dispatch(logout());
};

// Get user info
export const getUser = () => async (dispatch) => {
  try {
    const { data } = await axios.get('/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    dispatch(setUser(data));
  } catch (error) {
    console.error('Error fetching user info:', error);
  }
};


*/