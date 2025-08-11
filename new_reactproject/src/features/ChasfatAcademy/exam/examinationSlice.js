/*
// slices/examSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { studentAuth, examSession, questionManager, answerManager, examSubmission, connectionManager, offlineManager, timerSync, proctoring } from '../../../api/examinationApi';

// ============= ASYNC THUNKS =============

// ============= CONSTANTS =============
const DEFAULT_BATCH_SIZE = 5;
const AUTO_SAVE_INTERVAL = 15000; // 15 seconds
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

// Authentication & Initial Setup
export const studentLogin = createAsyncThunk(
  'exam/studentLogin',
  async ({ matricNo, examPassword }, { rejectWithValue }) => {
    try {
      const response = await studentAuth.login(matricNo, examPassword);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

export const fetchAvailableExams = createAsyncThunk(
  'exam/fetchAvailableExams',
  async (matricNo, { rejectWithValue }) => {
    try {
      const response = await studentAuth.getAvailableExams(matricNo);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch exams');
    }
  }
);

// Exam Session Management
export const startExamSession = createAsyncThunk(
  'exam/startExamSession',
  async ({ examId, studentId }, { rejectWithValue, dispatch }) => {
    try {
      // Start the session
      const sessionResponse = await examSession.startSession(examId, studentId);
      
      // Load initial batch of questions
      dispatch(fetchQuestionBatch({ examId, page: 1 }));
      
      // Start timer sync
      dispatch(startTimerSync(sessionResponse.sessionId));
      
      return sessionResponse;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to start exam');
    }
  }
);

export const fetchExamSession = createAsyncThunk(
  'exam/fetchExamSession',
  async ({ examId, studentId }, { rejectWithValue }) => {
    try {
      const response = await examSession.fetchExamSession(examId, studentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch exam session');
    }
  }
);

// Question Loading (Chunked/Batched)
export const fetchQuestionBatch = createAsyncThunk(
  'exam/fetchQuestionBatch',
  async ({ examId, page = 1, batchSize = 5 }, { getState, rejectWithValue }) => {
    try {
      const { exam } = getState();
      
      // Check if already loaded
      if (exam.loadedBatches.includes(page)) {
        return null;
      }
      
      const response = await questionManager.fetchQuestionBatch(examId, page, batchSize);
      return { ...response, page, batchSize };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to load questions');
    }
  }
);

export const preloadNextQuestions = createAsyncThunk(
  'exam/preloadQuestions',
  async ({ examId, currentIndex }, { rejectWithValue }) => {
    try {
      const response = await questionManager.preloadQuestions(examId, currentIndex + 1, 3);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to preload questions');
    }
  }
);

// Answer Management (Auto-save)
export const autoSaveAnswer = createAsyncThunk(
  'exam/autoSaveAnswer',
  async ({ sessionId, questionId, answer }, { rejectWithValue }) => {
    try {
      const response = await answerManager.updateAnswer(sessionId, questionId, answer);
      return { questionId, answer, ...response };
    } catch (error) {
      // If offline, queue the answer
      if (!navigator.onLine) {
        const { offlineManager } = await import('../../../api/examinationApi');
        offlineManager.queueAnswer(sessionId, questionId, answer);
        return { questionId, answer, queued: true };
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to save answer');
    }
  }
);

export const batchSaveAnswers = createAsyncThunk(
  'exam/batchSaveAnswers',
  async ({ sessionId, answers }, { rejectWithValue }) => {
    try {
      const response = await answerManager.saveAnswerBatch(sessionId, answers);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to save answers');
    }
  }
);

// Timer & Sync
export const syncTimer = createAsyncThunk(
  'exam/syncTimer',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await timerSync.syncTimer(sessionId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to sync timer');
    }
  }
);

export const sendHeartbeat = createAsyncThunk(
  'exam/sendHeartbeat',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await timerSync.sendHeartbeat(sessionId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Heartbeat failed');
    }
  }
);

export const checkExamStatus = createAsyncThunk(
  'exam/checkExamStatus',
  async (examId, { rejectWithValue }) => {
    try {
      const response = await timerSync.checkExamStatus(examId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to check exam status');
    }
  }
);

// Exam Submission
export const submitExam = createAsyncThunk(
  'exam/submitExam',
  async ({ sessionId, answers, violations = [] }, { dispatch, rejectWithValue }) => {
    try {
      // Stop auto-save and timer sync
      dispatch(stopAutoSave());
      dispatch(stopTimerSync());
      
      const response = await examSubmission.submitExam(sessionId, answers, violations);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to submit exam');
    }
  }
);

export const autoSubmitExam = createAsyncThunk(
  'exam/autoSubmitExam',
  async ({ sessionId, answers, reason = 'TIME_UP' }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(stopAutoSave());
      dispatch(stopTimerSync());
      
      const response = await examSubmission.autoSubmitExam(sessionId, answers, reason);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to auto-submit exam');
    }
  }
);

// Proctoring & Violations
export const logViolation = createAsyncThunk(
  'exam/logViolation',
  async ({ sessionId, violationType, details }, { rejectWithValue }) => {
    try {
      const response = await proctoring.logViolation(sessionId, violationType, details);
      return { violationType, details, timestamp: new Date().toISOString(), ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to log violation');
    }
  }
);

// Connection Management
export const checkConnection = createAsyncThunk(
  'exam/checkConnection',
  async (_, { rejectWithValue }) => {
    try {
      const health = await connectionManager.checkHealth();
      const speed = await connectionManager.testConnection();
      return { ...health, ...speed };
    } catch (error) {
      return rejectWithValue('Connection check failed');
    }
  }
);

// Offline Sync
export const syncOfflineAnswers = createAsyncThunk(
  'exam/syncOfflineAnswers',
  async (_, { rejectWithValue }) => {
    try {
      const syncCount = await offlineManager.syncOfflineAnswers();
      return { syncCount };
    } catch (error) {
      return rejectWithValue('Offline sync failed');
    }
  }
);

// ============= INITIAL STATE =============
const initialState = {
  // Authentication
  isAuthenticated: false,
  student: null,
  availableExams: [],
  
  // Current Exam Session
  currentExam: null,
  examSession: null,
  examiner: null,
  course: null,
  
  // Questions & Loading
  questions: [],
  loadedBatches: [],
  preloadedQuestions: {},
  totalQuestions: 0,
  currentQuestionIndex: 0,
  
  // Student Progress - FIXED: Using arrays instead of Sets
  answers: {},
  visitedQuestions: [], // Array instead of Set
  flaggedQuestions: [], // Array instead of Set
  answerHistory: [],
  
  // Timer & Status
  timeRemaining: 0,
  examStartTime: null,
  lastSync: null,
  
  // UI States
  isLoading: false,
  isSubmitting: false,
  isSubmitted: false,
  isSaving: false,
  error: null,
  
  // Connection & Sync
  connectionStatus: 'online',
  autoSaveEnabled: true,
  timerSyncEnabled: true,
  heartbeatInterval: null,
  autoSaveInterval: null,
  
  // Proctoring
  proctoringEnabled: false,
  proctoringSettings: null,
  violations: [],
  
  // Settings
  calculatorAllowed: false,
  allowReview: true,
  allowFlagging: true,
  batchSize: 5,
  
  // Performance
  timeSpentPerQuestion: {},
  questionLoadTimes: {},
};

const examinationSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    // Navigation - FIXED: Using array methods instead of Set methods
    goToQuestion: (state, action) => {
      const index = action.payload;
      if (index >= 0 && index < state.totalQuestions) {
        state.currentQuestionIndex = index;
        // Add to visitedQuestions array if not already present
        if (!state.visitedQuestions.includes(index)) {
          state.visitedQuestions.push(index);
        }
      }
    },
    
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.totalQuestions - 1) {
        state.currentQuestionIndex += 1;
        // Add to visitedQuestions array if not already present
        if (!state.visitedQuestions.includes(state.currentQuestionIndex)) {
          state.visitedQuestions.push(state.currentQuestionIndex);
        }
      }
    },
    
    previousQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
        // Add to visitedQuestions array if not already present
        if (!state.visitedQuestions.includes(state.currentQuestionIndex)) {
          state.visitedQuestions.push(state.currentQuestionIndex);
        }
      }
    },

    // Answer Management
    setLocalAnswer: (state, action) => {
      const { questionId, answer } = action.payload;
      state.answers[questionId] = answer;
      
      // Track answer history
      state.answerHistory.push({
        questionId,
        answer,
        timestamp: new Date().toISOString()
      });
    },

    // Question Management - FIXED: Using array methods instead of Set methods
    toggleFlagQuestion: (state, action) => {
      const questionIndex = action.payload;
      const flagIndex = state.flaggedQuestions.indexOf(questionIndex);
      
      if (flagIndex !== -1) {
        // Remove from flagged questions
        state.flaggedQuestions.splice(flagIndex, 1);
      } else {
        // Add to flagged questions
        state.flaggedQuestions.push(questionIndex);
      }
    },

    // Timer Management
    tickTimer: (state) => {
      if (state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      }
    },

    updateTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },

    // Connection Status
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },

    // Auto-save Control - FIXED: Intervals should not be stored in Redux state
    startAutoSave: (state) => {
      state.autoSaveEnabled = true;
      // Note: Don't store interval IDs in Redux state
      // Handle intervals in components or middleware
    },

    stopAutoSave: (state) => {
      state.autoSaveEnabled = false;
      // Clear interval ID reference but don't store the ID in state
      state.autoSaveInterval = null;
    },

    // Timer Sync Control - FIXED: Intervals should not be stored in Redux state
    startTimerSync: (state, action) => {
      state.timerSyncEnabled = true;
      if (action.payload && state.examSession) {
        state.examSession = { ...state.examSession, id: action.payload };
      }
    },

    stopTimerSync: (state) => {
      state.timerSyncEnabled = false;
      // Clear interval ID reference but don't store the ID in state
      state.heartbeatInterval = null;
    },

    // Violations
    addLocalViolation: (state, action) => {
      const violation = {
        ...action.payload,
        timestamp: new Date().toISOString(),
        local: true
      };
      state.violations.push(violation);
    },

    // Error Handling
    clearError: (state) => {
      state.error = null;
    },

    // Reset - FIXED: Proper state reset
    resetExam: (state) => {
      // Reset all state except authentication
      Object.assign(state, {
        ...initialState,
        isAuthenticated: state.isAuthenticated,
        student: state.student,
      });
    },

    // Complete logout reset
    resetAll: () => {
      return { ...initialState };
    },

    // Performance Tracking
    trackQuestionTime: (state, action) => {
      const { questionId, timeSpent } = action.payload;
      state.timeSpentPerQuestion[questionId] = timeSpent;
    },

    // Utility reducers for question management
    markQuestionVisited: (state, action) => {
      const questionIndex = action.payload;
      if (!state.visitedQuestions.includes(questionIndex)) {
        state.visitedQuestions.push(questionIndex);
      }
    },

    markQuestionFlagged: (state, action) => {
      const questionIndex = action.payload;
      if (!state.flaggedQuestions.includes(questionIndex)) {
        state.flaggedQuestions.push(questionIndex);
      }
    },

    unmarkQuestionFlagged: (state, action) => {
      const questionIndex = action.payload;
      const flagIndex = state.flaggedQuestions.indexOf(questionIndex);
      if (flagIndex !== -1) {
        state.flaggedQuestions.splice(flagIndex, 1);
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // Authentication
      .addCase(studentLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(studentLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.student = action.payload.student;
        state.availableExams = action.payload.exams || [];
        state.error = null;
      })
      .addCase(studentLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.student = null;
      })

      // Fetch Available Exams
      .addCase(fetchAvailableExams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailableExams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableExams = action.payload.exams || action.payload || [];
        state.error = null;
      })
      .addCase(fetchAvailableExams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Exam Session Start
      .addCase(startExamSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startExamSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.examSession = action.payload;
        state.currentExam = action.payload.exam || state.currentExam;
        state.examStartTime = new Date().toISOString();
        state.error = null;
      })
      .addCase(startExamSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Exam Session
      .addCase(fetchExamSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExamSession.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        
        state.currentExam = data.exam;
        state.examiner = data.examiner;
        state.course = data.course;
        state.student = data.student;
        state.examSession = data.examSession;
        state.answers = data.existingAnswers || {};
        state.timeRemaining = data.timeRemaining;
        state.violations = data.violations || [];
        state.proctoringEnabled = data.exam?.proctoringSettings?.enabled || false;
        state.proctoringSettings = data.exam?.proctoringSettings;
        state.calculatorAllowed = data.exam?.calculatorAllowed || false;
        
        // Convert any Set-like data to arrays
        if (data.visitedQuestions) {
          state.visitedQuestions = Array.isArray(data.visitedQuestions) 
            ? data.visitedQuestions 
            : Array.from(data.visitedQuestions);
        }
        if (data.flaggedQuestions) {
          state.flaggedQuestions = Array.isArray(data.flaggedQuestions) 
            ? data.flaggedQuestions 
            : Array.from(data.flaggedQuestions);
        }
        
        state.error = null;
      })
      .addCase(fetchExamSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Question Loading
      .addCase(fetchQuestionBatch.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchQuestionBatch.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          const { questions, page, totalQuestions } = action.payload;
          state.questions = [...state.questions, ...questions];
          if (!state.loadedBatches.includes(page)) {
            state.loadedBatches.push(page);
          }
          state.totalQuestions = totalQuestions;
        }
      })
      .addCase(fetchQuestionBatch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Preload Questions
      .addCase(preloadNextQuestions.fulfilled, (state, action) => {
        if (action.payload?.questions) {
          state.preloadedQuestions = { ...state.preloadedQuestions, ...action.payload.questions };
        }
      })

      // Auto-save
      .addCase(autoSaveAnswer.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(autoSaveAnswer.fulfilled, (state, action) => {
        state.isSaving = false;
        state.lastSync = new Date().toISOString();
        
        // Update answer if not queued
        if (!action.payload.queued) {
          state.answers[action.payload.questionId] = action.payload.answer;
        }
      })
      .addCase(autoSaveAnswer.rejected, (state, action) => {
        state.isSaving = false;
        // Don't show error for auto-save failures to avoid disrupting exam
        console.error('Auto-save failed:', action.payload);
      })

      // Batch Save Answers
      .addCase(batchSaveAnswers.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(batchSaveAnswers.fulfilled, (state, action) => {
        state.isSaving = false;
        state.lastSync = new Date().toISOString();
        if (action.payload?.savedAnswers) {
          state.answers = { ...state.answers, ...action.payload.savedAnswers };
        }
      })
      .addCase(batchSaveAnswers.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })

      // Timer Sync
      .addCase(syncTimer.fulfilled, (state, action) => {
        if (typeof action.payload?.timeRemaining === 'number') {
          state.timeRemaining = action.payload.timeRemaining;
        }
        state.lastSync = new Date().toISOString();
      })
      .addCase(syncTimer.rejected, (state, action) => {
        console.error('Timer sync failed:', action.payload);
      })

      // Heartbeat
      .addCase(sendHeartbeat.fulfilled, (state, action) => {
        state.lastSync = new Date().toISOString();
        if (action.payload?.timeRemaining !== undefined) {
          state.timeRemaining = action.payload.timeRemaining;
        }
      })

      // Connection Check
      .addCase(checkConnection.fulfilled, (state, action) => {
        state.connectionStatus = action.payload.connectionStatus || 'online';
      })
      .addCase(checkConnection.rejected, (state) => {
        state.connectionStatus = 'offline';
      })

      // Exam Submission
      .addCase(submitExam.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitExam.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.isSubmitted = true;
        state.examSession = {
          ...state.examSession,
          submissionResult: action.payload
        };
      })
      .addCase(submitExam.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Auto Submit
      .addCase(autoSubmitExam.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(autoSubmitExam.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.isSubmitted = true;
        state.examSession = {
          ...state.examSession,
          submissionResult: action.payload,
          autoSubmitted: true
        };
      })
      .addCase(autoSubmitExam.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Violations
      .addCase(logViolation.fulfilled, (state, action) => {
        // Update violation to mark as synced
        const violation = state.violations.find(v => 
          v.timestamp === action.payload.timestamp && v.local
        );
        if (violation) {
          violation.local = false;
        }
      })
      .addCase(logViolation.rejected, (state, action) => {
        console.error('Failed to log violation:', action.payload);
      })

      // Offline Sync
      .addCase(syncOfflineAnswers.fulfilled, (state, action) => {
        state.lastSync = new Date().toISOString();
        console.log(`Synced ${action.payload.syncCount} offline answers`);
      });
  },
});

export const {
  goToQuestion,
  nextQuestion,
  previousQuestion,
  setLocalAnswer,
  toggleFlagQuestion,
  tickTimer,
  updateTimeRemaining,
  setConnectionStatus,
  startAutoSave,
  stopAutoSave,
  startTimerSync,
  stopTimerSync,
  addLocalViolation,
  clearError,
  resetExam,
  resetAll,
  trackQuestionTime,
  markQuestionVisited,
  markQuestionFlagged,
  unmarkQuestionFlagged,
} = examinationSlice.actions;

export default examinationSlice.reducer;


*/

