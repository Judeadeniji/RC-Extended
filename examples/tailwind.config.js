/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#2dd1d8',
          200: '#47a8df',
          300: '#4774df',
          'shade': '#0d0f62',
        },
      },
      fontFamily: {
        cal: ["Cal"]
      }
    },
  },
  plugins: [],
};