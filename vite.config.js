import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      // 可选：如果需要代理视频请求
      // '/video-proxy': {
      //   target: 'https://dl-c-zb-u.drive.quark.cn',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/video-proxy/, ''),
      // }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'zustand-vendor': ['zustand'],
          'axios-vendor': ['axios']
        }
      }
    }
  },
  publicDir: 'public'
})
