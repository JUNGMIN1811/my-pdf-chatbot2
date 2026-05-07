import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Design Ref: §2.3 — 개발 환경에서 /api 요청을 Express 서버(3001)로 프록시
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
