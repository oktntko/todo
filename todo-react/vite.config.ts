import react from "@vitejs/plugin-react";
import * as path from "path";
import { defineConfig } from "vite";
import ViteFonts from "vite-plugin-fonts";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },
  plugins: [
    react(),
    ViteFonts({
      google: {
        families: ["Noto Sans JP", "Open Sans", "Roboto Mono"],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/files": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