// slices/examSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { studentAuth, examSession, questionManager, answerManager, examSubmission, connectionManager, offlineManager, timerSync, proctoring } from '../../../api/examinationApi';

// ============= CONSTANTS =============
const DEFAULT_BATCH_SIZE = 5;
//const AUTO_SAVE_INTERVAL = 15000; // 15 seconds
//const HEARTBEAT_INTERVAL = 30000; // 30 seconds

// ============= ASYNC THUNKS =============

// Student Authentication with Matric No and Exam Password
export const studentLogin = createAsyncThunk(
  'exam/studentLogin',
  async ({ matricNo, examPassword }, { rejectWithValue }) => {
    try {
      const response = await studentAuth.login(matricNo, examPassword);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

// Fetch Single Exam Session (aligned with schema - student gets ONE exam at a time)
export const fetchExamSession = createAsyncThunk(
  'exam/fetchExamSession',
  async ({ matricNo, examPassword }, { rejectWithValue }) => {
    try {
      const response = await examSession.fetchExamSession(matricNo, examPassword);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch exam session');
    }
  }
);

// Start Exam Session
export const startExamSession = createAsyncThunk(
  'exam/startExamSession',
  async ({ studentId, examId }, { rejectWithValue, dispatch }) => {
    try {
      // Start the session
      const sessionResponse = await examSession.startSession(examId, studentId);
      
      // Load initial batch of questions
      dispatch(fetchQuestionBatch({ examId, page: 1 }));
      
      // Start timer sync
      dispatch(startTimerSync(sessionResponse.sessionId));
      
      return sessionResponse;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to start exam');
    }
  }
);

// Question Loading (Chunked/Batched)
export const fetchQuestionBatch = createAsyncThunk(
  'exam/fetchQuestionBatch',
  async ({ examId, page = 1, batchSize = DEFAULT_BATCH_SIZE }, { getState, rejectWithValue }) => {
    try {
      const { exam } = getState();
      
      // Check if already loaded
      if (exam.loadedBatches.includes(page)) {
        return null;
      }
      
      const response = await questionManager.fetchQuestionBatch(examId, page, batchSize);
      return { ...response, page, batchSize };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to load questions');
    }
  }
);

// Preload next questions for smooth navigation
export const preloadNextQuestions = createAsyncThunk(
  'exam/preloadQuestions',
  async ({ examId, currentIndex }, { rejectWithValue }) => {
    try {
      const response = await questionManager.preloadQuestions(examId, currentIndex + 1, 3);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to preload questions');
    }
  }
);

// Answer Management (Auto-save)
export const autoSaveAnswer = createAsyncThunk(
  'exam/autoSaveAnswer',
  async ({ sessionId, questionId, answer, timeSpent }, { rejectWithValue }) => {
    try {
      const response = await answerManager.updateAnswer(sessionId, questionId, answer, timeSpent);
      return { questionId, answer, timeSpent, ...response };
    } catch (error) {
      // If offline, queue the answer
      if (!navigator.onLine) {
        const { offlineManager } = await import('../../../api/examinationApi');
        offlineManager.queueAnswer(sessionId, questionId, answer);
        return { questionId, answer, queued: true };
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to save answer');
    }
  }
);

// Batch save multiple answers
export const batchSaveAnswers = createAsyncThunk(
  'exam/batchSaveAnswers',
  async ({ sessionId, answers }, { rejectWithValue }) => {
    try {
      const response = await answerManager.saveAnswerBatch(sessionId, answers);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to save answers');
    }
  }
);

// Timer & Sync Management
export const syncTimer = createAsyncThunk(
  'exam/syncTimer',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await timerSync.syncTimer(sessionId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to sync timer');
    }
  }
);

export const sendHeartbeat = createAsyncThunk(
  'exam/sendHeartbeat',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await timerSync.sendHeartbeat(sessionId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Heartbeat failed');
    }
  }
);

export const checkExamStatus = createAsyncThunk(
  'exam/checkExamStatus',
  async ({ examId, studentId }, { rejectWithValue }) => {
    try {
      const response = await timerSync.checkExamStatus(examId, studentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to check exam status');
    }
  }
);

// Exam Submission
export const submitExam = createAsyncThunk(
  'exam/submitExam',
  async ({ sessionId, answers, violations = [], deviceInfo }, { dispatch, rejectWithValue }) => {
    try {
      // Stop auto-save and timer sync
      dispatch(stopAutoSave());
      dispatch(stopTimerSync());
      
      const response = await examSubmission.submitExam(sessionId, answers, violations, deviceInfo);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to submit exam');
    }
  }
);

export const autoSubmitExam = createAsyncThunk(
  'exam/autoSubmitExam',
  async ({ sessionId, answers, reason = 'TIME_UP', violations = [] }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(stopAutoSave());
      dispatch(stopTimerSync());
      
      const response = await examSubmission.autoSubmitExam(sessionId, answers, reason, violations);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to auto-submit exam');
    }
  }
);

// Proctoring & Violations
export const logViolation = createAsyncThunk(
  'exam/logViolation',
  async ({ sessionId, violationType, details }, { rejectWithValue }) => {
    try {
      const response = await proctoring.logViolation(sessionId, violationType, details);
      return { violationType, details, timestamp: new Date().toISOString(), ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to log violation');
    }
  }
);

// Connection Management
export const checkConnection = createAsyncThunk(
  'exam/checkConnection',
  async (_, { rejectWithValue }) => {
    try {
      const health = await connectionManager.checkHealth();
      const speed = await connectionManager.testConnection();
      return { ...health, ...speed };
    } catch (error) {
      return rejectWithValue('Connection check failed');
    }
  }
);

// Offline Sync
export const syncOfflineAnswers = createAsyncThunk(
  'exam/syncOfflineAnswers',
  async (sessionId, { rejectWithValue }) => {
    try {
      const syncCount = await offlineManager.syncOfflineAnswers(sessionId);
      return { syncCount };
    } catch (error) {
      return rejectWithValue('Offline sync failed');
    }
  }
);

// ============= INITIAL STATE =============
const initialState = {
  // Authentication & Student Info (aligned with Student model)
  isAuthenticated: false,
  student: {
    id: null,
    matricNo: null,
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    department: null,
    level: null,
    isActive: true,
    examinerId: null,
  },
  
  // Current Exam Session (aligned with ExamSession model)
  examSession: {
    id: null,
    studentId: null,
    examId: null,
    startedAt: null,
    endedAt: null,
    ipAddress: null,
    userAgent: null,
    isActive: false,
    violations: null, // JSON field for proctoring violations
  },
  
  // Current Exam Info (aligned with Exam model)
  currentExam: {
    id: null,
    title: null,
    date: null,
    password: null,
    duration: 0, // in minutes
    examinerId: null,
    courseId: null,
    state: 'DRAFT', // DRAFT, READY, PUBLISHED, ACTIVE, COMPLETED, ARCHIVED
    publishedAt: null,
    activatedAt: null,
    completedAt: null,
    description: null,
    instructions: null,
    isPublished: false,
    startTime: null,
    endTime: null,
    maxAttempts: 1,
    passingScore: 60.0,
    proctoringSettings: null, // JSON field
    totalQuestions:0,
  },
  
  // Examiner Info (aligned with User model)
  examiner: {
    id: null,
    username: null,
    email: null,
    firstName: null,
    lastName: null,
    phone: null,
    role: 'examiner',
  },
  
  // Course Info (aligned with Course model)
  course: {
    id: null,
    title: null,
    code: null,
    description: null,
    creditHours: null,
    semester: null,
    isActive: true,
    thumbnailUrl: null,
    examinerId: null,
  },
  
  // Questions & Loading (aligned with Question/ExamQuestion models)
  questions: [], // Array of questions with ExamQuestion data
  loadedBatches: [], // Track which pages are loaded
  preloadedQuestions: {}, // Preloaded questions for smooth navigation
  totalQuestions: 0,
  currentQuestionIndex: 0,
  
  // Student Progress & Answers
  answers: {}, // questionId -> answer mapping
  visitedQuestions: [], // Array of question indices visited
  flaggedQuestions: [], // Array of question indices flagged for review
  answerHistory: [], // Track answer changes for analytics
  timeSpentPerQuestion: {}, // questionId -> time spent (seconds)
  
  // Timer & Status (aligned with exam duration and session tracking)
  timeRemaining: 0, // in seconds
  examStartTime: null,
  examEndTime: null,
  lastSync: null,
  currentQuestionStartTime: null,
  
  // UI States
  isLoading: false,
  isSubmitting: false,
  isSubmitted: false,
  isSaving: false,
  error: null,
  
  // Connection & Sync
  connectionStatus: 'online', // online, offline, poor
  connectionSpeed: null,
  autoSaveEnabled: true,
  timerSyncEnabled: true,
  lastHeartbeat: null,
  
  // Proctoring (aligned with proctoringSettings JSON field)
  proctoringEnabled: false,
  proctoringSettings: {
    faceDetection: false,
    screenShare: false,
    cameraRequired: false,
    microphoneRequired: false,
    browserLock: false,
    keyboardShortcuts: false,
  },
  violations: [], // Array of violation objects
  
  // Exam Settings & Permissions
  calculatorAllowed: false,
  allowReview: true,
  allowFlagging: true,
  allowBackNavigation: true,
  showQuestionNumbers: true,
  randomizeQuestions: false,
  randomizeOptions: false,
  
  // Performance & Analytics
  questionLoadTimes: {}, // Track loading performance
  batteryLevel: null,
  deviceInfo: {
    userAgent: null,
    screen: null,
    timezone: null,
    language: null,
  },
  
  // Offline Support
  offlineAnswers: [], // Answers queued when offline
  hasPendingSync: false,
  
  // Exam Result Preview (aligned with ExamResult model)
  submissionResult: {
    id: null,
    score: null,
    status: 'PENDING', // PENDING, COMPLETED, ARCHIVED, IN_PROGRESS
    submittedAt: null,
    totalQuestions: 0,
    correctAnswers: 0,
    percentage: 0,
    timeSpent: 0, // in seconds
    ipAddress: null,
    deviceInfo: null,
  },
};

const examinationSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    // Navigation
    goToQuestion: (state, action) => {
      const index = action.payload;
      if (index >= 0 && index < state.totalQuestions) {
        // Track time spent on current question
        if (state.currentQuestionStartTime && state.questions[state.currentQuestionIndex]) {
          const timeSpent = Math.floor((Date.now() - state.currentQuestionStartTime) / 1000);
          const questionId = state.questions[state.currentQuestionIndex].id;
          state.timeSpentPerQuestion[questionId] = (state.timeSpentPerQuestion[questionId] || 0) + timeSpent;
        }
        
        state.currentQuestionIndex = index;
        state.currentQuestionStartTime = Date.now();
        
        // Add to visited questions if not already present
        if (!state.visitedQuestions.includes(index)) {
          state.visitedQuestions.push(index);
        }
      }
    },
    
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.totalQuestions - 1) {
        // Track time spent on current question
        if (state.currentQuestionStartTime && state.questions[state.currentQuestionIndex]) {
          const timeSpent = Math.floor((Date.now() - state.currentQuestionStartTime) / 1000);
          const questionId = state.questions[state.currentQuestionIndex].id;
          state.timeSpentPerQuestion[questionId] = (state.timeSpentPerQuestion[questionId] || 0) + timeSpent;
        }
        
        state.currentQuestionIndex += 1;
        state.currentQuestionStartTime = Date.now();
        
        // Add to visited questions if not already present
        if (!state.visitedQuestions.includes(state.currentQuestionIndex)) {
          state.visitedQuestions.push(state.currentQuestionIndex);
        }
      }
    },
    
    previousQuestion: (state) => {
      if (state.currentQuestionIndex > 0 && state.allowBackNavigation) {
        // Track time spent on current question
        if (state.currentQuestionStartTime && state.questions[state.currentQuestionIndex]) {
          const timeSpent = Math.floor((Date.now() - state.currentQuestionStartTime) / 1000);
          const questionId = state.questions[state.currentQuestionIndex].id;
          state.timeSpentPerQuestion[questionId] = (state.timeSpentPerQuestion[questionId] || 0) + timeSpent;
        }
        
        state.currentQuestionIndex -= 1;
        state.currentQuestionStartTime = Date.now();
        
        // Add to visited questions if not already present
        if (!state.visitedQuestions.includes(state.currentQuestionIndex)) {
          state.visitedQuestions.push(state.currentQuestionIndex);
        }
      }
    },

    // Answer Management
    setLocalAnswer: (state, action) => {
      const { questionId, answer } = action.payload;
      state.answers[questionId] = answer;
      
      // Track answer history for analytics
      state.answerHistory.push({
        questionId,
        answer,
        timestamp: new Date().toISOString(),
        questionIndex: state.currentQuestionIndex,
      });
    },

    // Question Management
    toggleFlagQuestion: (state, action) => {
      const questionIndex = action.payload;
      const flagIndex = state.flaggedQuestions.indexOf(questionIndex);
      
      if (flagIndex !== -1) {
        // Remove from flagged questions
        state.flaggedQuestions.splice(flagIndex, 1);
      } else {
        // Add to flagged questions
        state.flaggedQuestions.push(questionIndex);
      }
    },

    markQuestionVisited: (state, action) => {
      const questionIndex = action.payload;
      if (!state.visitedQuestions.includes(questionIndex)) {
        state.visitedQuestions.push(questionIndex);
      }
    },

    // Timer Management
    tickTimer: (state) => {
      if (state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      }
    },

    updateTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },

    startQuestionTimer: (state) => {
      state.currentQuestionStartTime = Date.now();
    },

    // Connection Status
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },

    updateConnectionSpeed: (state, action) => {
      state.connectionSpeed = action.payload;
    },

    // Auto-save Control
    startAutoSave: (state) => {
      state.autoSaveEnabled = true;
    },

    stopAutoSave: (state) => {
      state.autoSaveEnabled = false;
    },

    // Timer Sync Control
    startTimerSync: (state, action) => {
     // state.timerSyncEnabled = true;
      state.timerSyncEnabled =action.payload.timerSyncEnabled
    },

    stopTimerSync: (state) => {
      state.timerSyncEnabled = false;
    },

    updateLastHeartbeat: (state) => {
      state.lastHeartbeat = new Date().toISOString();
    },

    // Violations (aligned with ExamSession.violations JSON field)
    addLocalViolation: (state, action) => {
      const violation = {
        ...action.payload,
        timestamp: new Date().toISOString(),
        local: true,
        questionIndex: state.currentQuestionIndex,
        timeRemaining: state.timeRemaining,
      };
      state.violations.push(violation);
    },

    // Device & Performance Tracking
    updateDeviceInfo: (state, action) => {
      state.deviceInfo = { ...state.deviceInfo, ...action.payload };
    },

    updateBatteryLevel: (state, action) => {
      state.batteryLevel = action.payload;
    },

    // Offline Support
    addOfflineAnswer: (state, action) => {
      const { questionId, answer } = action.payload;
      state.offlineAnswers.push({
        questionId,
        answer,
        timestamp: new Date().toISOString(),
      });
      state.hasPendingSync = true;
    },

    clearOfflineAnswers: (state) => {
      state.offlineAnswers = [];
      state.hasPendingSync = false;
    },

    // Error Handling
    clearError: (state) => {
      state.error = null;
    },

    // Reset Functions
    resetExam: (state) => {
      // Reset all state except authentication and student info
      Object.assign(state, {
        ...initialState,
        isAuthenticated: state.isAuthenticated,
        student: state.student,
      });
    },

    resetAll: () => {
      return { ...initialState };
    },

    // Utility Reducers
    updateExamState: (state, action) => {
      state.currentExam.state = action.payload;
    },

    updateProctoringSettings: (state, action) => {
      state.proctoringSettings = { ...state.proctoringSettings, ...action.payload };
    },
  },

  extraReducers: (builder) => {
    builder
      // Student Authentication
      .addCase(studentLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(studentLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        
        // Map response to student state (aligned with Student model)
        const { student, exam, examiner, course, examSession } = action.payload;
        
        state.student = {
          id: student.id,
          matricNo: student.matricNo,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email || null,
          phone: student.phone || null,
          department: student.department || null,
          level: student.level || null,
          isActive: student.isActive,
          examinerId: student.examinerId,
        };
        // If examSession exists, it means student has an active/existing session
if (examSession) {
  state.examSession = {
    id: examSession.id,
    studentId: examSession.studentId,
    examId: examSession.examId,
    startedAt: examSession.startedAt,
    endedAt: examSession.endedAt, // null if still active
    ipAddress: examSession.ipAddress,
    userAgent: examSession.userAgent,
    isActive: examSession.isActive,
    violations: examSession.violations, // JSON field with proctoring violations
  };

  // Set exam timing based on session
  if (examSession.startedAt && exam?.duration) {
    const sessionStart = new Date(examSession.startedAt);
    const now = new Date();
    const elapsedMinutes = Math.floor((now - sessionStart) / 60000);
    const remainingMinutes = Math.max(0, exam.duration - elapsedMinutes);
    state.timeRemaining = remainingMinutes * 60; // Convert to seconds
  }

  // If session is not active, student might have already completed
  if (!examSession.isActive && examSession.endedAt) {
    state.isSubmitted = true;
    state.examEndTime = examSession.endedAt;
  }
}
        
        // Set exam info if available
        if (exam) {
          state.currentExam = {
            id: exam.id,
            title: exam.title,
            date: exam.date,
            password: exam.password,
            duration: exam.duration,
            examinerId: exam.examinerId,
            courseId: exam.courseId,
            state: exam.state || 'PUBLISHED',
            publishedAt: exam.publishedAt,
            activatedAt: exam.activatedAt,
            completedAt: exam.completedAt,
            description: exam.description,
            instructions: exam.instructions,
            isPublished: exam.isPublished,
            startTime: exam.startTime,
            endTime: exam.endTime,
            maxAttempts: exam.maxAttempts || 1,
            passingScore: exam.passingScore || 60.0,
            proctoringSettings: exam.proctoringSettings,
          };
          
          // Set proctoring settings
          if (exam.proctoringSettings) {
            state.proctoringEnabled = exam.proctoringSettings.enabled || false;
            state.proctoringSettings = exam.proctoringSettings;
          }
        }
        
        // Set examiner info
        if (examiner) {
          state.examiner = {
            id: examiner.id,
            username: examiner.username,
            email: examiner.email,
            firstName: examiner.firstName,
            lastName: examiner.lastName,
            phone: examiner.phone,
            role: examiner.role,
          };
        }
        
        // Set course info
        if (course) {
          state.course = {
            id: course.id,
            title: course.title,
            code: course.code,
            description: course.description,
            creditHours: course.creditHours,
            semester: course.semester,
            isActive: course.isActive,
            thumbnailUrl: course.thumbnailUrl,
            examinerId: course.examinerId,
          };
        }

       
       
        
        state.error = null;
      })
      .addCase(studentLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.student = initialState.student;
      })

      // Fetch Exam Session
      .addCase(fetchExamSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExamSession.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        
        // Update exam session info (aligned with ExamSession model)
        if (data.examSession) {
          state.examSession = {
            id: data.examSession.id,
            studentId: data.examSession.studentId,
            examId: data.examSession.examId,
            startedAt: data.examSession.startedAt,
            endedAt: data.examSession.endedAt,
            ipAddress: data.examSession.ipAddress,
            userAgent: data.examSession.userAgent,
            isActive: data.examSession.isActive,
            violations: data.examSession.violations,
          };
        }
        
        // Restore existing answers and progress
        state.answers = data.existingAnswers || {};
        state.timeRemaining = data.timeRemaining || 0;
        state.violations = data.violations || [];
        state.visitedQuestions = data.visitedQuestions || [];
        state.flaggedQuestions = data.flaggedQuestions || [];
        state.timeSpentPerQuestion = data.timeSpentPerQuestion || {};
        
        state.error = null;
      })
      .addCase(fetchExamSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Start Exam Session
      .addCase(startExamSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startExamSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.examSession = action.payload;
        state.examStartTime = new Date().toISOString();
        state.currentQuestionStartTime = Date.now();
        
        // Set initial timer
        if (state.currentExam.duration) {
          state.timeRemaining = state.currentExam.duration * 60; // Convert minutes to seconds
        }
        
        state.error = null;
      })
      .addCase(startExamSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Question Loading
      .addCase(fetchQuestionBatch.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchQuestionBatch.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          const { questions, page, totalQuestions } = action.payload;
          
          // Append questions (aligned with Question/ExamQuestion models)
          state.questions = [...state.questions, ...questions];
          
          if (!state.loadedBatches.includes(page)) {
            state.loadedBatches.push(page);
          }
          
          state.totalQuestions = totalQuestions;
        }
      })
      .addCase(fetchQuestionBatch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Preload Questions
      .addCase(preloadNextQuestions.fulfilled, (state, action) => {
        if (action.payload?.questions) {
          state.preloadedQuestions = { 
            ...state.preloadedQuestions, 
            ...action.payload.questions 
          };
        }
      })

      // Auto-save Answers
      .addCase(autoSaveAnswer.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(autoSaveAnswer.fulfilled, (state, action) => {
        state.isSaving = false;
        state.lastSync = new Date().toISOString();
        
        // Update answer if not queued
        if (!action.payload.queued) {
          state.answers[action.payload.questionId] = action.payload.answer;
          
          // Update time spent if provided
          if (action.payload.timeSpent) {
            state.timeSpentPerQuestion[action.payload.questionId] = action.payload.timeSpent;
          }
        }
      })
      .addCase(autoSaveAnswer.rejected, (state, action) => {
        state.isSaving = false;
        // Don't show error for auto-save failures to avoid disrupting exam
        console.error('Auto-save failed:', action.payload);
      })

      // Batch Save Answers
      .addCase(batchSaveAnswers.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(batchSaveAnswers.fulfilled, (state, action) => {
        state.isSaving = false;
        state.lastSync = new Date().toISOString();
        if (action.payload?.savedAnswers) {
          state.answers = { ...state.answers, ...action.payload.savedAnswers };
        }
      })
      .addCase(batchSaveAnswers.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })

      // Timer Sync
      .addCase(syncTimer.fulfilled, (state, action) => {
        if (typeof action.payload?.timeRemaining === 'number') {
          state.timeRemaining = action.payload.timeRemaining;
        }
        state.lastSync = new Date().toISOString();
      })
      .addCase(syncTimer.rejected, (state, action) => {
        console.error('Timer sync failed:', action.payload);
      })

      // Heartbeat
      .addCase(sendHeartbeat.fulfilled, (state, action) => {
        state.lastHeartbeat = new Date().toISOString();
        state.lastSync = new Date().toISOString();
        
        if (action.payload?.timeRemaining !== undefined) {
          state.timeRemaining = action.payload.timeRemaining;
        }
      })

      // Connection Check
      .addCase(checkConnection.fulfilled, (state, action) => {
        state.connectionStatus = action.payload.connectionStatus || 'online';
        state.connectionSpeed = action.payload.speed || null;
      })
      .addCase(checkConnection.rejected, (state) => {
        state.connectionStatus = 'offline';
      })

      // Exam Submission
      .addCase(submitExam.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitExam.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.isSubmitted = true;
        state.examEndTime = new Date().toISOString();
        
        // Update submission result (aligned with ExamResult model)
        if (action.payload) {
          state.submissionResult = {
            id: action.payload.id,
            score: action.payload.score,
            status: action.payload.status || 'COMPLETED',
            submittedAt: action.payload.submittedAt || new Date().toISOString(),
            totalQuestions: action.payload.totalQuestions || state.totalQuestions,
            correctAnswers: action.payload.correctAnswers || 0,
            percentage: action.payload.percentage || 0,
            timeSpent: action.payload.timeSpent || 0,
            ipAddress: action.payload.ipAddress,
            deviceInfo: action.payload.deviceInfo,
          };
        }
        
        // Update exam session end time
        if (state.examSession) {
          state.examSession.endedAt = new Date().toISOString();
          state.examSession.isActive = false;
        }
      })
      .addCase(submitExam.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Auto Submit Exam
      .addCase(autoSubmitExam.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(autoSubmitExam.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.isSubmitted = true;
        state.examEndTime = new Date().toISOString();
        
        // Update submission result (aligned with ExamResult model)
        if (action.payload) {
          state.submissionResult = {
            id: action.payload.id,
            score: action.payload.score,
            status: action.payload.status || 'COMPLETED',
            submittedAt: action.payload.submittedAt || new Date().toISOString(),
            totalQuestions: action.payload.totalQuestions || state.totalQuestions,
            correctAnswers: action.payload.correctAnswers || 0,
            percentage: action.payload.percentage || 0,
            timeSpent: action.payload.timeSpent || 0,
            ipAddress: action.payload.ipAddress,
            deviceInfo: action.payload.deviceInfo,
          };
          
          // Mark as auto-submitted
          state.submissionResult.autoSubmitted = true;
          state.submissionResult.autoSubmitReason = action.payload.reason || 'TIME_UP';
        }
        
        // Update exam session
        if (state.examSession) {
          state.examSession.endedAt = new Date().toISOString();
          state.examSession.isActive = false;
        }
      })
      .addCase(autoSubmitExam.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Violations
      .addCase(logViolation.fulfilled, (state, action) => {
        // Update violation to mark as synced
        const violation = state.violations.find(v => 
          v.timestamp === action.payload.timestamp && v.local
        );
        if (violation) {
          violation.local = false;
          violation.id = action.payload.id;
        }
      })
      .addCase(logViolation.rejected, (state, action) => {
        console.error('Failed to log violation:', action.payload);
      })

      // Offline Sync
      .addCase(syncOfflineAnswers.fulfilled, (state, action) => {
        state.lastSync = new Date().toISOString();
        state.hasPendingSync = false;
        state.offlineAnswers = [];
        console.log(`Synced ${action.payload.syncCount} offline answers`);
      })
      .addCase(syncOfflineAnswers.rejected, (state, action) => {
        console.error('Offline sync failed:', action.payload);
      })

      // Check Exam Status
      .addCase(checkExamStatus.fulfilled, (state, action) => {
        if (action.payload) {
          // Update exam state if changed
          if (action.payload.examState && action.payload.examState !== state.currentExam.state) {
            state.currentExam.state = action.payload.examState;
          }
          
          // Update time remaining if provided
          if (typeof action.payload.timeRemaining === 'number') {
            state.timeRemaining = action.payload.timeRemaining;
          }
          
          // Check if exam was force-ended by examiner
          if (action.payload.forceEnded) {
            state.currentExam.state = 'COMPLETED';
            state.error = 'Exam has been ended by the examiner';
          }
        }
      })
      .addCase(checkExamStatus.rejected, (state, action) => {
        console.error('Failed to check exam status:', action.payload);
      });
  },
});

