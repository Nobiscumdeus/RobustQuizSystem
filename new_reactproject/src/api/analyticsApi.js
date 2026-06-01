import { createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

const normalizeResponse= (response)=>{
    if(response &&typeof response ==="object" && "data" in response){
        return response.data;
    }
    return response
}

const buildTimeframeQuery = (timeframe) =>{
    if(!timeframe) return "";
    return `?timeframe=${encodeURIComponent(timeframe)}`;

}

export const analyticsApi = createApi({
    reducerPath:"analyticsApi",
    baseQuery:fetchBaseQuery({
        baseUrl:"http://localhost:5000",
        credentials:"include",
    }),
    tagTypes:["Analytics"],
    endpoints:(builder)=>({
        getAnalyticsOverview:builder.query({
            query:(timeframe="week") =>`/analytics${buildTimeframeQuery(timeframe)}`,
            transformResponse:normalizeResponse,
            providesTags:["Analytics"],
        }),

        getParticipationData:builder.query({
            query:(timeframe="week") =>
                `/analytics/participation${buildTimeframeQuery(timeframe)}`,
            transformResponse:normalizeResponse,

            providesTags:["Analytics"],
        }),
        getPerformanceTrends:builder.query({
            query:(timeframe="week")=>
                `/analytics/performance${buildTimeframeQuery(timeframe)}`,
            transformResponse:normalizeResponse,
            providesTags:["Analytics"],
        }),

        getScoreDistribution:builder.query({
            query:(timeframe="week")=>
                `/analytics/distribution${buildTimeframeQuery(timeframe)}`,
            transformResponse:normalizeResponse,
            providesTags:["Analytics"],
        }),

        getDeviceUsage: builder.query({
  query: (timeframe = "week") =>
    `/analytics/devices${buildTimeframeQuery(timeframe)}`,
  transformResponse: normalizeResponse,
  providesTags: ["Analytics"],
}),


    }),
});

export const {
    useGetAnalyticsOverviewQuery,
    useGetParticipationDataQuery,
    useGetPerformanceTrendsQuery,
    useGetScoreDistributionQuery,
    useGetDeviceUsageQuery,
} = analyticsApi