/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a1a1a',
          foreground: '#ffffff'
        },
        secondary: {
          DEFAULT: '#2a2a2a',
          foreground: '#e0e0e0'
        },
        accent: {
          DEFAULT: '#ff4444',
          foreground: '#ffffff'
        }
      }
    },
  },
  plugins: [],
}