export const {
  goToQuestion,
  nextQuestion,
  previousQuestion,
  setLocalAnswer,
  toggleFlagQuestion,
  markQuestionVisited,
  tickTimer,
  updateTimeRemaining,
  startQuestionTimer,
  setConnectionStatus,
  updateConnectionSpeed,
  startAutoSave,
  stopAutoSave,
  startTimerSync,
  stopTimerSync,
  updateLastHeartbeat,
  addLocalViolation,
  updateDeviceInfo,
  updateBatteryLevel,
  addOfflineAnswer,
  clearOfflineAnswers,
  clearError,
  resetExam,
  resetAll,
  updateExamState,
  updateProctoringSettings,





  
} = examinationSlice.actions;


// ============= SELECTORS =============

// Student Info Selectors
export const selectStudent = (state) => state.exam.student;
export const selectIsAuthenticated = (state) => state.exam.isAuthenticated;

// Exam Info Selectors
export const selectCurrentExam = (state) => state.exam.currentExam;

// If the above doesn't work, try this alternative that includes examiner and course:
export const selectCurrentExamWithDetails = (state) => ({
  ...state.exam.currentExam,
  examiner: state.exam.examiner,
  course: state.exam.course
});



export const selectExaminer = (state) => state.exam.examiner;
export const selectCourse = (state) => state.exam.course;
export const selectExamSession = (state) => state.exam.examSession;

