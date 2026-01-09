// hooks/useDashboard.js
import { useGetDashboardStatsQuery, useSearchAllQuery } from '../api/dashboardApi';
import { useState, useCallback } from 'react';

export const useDashboard = () => {
  // Stats
  const { data: statsData, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useGetDashboardStatsQuery();
  
  // Search - This is a query hook, so we use skip to control when to fetch
  const [searchTerm, setSearchTerm] = useState('');
  const { data: searchResults, isLoading: searchLoading, error: searchError } = useSearchAllQuery(searchTerm, {
    skip: !searchTerm || searchTerm.trim().length < 2,
  });

  // Function to trigger search
  const performSearch = useCallback((query) => {
    if (query && query.trim().length >= 2) {
      setSearchTerm(query);
    }
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // Process stats
  const stats = statsData ? {
    totalExams: statsData.statsData?.totalExams ?? 0,
    totalStudents: statsData.statsData?.totalStudents ?? 0,
    totalCourses: statsData.statsData?.totalCourses ?? 0,
    ongoingExams: statsData.statsData?.ongoingExams ?? 0,
    completedExams: statsData.statsData?.completedExams ?? 0,
  } : {
    totalExams: 0,
    totalStudents: 0,
    totalCourses: 0,
    ongoingExams: 0,
    completedExams: 0,
  };

  return {
    // Stats
    stats,
    statsLoading,
    statsError,
    refetchStats,
    
    // Search
    searchResults: searchResults?.data || { exams: [], students: [], courses: [] },
    searchLoading,
    searchError,
    performSearch,
    clearSearch,
    currentSearchTerm: searchTerm,
  };
};

/*
// hooks/useDashboard.js
import { useGetDashboardStatsQuery, useGetDashboardDataQuery, useSearchAllQuery } from '../api/dashboardApi';

export const useDashboard = () => {
  // Stats
  const { data: statsData, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useGetDashboardStatsQuery();
  
  // Dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useGetDashboardDataQuery();
  
  // Search function
  const [performSearch, { data: searchResults, isLoading: searchLoading, error: searchError }] = useSearchAllQuery();
  
  // Process stats into our format
  const stats = statsData ? {
    totalExams: statsData.statsData?.totalExams ?? 0,
    totalStudents: statsData.statsData?.totalStudents ?? 0,
    totalCourses: statsData.statsData?.totalCourses ?? 0,
    ongoingExams: statsData.statsData?.ongoingExams ?? 0,
    completedExams: statsData.statsData?.completedExams ?? 0,
  } : {
    totalExams: 0,
    totalStudents: 0,
    totalCourses: 0,
    ongoingExams: 0,
    completedExams: 0,
  };

  return {
    // Stats
    stats,
    statsLoading,
    statsError,
    refetchStats,
    
    // Dashboard data
    examData: dashboardData || {},
    dashboardLoading,
    dashboardError,
    
    // Search
    searchResults: searchResults?.data || { exams: [], students: [], courses: [] },
    searchLoading,
    searchError,
    performSearch,
  };
};

*/