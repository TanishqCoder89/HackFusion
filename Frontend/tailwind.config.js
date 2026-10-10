/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          bg: '#FFFFFF',
          text: '#111111',
          secondary: '#555555',
          accent: '#38BDF8',
          card: '#F8FAFC',
          border: '#E2E8F0',
        },
        dark: {
          bg: '#0A0A0A',
          text: '#FFFFFF',
          secondary: '#A3A3A3',
          accent: '#38BDF8',
          card: '#171717',
          border: '#27272A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