// Question & Progress Selectors
export const selectQuestions = (state) => state.exam.questions;
export const selectCurrentQuestion = (state) => {
  const { questions, currentQuestionIndex } = state.exam;
  return questions[currentQuestionIndex] || null;
};
export const selectCurrentQuestionIndex = (state) => state.exam.currentQuestionIndex;
export const selectTotalQuestions = (state) => state.exam.totalQuestions;
export const selectAnswers = (state) => state.exam.answers;
export const selectVisitedQuestions = (state) => state.exam.visitedQuestions;
export const selectFlaggedQuestions = (state) => state.exam.flaggedQuestions;

// Timer Selectors
export const selectTimeRemaining = (state) => state.exam.timeRemaining;
export const selectTimeRemainingFormatted = (state) => {
  const seconds = state.exam.timeRemaining;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Progress Selectors
export const selectExamProgress = (state) => {
  const { visitedQuestions, totalQuestions, answers } = state.exam;
  const answered = Object.keys(answers).length;
  const visited = visitedQuestions.length;
  
  return {
    answered,
    visited,
    total: totalQuestions,
    answeredPercentage: totalQuestions > 0 ? Math.round((answered / totalQuestions) * 100) : 0,
    visitedPercentage: totalQuestions > 0 ? Math.round((visited / totalQuestions) * 100) : 0,
  };
};

// Connection & Status Selectors
export const selectConnectionStatus = (state) => state.exam.connectionStatus;
export const selectIsLoading = (state) => state.exam.isLoading;
export const selectIsSubmitting = (state) => state.exam.isSubmitting;
export const selectIsSubmitted = (state) => state.exam.isSubmitted;
export const selectError = (state) => state.exam.error;

// Proctoring Selectors
export const selectProctoringEnabled = (state) => state.exam.proctoringEnabled;
export const selectProctoringSettings = (state) => state.exam.proctoringSettings;
export const selectViolations = (state) => state.exam.violations;

// Submission Result Selector
export const selectSubmissionResult = (state) => state.exam.submissionResult;




export default examinationSlice.reducer;
