import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'; // ✅ Add import

export const notificationApi = createApi({
  reducerPath: 'notificationApi', // ✅ Add reducerPath
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:5000/', // ✅ Add base URL (adjust as needed)
    credentials: 'include', // ✅ Enable cookies
  }),
  tagTypes: ['Notification'], // ✅ Add cache tags
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (userId) => `/users/${userId}/notifications`,
      providesTags: ['Notification'] // ✅ Add cache tag
    }),
    markAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PUT'
      }),
      invalidatesTags: ['Notification'] // ✅ Add cache tag
    }),
    // ✅ Consider adding delete and create endpoints
    deleteNotification: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Notification']
    })
  })
});

// ✅ Export hooks
export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useDeleteNotificationMutation
} = notificationApi;

