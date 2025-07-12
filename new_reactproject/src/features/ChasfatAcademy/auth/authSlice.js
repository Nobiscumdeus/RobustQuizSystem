/*

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  user: null,
  token: null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoggedIn = true;
      state.token = action.payload.token;
    },
    loginFailure: (state, action) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.token = null;
      state.user = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    getUser:(state,action)=>{
        state.user=action.payload;
    }
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, setUser,getUser } = authSlice.actions;

export default authSlice.reducer;

*/

import { createSlice , createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';

//Create axios instance with base configuration 
const api =axios.create({
  baseURL:'/api',
  headers:{
    'Content-Type':'application/json'
  }
})

//Add request interceptor to include auth token 
api.interceptors.request.use((config)=>{
  const token =localStorage.getItem('token');
  if(token){
    config.headers.Authorization = `Bearer ${token}`
  }
  return config 
})

//Async thunks for auth operation 
export const loginUser =createAsyncThunk(
  '/auth/login',
  async({ email, password }, { rejectWithValue}) =>{
    try{
      const response = await api.post('/auth/login', { email,password })

      //Store token in localStorage
      localStorage.setItem('token',response.data.token);
      return response.data
    } catch(error){
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Login failed '
      )
    }
  }
)


export const registerUser=createAsyncThunk(
  'auth/register',
  async(userData, {rejectWithValue}) =>{
    try{
      const response = await api.post('/auth/register', userData)
      return response.data
    }catch(error){
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Registration failed '
      )
    }
  }
)


export const logoutUser=createAsyncThunk(
  'auth/logout',
  async(_,{rejectWithValue}) =>{
    try{
      await api.post('/auth/logout')
      localStorage.removeItem('token')
      return true
    }catch(error){
      //Even if logout fails , remove token locally 
      localStorage.removeItem('token')
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Logout failed '
      )
    }
  }
)


const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isAuthenticated: false,
  error: null,
  role: null, // 'student', 'teacher', 'admin'
}


const authSlice=createSlice({
  name:'auth',
  initialState,
  reducers:{
      setUser: (state, action) => {
      state.user = action.payload;
    },
     loginStart: (state) => {
    state.isLoading = true
    state.error = null
  },
  loginSuccess:(state,action)=>{
    state.isLoading=false,
     state.user = action.payload.user
    state.token = action.payload.token
    state.isAuthenticated = true
    state.role = action.payload.user.role
    state.error = null
  },
    clearError:(state)=>{
      state.error =null
    },
    loginFailure:(state,action)=>{
      state.isLoading=false
      state.error =action.payload
      state.isAuthenticated=false

    },
    setCredentials:(state,action)=>{
      const { user ,token } =action.payload 
      state.user =user
      state.token =token 
      state.isAuthenticated=true
      state.role=user.role
    },
    logout:(state)=>{
      state.user=null
      state.token=null
      state.isAuthenticated =false
      state.role =null
      localStorage.removeItem('token')
    }

  },
  extraReducers:(builder)=>{
    builder
    //Login cases
    .addCase(loginUser.pending,(state)=>{
      state.isLoading=true
      state.error=null
    })
    .addCase(loginUser.fulfilled, (state,action)=>{
      state.isLoading =false
      state.user =action.payload.user 
      state.token =action.payload.token 
      state.isAuthenticated=true 
      state.role =action.payload.user.role
      state.error =null
    })
    .addCase(loginUser.rejected, (state,action)=>{
      state.isLoading=false
      state.error=action.payload 
      state.isAuthenticated=false 
    })

    //Register cases 
    .addCase(registerUser.pending,(state)=>{
      state.isLoading =true
      state.error =null
    })
    .addCase(registerUser.fulfilled,(state)=>{
      state.isLoading=false
      state.error=null
    })
    .addCase(registerUser.rejected ,(state,action)=>{
      state.isLoading =false
      state.error=action.payload
    })

    //Logout cases 
    .addCase(logoutUser.fulfilled,(state)=>{
      state.user =null
      state.token =null
      state.isAuthenticated =false
      state.role =null
    })
 
  }
})


export const {setUser, loginSuccess,loginStart,clearError,loginFailure,setCredentials,logout} =authSlice.actions
export default authSlice.reducer 