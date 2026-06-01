import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'; // ✅ Add

export const resultApi = createApi({
  reducerPath: 'resultApi', // ✅ Add
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:5000/', // ✅ Add (adjust URL)
    credentials: 'include', // ✅ Enable cookies
  }),
  tagTypes: ['Result'], // ✅ Add cache tags
  endpoints: (builder) => ({
    getExamResults: builder.query({
      query: (examId) => `/exams/${examId}/results`,
      providesTags: ['Result'] // ✅ Add cache tag
    }),
    getStudentResults: builder.query({
      query: (studentId) => `/students/${studentId}/results`,
      providesTags: (result, error, studentId) => [
        { type: 'Result', id: studentId }
      ]
    }),
    // ✅ Consider adding more endpoints
    submitResult: builder.mutation({
      query: (resultData) => ({
        url: '/results',
        method: 'POST',
        body: resultData
      }),
      invalidatesTags: ['Result']
    }),
    deleteResult: builder.mutation({
      query: (resultId) => ({
        url: `/results/${resultId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Result']
    })
  })
});

// ✅ Export hooks
export const {
  useGetExamResultsQuery,
  useGetStudentResultsQuery,
  useSubmitResultMutation,
  useDeleteResultMutation
} = resultApi;

