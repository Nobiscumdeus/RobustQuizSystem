// store.js

import { configureStore } from "@reduxjs/toolkit";
import todosReducer from './features/todos/todosSlice';
import filtersReducer from './features/filters/filtersSlice';
import timerReducer from './features/ChasfatAcademy/timer/timerSlice';
import darkModeReducer from './features/ChasfatAcademy/darkmode/darkModeSlice';
import quizReducer from './features/ChasfatAcademy/quiz/quizSlice'; 
import trial_quizReducer from './store/trial_quizSlice';

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
