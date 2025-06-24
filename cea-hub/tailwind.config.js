/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ensure no typos here
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1A237E',
      },
    },
  },
  plugins: [],
}