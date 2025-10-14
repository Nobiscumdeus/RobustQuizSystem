// store/api/examApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const examinationApi = createApi({
  reducerPath: 'examinationApi',
 baseQuery: fetchBaseQuery({
  baseUrl: 'http://localhost:5000/',
  timeout:15000, //15 seconds timeout
  prepareHeaders: (headers, { getState }) => {
    const token = getState().studentAuth.token || localStorage.getItem('studentToken');
     console.log("📤 Attaching token:", token ? token.slice(0, 25) + "..." : "❌ No token")
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  }
}),

  tagTypes: ['Student', 'AvailableExams', 'ExamSession', 'Answer', 'Questions'],
  endpoints: (builder) => ({
    // Step 1: Student Login (matric number only)
    studentLogin: builder.mutation({
      query: (credentials) => ({
        url: 'student/login',
        method: 'POST',
        body: credentials // { matricNo }
      }),
    //  providesTags: ['Student', 'AvailableExams']
    providesTags:(result,error,arg)=>[
      { type:'Student',id:arg.matricNo},
      { type:'AvaialableExams',id:'LIST'}
    ]
    }),

    // Step 2: Validate Exam Access (exam password)
    validateExamAccess: builder.mutation({
      query: ({ examId, password }) => ({
        url: `/student/exam/${examId}/validate`,
        method: 'POST',
        body: { password }
      }),
     // providesTags: ['ExamSession']
       providesTags: (result) => [
        { type: 'ExamSession', id: result?.examSession?.id } // ← Specific session
      ]

    }),




    // Change from query to mutation
   startExamSession: builder.mutation({
  query: (sessionId) => ({
    url: `session/${sessionId}/start`,
    method: 'POST'
  }),
  //providesTags: ['ExamSession', 'Questions']
    providesTags: (result, error, sessionId) => [
        { type: 'ExamSession', id: sessionId }, // ← This specific session
        { type: 'Questions', id: sessionId }    // ← Questions for this session
      ]
}),

    // Fetch Exam Session Status
    fetchExamSession: builder.query({
      query: ({ examId }) => `exam/${examId}/session`,
      method:'GET',
    //  providesTags: ['ExamSession']
     providesTags: (result, error, arg) => [
        { type: 'Questions', id: arg.sessionId } // ← Questions for session 456
      ]
    }),

    //Fetch Exam questions 
    fetchExamQuestions:builder.query({
      query:({ sessionId}) =>`session/${sessionId}/questions`,

    }),

    // Fetch Questions in Batches
    fetchQuestionBatch: builder.query({
      query: ({ studentId, examId, batch }) => 
        `${studentId}/questions?examId=${examId}&batch=${batch}`,
      providesTags: ['Questions']
    }),

    // Answer Management
    saveAnswer: builder.mutation({
      query: ({ sessionId, questionId, answer }) => ({
        url: `session/${sessionId}/answer`,
        method: 'PUT',
        body: { questionId, answer }
      }),
     //invalidatesTags: ['Answer']
       invalidatesTags: (result, error, arg) => [
        { type: 'Answer', id: arg.sessionId } // ← Answers for session 456
      ]
    }),

    saveAnswerBatch: builder.mutation({
      query: ({ sessionId, answers }) => ({
        url: `session/${sessionId}/answers/batch`,
        method: 'PUT',
        body: { answers }
      }),
      invalidatesTags: ['Answer']
    }),

    // Get Current Answers
    getCurrentAnswers: builder.query({
      query: (sessionId) => `session/${sessionId}/answers`,
     // providesTags: ['Answer']
      providesTags: (result, error, sessionId) => [
        { type: 'Answer', id: sessionId } // ← Answers for this specific session
      ]
    }),

    // Exam Submission
    submitExam: builder.mutation({
      query: (sessionId) => ({
        url: `session/${sessionId}/submit`,
        method: 'POST'
      }),
     // invalidatesTags: ['ExamSession', 'Answer']
       invalidatesTags: (result, error, sessionId) => [
        { type: 'ExamSession', id: sessionId },  // ← This session is done
        { type: 'Answer', id: sessionId },        // ← Answers are finalized
        { type: 'Questions', id: sessionId },     // ← Questions no longer needed
        { type: 'AvailableExams', id: 'LIST' }    // ← Exam list might show new attempt count
      ]
    }),

    // Auto Submit (when time expires)
    autoSubmitExam: builder.mutation({
      query: (sessionId) => ({
        url: `session/${sessionId}/auto-submit`,
        method: 'POST'
      }),
   //  invalidatesTags: ['ExamSession', 'Answer']
       invalidatesTags: (result, error, sessionId) => [
        { type: 'ExamSession', id: sessionId },  // ← This session is done
        { type: 'Answer', id: sessionId },        // ← Answers are finalized
       
      ]
    }),

    // Timer Sync
    syncTimer: builder.query({
      query: (sessionId) => `session/${sessionId}/time`,
      //providesTags: ['ExamSession']
       invalidatesTags: (result, error, sessionId) => [
        { type: 'ExamSession', id: sessionId },  // ← This session is done
     
       
      ]
    }),

    // Proctoring Features
    sendHeartbeat: builder.mutation({
      query: ({ sessionId, clientTime }) => ({
        url: `session/${sessionId}/heartbeat`,
        method: 'POST',
        body: { clientTime }
      })
    }),

    logViolation: builder.mutation({
      query: ({ sessionId, violationType, details }) => ({
        url: `session/${sessionId}/violation`,
        method: 'POST',
        body: { violationType, details }
      })
    }),

    getViolations: builder.query({
      query: (sessionId) => `session/${sessionId}/violations`
    })
  })
});

export const {
  // Authentication Flow
  useStudentLoginMutation,
  useValidateExamAccessMutation,
  
  // Exam Session
  useStartExamSessionMutation,
  useFetchExamSessionQuery,
  useFetchQuestionBatchQuery,
  
  // Answer Management
  useSaveAnswerMutation,
  useSaveAnswerBatchMutation,
  useGetCurrentAnswersQuery,
  
  // Exam Completion
  useSubmitExamMutation,
  useAutoSubmitExamMutation,
  
  // Timer & Sync
  useSyncTimerQuery,
  
  // Proctoring
  useSendHeartbeatMutation,
  useLogViolationMutation,
  useGetViolationsQuery
} = examinationApi;