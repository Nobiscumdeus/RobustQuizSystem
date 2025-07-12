import { createApi } from "@reduxjs/toolkit/query"

export const courseApi=createApi({
    endpoints:(builder)=>({
        //Direct course model operations 
        getCourses:builder.query({
            query:()=>'/courses',
            providesTags:['Course']
        }),
        getCourseById:builder.query({
            query:(id)=> `courses/${id}`
        }),
        createCourse:builder.mutation({
            query:(courseData)=>({
                url:'/courses',
                method:'POST',
                body:courseData
            }),
            invalidatesTag:['Course']
        }),
        updateCourse:builder.mutation({
            query:({id, ...data})=>({
                url:`/courses/${id}`,
                method:'PUT',
                body:data
            })
        }),
        deleteCourse:builder.mutation({
            query:(id)=>({
                url:`/courses/${id}`,
                method:'DELETE'
            })
        })
    })
})