import { useMemo } from 'react';
import { useCurrentUser } from '@/hooks/useAuth';
import {
  useGetExaminerStudentsQuery,
  useGetStudentByIdQuery,
  useGetStudentsNotInCourseQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetStudentWithDetailsQuery,
  useGetStudentForEditQuery,
  useBulkRegisterStudentsMutation,
  useStudentRegistrationMutation
} from '@/api/studentApi';

/**
 * Hook for fetching students for a specific examiner
 */
export const useExaminerStudents = () => {
  const { user } = useCurrentUser();
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetExaminerStudentsQuery(user?.id, {
    skip: !user?.id,
  });
  
  // Calculate status for each student
  const studentsWithStatus = useMemo(() => {
    if (!data?.students) return [];
    
    return data.students.map((student) => {
      const lastActiveDate = student.lastActive
        ? new Date(student.lastActive)
        : null;
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

      let status = "active";
      if (!student.isActive) status = "inactive";
      else if (lastActiveDate && lastActiveDate < thirtyDaysAgo)
        status = "inactive";

      return {
        ...student,
        status,
        fullName: `${student.firstName} ${student.lastName}`,
      };
    });
  }, [data?.students]);

  return {
    students: studentsWithStatus,
    rawStudents: data?.students || [],
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
    isEmpty: !data?.students?.length,
  };
};

/**
 * Hook for fetching a single student
 */
export const useStudent = (studentId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetStudentByIdQuery(studentId, {
    skip: !studentId,
  });
  
  return {
    student: data?.student || data,
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
  };
};

/**
 * Hook for fetching students not in a course
 */
export const useStudentsNotInCourse = (courseId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetStudentsNotInCourseQuery(courseId, {
    skip: !courseId,
  });
  
  return {
    students: data?.students || [],
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
    isEmpty: !data?.students?.length,
  };
};

/**
 * Hook for creating a student
 */
export const useCreateStudent = () => {
  const [createStudentMutation, { isLoading, error }] = useCreateStudentMutation();
  
  const createStudent = async (studentData) => {
    try {
      const result = await createStudentMutation(studentData).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to create student' 
      };
    }
  };
  
  return {
    createStudent,
    isLoading,
    error: error?.data?.message || error?.error,
  };
};

/**
 * Hook for updating a student
 */
export const useUpdateStudent = () => {
  const [updateStudentMutation, { isLoading, error }] = useUpdateStudentMutation();
  
  const updateStudent = async ({ studentId, ...data }) => {
    try {
      const result = await updateStudentMutation({ studentId, ...data }).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to update student' 
      };
    }
  };
  
  return {
    updateStudent,
    isLoading,
    error: error?.data?.message || error?.error,
  };
};

/**
 * Hook for deleting a student
 */
export const useDeleteStudent = () => {
  const [deleteStudentMutation, { isLoading, error }] = useDeleteStudentMutation();
  
  const deleteStudent = async (studentId) => {
    try {
      const result = await deleteStudentMutation(studentId).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to delete student' 
      };
    }
  };
  
  return {
    deleteStudent,
    isLoading,
    error: error?.data?.message || error?.error,
  };
};



/**
 * Hook for fetching student with full details
 */
export const useStudentWithDetails = (studentId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetStudentWithDetailsQuery(studentId, {
    skip: !studentId,
  });
  
  return {
    student: data?.student,
    stats: data?.stats,
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
  };
};

/**
 * Hook for fetching student data for editing
 */
export const useStudentForEdit = (studentId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetStudentForEditQuery(studentId, {
    skip: !studentId,
  });
  
  return {
    student: data?.student,
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
  };
};
/**
 * Hook for bulk student registration
 */
export const useBulkRegisterStudents = () => {
  const [bulkRegisterMutation, { isLoading, error, data }] = useBulkRegisterStudentsMutation();
  
  const bulkRegister = async (formData) => {
    try {
      const result = await bulkRegisterMutation(formData).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to register students in bulk' 
      };
    }
  };
  
  return {
    bulkRegister,
    isLoading,
    error: error?.data?.message || error?.error,
    result: data,
  };
};


/**
 * Hook for registering students for exams
 */
export const useRegisterStudents = () => {
  const [studentRegistrationMutation, { isLoading, error, data }] = useStudentRegistrationMutation();
  
  const registerStudents = async (registrationData) => {
    try {
      const result = await studentRegistrationMutation(registrationData).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to register students' 
      };
    }
  };
  
  return {
    registerStudents,
    isLoading,
    error: error?.data?.message || error?.error,
    result: data,
  };
};


// Helper functions for date formatting (can be extracted or kept inline)
export const useStudentHelpers = () => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGradeColor = (score) => {
    if (score >= 70) return { text: 'rgb(22, 163, 74)', bg: 'rgba(22, 163, 74, 0.1)' };
    if (score >= 60) return { text: 'rgb(59, 130, 246)', bg: 'rgba(59, 130, 246, 0.1)' };
    if (score >= 50) return { text: 'rgb(245, 158, 11)', bg: 'rgba(245, 158, 11, 0.1)' };
    if (score >= 40) return { text: 'rgb(249, 115, 22)', bg: 'rgba(249, 115, 22, 0.1)' };
    return { text: 'rgb(239, 68, 68)', bg: 'rgba(239, 68, 68, 0.1)' };
  };

  return {
    formatDate,
    formatDateTime,
    getGradeColor
  };
};