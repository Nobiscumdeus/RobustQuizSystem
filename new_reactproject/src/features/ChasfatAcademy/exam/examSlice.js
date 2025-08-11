// slices/examSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

import { studentAuth, examSession,  questionManager, answerManager, examSubmission, timerSync } from '../../../api/examApi'

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ============== ENHANCED AUTO-SAVE FUNCTIONALITY ==============

export const autoSaveAnswer = createAsyncThunk(
  'exam/autoSaveAnswer',
  async ({ sessionId, questionId, answer }, { getState, rejectWithValue }) => {
    try {
      const state = getState().exam;
      
      // Skip if auto-save is disabled or exam is submitted
      if (!state.autoSaveEnabled || state.isSubmitted) {
        return null;
      }

      const response = await answerManager.updateAnswer(sessionId, questionId, answer);
      return { 
        questionId, 
        answer, 
        timestamp: new Date().toISOString(),
        ...response 
      };
    } catch (error) {
      // Handle offline scenario
      if (!navigator.onLine) {
        const { offlineManager } = await import('../../../api/examApi');
        await offlineManager.queueAnswer(sessionId, questionId, answer);
        return { 
          questionId, 
          answer, 
          queued: true, 
          offline: true,
          timestamp: new Date().toISOString()
        };
      }
      
      // Don't throw error for auto-save failures - just log them
      console.error('Auto-save failed:', error.message);
      return rejectWithValue({
        questionId,
        error: error.response?.data?.message || 'Auto-save failed',
        canRetry: true
      });
    }
  }
);

export const batchAutoSave = createAsyncThunk(
  'exam/batchAutoSave',
  async ({ sessionId }, { getState, rejectWithValue }) => {
    try {
      const state = getState().exam;
      const unsavedAnswers = [];
      
      // Collect unsaved answers
      Object.entries(state.answers).forEach(([questionId, answer]) => {
        if (!state.savedAnswers[questionId] || 
            state.savedAnswers[questionId] !== answer) {
          unsavedAnswers.push({ questionId, answer });
        }
      });

      if (unsavedAnswers.length === 0) {
        return { message: 'No unsaved answers', count: 0 };
      }

      const response = await answerManager.saveAnswerBatch(sessionId, unsavedAnswers);
      return { 
        ...response, 
        savedAnswers: unsavedAnswers,
        count: unsavedAnswers.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return rejectWithValue({
        error: error.response?.data?.message || 'Batch auto-save failed',
        canRetry: true
      });
    }
  }
);

// ============== ENHANCED TIMER SYNC FUNCTIONALITY ==============

export const syncTimer = createAsyncThunk(
  'exam/syncTimer',
  async (sessionId, { getState, rejectWithValue }) => {
    try {
      const state = getState().exam;
      
      // Skip if timer sync is disabled
      if (!state.timerSyncEnabled || !state.isActive) {
        return null;
      }

      const response = await timerSync.syncTimer(sessionId);
      
      // Calculate drift between client and server time
      const clientTime = state.timeRemaining;
      const serverTime = response.timeRemaining;
      const drift = Math.abs(clientTime - serverTime);
      
      return {
        ...response,
        drift,
        requiresAdjustment: drift > 10, // 10 seconds tolerance
        syncTimestamp: new Date().toISOString()
      };
    } catch (error) {
      return rejectWithValue({
        error: error.response?.data?.message || 'Timer sync failed',
        canRetry: true
      });
    }
  }
);

export const sendHeartbeat = createAsyncThunk(
  'exam/sendHeartbeat',
  async ({ sessionId, clientState }, { getState, rejectWithValue }) => {
    try {
      const state = getState().exam;
      
      const heartbeatData = {
        sessionId,
        timeRemaining: state.timeRemaining,
        currentQuestionIndex: state.currentQuestionIndex,
        answersCount: Object.keys(state.answers).length,
        violationsCount: state.violations.length,
        connectionStatus: state.connectionStatus,
        timestamp: new Date().toISOString(),
        ...clientState
      };

      const response = await timerSync.sendHeartbeat(heartbeatData);
      
      return {
        ...response,
        heartbeatTimestamp: new Date().toISOString()
      };
    } catch (error) {
      return rejectWithValue({
        error: error.response?.data?.message || 'Heartbeat failed',
        canRetry: true
      });
    }
  }
);

// ============== ENHANCED EXAM SESSION MANAGEMENT ==============

export const startExamSession = createAsyncThunk(
  'exam/startExamSession',
  async ({ examId, studentId }, { rejectWithValue, dispatch }) => {
    try {
      // Start the session
      const sessionResponse = await examSession.startSession(examId, studentId);
      
      // Load initial batch of questions
      dispatch(fetchQuestionBatch({ examId, page: 1 }));
      
      // Initialize auto-save and timer sync
      dispatch(initializeAutoSave(sessionResponse.sessionId));
      dispatch(initializeTimerSync(sessionResponse.sessionId));
      
      return sessionResponse;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start exam');
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
      return rejectWithValue(error.response?.data?.message || 'Failed to load questions');
    }
  }
);


// ============== BACKGROUND SYNC MANAGEMENT ==============

export const initializeAutoSave = createAsyncThunk(
  'exam/initializeAutoSave',
  async (sessionId, { dispatch, getState }) => {
    const state = getState().exam;
    
    if (state.autoSaveInterval) {
      clearInterval(state.autoSaveInterval);
    }

    const intervalId = setInterval(() => {
      dispatch(batchAutoSave({ sessionId }));
    }, 30000); // Auto-save every 30 seconds

    return { intervalId, sessionId };
  }
);

export const fetchAvailableExams = createAsyncThunk(
  'exam/fetchAvailableExams',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await examSession.getAvailableExams(studentId);
      return response.exams;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available exams');
    }
  }
);
export const initializeTimerSync = createAsyncThunk(
  'exam/initializeTimerSync',
  async (sessionId, { dispatch, getState }) => {
    const state = getState().exam;
    
    if (state.timerSyncInterval) {
      clearInterval(state.timerSyncInterval);
    }

    if (state.heartbeatInterval) {
      clearInterval(state.heartbeatInterval);
    }

    // Timer sync every 2 minutes
    const timerSyncId = setInterval(() => {
      dispatch(syncTimer(sessionId));
    }, 120000);

    // Heartbeat every 30 seconds
    const heartbeatId = setInterval(() => {
      dispatch(sendHeartbeat({ sessionId }));
    }, 30000);

    return { 
      timerSyncInterval: timerSyncId, 
      heartbeatInterval: heartbeatId, 
      sessionId 
    };
  }
);

