/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          green: '#2d5016',
          light: '#4a7c2a',
          dark: '#1a2e0a',
          brown: '#8b6f47',
          tan: '#d4c4a0',
        },
      },
    },
  },
  plugins: [],
}

