import { useMemo } from 'react';
import { 
  useGetCoursesQuery,
  useGetInstructorCoursesQuery,
  useGetCourseByIdQuery,
  useGetCourseForEditQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useUpdateCourseViaEditMutation,
  useDeleteCourseMutation,
   useGetCourseWithDetailsQuery,
  useGetAvailableStudentsQuery,
  useAddStudentsToCourseMutation,
  useRemoveStudentFromCourseMutation,
} from '@api/courseApi';

/**
 * Hook for fetching all courses
 */
export const useAllCourses = () => {
  const { data, isLoading, error, refetch } = useGetCoursesQuery();
  
  return {
    courses: data?.courses || [],
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
    isEmpty: !data?.courses?.length
  };
};

/**
 * Hook for fetching courses for a specific instructor
 * @param {string} instructorId - The ID of the instructor
 */
export const useInstructorCourses = (instructorId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetInstructorCoursesQuery(instructorId, {
    skip: !instructorId,
  });
  
  // Calculate status for each course using useMemo
  const coursesWithStatus = useMemo(() => {
    if (!data?.courses) return [];
    
    return data.courses.map((course) => {
      const now = new Date();
      const currentMonth = now.getMonth();
      
      let status = "active";
      if (course.semester === "Fall" && currentMonth > 11) status = "archived";
      if (course.semester === "Spring" && currentMonth > 5) status = "archived";
      if (course.semester === "Summer" && currentMonth > 8) status = "archived";
      
      return { ...course, status };
    });
  }, [data?.courses]);

  return {
    courses: coursesWithStatus,
    rawCourses: data?.courses || [],
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
    isEmpty: !data?.courses?.length
  };
};

/**
 * Hook for fetching a single course by ID
 * @param {string} courseId - The ID of the course
 */
export const useCourse = (courseId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetCourseByIdQuery(courseId, {
    skip: !courseId,
  });
  
  return {
    course: data?.course || data,
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
  };
};

/**
 * Hook for fetching course data for editing
 * @param {string} courseId - The ID of the course
 */
export const useCourseForEdit = (courseId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetCourseForEditQuery(courseId, {
    skip: !courseId,
  });
  
  return {
    course: data?.course || data,
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
  };
};

/**
 * Hook for creating a new course
 */
export const useCreateCourse = () => {
  const [createCourseMutation, { isLoading, error, data }] = useCreateCourseMutation();
  
  const createCourse = async (courseData) => {
    try {
      const result = await createCourseMutation(courseData).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to create course'
      };
    }
  };
  
  return {
    createCourse,
    isLoading,
    error: error?.data?.message || error?.error,
    newCourse: data,
  };
};

/**
 * Hook for updating a course
 */
export const useUpdateCourse = () => {
  const [updateCourseMutation, { isLoading, error, data }] = useUpdateCourseMutation();
  
  const updateCourse = async ({ id, ...courseData }) => {
    try {
      const result = await updateCourseMutation({ id, ...courseData }).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to update course'
      };
    }
  };
  
  return {
    updateCourse,
    isLoading,
    error: error?.data?.message || error?.error,
    updatedCourse: data,
  };
};

/**
 * Hook for updating a course via the edit endpoint
 */
export const useUpdateCourseViaEdit = () => {
  const [updateCourseViaEditMutation, { isLoading, error, data }] = useUpdateCourseViaEditMutation();
  
  const updateCourse = async ({ id, ...courseData }) => {
    try {
      const result = await updateCourseViaEditMutation({ id, ...courseData }).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to update course'
      };
    }
  };
  
  return {
    updateCourse,
    isLoading,
    error: error?.data?.message || error?.error,
    updatedCourse: data,
  };
};

/**
 * Hook for deleting a course
 */
export const useDeleteCourse = () => {
  const [deleteCourseMutation, { isLoading, error, data }] = useDeleteCourseMutation();
  
  const deleteCourse = async (courseId) => {
    try {
      const result = await deleteCourseMutation(courseId).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to delete course'
      };
    }
  };
  
  return {
    deleteCourse,
    isLoading,
    error: error?.data?.message || error?.error,
    deleteResult: data,
  };
};

export const useCourseWithDetails = (courseId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetCourseWithDetailsQuery(courseId, {
    skip: !courseId,
  });
  
  return {
    course: data?.course,
    stats: data?.stats,
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
  };
};

/**
 * Hook for fetching students not enrolled in a course
 * @param {string} courseId - The ID of the course
 */
export const useAvailableStudents = (courseId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetAvailableStudentsQuery(courseId, {
    skip: !courseId,
  });
  
  return {
    students: data?.students || [],
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
    isEmpty: !data?.students?.length
  };
};

/**
 * Hook for adding students to a course
 */
export const useAddStudentsToCourse = () => {
  const [addStudentsMutation, { isLoading, error, data }] = useAddStudentsToCourseMutation();
  
  const addStudents = async ({ courseId, studentIds }) => {
    try {
      const result = await addStudentsMutation({ courseId, studentIds }).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to add students'
      };
    }
  };
  
  return {
    addStudents,
    isLoading,
    error: error?.data?.message || error?.error,
    result: data,
  };
};

/**
 * Hook for removing a student from a course
 */
export const useRemoveStudentFromCourse = () => {
  const [removeStudentMutation, { isLoading, error, data }] = useRemoveStudentFromCourseMutation();
  
  const removeStudent = async ({ courseId, studentId }) => {
    try {
      const result = await removeStudentMutation({ courseId, studentId }).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to remove student'
      };
    }
  };
  
  return {
    removeStudent,
    isLoading,
    error: error?.data?.message || error?.error,
    result: data,
  };
};