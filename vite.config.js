import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'example', // 明确指定 example 目录为根目录
  build: {
    outDir: 'dist', // 输出到 example/dist
    emptyOutDir: true
  },
  publicDir: resolve(__dirname, 'example/assets'), // 让 assets 目录下的图片等静态资源原样拷贝到 dist
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
