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
        matrix: {
          off: '#1a1a2e',
          on: '#16f4d0',
          hover: '#0f3460',
          accent: '#e94560'
        }
      },
      animation: {
        'flip': 'flip 0.6s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 0.8s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' }
        },
        ripple: {
          '0%': { 
            transform: 'scale(0)',
            opacity: '1'
          },
          '100%': { 
            transform: 'scale(4)',
            opacity: '0'
          }
        },
        glow: {
          '0%': { 
            boxShadow: '0 0 5px #16f4d0, 0 0 10px #16f4d0'
          },
          '100%': { 
            boxShadow: '0 0 20px #16f4d0, 0 0 30px #16f4d0, 0 0 40px #16f4d0'
          }
        }
      }
    },
  },
  plugins: [],
}