import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Pi Manager",
        short_name: "PiManager",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#d5a900",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],

  server: {
    port: 5173,
    host: true,
    open: true,
  },

  build: {
    outDir: "dist", // Diretório que a Vercel publica
  },

  preview: {
    port: 4173,
    strictPort: true,
  },

  define: {
    "process.env": process.env,
  },
});
