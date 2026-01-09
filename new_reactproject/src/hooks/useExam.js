import { useMemo } from 'react';
import {
      useGetExaminerExamsQuery,
  useDeleteExamMutation,
  useGetExamByIdQuery,
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
   useGetExamForEditQuery,
  useGetExaminerCoursesQuery,
  useUpdateExamMutation,
  usePublishExamMutation,
  useCreateExamMutation
} from '@/api/examApi';
import { useCurrentUser } from './useAuth';
/**
 * Hook for deleting an exam
 */
export const useDeleteExam = () => {
  const [deleteExamMutation, { isLoading, error }] = useDeleteExamMutation();
  
  const deleteExam = async (examId) => {
    try {
      const result = await deleteExamMutation(examId).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to delete exam' 
      };
    }
  };
  
  return {
    deleteExam,
    isLoading,
    error: error?.data?.message || error?.error,
  };
};
/*
 * Hook for fetching exams for a specific examiner
 */
export const useExaminerExams = () => {
  const { user } = useCurrentUser(); // We need user ID from auth
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetExaminerExamsQuery(user?.id, {
    skip: !user?.id,
  });
  
  // Calculate status for each exam
  const examsWithStatus = useMemo(() => {
    if (!data?.exams) return [];
    
    return data.exams.map((exam) => {
      const now = new Date();
      const startTime = new Date(exam.startTime || exam.date);
      const endTime = new Date(
        exam.endTime ||
          new Date(startTime.getTime() + exam.duration * 60000)
      );

      let status = "scheduled";
      if (now > startTime && now < endTime) status = "in-progress";
      if (now > endTime) status = "completed";

      return { ...exam, status };
    });
  }, [data?.exams]);

  return {
    exams: examsWithStatus,
    rawExams: data?.exams || [],
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
    isEmpty: !data?.exams?.length,
  };
};


/**
 * Hook for fetching exam details
 */
export const useExam = (examId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetExamByIdQuery(examId, {
    skip: !examId,
  });
  
  const totalPoints = useMemo(() => {
    return data?.exam?.examQuestions?.reduce((sum, q) => sum + q.points, 0) || 0;
  }, [data?.exam?.examQuestions]);

  return {
    exam: data?.exam,
    totalPoints,
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
  };
};

/**
 * Hook for fetching eligible students
 */
export const useEligibleStudents = (examId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetEligibleStudentsQuery(examId, {
    skip: !examId,
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
 * Hook for fetching course questions
 */
export const useCourseQuestions = (courseId, options = {}) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetCourseQuestionsQuery(
    { 
      courseId, 
      page: options.page || 1, 
      limit: options.limit || 1000 
    },
    { skip: !courseId }
  );
  
  return {
    questions: data?.questions || [],
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
    isEmpty: !data?.questions?.length,
  };
};

/**
 * Hook for fetching student results
 */
export const useStudentResults = (examId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetStudentResultsQuery(examId, {
    skip: !examId,
  });
  
  return {
    results: data?.results || [],
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
    isEmpty: !data?.results?.length,
  };
};

/**
 * Hook for fetching question analytics
 */
export const useQuestionAnalytics = (examId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetQuestionAnalyticsQuery(examId, {
    skip: !examId,
  });
  
  return {
    analytics: data?.analytics || [],
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
    isEmpty: !data?.analytics?.length,
  };
};

/**
 * Hook for fetching attendances
 */
export const useAttendances = (examId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetAttendancesQuery(examId, {
    skip: !examId,
  });
  
  return {
    attendances: data?.attendances || [],
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
    isEmpty: !data?.attendances?.length,
  };
};

/**
 * Hook for adding question to exam
 */
export const useAddQuestionToExam = () => {
  const [addQuestionMutation, { isLoading, error }] = useAddQuestionToExamMutation();
  
  const addQuestion = async ({ examId, questionId }) => {
    try {
      const result = await addQuestionMutation({ examId, questionId }).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to add question' 
      };
    }
  };
  
  return {
    addQuestion,
    isLoading,
    error: error?.data?.message || error?.error,
  };
};

/**
 * Hook for adding random questions
 */
export const useAddRandomQuestions = () => {
  const [addRandomQuestionsMutation, { isLoading, error }] = useAddRandomQuestionsMutation();
  
  const addRandomQuestions = async ({ examId, count }) => {
    try {
      const result = await addRandomQuestionsMutation({ examId, count }).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to add random questions' 
      };
    }
  };
  
  return {
    addRandomQuestions,
    isLoading,
    error: error?.data?.message || error?.error,
  };
};

/**
 * Hook for removing question from exam
 */
export const useRemoveQuestionFromExam = () => {
  const [removeQuestionMutation, { isLoading, error }] = useRemoveQuestionFromExamMutation();
  
  const removeQuestion = async ({ examId, examQuestionId }) => {
    try {
      const result = await removeQuestionMutation({ examId, examQuestionId }).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to remove question' 
      };
    }
  };
  
  return {
    removeQuestion,
    isLoading,
    error: error?.data?.message || error?.error,
  };
};

/**
 * Hook for managing exam students
 */
export const useExamStudents = () => {
  const [addStudentMutation, { isLoading: addingStudent }] = useAddStudentToExamMutation();
  const [removeStudentMutation, { isLoading: removingStudent }] = useRemoveStudentFromExamMutation();
  
  const addStudent = async ({ examId, studentId }) => {
    try {
      const result = await addStudentMutation({ examId, studentId }).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to add student' 
      };
    }
  };
  
  const removeStudent = async ({ examId, studentId }) => {
    try {
      const result = await removeStudentMutation({ examId, studentId }).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to remove student' 
      };
    }
  };
  
  return {
    addStudent,
    removeStudent,
    isLoading: addingStudent || removingStudent,
  };
};

/**
 * Hook for fetching exam data for editing
 */
export const useExamForEdit = (examId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetExamForEditQuery(examId, {
    skip: !examId,
  });
  
  return {
    exam: data?.exam,
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
  };
};

/**
 * Hook for fetching examiner's courses
 */
export const useExaminerCourses = () => {
  const { user } = useCurrentUser();
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetExaminerCoursesQuery(user?.id, {
    skip: !user?.id,
  });
  
  return {
    courses: data?.courses || [],
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
    isEmpty: !data?.courses?.length,
  };
};

/**
 * Hook for updating an exam
 */
export const useUpdateExam = () => {
  const [updateExamMutation, { isLoading, error }] = useUpdateExamMutation();
  
  const updateExam = async ({ examId, ...data }) => {
    try {
      const result = await updateExamMutation({ examId, ...data }).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to update exam' 
      };
    }
  };
  
  return {
    updateExam,
    isLoading,
    error: error?.data?.message || error?.error,
  };
};

/**
 * Hook for publishing an exam
 */
export const usePublishExam = () => {
  const [publishExamMutation, { isLoading, error }] = usePublishExamMutation();
  
  const publishExam = async (examId) => {
    try {
      const result = await publishExamMutation(examId).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to publish exam' 
      };
    }
  };
  
  return {
    publishExam,
    isLoading,
    error: error?.data?.message || error?.error,
  };
};



/**
 * Hook for creating a new exam
 */
export const useCreateExam = () => {
  const [createExamMutation, { isLoading, error, data }] = useCreateExamMutation();
  
  const createExam = async (examData) => {
    try {
      const result = await createExamMutation(examData).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to create exam' 
      };
    }
  };
  
  return {
    createExam,
    isLoading,
    error: error?.data?.message || error?.error,
    newExam: data,
  };
};