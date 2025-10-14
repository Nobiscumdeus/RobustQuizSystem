/*
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './features/ChasfatAcademy/auth/authSlice';
import studentAuthReducer from './features/ChasfatAcademy/auth/studentAuthSlice';
import examinationReducer from './features/ChasfatAcademy/exam/examinationSlice';
import questionReducer from './features/ChasfatAcademy/question/questionSlice';
import timerReducer from './features/ChasfatAcademy/timer/timerSlice';
import resultReducer from './features/ChasfatAcademy/result/resultSlice';
import darkModeReducer from './features/ChasfatAcademy/darkmode/darkModeSlice';
import trial_quizReducer from './features/ChasfatAcademy/trial_quiz/trial_quizSlice';

// Persist only studentAuth
const studentAuthPersistConfig = {
  key: 'studentAuth',
  storage,
};

const store = configureStore({
  reducer: {
    studentAuth: persistReducer(studentAuthPersistConfig, studentAuthReducer),
    auth: authReducer,
    questions: questionReducer,
    examination: examinationReducer,
    timer: timerReducer,
    results: resultReducer,
    trial_quiz: trial_quizReducer,
    darkMode: darkModeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);


export default store;

*/
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Feature slices
import authReducer from "./features/ChasfatAcademy/auth/authSlice";
import studentAuthReducer from "./features/ChasfatAcademy/auth/studentAuthSlice";
import examinationReducer from "./features/ChasfatAcademy/exam/examinationSlice";
import questionReducer from "./features/ChasfatAcademy/question/questionSlice";
import timerReducer from "./features/ChasfatAcademy/timer/timerSlice";
import resultReducer from "./features/ChasfatAcademy/result/resultSlice";
import darkModeReducer from "./features/ChasfatAcademy/darkmode/darkModeSlice";
import trial_quizReducer from "./features/ChasfatAcademy/trial_quiz/trial_quizSlice";

// RTK Query API

import { examinationApi } from "./api/examinationApi";
// Persist only studentAuth safe fields
const studentAuthPersistConfig = {
  key: "studentAuth",
  storage,
  whitelist: ["student", "availableExams"], // ✅ no token
};

const store = configureStore({
  reducer: {
    studentAuth: persistReducer(studentAuthPersistConfig, studentAuthReducer),
    auth: authReducer,
    questions: questionReducer,
    examination: examinationReducer,
    timer: timerReducer,
    results: resultReducer,
    trial_quiz: trial_quizReducer,
    darkMode: darkModeReducer,

    // ✅ Register RTK Query reducer
    [examinationApi.reducerPath]: examinationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(examinationApi.middleware), // ✅ Add RTK Query middleware
});

export const persistor = persistStore(store);
export default store;
