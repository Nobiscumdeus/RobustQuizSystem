import { createSlice} from '@reduxjs/toolkit';

const initialState ={
  user:null,
  //token:null,
  isLoading:false,
  isAuthenticated:false,
  error:null,
  role:null, //'student','admin'

}

const authSlice = createSlice({
  name:'auth',
  initialState,
  reducers:{
    setUser:(state,action) =>{
      state.user = action.payload
    },
    loginStart:(state)=>{
      state.isLoading =true
      state.error=null
    },
    loginSuccess:(state,action)=>{
      state.isLoading = false
      state.user= action.payload.user
     // state.token = null
      state.isAuthenticated=true
      state.role= action.payload.user?.role
      state.error= null
    },
    clearError:(state)=>{
      state.error=null
    },
    loginFailure:(state,action) =>{
      state.isLoading =false
      state.error =action.payload
      state.isAuthenticated=false
    },
    setCredentials:(state,action) =>{
      const {user} = action.payload
      state.user = user
      state.token=null
      state.isAuthenticated=true
      state.role = user?.role
    },
    logout:(state)=>{
      state.user =null
      state.token = null
      state.isAuthenticated= false
      state.role= null
      // No LocalStorage operation 
    }
  }
})


export const {
  setUser,
  loginSuccess,
  loginStart,
  clearError,
  loginFailure,
  setCredentials,
  logout
} = authSlice.actions;
export default authSlice.reducer;
