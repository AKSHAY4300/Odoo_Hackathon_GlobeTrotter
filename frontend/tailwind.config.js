/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core travel design system tokens
        'ink-navy': {
          DEFAULT: '#14213D',
          50: '#F0F3FA',
          100: '#DCE4F3',
          200: '#B8C9E7',
          300: '#8FAEDB',
          400: '#5F8DCB',
          500: '#346BB7',
          600: '#235094',
          700: '#1A396C',
          800: '#14213D', // Primary Ink Navy
          900: '#0B1324',
          950: '#060B14',
        },
        'runway-white': {
          DEFAULT: '#FAFAF7',
          dark: '#F3F2EB',
        },
        'boarding-amber': {
          DEFAULT: '#F4A300',
          50: '#FFF9EB',
          100: '#FFF1CC',
          200: '#FFE199',
          300: '#FFCE66',
          400: '#F4A300', // Primary Boarding Amber
          500: '#DB8F00',
          600: '#B87400',
          700: '#945A00',
        },
        'signal-teal': {
          DEFAULT: '#0F8B8D',
          50: '#EDFAFA',
          100: '#D4F3F3',
          200: '#A4E5E6',
          300: '#6CD4D5',
          400: '#0F8B8D', // Primary Signal Teal
          500: '#0C7476',
          600: '#095A5C',
        },
        'tarmac-grey': {
          DEFAULT: '#6B7280',
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280', // Primary Tarmac Grey
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
        },
        'stamp-red': {
          DEFAULT: '#D64545',
          50: '#FDF2F2',
          100: '#FDE8E8',
          200: '#FBD5D5',
          300: '#F8B4B4',
          400: '#F98080',
          500: '#D64545', // Primary Stamp Red
          600: '#B82E2E',
          700: '#9B1C1C',
        },
        'parchment': '#F4F0E8',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(#6B7280 1px, transparent 1px)",
      },
      boxShadow: {
        'ticket': '0 4px 20px -2px rgba(20, 33, 61, 0.08), 0 2px 6px -1px rgba(20, 33, 61, 0.04)',
        'ticket-hover': '0 12px 30px -4px rgba(20, 33, 61, 0.14), 0 4px 10px -2px rgba(20, 33, 61, 0.06)',
        'stamp': '0 0 0 2px #D64545, inset 0 0 0 2px #D64545',
        'departure': 'inset 0 2px 4px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'flight-dash': 'dash 20s linear infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        dash: {
          to: {
            strokeDashoffset: '-1000',
          },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' },
        },
      },
    },
  },
  plugins: [],
}
