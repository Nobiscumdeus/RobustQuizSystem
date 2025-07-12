
import { createApi } from "@reduxjs/toolkit/query"

export const notificationApi = createApi({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (userId) => `/users/${userId}/notifications`
    }),
    markAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PUT'
      })
    })
  })
})

