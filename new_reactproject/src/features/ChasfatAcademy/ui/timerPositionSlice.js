import { createSlice} from "@reduxjs/toolkit";

const timerPositionSlice = createSlice({
    name:"timerPosition",
    initialState:"top", //default timer position, other options are:  "top", "bottom", "floating","hidden"
    reducers:{
        setTimerPosition:(state,action) => action.payload,
    }
})

export const { setTimerPosition } = timerPositionSlice.actions;
export default timerPositionSlice.reducer;