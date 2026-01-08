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
          50: '#eef0fd',
          100: '#dce0fc',
          200: '#bcc3f9',
          300: '#9ba5f6',
          400: '#7a88f3',
          500: '#5865F2', // Discord Blurple
          600: '#4651c2',
          700: '#353d91',
          800: '#232861',
          900: '#121430',
        },
        discord: {
          bg: '#111216', // Premium Dark Slate (not void black)
          sidebar: '#0e0f13', // Slightly darker slate for sidebar
          element: '#1a1b20', // Lighter slate for elements
          hover: '#23242a',
          active: '#2c2d35',
          green: '#23A559',
          red: '#ED4245',
          yellow: '#FEE75C',
          fuchsia: '#EB459E',
        },
        gray: {
          50: '#f6f6f7',
          100: '#ebedef',
          200: '#dfe2e5',
          300: '#cfd3d7',
          400: '#babece',
          500: '#99aab5',
          600: '#80848e',
          700: '#4f545c',
          800: '#36393f',
          900: '#202225',
        }
      },
      backgroundImage: {
        'nitro-gradient': 'linear-gradient(45deg, #5865F2, #EB459E)',
        'glass-gradient': 'linear-gradient(135deg, rgba(43, 45, 49, 0.7), rgba(30, 31, 34, 0.7))',
      },
      fontFamily: {
        'arabic': ['Cairo', 'gg sans', 'Inter', 'system-ui', 'sans-serif'],
        'english': ['gg sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
