import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({server: {
  proxy: {
    '/api' : {
      target: "http://localhost:3000",
      changeOrigin: true
    }
  },
  base: '/',
  watch: {
    usePolling: true,
  },
},
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-slot'] // Add other shadcn dependencies
        }
      }
    }
  }
  
})
