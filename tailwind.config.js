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
        background: '#07090E',
        surface: '#0C0F14',
        surfaceElevated: '#12171F',
        border: '#1E293B',
        borderHover: '#334155',
        primary: {
          DEFAULT: '#06B6D4',
          glow: 'rgba(6, 182, 212, 0.4)',
        },
        secondary: {
          DEFAULT: '#6366F1',
          glow: 'rgba(99, 102, 241, 0.4)',
        },
        accent: {
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          violet: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['JetBrains Mono', 'Fira Code', 'monospace'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Orbitron', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(6, 182, 212, 0.6)' },
        },
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      boxShadow: {
        'glow-cyan': '0 0 30px rgba(6, 182, 212, 0.3)',
        'glow-emerald': '0 0 30px rgba(16, 185, 129, 0.3)',
        'glow-rose': '0 0 30px rgba(244, 63, 94, 0.3)',
        'glow-amber': '0 0 30px rgba(245, 158, 11, 0.3)',
        'inner-glow': 'inset 0 0 30px rgba(6, 182, 212, 0.1)',
      },
    },
  },
  plugins: [],
}