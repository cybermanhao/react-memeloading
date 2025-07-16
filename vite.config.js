import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: './example',
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
