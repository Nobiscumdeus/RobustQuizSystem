import { createSlice } from "@reduxjs/toolkit";



const notificationSlice=createSlice({
    name:'notifications',
    initialState:{
        notifications:[],
        unreadCount:0,
        showToast:false, //UI state 
        toastMessage:null
    },

    reducers:{
        showNotificationToast:(state,action)=>{
            state.showToast=true,
            state.toastMessage=action.payload
        }
    }
})

export const {showNotificationToast}=notificationSlice.actions 
export default notificationSlice.reducer;
