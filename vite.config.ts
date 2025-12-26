import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // 使用绝对路径，确保 SPA 路由正常工作
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false, // 生产环境建议关闭 sourcemap 以减小文件体积
    rollupOptions: {
      output: {
        manualChunks: undefined, // 根据需要调整代码分割策略
      },
    },
  },
  server: {
    host: true,
    port: 3000,
    cors: true,
  },
});
