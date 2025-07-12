// slices/examSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'


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

// Async thunks
export const startExam = createAsyncThunk(
  'exam/start',
  async (examId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/exam/${examId}/start`)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const submitExam = createAsyncThunk(
  'exam/submit',
  async ({ examId, answers }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/exam/${examId}/submit`, { answers })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

export const saveProgress = createAsyncThunk(
  'exam/saveProgress',
  async ({ examId, answers, currentQuestion }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/exam/${examId}/progress`, {
        answers,
        currentQuestion,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

const initialState = {
  // Current exam session
  currentExam: null,
  examId: null,
  isActive: false,
  isStarted: false,
  isSubmitted: false,
  isPaused: false,
  
  // Navigation
  currentQuestionIndex: 0,
  totalQuestions: 0,
  visitedQuestions: new Set(),
  
  // Answers and progress
  answers: {},
  flaggedQuestions: new Set(),
  
  // Exam metadata
  examTitle: '',
  examDescription: '',
  duration: 0, // in minutes
  instructions: '',
  
  // Status
  isLoading: false,
  isSaving: false,
  error: null,
  
  // Settings
  allowReview: true,
  allowFlagging: true,
  shuffleQuestions: false,

  //others 
  currentQuestion:0,
  timeRemaining:0,
  isExamActive:false,
  navigationHistory:[], //UI state
  showConfirmDialog:false , //UI state
  proctoringWarnings:[] //local tracking 


}

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
      }
    },
    
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.totalQuestions - 1) {
        state.currentQuestionIndex += 1
        state.visitedQuestions.add(state.currentQuestionIndex)
      }
    },
    setCurrentQuestion:(state,action)=>{
      state.currentQuestion=action.payload
    },
    
    previousQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1
        state.visitedQuestions.add(state.currentQuestionIndex)
      }
    },
    
    // Answer management
    saveAnswer: (state, action) => {
      const { questionId, answer } = action.payload
      state.answers[questionId] = answer
    },
    
    clearAnswer: (state, action) => {
      const questionId = action.payload
      delete state.answers[questionId]
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
    
    // Reset and cleanup
    resetExam: (state) => {
      return {
        ...initialState,
        // Keep user preferences
        allowReview: state.allowReview,
        allowFlagging: state.allowFlagging,
      }
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null
    },
    //Update timer
    updateTimer:(state,action)=>{
      state.timeRemaining=action.payload
    },
    
    // Set exam data
    setExamData: (state, action) => {
      const { exam, questions } = action.payload
      state.currentExam = exam
      state.examId = exam._id
      state.examTitle = exam.title
      state.examDescription = exam.description
      state.duration = exam.duration
      state.instructions = exam.instructions
      state.totalQuestions = questions.length
      state.allowReview = exam.allowReview
      state.allowFlagging = exam.allowFlagging
      state.shuffleQuestions = exam.shuffleQuestions
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Start exam
      .addCase(startExam.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(startExam.fulfilled, (state, action) => {
        state.isLoading = false
        state.isStarted = true
        state.isActive = true
        state.visitedQuestions.add(0) // Mark first question as visited
        // Load any existing progress
        if (action.payload.progress) {
          state.answers = action.payload.progress.answers || {}
          state.currentQuestionIndex = action.payload.progress.currentQuestion || 0
        }
      })
      .addCase(startExam.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Submit exam
      .addCase(submitExam.pending, (state) => {
        state.isLoading = true
      })
      .addCase(submitExam.fulfilled, (state) => {
        state.isLoading = false
        state.isSubmitted = true
        state.isActive = false
      })
      .addCase(submitExam.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Save progress
      .addCase(saveProgress.pending, (state) => {
        state.isSaving = true
      })
      .addCase(saveProgress.fulfilled, (state) => {
        state.isSaving = false
      })
      .addCase(saveProgress.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload
      })
  },
})

export const {
  goToQuestion,
  nextQuestion,
  previousQuestion,
  saveAnswer,
  clearAnswer,
  toggleFlagQuestion,
  pauseExam,
  resumeExam,
  resetExam,
  clearError,
  setExamData,
} = examSlice.actions

export default examSlice.reducer




/*


// Complex exam operations involving multiple models
export const startExamSession = createAsyncThunk(
  'exam/startSession',
  async ({ examId, studentId }, { dispatch }) => {
    // 1. Validate exam availability
    // 2. Check student eligibility  
    // 3. Create attendance record
    // 4. Initialize timer
    // 5. Log exam start in ExamResult
    // 6. Set up proctoring if enabled
  }
)

export const submitExam = createAsyncThunk(
  'exam/submit',
  async ({ examId, answers }, { getState, dispatch }) => {
    // 1. Calculate scores
    // 2. Update ExamResult model
    // 3. Create notification
    // 4. Update attendance
    // 5. Clean up timer
    // 6. Generate analytics
  }
)

export const autoSaveProgress = createAsyncThunk(
  'exam/autoSave',
  async ({ examId, currentAnswers }, { dispatch }) => {
    // Background auto-save logic
    // Handle network failures gracefully
  }
)

*/