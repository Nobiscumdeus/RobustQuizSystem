import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:5000',
    credentials: 'include', // Important for HTTP-only cookies
  }),
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    
    // Get user profile with detailed information
    getUserProfile: builder.query({
      query: () => ({
        url: '/profile',
        method: 'GET',
      }),
      providesTags: ['Profile'],
    }),
    
    // Update user profile
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Profile'], // This will auto-refresh the profile data
    }),
    
    // Change password
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/profile/password',
        method: 'PUT',
        body: passwordData,
      }),
    }),
    
    // Upload profile picture
    uploadAvatar: builder.mutation({
      query: (formData) => ({
        url: '/profile/avatar',
        method: 'POST',
        body: formData,
       // formData: true,
      }),
      invalidatesTags: ['Profile'],
    }),
    
    // Get user stats/achievements
    getUserStats: builder.query({
      query: () => ({
        url: '/profile/stats',
        method: 'GET',
      }),
    }),
  }),
});

export const { 
  useGetUserProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
  useGetUserStatsQuery,
} = profileApi;