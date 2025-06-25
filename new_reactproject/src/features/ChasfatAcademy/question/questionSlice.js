// slices/questionSlice.js
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
export const fetchQuestions = createAsyncThunk(
  'questions/fetch',
  async (examId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/exam/${examId}/questions`)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

const initialState = {
  // Questions data
  questions: [],
  currentQuestion: null,
  
  // Question metadata
  totalQuestions: 0,
  questionTypes: {
    multipleChoice: 0,
    trueFalse: 0,
    essay: 0,
    fillInBlank: 0,
  },
  
  // Navigation tracking
  questionStatus: {}, // { questionId: 'answered' | 'flagged' | 'skipped' | 'current' }
  
  // Loading states
  isLoading: false,
  error: null,
  
  // Question display settings
  showQuestionNumbers: true,
  randomizeOptions: false,
}

const questionSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    // Set current question
    setCurrentQuestion: (state, action) => {
      const questionIndex = action.payload
      if (questionIndex >= 0 && questionIndex < state.questions.length) {
        state.currentQuestion = state.questions[questionIndex]
        
        // Update question status
        const questionId = state.currentQuestion._id
        if (!state.questionStatus[questionId]) {
          state.questionStatus[questionId] = 'current'
        }
      }
    },
    
    // Update question status
    setQuestionStatus: (state, action) => {
      const { questionId, status } = action.payload
      state.questionStatus[questionId] = status
    },
    
    // Mark question as answered
    markAsAnswered: (state, action) => {
      const questionId = action.payload
      state.questionStatus[questionId] = 'answered'
    },
    
    // Mark question as flagged
    markAsFlagged: (state, action) => {
      const questionId = action.payload
      const currentStatus = state.questionStatus[questionId]
      
      if (currentStatus === 'flagged') {
        // Unflag - revert to previous status or 'skipped'
        state.questionStatus[questionId] = 'skipped'
      } else {
        state.questionStatus[questionId] = 'flagged'
      }
    },
    
    // Mark question as skipped
    markAsSkipped: (state, action) => {
      const questionId = action.payload
      if (state.questionStatus[questionId] !== 'answered') {
        state.questionStatus[questionId] = 'skipped'
      }
    },
    
    // Shuffle question options (for multiple choice)
    shuffleOptions: (state, action) => {
      const questionIndex = action.payload
      if (questionIndex >= 0 && questionIndex < state.questions.length) {
        const question = state.questions[questionIndex]
        if (question.type === 'multipleChoice' && question.options) {
          // Fisher-Yates shuffle
          const options = [...question.options]
          for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]]
          }
          state.questions[questionIndex].options = options
        }
      }
    },
    
    // Clear all question statuses
    clearQuestionStatuses: (state) => {
      state.questionStatus = {}
    },
    
    // Settings
    toggleQuestionNumbers: (state) => {
      state.showQuestionNumbers = !state.showQuestionNumbers
    },
    
    toggleRandomizeOptions: (state) => {
      state.randomizeOptions = !state.randomizeOptions
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null
    },
    
    // Reset questions
    resetQuestions: (state) => {
      return {
        ...initialState,
        showQuestionNumbers: state.showQuestionNumbers,
        randomizeOptions: state.randomizeOptions,
      }
    },
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.isLoading = false
        state.questions = action.payload.questions
        state.totalQuestions = action.payload.questions.length
        
        // Set current question to first question
        if (action.payload.questions.length > 0) {
          state.currentQuestion = action.payload.questions[0]
          state.questionStatus[action.payload.questions[0]._id] = 'current'
        }
        
        // Count question types
        const typeCounts = { multipleChoice: 0, trueFalse: 0, essay: 0, fillInBlank: 0 }
        action.payload.questions.forEach(question => {
          if (Object.prototype.hasOwnProperty.call(typeCounts, question.type)) {
            typeCounts[question.type]++
          }
        })
        state.questionTypes = typeCounts
        
        // Randomize options if enabled
        if (state.randomizeOptions) {
          action.payload.questions.forEach((question, index) => {
            if (question.type === 'multipleChoice' && question.options) {
              const options = [...question.options]
              for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]]
              }
              state.questions[index].options = options
            }
          })
        }
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const {
  setCurrentQuestion,
  setQuestionStatus,
  markAsAnswered,
  markAsFlagged,
  markAsSkipped,
  shuffleOptions,
  clearQuestionStatuses,
  toggleQuestionNumbers,
  toggleRandomizeOptions,
  clearError,
  resetQuestions,
} = questionSlice.actions

// Selectors
export const selectCurrentQuestion = (state) => state.questions.currentQuestion
export const selectAllQuestions = (state) => state.questions.questions
export const selectQuestionStatus = (state) => state.questions.questionStatus
export const selectQuestionsByStatus = (status) => (state) => {
  return Object.keys(state.questions.questionStatus)
    .filter(questionId => state.questions.questionStatus[questionId] === status)
    .map(questionId => state.questions.questions.find(q => q._id === questionId))
    .filter(Boolean)
}

export const selectAnsweredCount = (state) => {
  return Object.values(state.questions.questionStatus).filter(status => status === 'answered').length
}

export const selectFlaggedCount = (state) => {
  return Object.values(state.questions.questionStatus).filter(status => status === 'flagged').length
}

export default questionSlice.reducer