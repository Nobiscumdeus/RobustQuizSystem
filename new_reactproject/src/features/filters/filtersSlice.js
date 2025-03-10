import { createSlice } from "@reduxjs/toolkit";


//Create a slice for filters
const filtersSlice=createSlice({
    name:'filters',
    initialState:{
        status:'All', //Current filter status 
        colors:[], //Array of selected colors 
    },
    reducers:{
        //Action to set status filter 
        setStatusFilter:(state,action)=>{
            state.status=action.payload; //Update the status filter 
        },
        //Action to add a color filter 
        addColorFilter:(state,action)=>{
            if(!state.colors.includes(action.payload)){
                state.colors.push(action.payload); //Add color if not already included 
            }
        },
        //Action to remove a color filter 
        removeColorFilter:(state,action)=>{
            state.colors=state.colors.filter((color)=>color !== action.payload ) //Remove the specified color 

        }
    }
})

//Export actions and reducers 
export const { setStatusFilter,addColorFilter,removeColorFilter}=filtersSlice.actions;
export default filtersSlice.reducer