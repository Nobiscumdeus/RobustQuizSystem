// api/examApi.js

/*
import axios from 'axios'

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
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

*/

import {createApi} from '@reduxjs/toolkit/query/react';
import axios from 'axios'


//Creating axios instance with all custom configs 


const axiosInstance=axios.create({
  baseURL:'http://localhost:5000/api',
  headers:{
    'Content-Type':'application/json',

  },
  timeout:1000, //10 seconds
})

//Adding request interceptors for authentication token 
axiosInstance.interceptors.request.use((config)=>{
  const token=localStorage.getItem('token');
  if(token){
    config.headers.Authorization =`Bearer ${token}`;
  }
  return config
})

//Adding response interceptors for error handling 
axiosInstance.interceptors.response.use(
  (response)=>response,
  (error)=>{
    //Handling token expiry, network errors etc
    if(error.response?.status === 401){
      localStorage.removeItem('token');
      //Redirection to login or dispatch logout action 
     // ...........................................
    }
    return Promise.reject(error)
  }
)


//Custom base query using axios insstead of fetch 
const axiosBaseQuery=({ baseUrl} = {baseUrl:''})=>async({url,method,data,params}) =>{
  try{
    const result=await axiosInstance({
      url:baseUrl + url,
      method,
      data,
      params
    })
    return { data:result.data}
  }catch(axiosError){
    return {
      error:{
        status:axiosError.response?.status || 'FETCH_ERROR',
        data:axiosError.response?.data || axiosError.message || 'An error occurred'
      }
    }
  }
}

//RTK Query API Slice using axios instead of fetch 
export const examApi=createApi({
  reducerPath:'examApi',
  baseQuery:axiosBaseQuery({baseUrl:'/api'}),
  tagTypes:['Exam','Question','Result','Progress'],
  endpoints:(builder)=>({
    //Get all available exams 
    getExams:builder.query({
      query:()=>({
        url:'/exams',
        method:'GET',

      }),
      providesTags:['Exam'],
    }),

     // Get specific exam details
    getExamById: builder.query({
      query: (examId) => ({
        url: `/exam/${examId}`,
        method: 'GET',
      }),
      providesTags: (result, error, examId) => [{ type: 'Exam', id: examId }],
    }),


     // Start an exam session
    startExam: builder.mutation({
      query: (examId) => ({
        url: `/exam/${examId}/start`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, examId) => [{ type: 'Exam', id: examId }],
    }),

     // Get questions for an exam
    getQuestions: builder.query({
      query: (examId) => ({
        url: `/exam/${examId}/questions`,
        method: 'GET',
      }),
      providesTags: (result, error, examId) => [{ type: 'Question', id: examId }],
    }),

     // Save progress (auto-save answers)
    saveProgress: builder.mutation({
      query: ({ examId, answers, currentQuestion }) => ({
        url: `/exam/${examId}/progress`,
        method: 'PUT',
        data: { answers, currentQuestion },
      }),
      invalidatesTags: (result, error, { examId }) => [{ type: 'Progress', id: examId }],
    }),


    
    // Submit final exam
    submitExam: builder.mutation({
      query: ({ examId, answers }) => ({
        url: `/exam/${examId}/submit`,
        method: 'POST',
        data: { answers },
      }),
      invalidatesTags: (result, error, { examId }) => [
        { type: 'Exam', id: examId },
        { type: 'Result', id: examId },
      ],
    }),

     // Get exam results
    getResults: builder.query({
      query: (examId) => ({
        url: `/exam/${examId}/results`,
        method: 'GET',
      }),
      providesTags: (result, error, examId) => [{ type: 'Result', id: examId }],
    }),


     // Get saved progress
    getProgress: builder.query({
      query: (examId) => ({
        url: `/exam/${examId}/progress`,
        method: 'GET',
      }),
      providesTags: (result, error, examId) => [{ type: 'Progress', id: examId }],
    }),


  })
})


//Export hooks for components to use 
export const {
   useGetExamsQuery,
  useGetExamQuery,
  useStartExamMutation,
  useGetQuestionsQuery,
  useSaveProgressMutation,
  useSubmitExamMutation,
  useGetResultsQuery,
  useGetProgressQuery,
} =examApi