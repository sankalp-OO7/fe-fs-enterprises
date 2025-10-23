import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // ✅ Local Dev Settings
  server: {
    proxy: {
      // When running locally, any call to /api/* will go to your local backend
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },

  // ✅ Fix "404 on refresh" issue for React Router (useful in `vite preview`)
  preview: {
    port: 4173,
    strictPort: true,
    historyApiFallback: true, // fallback to index.html
  },

  // ✅ Ensure correct build output for Vercel
  build: {
    outDir: "dist",
  },
});
