import { createApi } from "@reduxjs/toolkit/query";

export const authApi=createApi({
    endpoints:(builder)=>({
        //Simple Crud user model 
        login:builder.mutation({
            query:(credentials)=>({
                url:'/auth/login',
                method:'POST',
                body:credentials
            })
        }),
        register:builder.mutation({
            query:(userData)=>({
                url:'/auth/register',
                method:'POST',
                body:userData

            })
        }),
        getProfile:builder.query({
            query:(userId)=>`/users/${userId}`
        }),
        updateProfile:builder.mutation({
            query:({id, ...data})=>({
                url:`/users/${id}`,
                method:'PUT',
                body:data

            })
        })

    })
})