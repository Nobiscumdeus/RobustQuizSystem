import { createSlice} from "@reduxjs/toolkit";

const fontSizeSlice = createSlice({
    name:"fontSize",
    initialState:"medium", //default font size, other options are:  "medium", "large", "x-large"
    reducers:{
        increaseFontSize:(state) => {
            const sizes = ["small", "medium", "large", "x-large"];
            const currentIndex = sizes.indexOf(state);
            return sizes[Math.min(currentIndex + 1, sizes.length -1)];
            
        },
        decreaseFontSize:(state) => {
            const sizes = ["small", "medium", "large", "x-large"];
            const currentIndex = sizes.indexOf(state);
            return sizes[Math.max(currentIndex-1,0)];
        },
        setFontSize:(state,action) => action.payload,
    }

})

export const { increaseFontSize, decreaseFontSize, setFontSize } = fontSizeSlice.actions;
export default fontSizeSlice.reducer;
