import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Vite 8 bundles with Rolldown, which ignores `manualChunks`.
        // `codeSplitting` is the supported equivalent. three.js is large
        // and changes rarely, so splitting it keeps app code cacheable.
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules\/three\// },
            { name: 'r3f', test: /node_modules\/(@react-three|postprocessing)\// },
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
})
