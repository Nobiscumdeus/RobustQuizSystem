// hooks/useStudentResults.js
import { 
  useGetStudentResultsQuery,
  useGetPerformanceStatsQuery,
  useGetExamResultDetailsQuery  // Regular query, NOT lazy
} from '@api/examinationApi';

export const useStudentResults = (selectedExamId = null) => {
  // Always fetch these on component mount
  const {
    data: resultsData,
    isLoading: resultsLoading,
    error: resultsError,
    refetch: refetchResults
  } = useGetStudentResultsQuery();

  const {
    data: performanceData,
    isLoading: performanceLoading,
    error: performanceError,
    refetch: refetchPerformance
  } = useGetPerformanceStatsQuery();

  // Fetch exam details ONLY when selectedExamId is provided
  const {
    data: examResultDetails,
    isLoading: detailsLoading,
    error: detailsError
  } = useGetExamResultDetailsQuery(selectedExamId, {
    skip: !selectedExamId  // Don't fetch if no exam selected
  });

  return {
    // Results data
    results: resultsData?.results || [],
    resultsLoading,
    resultsError,
    refetchResults,
    
    // Performance stats
    performanceStats: performanceData?.stats || {},
    performanceLoading,
    performanceError,
    refetchPerformance,
    
    // Exam details (only available when selectedExamId is provided)
    examResultDetails,
    detailsLoading,
    detailsError
  };
};