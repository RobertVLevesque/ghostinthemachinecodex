import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/ghostinthemachinecodex/",
  base: '/ghostinthemachinecodex/',   // 👈 important for GitHub Pages
})
