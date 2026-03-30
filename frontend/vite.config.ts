import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        // Use 127.0.0.1 so Node matches Flask binding (avoids ::1 vs 127.0.0.1 ECONNREFUSED)
        target: "http://127.0.0.1:5001",
        changeOrigin: true,
      },
    },
  },
});
