/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          emerald: '#059669',
          blue: '#2563eb',
          indigo: '#4f46e5',
          violet: '#7c3aed',
        },
        accent: {
          orange: '#ea580c',
          rose: '#e11d48',
        },
        neutral: {
          slate: '#475569',
        },
        surface: {
          white: '#ffffff',
          gray: '#f8fafc',
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(5, 150, 105, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(5, 150, 105, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}