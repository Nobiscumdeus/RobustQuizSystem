import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const examinationApi = createApi({
  reducerPath: 'examinationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000',
    credentials: 'include',
    timeout: 15000,
    prepareHeaders: (headers) => {
      // Optional: Add any custom headers if needed
      return headers;
    }
  }),

  tagTypes: ['Student', 'ExamSession', 'Answers', 'Questions', 'Violations'],
  
  endpoints: (builder) => ({
    // =========== AUTHENTICATION ===========
    studentLogin: builder.mutation({
      query: ({ matricNo }) => ({
        url: '/student/login',
        method: 'POST',
        body: { matricNo }
      }),
      providesTags: ['Student']
    }),

    // =========== EXAM ACCESS ===========
    validateExamAccess: builder.mutation({
      query: ({ examId, password }) => ({
        url: `/student/exam/${examId}/validate`,
        method: 'POST',
        body: { password }
      }),
      providesTags: (result) => [
        { type: 'ExamSession', id: result?.examSession?.id }
      ]
    }),

    // =========== EXAM SESSION ===========
    startExamSession: builder.mutation({
      query: ({ sessionId }) => ({
        url: `/session/${sessionId}/start`,
        method: 'POST'
      }),
      providesTags: (result, error, { sessionId }) => [
        { type: 'ExamSession', id: sessionId },
        { type: 'Questions', id: sessionId }
      ]
    }),

    fetchExamSession: builder.query({
      query: (sessionId) => `/exam/${sessionId}/session`,
      providesTags: (result, error, sessionId) => [
        { type: 'ExamSession', id: sessionId }
      ]
    }),

    // =========== QUESTIONS ===========
    fetchExamQuestions: builder.query({
      query: ({ sessionId, batch = 0, limit = 20 }) => ({
        url: `/session/${sessionId}/questions`,
        params: { batch, limit }
      }),
      providesTags: (result, error, { sessionId }) => [
        { type: 'Questions', id: sessionId }
      ]
    }),

    // =========== ANSWER MANAGEMENT ===========
    saveAnswer: builder.mutation({
      query: ({ sessionId, questionId, answer }) => ({
        url: `/session/${sessionId}/answer`,
        method: 'PUT',
        body: { questionId, answer }
      }),
      invalidatesTags: (result, error, { sessionId }) => [
        { type: 'Answers', id: sessionId }
      ]
    }),

    saveAnswerBatch: builder.mutation({
      query: ({ sessionId, answers }) => ({
        url: `/session/${sessionId}/answers/batch`,
        method: 'PUT',
        body: { answers }
      }),
      invalidatesTags: (result, error, { sessionId }) => [
        { type: 'Answers', id: sessionId }
      ]
    }),

    getCurrentAnswers: builder.query({
      query: (sessionId) => `/session/${sessionId}/answers`,
      providesTags: (result, error, sessionId) => [
        { type: 'Answers', id: sessionId }
      ]
    }),

    // =========== EXAM SUBMISSION ===========
    submitExam: builder.mutation({
      query: (sessionId) => ({
        url: `/session/${sessionId}/submit`,
        method: 'POST'
      }),
      invalidatesTags: () => [
        'ExamSession',
        'Answers',
        'Questions'
      ]
    }),

    autoSubmitExam: builder.mutation({
      query: (sessionId) => ({
        url: `/session/${sessionId}/auto-submit`,
        method: 'POST'
      }),
      invalidatesTags: ['ExamSession', 'Answers']
    }),

    // =========== TIMER & SYNCHRONIZATION ===========
    syncTimer: builder.query({
      query: (sessionId) => `/session/${sessionId}/time`,
      providesTags: ['ExamSession']
    }),

    // =========== PROCTORING ===========
    sendHeartbeat: builder.mutation({
      query: ({ sessionId }) => ({
        url: `/session/${sessionId}/heartbeat`,
        method: 'POST',
        body: { clientTime: new Date().toISOString() }
      })
    }),

    logViolation: builder.mutation({
      query: ({ sessionId, violationType, details }) => ({
        url: `/session/${sessionId}/violation`,
        method: 'POST',
        body: { violationType, details }
      }),
      invalidatesTags: ['Violations']
    }),

    getViolations: builder.query({
      query: (sessionId) => `/session/${sessionId}/violations`,
      providesTags: ['Violations']
    }),

    getStudentResults: builder.query({
  query: () => '/student/results',
  providesTags: ['ExamResults']
}),

getExamResultDetails: builder.query({
  query: (examId) => `/student/results/${examId}`,
  providesTags: (result, error, examId) => [
    { type: 'ExamResultDetails', id: examId }
  ]
}),

getPerformanceStats: builder.query({
  query: () => '/student/performance',
  providesTags: ['PerformanceStats']
}),


  })

});

// Export all hooks
export const {
  // Authentication
  useStudentLoginMutation,
  useValidateExamAccessMutation,
  
  // Exam Session
  useStartExamSessionMutation,
  useFetchExamSessionQuery,
  
  // Questions
  useFetchExamQuestionsQuery,
  
  // Answers
  useSaveAnswerMutation,
  useSaveAnswerBatchMutation,
  useGetCurrentAnswersQuery,
  
  // Submission
  useSubmitExamMutation,
  useAutoSubmitExamMutation,
  
  // Timer
  useSyncTimerQuery,
  
  // Proctoring
  useSendHeartbeatMutation,
  useLogViolationMutation,
  useGetViolationsQuery,

  //Results 
  useGetStudentResultsQuery,
  useGetExamResultDetailsQuery,
  useGetPerformanceStatsQuery
} = examinationApi;
