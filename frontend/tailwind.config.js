import containerQueries from '@tailwindcss/container-queries'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Cabin', 'Lato', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-sm': ['1.625rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display': ['1.875rem', { lineHeight: '1.15', letterSpacing: '-0.025em' }],
      },
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
      },
      transitionTimingFunction: {
        'smooth-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      colors: {
        primary: {
          50: '#f4f7f2',
          100: '#e3ebde',
          200: '#c5d4be',
          300: '#9eb592',
          400: '#6d8f62',
          500: '#4a6b41',
          600: '#3d5a36',
          700: '#324830',
          800: '#2a3d28',
          900: '#1f2e1d',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#633112',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fca5a5',
          300: '#f87171',
          400: '#ef4444',
          500: '#dc2626',
          600: '#b91c1c',
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#691c1c',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      boxShadow: {
        'soft': '0 8px 24px rgba(31, 46, 29, 0.06)',
        'soft-lg': '0 16px 40px rgba(31, 46, 29, 0.08)',
      },
    },
  },
  plugins: [containerQueries],
}
