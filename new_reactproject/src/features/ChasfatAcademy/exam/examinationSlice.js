// store/slices/examinationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const examinationSlice = createSlice({
  name: 'examination',
  initialState: {
    // Session Management
    examSession: null,
    sessionId: null,
    isActive: false,
    
    // Questions & Navigation
    questions: [],
    currentQuestionIndex: 0,
    totalQuestions: 0,
    
    // Answers & Progress
    answers: {}, // { questionId: answer }
    savedAnswers: {}, // Last saved state
    unsavedChanges: false,
    
    // Timing
    timeRemaining: 0, // in seconds
    serverTime: null,
    lastSyncTime: null,
    
    // UI State
    loading: false,
    error: null,
    isSubmitting: false,
    isSubmitted: false,
    
    // Features
    calculatorOpen: false,
    violations: [],
    
    // Auto-save
    autoSaveEnabled: true,
    lastAutoSave: null
  },
  reducers: {
    // Session Management
    setExamSession: (state, action) => {
      const { sessionId, questions, timeRemaining } = action.payload;
      state.sessionId = sessionId;
      state.questions = questions;
      state.totalQuestions = questions.length;
      state.timeRemaining = timeRemaining;
      state.isActive = true;
      state.loading = false;
    },
    
    // Question Navigation
    setCurrentQuestion: (state, action) => {
      state.currentQuestionIndex = action.payload;
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1;
      }
    },
    previousQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
      }
    },
    
    // Answer Management
    setAnswer: (state, action) => {
      const { questionId, answer } = action.payload;
      state.answers[questionId] = answer;
      state.unsavedChanges = true;
    },
    setAnswerBatch: (state, action) => {
      state.answers = { ...state.answers, ...action.payload };
      state.unsavedChanges = true;
    },
    markAnswersSaved: (state) => {
      state.savedAnswers = { ...state.answers };
      state.unsavedChanges = false;
      state.lastAutoSave = Date.now();
    },
    
    // Timer Management
    updateTimer: (state, action) => {
      const { timeRemaining, serverTime } = action.payload;
      state.timeRemaining = timeRemaining;
      state.serverTime = serverTime;
      state.lastSyncTime = Date.now();
    },
    decrementTimer: (state) => {
      if (state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      }
    },
    
    // UI State
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    toggleCalculator: (state) => {
      state.calculatorOpen = !state.calculatorOpen;
    },
    
    // Submission
    startSubmission: (state) => {
      state.isSubmitting = true;
      state.error = null;
    },
    completeSubmission: (state) => {
      state.isSubmitted = true;
      state.isSubmitting = false;
      state.isActive = false;
      state.examSession = null;
    },
    
    // Violations
    addViolation: (state, action) => {
      state.violations.push({
        ...action.payload,
        timestamp: Date.now()
      });
    },
    
    // Reset
    resetExamination: () => {
      return examinationSlice.getInitialState();
    }
  }
});

export const {
  setExamSession,
  setCurrentQuestion,
  nextQuestion,
  previousQuestion,
  setAnswer,
  setAnswerBatch,
  markAnswersSaved,
  updateTimer,
  decrementTimer,
  setLoading,
  setError,
  toggleCalculator,
  startSubmission,
  completeSubmission,
  addViolation,
  resetExamination
} = examinationSlice.actions;

export default examinationSlice.reducer;