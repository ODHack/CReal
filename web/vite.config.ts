import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/ODHack/',
  plugins: [react()],
  build: {
    outDir: 'docs',  // 出力ディレクトリを 'docs' に設定
  },
})
