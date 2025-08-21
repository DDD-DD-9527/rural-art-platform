import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    server: {
      port: parseInt(env.VITE_DEV_SERVER_PORT) || 3000,
      open: true,
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        ...(env.VITE_ALLOWED_HOSTS ? env.VITE_ALLOWED_HOSTS.split(',') : [
          'cfa03a312188.ngrok-free.app',
          '0232bbdc2036.ngrok-free.app',
          '3c78d93dbf5d.ngrok-free.app',
          '5f63d143cc61.ngrok-free.app',
          'b9cd47b5e9a8.ngrok-free.app',
          '6c3b98d66e29.ngrok-free.app',
          '3690cade7f42.ngrok-free.app'
        ])
      ],
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      sourcemap: env.VITE_BUILD_SOURCEMAP === 'true',
      minify: env.VITE_BUILD_MINIFY !== 'false',
    },
  }
})