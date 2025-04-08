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
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Lexend', 'ui-sans-serif', 'system-ui'],
      },
      backgroundColor: {
        // Adding darker colors for dark mode
        'dark': {
          DEFAULT: '#000000',
          '50': '#0a0a0a',
          '100': '#121212',
          '200': '#1a1a1a',
          '300': '#262626',
          '400': '#333333',
          '500': '#404040',
          '600': '#4d4d4d',
          '700': '#595959',
          '800': '#666666',
          '900': '#737373',
        },
      },
    },
  },
  plugins: [],
};