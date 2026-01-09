// features/ChasfatAcademy/ui/displayModeSlice.js
import { createSlice } from "@reduxjs/toolkit";

const displayModeSlice = createSlice({
  name: "displayMode",
  initialState: "light", // Options: "light" or "dark"
  reducers: {
    toggleDisplayMode: (state) => state === "light" ? "dark" : "light",
    setDisplayMode: (state, action) => action.payload
  }
});

export const { toggleDisplayMode, setDisplayMode } = displayModeSlice.actions;
export default displayModeSlice.reducer;