// slices/resultSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Configure axios instance
const API_URL =  'http://localhost:5000'

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Async thunks
export const fetchResults = createAsyncThunk(
  'results/fetch',
  async (examId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/exam/${examId}/results`)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch results'
      )
    }
  }
)

export const fetchUserResults = createAsyncThunk(
  'results/fetchUserResults',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/user/results')
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch user results'
      )
    }
  }
)

export const calculateResults = createAsyncThunk(
  'results/calculate',
  async ({ examId, answers }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/exam/${examId}/calculate`, {
        answers,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to calculate results'
      )
    }
  }
)

export const fetchDetailedResults = createAsyncThunk(
  'results/fetchDetailed',
  async ({ examId, userId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/api/exam/${examId}/results/${userId}`
      )
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch detailed results'
      )
    }
  }
)

const initialState = {
  // Current exam results
  currentResults: null,
  
  // User's all exam results
  userResults: [],
  
  // Detailed result breakdown
  detailedResults: null,
  
  // Score information
  score: {
    totalQuestions: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    unanswered: 0,
    percentage: 0,
    grade: null,
    passed: false,
  },
  
  // Question-wise results
  questionResults: [], // Array of { questionId, userAnswer, correctAnswer, isCorrect, points }
  
  // Analytics
  analytics: {
    timeSpent: 0, // in seconds
    averageTimePerQuestion: 0,
    completionRate: 0,
    difficulty: {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    },
    categories: {}, // Category-wise performance
  },
  
  // Ranking and comparison
  ranking: {
    position: null,
    totalParticipants: 0,
    percentile: 0,
  },
  
  // Certificate
  certificate: {
    eligible: false,
    issued: false,
    certificateId: null,
    issuedDate: null,
  },
  
  // Loading states
  isLoading: false,
  isCalculating: false,
  error: null,
  
  // Display settings
  showCorrectAnswers: true,
  showExplanations: true,
  showStatistics: true,
}

const resultSlice = createSlice({
  name: 'results',
  initialState,
  reducers: {
    // Set current results
    setCurrentResults: (state, action) => {
      state.currentResults = action.payload
    },
    
    // Clear results
    clearResults: (state) => {
      state.currentResults = null
      state.detailedResults = null
      state.questionResults = []
      state.score = {
        totalQuestions: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        unanswered: 0,
        percentage: 0,
        grade: null,
        passed: false,
      }
      state.analytics = {
        timeSpent: 0,
        averageTimePerQuestion: 0,
        completionRate: 0,
        difficulty: {
          easy: { correct: 0, total: 0 },
          medium: { correct: 0, total: 0 },
          hard: { correct: 0, total: 0 },
        },
        categories: {},
      }
      state.ranking = {
        position: null,
        totalParticipants: 0,
        percentile: 0,
      }
    },
    
    // Update score
    updateScore: (state, action) => {
      state.score = { ...state.score, ...action.payload }
    },
    
    // Set question results
    setQuestionResults: (state, action) => {
      state.questionResults = action.payload
    },
    
    // Update analytics
    updateAnalytics: (state, action) => {
      state.analytics = { ...state.analytics, ...action.payload }
    },
    
    // Set ranking
    setRanking: (state, action) => {
      state.ranking = { ...state.ranking, ...action.payload }
    },
    
    // Certificate actions
    setCertificateEligibility: (state, action) => {
      state.certificate.eligible = action.payload
    },
    
    issueCertificate: (state, action) => {
      const { certificateId, issuedDate } = action.payload
      state.certificate.issued = true
      state.certificate.certificateId = certificateId
      state.certificate.issuedDate = issuedDate
    },
    
    // Display settings
    toggleShowCorrectAnswers: (state) => {
      state.showCorrectAnswers = !state.showCorrectAnswers
    },
    
    toggleShowExplanations: (state) => {
      state.showExplanations = !state.showExplanations
    },
    
    toggleShowStatistics: (state) => {
      state.showStatistics = !state.showStatistics
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch results
      .addCase(fetchResults.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentResults = action.payload
        
        // Update score if provided
        if (action.payload.score) {
          state.score = { ...state.score, ...action.payload.score }
        }
        
        // Update analytics if provided
        if (action.payload.analytics) {
          state.analytics = { ...state.analytics, ...action.payload.analytics }
        }
        
        // Update ranking if provided
        if (action.payload.ranking) {
          state.ranking = { ...state.ranking, ...action.payload.ranking }
        }
      })
      .addCase(fetchResults.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch user results
      .addCase(fetchUserResults.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserResults.fulfilled, (state, action) => {
        state.isLoading = false
        state.userResults = action.payload.results || []
      })
      .addCase(fetchUserResults.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Calculate results
      .addCase(calculateResults.pending, (state) => {
        state.isCalculating = true
        state.error = null
      })
      .addCase(calculateResults.fulfilled, (state, action) => {
        state.isCalculating = false
        state.currentResults = action.payload
        
        // Update all result data
        if (action.payload.score) {
          state.score = { ...state.score, ...action.payload.score }
        }
        
        if (action.payload.questionResults) {
          state.questionResults = action.payload.questionResults
        }
        
        if (action.payload.analytics) {
          state.analytics = { ...state.analytics, ...action.payload.analytics }
        }
        
        if (action.payload.ranking) {
          state.ranking = { ...state.ranking, ...action.payload.ranking }
        }
        
        if (action.payload.certificate) {
          state.certificate = { ...state.certificate, ...action.payload.certificate }
        }
      })
      .addCase(calculateResults.rejected, (state, action) => {
        state.isCalculating = false
        state.error = action.payload
      })
      
      // Fetch detailed results
      .addCase(fetchDetailedResults.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDetailedResults.fulfilled, (state, action) => {
        state.isLoading = false
        state.detailedResults = action.payload
        
        // Update question results with detailed breakdown
        if (action.payload.questionResults) {
          state.questionResults = action.payload.questionResults
        }
      })
      .addCase(fetchDetailedResults.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const {
  setCurrentResults,
  clearResults,
  updateScore,
  setQuestionResults,
  updateAnalytics,
  setRanking,
  setCertificateEligibility,
  issueCertificate,
  toggleShowCorrectAnswers,
  toggleShowExplanations,
  toggleShowStatistics,
  clearError,
} = resultSlice.actions

// Selectors
export const selectCurrentResults = (state) => state.results.currentResults
export const selectUserResults = (state) => state.results.userResults
export const selectScore = (state) => state.results.score
export const selectQuestionResults = (state) => state.results.questionResults
export const selectAnalytics = (state) => state.results.analytics
export const selectRanking = (state) => state.results.ranking
export const selectCertificate = (state) => state.results.certificate
export const selectIsLoading = (state) => state.results.isLoading
export const selectIsCalculating = (state) => state.results.isCalculating

// Computed selectors
export const selectPassStatus = (state) => {
  const { percentage } = state.results.score
  const passingPercentage = state.results.currentResults?.exam?.passingPercentage || 60
  return percentage >= passingPercentage
}

export const selectGrade = (state) => {
  const { percentage } = state.results.score
  if (percentage >= 90) return 'A'
  if (percentage >= 80) return 'B'
  if (percentage >= 70) return 'C'
  if (percentage >= 60) return 'D'
  return 'F'
}

export default resultSlice.reducer