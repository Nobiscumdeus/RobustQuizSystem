import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const examApi = createApi({
  reducerPath: 'examApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:5000',
    credentials: 'include',
  }),
  tagTypes: ['Exam', 'ExamQuestion', 'ExamStudent', 'ExamResult'],
  endpoints: (builder) => ({
    // Get single exam with details
    getExamById: builder.query({
      query: (examId) => `/singleexam/${examId}`,
      providesTags: (result, error, examId) => [
        { type: 'Exam', id: examId },
        'ExamQuestion',
        'ExamStudent',
        'ExamResult'
      ],
    }),
    
    // Get eligible students for exam
    getEligibleStudents: builder.query({
      query: (examId) => `/exam/${examId}/eligible-students`,
      providesTags: ['ExamStudent'],
    }),
    
    // Get course questions
    getCourseQuestions: builder.query({
      query: ({ courseId, page = 1, limit = 1000 }) => 
        `/course/${courseId}/questions?page=${page}&limit=${limit}`,
      providesTags: ['ExamQuestion'],
    }),
    
    // Get student results
    getStudentResults: builder.query({
      query: (examId) => `/exam/${examId}/results`,
      providesTags: ['ExamResult'],
    }),
    
    // Get question analytics
    getQuestionAnalytics: builder.query({
      query: (examId) => `/exam/${examId}/question-analytics`,
      providesTags: ['ExamQuestion'],
    }),
    
    // Get attendances
    getAttendances: builder.query({
      query: (examId) => `/exam/${examId}/attendances`,
      providesTags: ['ExamStudent'],
    }),
    
    // Add question to exam
    addQuestionToExam: builder.mutation({
      query: ({ examId, questionId }) => ({
        url: `/exam/${examId}/questions`,
        method: 'POST',
        body: { questionId },
      }),
      invalidatesTags: ['ExamQuestion'],
    }),
    
    // Add random questions
    addRandomQuestions: builder.mutation({
      query: ({ examId, count }) => ({
        url: `/exam/${examId}/questions/random`,
        method: 'POST',
        body: { count },
      }),
      invalidatesTags: ['ExamQuestion'],
    }),
    
    // Remove question from exam
    removeQuestionFromExam: builder.mutation({
      query: ({ examId, examQuestionId }) => ({
        url: `/exam/${examId}/questions/${examQuestionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExamQuestion'],
    }),
    
    // Add student to exam
    addStudentToExam: builder.mutation({
      query: ({ examId, studentId }) => ({
        url: `/exam/${examId}/students`,
        method: 'POST',
        body: { studentId },
      }),
      invalidatesTags: ['ExamStudent', 'ExamResult'],
    }),
    
    // Remove student from exam
    removeStudentFromExam: builder.mutation({
      query: ({ examId, studentId }) => ({
        url: `/exam/${examId}/students/${studentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExamStudent', 'ExamResult'],
    }),


    
    // Update exam
    updateExam: builder.mutation({
      query: ({ examId, ...data }) => ({
        url: `/exam/${examId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { examId }) => [
        { type: 'Exam', id: examId }
      ],
    }),
    getExaminerExams: builder.query({
  query: (examinerId) => `/exams/${examinerId}`,
  providesTags: ['Exam'],
}),
        getExamForEdit: builder.query({
      query: (examId) => `/exam/${examId}/edit`,
      providesTags: (result, error, examId) => [{ type: 'Exam', id: examId }],
    }),
    // Delete exam
    deleteExam: builder.mutation({
      query: (examId) => ({
        url: `/exam/${examId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Exam'],
    }),
getExaminerCourses: builder.query({
  query: (examinerId) => `/courses/${examinerId}`,
  providesTags: ['Course'],
}),



publishExam: builder.mutation({
  query: (examId) => ({
    url: `/exam/${examId}/publish`,
    method: 'PATCH',
  }),
  invalidatesTags: (result, error, examId) => [
    { type: 'Exam', id: examId },
    { type: 'Exam', id: 'LIST' }
  ],
}),

unpublishExam: builder.mutation({
  query: (examId) => ({
    url: `/exam/${examId}/unpublish`,
    method: 'PATCH',
  }),
  invalidatesTags: (result, error, examId) => [
    { type: 'Exam', id: examId },
    { type: 'Exam', id: 'LIST' }
  ],
}),
// Add this to your examApi.js endpoints
createExam: builder.mutation({
  query: (examData) => ({
    url: '/exams',
    method: 'POST',
    body: examData,
  }),
  invalidatesTags: ['Exam'],
}),


  }),


});

// Add these to your existing examApi.js endpoints






export const {
  useGetExamByIdQuery,
    useGetExaminerExamsQuery,
  useGetEligibleStudentsQuery,
  useGetCourseQuestionsQuery,
  useGetStudentResultsQuery,
  useGetQuestionAnalyticsQuery,
  useGetAttendancesQuery,
  useAddQuestionToExamMutation,
  useAddRandomQuestionsMutation,
  useRemoveQuestionFromExamMutation,
  useAddStudentToExamMutation,
  useRemoveStudentFromExamMutation,

  useDeleteExamMutation,
   useGetExamForEditQuery,
  useGetExaminerCoursesQuery,
  useUpdateExamMutation,
  usePublishExamMutation,
  useUnpublishExamMutation,
  useCreateExamMutation
  
} = examApi;