import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const questionApi = createApi({
  reducerPath: 'questionApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:5000/',
    credentials: 'include',
  }),
  tagTypes: ['Question', 'CourseQuestion', 'ExamQuestion'],
  endpoints: (builder) => ({
    // Create question
    createQuestion: builder.mutation({
      query: (questionData) => ({
        url: '/questions',
        method: 'POST',
        body: questionData,
      }),
      invalidatesTags: ['Question', 'CourseQuestion'],
    }),
    
    // Get questions by course ID
    getCourseQuestions: builder.query({
      query: (courseId) => `/courses/${courseId}/questions`,
      providesTags: ['CourseQuestion'],
    }),
    
    // Get questions by exam
    getQuestionsByExam: builder.query({
      query: (examId) => `/exams/${examId}/questions`,
      providesTags: ['ExamQuestion'],
    }),
    
    // Get courses and exams for examiner
    getCoursesAndExams: builder.query({
      query: (examinerId) => `/examiners/${examinerId}/courses-exams`,
      providesTags: ['CourseQuestion', 'ExamQuestion'],
    }),
    
    // Get single question
    getQuestionById: builder.query({
      query: (questionId) => `/questions/${questionId}`,
      providesTags: (result, error, questionId) => [{ type: 'Question', id: questionId }],
    }),
    
    // Update question
    updateQuestion: builder.mutation({
      query: ({ questionId, ...data }) => ({
        url: `/questions/${questionId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { questionId }) => [
        { type: 'Question', id: questionId }
      ],
    }),
    
    // Delete question
    deleteQuestion: builder.mutation({
      query: (questionId) => ({
        url: `/questions/${questionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Question', 'CourseQuestion'],
    }),

    getExaminerCourses: builder.query({
//  query: (examinerId) => `/api/examiners/${examinerId}/courses`,
 query: (examinerId) => `/courses/${examinerId}`, // ✅ Correct - matches your route
  providesTags: ['Course'],
}),
uploadImage: builder.mutation({
  query: (formData) => ({
    url: '/upload', // Your upload endpoint
    method: 'POST',
    body: formData,
  }),
}),

getExaminerExams: builder.query({
  query: (examinerId) => `/examiners/${examinerId}/exams`,
  providesTags: ['Exam'],
}),

  }),
});

export const {
  useCreateQuestionMutation,
  useGetCourseQuestionsQuery, 
  useGetCoursesAndExamsQuery, 
  useGetQuestionsByExamQuery,
  useGetQuestionByIdQuery,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
   useGetExaminerCoursesQuery,
  useGetExaminerExamsQuery,   
} = questionApi;
