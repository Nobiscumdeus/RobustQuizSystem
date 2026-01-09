// src/api/uploadApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const uploadApi = createApi({
  reducerPath: 'uploadApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:5000',
    credentials: 'include',
  }),
  tagTypes: ['Upload'],
  endpoints: (builder) => ({
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: '/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Upload'],
    }),
  }),
});

export const {
  useUploadImageMutation,
  
} = uploadApi;