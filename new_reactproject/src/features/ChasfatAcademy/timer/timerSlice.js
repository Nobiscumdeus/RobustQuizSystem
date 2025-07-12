/*
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

  */


  // slices/timerSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Time tracking
  timeRemaining: 0, // in seconds
  totalTime: 0, // in seconds
  timeElapsed: 0, // in seconds
  
  // Timer state
  isRunning: false,
  isPaused: false,
  isExpired: false,
  
  // Warnings
  warningShown: {
    fifteenMinutes: false,
    fiveMinutes: false,
    oneMinute: false,
    thirtySeconds: false,
  },
  
  // Timer settings
  autoSubmitOnExpiry: true,
  showWarnings: true,
  
  // Interval tracking
  intervalId: null,
}

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    // Initialize timer
    initializeTimer: (state, action) => {
      const durationInMinutes = action.payload
      const durationInSeconds = durationInMinutes * 60
      
      state.timeRemaining = durationInSeconds
      state.totalTime = durationInSeconds
      state.timeElapsed = 0
      state.isExpired = false
      state.warningShown = {
        fifteenMinutes: false,
        fiveMinutes: false,
        oneMinute: false,
        thirtySeconds: false,
      }
    },
    
    // Start timer
    startTimer: (state) => {
      state.isRunning = true
      state.isPaused = false
    },
    
    // Pause timer
    pauseTimer: (state) => {
      state.isRunning = false
      state.isPaused = true
    },
    
    // Resume timer
    resumeTimer: (state) => {
      state.isRunning = true
      state.isPaused = false
    },
    
    // Stop timer
    stopTimer: (state) => {
      state.isRunning = false
      state.isPaused = false
    },
    
    // Reset timer
    resetTimer: (state) => {
      state.timeRemaining = state.totalTime
      state.timeElapsed = 0
      state.isRunning = false
      state.isPaused = false
      state.isExpired = false
      state.warningShown = {
        fifteenMinutes: false,
        fiveMinutes: false,
        oneMinute: false,
        thirtySeconds: false,
      }
    },
    
    // Tick (decrease time by 1 second)
    tick: (state) => {
      if (state.isRunning && !state.isPaused && state.timeRemaining > 0) {
        state.timeRemaining -= 1
        state.timeElapsed += 1
        
        // Check if time expired
        if (state.timeRemaining <= 0) {
          state.timeRemaining = 0
          state.isExpired = true
          state.isRunning = false
        }
        
        // Set warning flags
        if (state.showWarnings) {
          if (state.timeRemaining <= 30 && !state.warningShown.thirtySeconds) {
            state.warningShown.thirtySeconds = true
          } else if (state.timeRemaining <= 60 && !state.warningShown.oneMinute) {
            state.warningShown.oneMinute = true
          } else if (state.timeRemaining <= 300 && !state.warningShown.fiveMinutes) {
            state.warningShown.fiveMinutes = true
          } else if (state.timeRemaining <= 900 && !state.warningShown.fifteenMinutes) {
            state.warningShown.fifteenMinutes = true
          }
        }
      }
    },
    
    // Set time remaining (for loading saved progress)
    setTimeRemaining: (state, action) => {
      const timeRemaining = action.payload
      state.timeRemaining = timeRemaining
      state.timeElapsed = state.totalTime - timeRemaining
      
      // Check if already expired
      if (timeRemaining <= 0) {
        state.timeRemaining = 0
        state.isExpired = true
        state.isRunning = false
      }
    },
    
    // Add extra time (for special circumstances)
    addExtraTime: (state, action) => {
      const extraMinutes = action.payload
      const extraSeconds = extraMinutes * 60
      state.timeRemaining += extraSeconds
      state.totalTime += extraSeconds
      
      // If was expired, un-expire it
      if (state.isExpired && state.timeRemaining > 0) {
        state.isExpired = false
      }
    },
    
    // Settings
    toggleAutoSubmit: (state) => {
      state.autoSubmitOnExpiry = !state.autoSubmitOnExpiry
    },
    
    toggleWarnings: (state) => {
      state.showWarnings = !state.showWarnings
    },
    
    // Interval management
    setIntervalId: (state, action) => {
      state.intervalId = action.payload
    },
    
    clearIntervalId: (state) => {
      if (state.intervalId) {
        clearInterval(state.intervalId)
        state.intervalId = null
      }
    },
  },
})

export const {
  initializeTimer,
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  resetTimer,
  tick,
  setTimeRemaining,
  addExtraTime,
  toggleAutoSubmit,
  toggleWarnings,
  setIntervalId,
  clearIntervalId,
} = timerSlice.actions

// Selectors
export const selectTimeRemaining = (state) => state.timer.timeRemaining
export const selectTimeElapsed = (state) => state.timer.timeElapsed
export const selectIsRunning = (state) => state.timer.isRunning
export const selectIsExpired = (state) => state.timer.isExpired
export const selectWarningShown = (state) => state.timer.warningShown
export const selectFormattedTimeRemaining = (state) => {
  const seconds = state.timer.timeRemaining
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}

export default timerSlice.reducer