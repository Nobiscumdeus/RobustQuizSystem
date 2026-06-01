import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import sessionStorage from "redux-persist/lib/storage/session";

// Core slices
import authReducer from "./features/ChasfatAcademy/auth/authSlice";
import studentAuthReducer from "./features/ChasfatAcademy/auth/studentAuthSlice";
import examinationReducer from "./features/ChasfatAcademy/exam/examinationSlice";
import questionReducer from "./features/ChasfatAcademy/question/questionSlice";
import timerReducer from "./features/ChasfatAcademy/timer/timerSlice";
import resultReducer from "./features/ChasfatAcademy/result/resultSlice";
import trial_quizReducer from "./features/ChasfatAcademy/trial_quiz/trial_quizSlice";

// UI preference slices (create these files)
//import displayModeReducer from "./features/ChasfatAcademy/ui/displayModeSlice"; 
import displayModeReducer from "@features/ChasfatAcademy/ui/displayModeSlice";
import fontSizeReducer from "@features/ChasfatAcademy/ui/fontSizeSlice";      // dark/light
//import fontSizeReducer from "./features/ChasfatAcademy/ui/fontSizeSlice";  
import timerPositionReducer from "@features/ChasfatAcademy/ui/timerPositionSlice";           // small/medium/large
//import timerPositionReducer from "./features/ChasfatAcademy/ui/timerPositionSlice";

import calculatorTypeReducer from "@features/ChasfatAcademy/ui/calculatorTypeSlice";
//import calculatorTypeReducer from "./features/ChasfatAcademy/ui/calculatorTypeSlice"; // basic/scientific/medical

// RTK Query API
//import { examinationApi } from "./api/examinationApi";
import { examinationApi} from "@api/examinationApi";
//RTK Query API for Users authentication 
//import { authApi } from "./api/authApi";
import {authApi} from "@api/authApi";
import { dashboardApi } from "@api/dashboardApi";
import { profileApi } from "@api/profileApi";
import { questionApi } from "@api/questionApi";
import { reportsApi } from "@api/reportsApi";
import { courseApi } from "@api/courseApi";
import { examApi } from "@api/examApi";
import { studentApi } from "@api/studentApi";
import {analyticsApi} from "@api/analyticsApi";

// Student auth persistence
const studentAuthPersistConfig = {
  key: "studentAuth",
  storage: sessionStorage,
  whitelist: ["student", "availableExams", "sessionId"],
};

// Combined UI preferences
const uiReducer = combineReducers({
  displayMode: displayModeReducer,     // dark/light mode
  fontSize: fontSizeReducer,           // text size
  timerPosition: timerPositionReducer, // where timer shows
  calculatorType: calculatorTypeReducer, // calculator style
});

const uiPersistConfig = {
  key: "ui",
  storage: sessionStorage,
  whitelist: ["displayMode", "fontSize", "timerPosition", "calculatorType"],
};

const store = configureStore({
  reducer: {
    // Persisted slices (safe user preferences)
    studentAuth: persistReducer(studentAuthPersistConfig, studentAuthReducer),
    ui: persistReducer(uiPersistConfig, uiReducer),
    
    // Non-persisted slices (volatile/sensitive)
    auth: authReducer,
    questions: questionReducer,
    examination: examinationReducer,
    timer: timerReducer,
    results: resultReducer,
    trial_quiz: trial_quizReducer,

    // RTK Query for examination
    [examinationApi.reducerPath]: examinationApi.reducer,
    //RTK Query for authentication 
    [authApi.reducerPath]: authApi.reducer,
    //RTK Query for dashboard operations 
    [dashboardApi.reducerPath] : dashboardApi.reducer,
    //RTK Query for profile 
    [profileApi.reducerPath] : profileApi.reducer,
    //RTK Query for questions
    [questionApi.reducerPath]: questionApi.reducer,
    //RTK Query for reports 
    [reportsApi.reducerPath] : reportsApi.reducer,
    //RTK Query for courses
    [courseApi.reducerPath] : courseApi.reducer,
    //RTK Query for exam admin
    [examApi.reducerPath] : examApi.reducer,
    //RTK Query for student admin
    [ studentApi.reducerPath] : studentApi.reducer,
    //RTK Query for analytics 
    [analyticsApi.reducerPath] : analyticsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(examinationApi.middleware).concat(authApi.middleware)
    .concat(dashboardApi.middleware).concat(profileApi.middleware)
    .concat(questionApi.middleware).concat(reportsApi.middleware)
    .concat(courseApi.middleware).concat(examApi.middleware)
    .concat(studentApi.middleware).concat(analyticsApi.middleware),
});

export const persistor = persistStore(store);
export default store;



/*
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

*/
