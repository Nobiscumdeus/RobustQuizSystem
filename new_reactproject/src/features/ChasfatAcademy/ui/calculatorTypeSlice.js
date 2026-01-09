import { createSlice } from "@reduxjs/toolkit";

const calculatorTypeSlice = createSlice({
    name:"calculatorType",
    initialState:"basic"    , //default calculator type, other options are:  "basic", "scientific", "medical"
    reducers:{
        setCalculatorType:(state,action) => action.payload
    }
})


export const { setCalculatorType} = calculatorTypeSlice.actions;
export default calculatorTypeSlice.reducer;
