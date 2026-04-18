/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F3F4F6',
        surface: '#FFFFFF',
        primary: '#111827',
        secondary: '#6B7280',
        muted: '#9CA3AF',
        border: '#E5E7EB',
        accent: '#F97316',
        'accent-hover': '#EA580C',
        'accent-warm': '#FFF0E6',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08)',
        'elevated': '0 4px 12px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
