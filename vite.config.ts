import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// 剥离 Origin 头，避免后端 CORS 过滤器拒绝（"Invalid CORS request"）
const stripOrigin = {
  configure: (proxy: any) => {
    proxy.on('proxyReq', (proxyReq: any) => {
      proxyReq.removeHeader('origin')
    })
  }
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 8000,
    proxy: {
      '/admin': { target: 'http://localhost:8080', changeOrigin: true, ...stripOrigin },
      '/api': { target: 'http://localhost:8080', changeOrigin: true, ...stripOrigin }
    }
  }
})
