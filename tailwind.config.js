/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Design Ref: §5.1 — ui_ux.md 네이버 스타일 색상 토큰
      colors: {
        primary: '#00C73C',
        'user-bubble': '#0066FF',
        'bot-bubble': '#F5F5F5',
        'text-dark': '#333333',
        'text-muted': '#999999',
      },
    },
  },
  plugins: [],
}
