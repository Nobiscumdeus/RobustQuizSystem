// api/dashboardApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:5000',
    credentials: 'include',
  }),
  tagTypes: ['Dashboard', 'Stats', 'User', 'Search'],
  endpoints: (builder) => ({
    // Get user profile
    getUserProfile: builder.query({
      query: () => '/profile',
      providesTags: ['User']
    }),
    
    // Get dashboard stats
    getDashboardStats: builder.query({
      query: () => '/stats',
      providesTags: ['Stats']
    }),
    
    // Get dashboard data
    getDashboardData: builder.query({
      query: () => '/dashboard-data',
      providesTags: ['Dashboard']
    }),
    
    // Search functionality - FIXED: This should be a query, not a mutation
    searchAll: builder.query({
      query: (query) => `/search?query=${encodeURIComponent(query)}`,
      providesTags: (result, error, query) => 
        [{ type: 'Search', id: `search-${query}` }]
    }),
  })
});

export const {
  useGetUserProfileQuery,
  useGetDashboardStatsQuery,
  useGetDashboardDataQuery,
  useSearchAllQuery, // This is a QUERY hook, not mutation
} = dashboardApi;

