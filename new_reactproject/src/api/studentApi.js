import { createApi } from "@reduxjs/toolkit/query"



export const studentApi = createApi({
  endpoints: (builder) => ({
    // Direct Student model operations
    getStudents: builder.query({
      query: () => '/students'
    }),
    getStudentByMatric: builder.query({
      query: (matricNo) => `/students/matric/${matricNo}`
    }),
    createStudent: builder.mutation({
      query: (studentData) => ({
        url: '/students',
        method: 'POST',
        body: studentData
      })
    }),
    updateStudent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/students/${id}`,
        method: 'PUT',
        body: data
      })
    })
  })
})



/*
For Aysnc thunk operations 


// Complex student operations
export const enrollStudentInCourse = createAsyncThunk(
  'student/enroll',
  async ({ studentId, courseId }, { dispatch }) => {
    // 1. Validate enrollment eligibility
    // 2. Update Student-Course relationship
    // 3. Create notification
    // 4. Update student's course list
    // 5. Log enrollment activity
  }
)

export const bulkImportStudents = createAsyncThunk(
  'student/bulkImport',
  async (csvData, { dispatch }) => {
    // 1. Parse CSV file
    // 2. Validate data
    // 3. Create multiple Student records
    // 4. Handle duplicates
    // 5. Generate import report
  }
)
  */