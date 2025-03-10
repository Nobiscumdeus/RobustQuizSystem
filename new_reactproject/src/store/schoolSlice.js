import { createSlice } from "@reduxjs/toolkit";

const schoolSlice=createSlice({
    name:'school',
    initialState:{
        currentSchool:null,
        departments:[],
        exams:[],
        loading:false,
        error:null,
    },
    reducers:{
        //School management reducers
    }
})

export default schoolSlice.reducer;