import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
     host: '0.0.0.0',  
    port: 5173, // Port de l'application
    proxy: {
      '/api': {
       //target: 'http://10.188.44.52:5000',
       target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
