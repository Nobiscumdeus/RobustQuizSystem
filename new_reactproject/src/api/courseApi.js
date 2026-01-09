import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const courseApi = createApi({
  reducerPath: 'courseApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:5000',
    credentials: 'include', // ✅ HTTP-only cookies
  }),
  tagTypes: ['Course', 'CourseStudents'],
  endpoints: (builder) => ({
    // Existing endpoints
    getCourses: builder.query({
      query: () => '/courses',
      providesTags: ['Course']
    }),
    
    getInstructorCourses: builder.query({
      query: (instructorId) => `/courses/${instructorId}`,
      providesTags: ['Course']
    }),
    
    getCourseById: builder.query({
      query: (id) => `/courses/${id}`,
      providesTags: (result, error, id) => [{ type: 'Course', id }]
    }),
    
    // ✅ NEW: Get detailed course with stats
    getCourseWithDetails: builder.query({
      query: (courseId) => `/singlecourse/${courseId}`,
      providesTags: (result, error, courseId) => [
        { type: 'Course', id: courseId },
        'CourseStudents'
      ],
    }),
    
    getCourseForEdit: builder.query({
      query: (id) => `/course/${id}/edit`,
      providesTags: (result, error, id) => [{ type: 'Course', id }]
    }),
    
    createCourse: builder.mutation({
      query: (courseData) => ({
        url: '/courses',
        method: 'POST',
        body: courseData
      }),
      invalidatesTags: ['Course']
    }),
    
    updateCourse: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/courses/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Course', id }
      ]
    }),
    
    updateCourseViaEdit: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/course/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Course', id }
      ]
    }),
    
    deleteCourse: builder.mutation({
      query: (id) => ({
        url: `/courses/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Course']
    }),
    
    // ✅ NEW: Student management endpoints
    getAvailableStudents: builder.query({
      query: (courseId) => `/students/not-in-course/${courseId}`,
      providesTags: ['CourseStudents']
    }),
    
    addStudentsToCourse: builder.mutation({
      query: ({ courseId, studentIds }) => ({
        url: `/courses/${courseId}/students`,
        method: 'POST',
        body: { studentIds }
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'Course', id: courseId },
        'CourseStudents'
      ],
    }),
    
    removeStudentFromCourse: builder.mutation({
      query: ({ courseId, studentId }) => ({
        url: `/courses/${courseId}/students/${studentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'Course', id: courseId },
        'CourseStudents'
      ],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetInstructorCoursesQuery,
  useGetCourseByIdQuery,
  useGetCourseWithDetailsQuery, // ✅ Export new hook
  useGetCourseForEditQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useUpdateCourseViaEditMutation,
  useDeleteCourseMutation,
  useGetAvailableStudentsQuery, // ✅ Export new hook
  useAddStudentsToCourseMutation, // ✅ Export new hook
  useRemoveStudentFromCourseMutation, // ✅ Export new hook
} = courseApi;

