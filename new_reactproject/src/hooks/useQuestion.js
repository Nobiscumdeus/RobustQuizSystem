import { useMemo } from 'react';
import {
  useCreateQuestionMutation,
  useGetQuestionsByExamQuery,
  useGetQuestionByIdQuery,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useGetCoursesAndExamsQuery,
  useGetCourseQuestionsQuery,
  useGetExaminerCoursesQuery,
   useGetExaminerExamsQuery
} from '@api/questionApi';

/**
 * Hook for creating a question
 */
export const useCreateQuestion = () => {
  const [createQuestionMutation, { isLoading, error }] = useCreateQuestionMutation();
  
  const createQuestion = async (questionData) => {
    try {
      const result = await createQuestionMutation(questionData).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to create question' 
      };
    }
  };
  
  return {
    createQuestion,
    isLoading,
    error: error?.data?.message || error?.error,
  };
};

/**
 * Hook for fetching questions by exam
 */
export const useQuestionsByExam = (examId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetQuestionsByExamQuery(examId, {
    skip: !examId,
  });
  
  return {
    questions: data?.questions || data || [],
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
    isEmpty: !data?.length,
  };
};

/**
 * Hook for fetching a single question
 */
export const useQuestion = (questionId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetQuestionByIdQuery(questionId, {
    skip: !questionId,
  });
  
  return {
    question: data?.question || data,
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
  };
};

/**
 * Hook for updating a question
 */
export const useUpdateQuestion = () => {
  const [updateQuestionMutation, { isLoading, error }] = useUpdateQuestionMutation();
  
  const updateQuestion = async ({ questionId, ...data }) => {
    try {
      const result = await updateQuestionMutation({ questionId, ...data }).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to update question' 
      };
    }
  };
  
  return {
    updateQuestion,
    isLoading,
    error: error?.data?.message || error?.error,
  };
};

/**
 * Hook for deleting a question
 */
export const useDeleteQuestion = () => {
  const [deleteQuestionMutation, { isLoading, error }] = useDeleteQuestionMutation();
  
  const deleteQuestion = async (questionId) => {
    try {
      const result = await deleteQuestionMutation(questionId).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        error: err?.data?.message || err?.error || 'Failed to delete question' 
      };
    }
  };
  
  return {
    deleteQuestion,
    isLoading,
    error: error?.data?.message || error?.error,
  };
};

// ADD THESE NEW HOOKS:

/**
 * Hook for fetching courses and exams for an examiner
 */
export const useCoursesAndExams = (examinerId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetCoursesAndExamsQuery(examinerId, {
    skip: !examinerId,
  });
  
  // Memoize the results for better performance
  const courses = useMemo(() => data?.courses || [], [data?.courses]);
  const exams = useMemo(() => data?.exams || [], [data?.exams]);
  
  return {
    courses,
    exams,
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
    isEmpty: !courses.length && !exams.length,
  };
};

/**
 * Hook for fetching questions by course
 */
export const useQuestionsByCourse = (courseId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetCourseQuestionsQuery(courseId, {
    skip: !courseId,
  });
  
  // Memoize questions for better performance
  const questions = useMemo(() => data?.questions || data || [], [data]);
  
  return {
    questions,
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
    isEmpty: !questions.length,
  };
};

/**
 * Hook for question statistics and analytics
 */
export const useQuestionStats = (courseId) => {
  const { questions, isLoading, error } = useQuestionsByCourse(courseId);
  
  const stats = useMemo(() => {
    if (!questions.length) return null;
    
    const totalQuestions = questions.length;
    const byType = questions.reduce((acc, q) => {
      acc[q.questionType] = (acc[q.questionType] || 0) + 1;
      return acc;
    }, {});
    
    const byDifficulty = questions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {});
    
    const totalPoints = questions.reduce((sum, q) => sum + (parseFloat(q.points) || 0), 0);
    const avgPoints = totalPoints / totalQuestions;
    
    return {
      totalQuestions,
      byType,
      byDifficulty,
      totalPoints,
      avgPoints: avgPoints.toFixed(2),
    };
  }, [questions]);
  
  return {
    stats,
    isLoading,
    error,
  };
};

/**
 * Hook for managing question operations with proper error handling
 */
export const useQuestionManagement = () => {
  const createQuestionHook = useCreateQuestion();
  const updateQuestionHook = useUpdateQuestion();
  const deleteQuestionHook = useDeleteQuestion();
  
  return {
    createQuestion: createQuestionHook.createQuestion,
    updateQuestion: updateQuestionHook.updateQuestion,
    deleteQuestion: deleteQuestionHook.deleteQuestion,
    isLoading: createQuestionHook.isLoading || updateQuestionHook.isLoading || deleteQuestionHook.isLoading,
    errors: {
      create: createQuestionHook.error,
      update: updateQuestionHook.error,
      delete: deleteQuestionHook.error,
    },
  };
};

// Replace the useCoursesAndExams hook with these two separate hooks:

/**
 * Hook for fetching courses for an examiner
 */
export const useExaminerCourses = (examinerId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetExaminerCoursesQuery(examinerId, {
    skip: !examinerId,
  });
  
  return {
    courses: data?.courses || data || [],
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
    isEmpty: !data?.length,
  };
};

/**
 * Hook for fetching exams for an examiner
 */
export const useExaminerExams = (examinerId) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetExaminerExamsQuery(examinerId, {
    skip: !examinerId,
  });
  
  return {
    exams: data?.exams || data || [],
    isLoading,
    error: error?.data?.message || error?.error,
    refetch,
    isEmpty: !data?.length,
  };
};