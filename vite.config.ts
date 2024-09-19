import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({
    insertTypesEntry: true,
  }),],
  build: {
    lib: {
      entry: 'src/index.tsx',
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
        },
        intro: 'import "./style.css";',
      }
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/index.css";`
      }
    },
    postcss: {
      plugins: [tailwind, autoprefixer],
    },
  },
})
