import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'cfa03a312188.ngrok-free.app',
      '0232bbdc2036.ngrok-free.app',
      '3c78d93dbf5d.ngrok-free.app',
      '5f63d143cc61.ngrok-free.app',
      'b9cd47b5e9a8.ngrok-free.app',
      '6c3b98d66e29.ngrok-free.app',
      '3690cade7f42.ngrok-free.app'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})