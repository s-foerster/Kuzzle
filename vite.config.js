import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
const isGithubPages = process.env.DEPLOY_TARGET === 'github';

export default defineConfig({
  plugins: [vue()],
  base: isGithubPages ? '/hearts_game/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
