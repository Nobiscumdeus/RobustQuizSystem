/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode via class
  content: ["./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",	
],
  theme: {
    extend: {
      colors: {
        // Your custom color palette for dark mode
        background: '#121212',
        text: '#e0e0e0',
      },
    },
  },
  plugins: [],
}

