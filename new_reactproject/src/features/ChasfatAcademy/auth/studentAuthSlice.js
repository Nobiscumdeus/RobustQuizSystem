import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  student: null,
  availableExams: [],
  exam: null,
  examiner: null,
  course: null,
  loading: false,
  error: null,
  currentExamSession: null,
  examQuestions: [],
  examAnswers: {},
  token: null, // keep in memory only
  isAuthenticated: false,
};

const studentAuthSlice = createSlice({
  name: "studentAuth",
  initialState,
  reducers: {
    setAuthData: (state, action) => {
      const { student, token, availableExams } = action.payload;
      state.student = student;
      state.token = token;
      state.availableExams = availableExams;
      state.isAuthenticated = true;

      console.log("Auth data set - Token:", token);
    },

    setExamSession: (state, action) => {
      state.currentExamSession = action.payload;
    },
    setExamQuestions: (state, action) => {
      state.examQuestions = action.payload;
    },
    updateAnswer: (state, action) => {
      const { questionNumber, answer } = action.payload;
      state.examAnswers[questionNumber] = answer;
    },
    clearExamData: (state) => {
      state.currentExamQuestions = null;
      state.examQuestions = [];
      state.examAnswers = {};
    },
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { student, token, exam, examiner, course } = action.payload;
      state.student = student;
      state.token = token;
      state.exam = exam;
      state.examiner = examiner;
      state.course = course;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.student = null;
      state.token = null;
      state.exam = null;
      state.examiner = null;
      state.course = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      localStorage.removeItem('studentToken');
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setAuthData,
  setExamSession,
  setExamQuestions,
  updateAnswer,
  clearExamData,
} = studentAuthSlice.actions;

export default studentAuthSlice.reducer;




