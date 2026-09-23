import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './frontend/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F8CFF',
          foreground: '#FFFFFF'
        },
        accent: '#8B5CF6',
        background: '#0B0F19',
        surface: '#121726'
      },
      container: {
        center: true,
        padding: '1rem'
      },
      boxShadow: {
        glow: '0 0 40px rgba(79,140,255,0.45)'
      }
    }
  },
  plugins: []
} satisfies Config
