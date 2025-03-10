import { createSlice } from '@reduxjs/toolkit';

// Get initial state from local storage if it exists 
const savedMode = localStorage.getItem('darkMode');
const initialState = {
  darkMode: savedMode === 'true' // Defaults to false if nothing is found 
};

const darkModeSlice = createSlice({
  name: 'darkMode',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      // Write the new dark mode to local storage 
      localStorage.setItem('darkMode', state.darkMode.toString());

      // Update the Tailwind dark class in the document 
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
});

// Action creators
export const { toggleDarkMode } = darkModeSlice.actions;

// Selector
export const selectDarkMode = (state) => state.darkMode.darkMode;

export default darkModeSlice.reducer;
