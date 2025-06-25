// store.js
/*
import { configureStore } from "@reduxjs/toolkit";
import todosReducer from './features/todos/todosSlice';
import filtersReducer from './features/filters/filtersSlice';
import timerReducer from './features/ChasfatAcademy/timer/timerSlice';
import darkModeReducer from './features/ChasfatAcademy/darkmode/darkModeSlice';
import quizReducer from './features/ChasfatAcademy/quiz/quizSlice'; 
import trial_quizReducer from './features/ChasfatAcademy/trial_quiz/trial_quizSlice';

// Configure the Redux store
const store = configureStore({
  reducer: {

    todos: todosReducer, 
    filters: filtersReducer,
    quiz: quizReducer,
    timer: timerReducer,
    darkMode: darkModeReducer, // Ensure darkModeReducer is added to the store
    trial_quiz:trial_quizReducer,
  },
});

export default store; // Default export for the store
*/


import { configureStore } from "@reduxjs/toolkit";
import authReducer from './features/ChasfatAcademy/auth/authSlice';
import examReducer from './features/ChasfatAcademy/exam/examSlice';
import questionReducer from './features/ChasfatAcademy/question/questionSlice';
import timerReducer from './features/ChasfatAcademy/timer/timerSlice';
import resultReducer from './features/ChasfatAcademy/result/resultSlice';

// Importing an API slice created using RTK Query (Redux Toolkit's data-fetching tool).
import { examApi } from './api/examApi'


export const store =configureStore({
  reducer:{
    auth:authReducer,
    exam:examReducer,
    questions:questionReducer,
    timer:timerReducer,
    results:resultReducer,
    //RTK Api reducer 
    [examApi.reducerPath] : examApi.reducer
  },
  middleware:(getDefaultMiddleware)=>
    getDefaultMiddleware({
      serializableCheck:{
        ignoredActions:['persist/PERSIST','persist/REHYDRATE']
      }
    }).concat(examApi.middleware),
     
})


