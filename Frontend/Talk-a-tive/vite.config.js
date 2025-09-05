import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin:true,
        secure:false
      }
    },
  },
  build: {
  
    chunkSizeWarningLimit: 1000, // Increase limit to 1000 kB
  
    rollupOptions: {
      output: {
        manualChunks: {
          // Group dependencies into separate chunks
          vendor: ['react', 'react-dom'], // Separate React and ReactDOM
        },
      },
    }
  },
  plugins: [react()],
});


