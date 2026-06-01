import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const studentApi = createApi({
  reducerPath: 'studentApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:5000/',
    credentials: 'include',
  }),
  tagTypes: ['Student', 'CourseStudent'],
  endpoints: (builder) => ({
    // Get students by examiner
    getExaminerStudents: builder.query({
      query: (examinerId) => `/ students/${examinerId}`,
      providesTags: ['Student'],
    }),
    
    // Get single student
    getStudentById: builder.query({
      query: (studentId) => `/student/${studentId}`,
      providesTags: (result, error, studentId) => [{ type: 'Student', id: studentId }],
    }),
    
    // Get students not in course
    getStudentsNotInCourse: builder.query({
      query: (courseId) => `/students/not-in-course/${courseId}`,
      providesTags: ['Student'],
    }),
    
    // Create student
    createStudent: builder.mutation({
      query: (studentData) => ({
        url: '/students',
        method: 'POST',
        body: studentData,
      }),
      invalidatesTags: ['Student'],
    }),
    
    // Update student
    updateStudent: builder.mutation({
      query: ({ studentId, ...data }) => ({
        url: `/students/${studentId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { studentId }) => [
        { type: 'Student', id: studentId }
      ],
    }),
    
    // Delete student
    deleteStudent: builder.mutation({
      query: (studentId) => ({
        url: `/students/${studentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Student'],
    }),
    
    // Add student to course (course-specific API)
    addStudentToCourse: builder.mutation({
      query: ({ courseId, studentIds }) => ({
        url: `/courses/${courseId}/students`,
        method: 'POST',
        body: { studentIds },
      }),
      invalidatesTags: ['Student', 'CourseStudent'],
    }),
    
    // Remove student from course
    removeStudentFromCourse: builder.mutation({
      query: ({ courseId, studentId }) => ({
        url: `/courses/${courseId}/students/${studentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Student', 'CourseStudent'],
    }),

    // Add this to your studentApi.js endpoints
getStudentWithDetails: builder.query({
  query: (studentId) => `/student/${studentId}`,
  providesTags: (result, error, studentId) => [
    { type: 'Student', id: studentId },
    'CourseStudent'
  ],
}),
// Add this to your studentApi.js endpoints
getStudentForEdit: builder.query({
  query: (studentId) => `/student/${studentId}/edit`,
  providesTags: (result, error, studentId) => [{ type: 'Student', id: studentId }],
}),
bulkRegisterStudents: builder.mutation({
  query: (formData) => ({
    url: '/api/bulk-register',
    method: 'POST',
    body: formData,
  }),
  invalidatesTags: ['Student'],
}),

studentRegistration: builder.mutation({
  query: (registrationData) => ({
    url: '/student-register', 
    method: 'POST',
    body: registrationData,
   
  }),
  invalidatesTags: ['Student'],
}),



  }),
});

export const {
  useGetExaminerStudentsQuery,
  useGetStudentByIdQuery,
  useGetStudentsNotInCourseQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useAddStudentToCourseMutation,
  useRemoveStudentFromCourseMutation,
  useGetStudentWithDetailsQuery,
  useGetStudentForEditQuery,
  useBulkRegisterStudentsMutation,
  useStudentRegistrationMutation
} = studentApi;