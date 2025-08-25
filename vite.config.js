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
        '58tm1vpk-3000.asse.devtunnels.ms'
      ],
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:3000',
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