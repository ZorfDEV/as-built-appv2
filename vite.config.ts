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
 /* test: {
    globals: true,           // permet d'utiliser describe/it/expect sans import
    environment: 'jsdom',    // simule le DOM du navigateur
    setupFiles: './src/test/setup.ts',
    css: true,               // si tes composants importent du CSS
  },*/
  server: {
     host: '0.0.0.0',  
    port: 5173, // Port de l'application
    proxy: {
      '/api': {
      target: 'http://10.188.44.101:5000',
       //target: 'http://192.168.1.133:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