// ============== EXISTING THUNKS (keeping the important ones) ==============

export const studentLogin = createAsyncThunk(
  'exam/studentLogin',
  async ({ matricNo, examPassword }, { rejectWithValue }) => {
    try {
      const response = await studentAuth.login(matricNo, examPassword);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
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
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch exam session');
    }
  }
);

export const submitExam = createAsyncThunk(
  'exam/submitExam',
  async ({ sessionId, answers, violations = [] }, { dispatch, rejectWithValue }) => {
    try {
      // Stop auto-save and timer sync before submission
      dispatch(stopAutoSave());
      dispatch(stopTimerSync());
      
      // Perform final save before submission
      await dispatch(batchAutoSave({ sessionId })).unwrap();
      
      const response = await examSubmission.submitExam(sessionId, answers, violations);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit exam');
    }
  }
);

// ============== ENHANCED INITIAL STATE ==============

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
  examId: null,
  
  // Questions & Loading
  questions: [],
  loadedBatches: [],
  totalQuestions: 0,
  currentQuestionIndex: 0,
  
  // Student Progress
  answers: {},
  savedAnswers: {}, // Track which answers are saved to server
  visitedQuestions: [],
  flaggedQuestions: [],
  answerHistory: [],
  
  // Timer & Status
  timeRemaining: 0,
  examStartTime: null,
  lastSync: null,
  serverTimeOffset: 0, // Difference between client and server time
  
  // Status flags
  isActive: false,
  isStarted: false,
  isSubmitted: false,
  isPaused: false,
  isLoading: false,
  isSubmitting: false,
  isSaving: false,
  error: null,
  
  // Auto-save system
  autoSaveEnabled: true,
  autoSaveInterval: null,
  autoSaveStatus: 'idle', // 'idle', 'saving', 'success', 'error'
  lastAutoSave: null,
  pendingSaves: [],
  
  // Timer sync system
  timerSyncEnabled: true,
  timerSyncInterval: null,
  heartbeatInterval: null,
  lastHeartbeat: null,
  syncStatus: 'idle', // 'idle', 'syncing', 'success', 'error'
  timeDrift: 0,
  
  // Connection & Sync
  connectionStatus: 'online', // 'online', 'offline', 'poor'
  offlineQueue: [],
  
  // Proctoring
  proctoringEnabled: false,
  proctoringSettings: null,
  violations: [],
  
  // Settings
  calculatorAllowed: false,
  allowReview: true,
  allowFlagging: true,
  batchSize: 5,
  
  // Performance tracking
  timeSpentPerQuestion: {},
  questionLoadTimes: {},
  
  // UI states
  showConfirmDialog: false,
  navigationHistory: [],
}

