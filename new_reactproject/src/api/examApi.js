
import { createApi } from "@reduxjs/toolkit/query"

export const examApi=createApi({
    endpoints:(builder)=>({
        //Basic exam model operations 
        getExams:builder.query({
            query:()=>'/exams'
        }),
        getExamById:builder.query({
            query:(id)=>`/exams/${id}`
        }),
        createExam:builder.mutation({
            query:(examData)=>({
                url:'/exams',
                method:'POST',
                body:examData
            })
        }),
        //Simple questions operation
        getExamQuestions:builder.query({
            query:(examId)=>`/exams/${examId}/questions`
        }),
        addQuestion:builder.mutation({
            query:({examId,questionData}) =>({
                url:`/exams/${examId}/questions`,
                method:'POST',
                body:questionData
            })
        })
    })
    
})