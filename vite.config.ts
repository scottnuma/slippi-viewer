import { defineConfig } from 'vite'
import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), libAssetsPlugin({
    include: ['**/*.zip']
  })],
  build: {
    lib: {
      entry: 'index.tsx',
      name: 'slippilab-vite',
      fileName: 'slippilab-vite',
      formats: ['es'],      
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },    
  },
  // include tailwind
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/index.css";`
      }
    }
  }
})
