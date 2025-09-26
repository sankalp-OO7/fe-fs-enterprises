import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Directs calls from 5173/api/* to 5000/api/*
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
