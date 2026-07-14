import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0d1117',
        surface: '#161b22',
        teal: { DEFAULT: '#00d4aa', dark: '#00a882' },
        blue: { accent: '#0080ff' },
      },
    },
  },
} satisfies Config
