import { createSlice } from "@reduxjs/toolkit";

//Initial state for the timer ,setting the defaut to say 10 mins or ...

const initialState={
    timer:200, //Defaut timer value in seconds 


}

//Create the timer slice using redux toolkit 

//create the timer slice 
const timerSlice=createSlice({
    name:'timer', //Name of the timer 
    initialState,
    reducers:{
      //Action to set the timer to a specific value
      setTimer(state,action){
        state.timer=action.payload //Update the timer with the new value 
  
      },
      //Action to decrement the timer by 1 seconds 
      decrementTimer(state){
        if(state.timer>0){
          state.timer -= 1; //Decrease timer only if its greater than 1 
  
        }
      },
      //Action to reset the timer back to the initial state 
      resetTimer(state){
        state.timer=initialState.timer //Reset the default timer value 
      }
    }
  })

  export const { setTimer,decrementTimer,resetTimer} =timerSlice.actions;


  export default timerSlice.reducer; 