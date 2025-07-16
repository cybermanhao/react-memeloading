import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'example', // 明确指定 example 目录为根目录
  build: {
    outDir: 'dist', // 输出到 example/dist
    emptyOutDir: true
  },
  server: {
    port: 3002,
    open: true,
    host: 'localhost'
  },
  resolve: {
    alias: {
      // 允许导入构建的dist文件
      '../dist': '../dist'
    }
  }
})
