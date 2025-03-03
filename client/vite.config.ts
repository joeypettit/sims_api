import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to your local API
      "/api": {
        target: "http://localhost:3000", // Where your backend is running
        changeOrigin: true, // Ensure the origin is changed to the target URL
      },
    },
  },
});
