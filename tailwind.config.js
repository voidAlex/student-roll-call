/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#EC4899', 
        accent: '#F59E0B',
        success: '#10B981',
        danger: '#EF4444',
      },
      fontFamily: {
        'sans': ['Source Han Sans', 'sans-serif'],
        'mono': ['Roboto', 'monospace'],
      },
    },
  },
  plugins: [],
}