// ============== ENHANCED SLICE ==============

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    // Navigation
    goToQuestion: (state, action) => {
      const questionIndex = action.payload
      if (questionIndex >= 0 && questionIndex < state.totalQuestions) {
        state.currentQuestionIndex = questionIndex
        state.visitedQuestions.add(questionIndex)
        
        // Track navigation for analytics
        state.navigationHistory.push({
          from: state.currentQuestionIndex,
          to: questionIndex,
          timestamp: new Date().toISOString()
        });
      }
    },
    
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.totalQuestions - 1) {
        state.currentQuestionIndex += 1
        state.visitedQuestions.add(state.currentQuestionIndex)
      }
    },
    
    previousQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1
        state.visitedQuestions.add(state.currentQuestionIndex)
      }
    },
    
    // Enhanced answer management with auto-save tracking
    setLocalAnswer: (state, action) => {
      const { questionId, answer } = action.payload;
      state.answers[questionId] = answer;
      
      // Track answer history
      state.answerHistory.push({
        questionId,
        answer,
        timestamp: new Date().toISOString()
      });
      
      // Mark as pending save if different from saved version
      if (state.savedAnswers[questionId] !== answer) {
        if (!state.pendingSaves.includes(questionId)) {
          state.pendingSaves.push(questionId);
        }
      }
    },

    // Mark answer as saved
    markAnswerSaved: (state, action) => {
      const { questionId, answer } = action.payload;
      state.savedAnswers[questionId] = answer;
      state.pendingSaves = state.pendingSaves.filter(id => id !== questionId);
    },

    // Timer management
    tickTimer: (state) => {
      if (state.timeRemaining > 0 && state.isActive && !state.isPaused) {
        state.timeRemaining -= 1;
      }
    },
    
    updateTimer: (state, action) => {
      const { timeRemaining, serverTime, drift } = action.payload;
      state.timeRemaining = timeRemaining;
      
      if (serverTime) {
        state.lastSync = new Date().toISOString();
      }
      
      if (drift !== undefined) {
        state.timeDrift = drift;
      }
    },

    // Auto-save control
    enableAutoSave: (state) => {
      state.autoSaveEnabled = true;
    },
    
    disableAutoSave: (state) => {
      state.autoSaveEnabled = false;
    },
    
    stopAutoSave: (state) => {
      state.autoSaveEnabled = false;
      if (state.autoSaveInterval) {
        clearInterval(state.autoSaveInterval);
        state.autoSaveInterval = null;
      }
    },

    // Timer sync control
    enableTimerSync: (state) => {
      state.timerSyncEnabled = true;
    },
    
    disableTimerSync: (state) => {
      state.timerSyncEnabled = false;
    },
    
    stopTimerSync: (state) => {
      state.timerSyncEnabled = false;
      if (state.timerSyncInterval) {
        clearInterval(state.timerSyncInterval);
        state.timerSyncInterval = null;
      }
      if (state.heartbeatInterval) {
        clearInterval(state.heartbeatInterval);
        state.heartbeatInterval = null;
      }
    },

    // Connection status
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },

    // Question flagging
    toggleFlagQuestion: (state, action) => {
      const questionIndex = action.payload
      if (state.flaggedQuestions.has(questionIndex)) {
        state.flaggedQuestions.delete(questionIndex)
      } else {
        state.flaggedQuestions.add(questionIndex)
      }
    },
    
    // Exam control
    pauseExam: (state) => {
      state.isPaused = true
    },
    
    resumeExam: (state) => {
      state.isPaused = false
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null
    },
    
    // Reset and cleanup
    resetExam: (state) => {
      // Clear intervals
      if (state.autoSaveInterval) {
        clearInterval(state.autoSaveInterval);
      }
      if (state.timerSyncInterval) {
        clearInterval(state.timerSyncInterval);
      }
      if (state.heartbeatInterval) {
        clearInterval(state.heartbeatInterval);
      }
      
      return {
        ...initialState,
        // Keep user preferences
        allowReview: state.allowReview,
        allowFlagging: state.allowFlagging,
        autoSaveEnabled: state.autoSaveEnabled,
        timerSyncEnabled: state.timerSyncEnabled,
      }
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch exam session
      .addCase(fetchExamSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExamSession.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;

        // Core exam data
        state.currentExam = data.exam;
        state.examiner = data.examiner;
        state.course = data.course;
        state.student = data.student;
        
        // Questions and session
        state.questions = data.questions;
        state.examSession = data.examSession;
        state.totalQuestions = data.questions.length;
        
        // Student progress
        state.answers = data.existingAnswers || {};
        state.savedAnswers = { ...data.existingAnswers } || {}; // Mark existing answers as saved
        state.timeRemaining = data.timeRemaining;
        state.violations = data.violations || [];
        
        // Settings
        state.proctoringEnabled = data.exam.proctoringSettings?.enableScreenShare || false;
        state.proctoringSettings = data.exam.proctoringSettings;
        state.calculatorAllowed = data.examiner.settings?.allowCalculator || false;
      })
      .addCase(fetchExamSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Auto-save handling
      .addCase(autoSaveAnswer.pending, (state) => {
        state.autoSaveStatus = 'saving';
        state.isSaving = true;
      })
      .addCase(autoSaveAnswer.fulfilled, (state, action) => {
        if (action.payload) {
          state.autoSaveStatus = 'success';
          state.lastAutoSave = action.payload.timestamp;
          
          if (!action.payload.offline) {
            state.savedAnswers[action.payload.questionId] = action.payload.answer;
            state.pendingSaves = state.pendingSaves.filter(id => id !== action.payload.questionId);
          }
        }
        state.isSaving = false;
      })
      .addCase(autoSaveAnswer.rejected, (state, action) => {
        state.autoSaveStatus = 'error';
        state.isSaving = false;
        // Don't set general error for auto-save failures
        console.warn('Auto-save failed:', action.payload);
      })

      // Batch auto-save
      .addCase(batchAutoSave.pending, (state) => {
        state.autoSaveStatus = 'saving';
        state.isSaving = true;
      })
      .addCase(batchAutoSave.fulfilled, (state, action) => {
        state.autoSaveStatus = 'success';
        state.isSaving = false;
        
        if (action.payload.savedAnswers) {
          action.payload.savedAnswers.forEach(({ questionId, answer }) => {
            state.savedAnswers[questionId] = answer;
          });
          // Clear pending saves for successfully saved answers
          const savedIds = action.payload.savedAnswers.map(a => a.questionId);
          state.pendingSaves = state.pendingSaves.filter(id => !savedIds.includes(id));
        }
        
        state.lastAutoSave = action.payload.timestamp;
      })
      .addCase(batchAutoSave.rejected, (state, action) => {
        //state.autoSaveStatus = 'error';
        state.autoSaveStatus =action.payload.autoSaveStatus ||'error';
        
       // state.isSaving = false;
        state.isSaving = action.payload.isSaving || false;
      })

      // Timer sync handling
      .addCase(syncTimer.pending, (state) => {
        state.syncStatus = 'syncing';
      })
      .addCase(syncTimer.fulfilled, (state, action) => {
        if (action.payload) {
          state.syncStatus = 'success';
          state.lastSync = action.payload.syncTimestamp;
          state.timeDrift = action.payload.drift || 0;
          
          // Adjust time if there's significant drift
          if (action.payload.requiresAdjustment) {
            state.timeRemaining = action.payload.timeRemaining;
          }
        }
      })
      .addCase(syncTimer.rejected, (state, action) => {
        state.syncStatus = 'error';
        state.syncStatus=action.payload.syncStatus || 'error';
      })

      // Heartbeat
      .addCase(sendHeartbeat.fulfilled, (state, action) => {
        state.lastHeartbeat = action.payload.heartbeatTimestamp;
        
        // Update connection status based on heartbeat response
        if (action.payload.connectionQuality) {
          state.connectionStatus = action.payload.connectionQuality;
        }
      })

      // Initialize intervals
      .addCase(initializeAutoSave.fulfilled, (state, action) => {
        state.autoSaveInterval = action.payload.intervalId;
        state.autoSaveEnabled = true;
      })
      .addCase(initializeTimerSync.fulfilled, (state, action) => {
        state.timerSyncInterval = action.payload.timerSyncInterval;
        state.heartbeatInterval = action.payload.heartbeatInterval;
        state.timerSyncEnabled = true;
      })

      // Start exam session
      .addCase(startExamSession.fulfilled, (state, action) => {
        state.examSession = action.payload;
        state.isActive = true;
        state.isStarted = true;
        state.examStartTime = new Date().toISOString();
      })

      // Submit exam
      .addCase(submitExam.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitExam.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.isSubmitted = true;
        state.isActive = false;
        
        // Clear all intervals
        state.autoSaveEnabled = false;
        state.timerSyncEnabled = false;
        
        state.examSession = { 
          ...state.examSession, 
          isActive: false,
          submissionResult: action.payload
        };
      })
      .addCase(submitExam.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
  },
})

export const {
  goToQuestion,
  nextQuestion,
  previousQuestion,
  setLocalAnswer,
  markAnswerSaved,
  toggleFlagQuestion,
  tickTimer,
  updateTimer,
  enableAutoSave,
  disableAutoSave,
  stopAutoSave,
  enableTimerSync,
  disableTimerSync,
  stopTimerSync,
  setConnectionStatus,
  pauseExam,
  resumeExam,
  resetExam,
  clearError,
} = examSlice.actions

export default examSlice.reducer