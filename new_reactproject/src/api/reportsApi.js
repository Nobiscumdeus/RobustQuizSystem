import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const reportsApi = createApi({
    reducerPath: 'reportsApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: 'http://localhost:5000',
        credentials: 'include',
    }),
    tagTypes: ['Report'],
    endpoints: (builder) => ({
        
        // Get report data for preview
        getReportData: builder.query({
            query: ({ type, range }) => ({
                url: `/reports/data`,
                params: { type, range },
            }),
        }),
        
        // Generate and download report
        generateReport: builder.mutation({
            query: ({ type, range, format }) => ({
                url: `/reports/generate`,
                params: { type, range, format },
                responseHandler: (response) => response.blob(),
            }),
        }),
        
        // Get report history
        getReportHistory: builder.query({
            query: () => ({
                url: `/reports/history`,
            }),
            providesTags: ['Report'],
        }),
        
        // Delete a report
        deleteReport: builder.mutation({
            query: (id) => ({
                url: `/reports/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Report'],
        }),
    }),
});

export const {
    useGetReportDataQuery,
    useGenerateReportMutation,
    useGetReportHistoryQuery,
    useDeleteReportMutation,
} = reportsApi;