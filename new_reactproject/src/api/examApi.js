// api/examApi.js
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

// Exam API functions
const examApi = {
  // Get all exams
  getExams: () => api.get('/exams'),
  
  // Get exam by ID
  getExam: (id) => api.get(`/exam/${id}`),
  
  // Start exam
  startExam: (examId) => api.post(`/exam/${examId}/start`),
  
  // Submit exam
  submitExam: (examId, answers) => api.post(`/exam/${examId}/submit`, { answers }),
  
  // Save progress
  saveProgress: (examId, answers, currentQuestion) => 
    api.put(`/exam/${examId}/progress`, { answers, currentQuestion }),
  
  // Get exam questions
  getQuestions: (examId) => api.get(`/exam/${examId}/questions`),
  
  // Get exam results
  getResults: (examId) => api.get(`/exam/${examId}/results`),
}

export default examApi