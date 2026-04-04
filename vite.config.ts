import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three-core'
          if (id.includes('@react-three/fiber') || id.includes('@react-three/drei')) return 'r3f'
          if (id.includes('@react-three/postprocessing') || id.includes('postprocessing')) return 'postprocessing'
          if (id.includes('framer-motion') || id.includes('zustand')) return 'ui'
        },
      },
    },
  },
})
