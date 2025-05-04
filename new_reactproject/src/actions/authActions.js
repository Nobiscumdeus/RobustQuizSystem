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