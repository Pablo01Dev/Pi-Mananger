import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
        "icon-192.png",
        "icon-512.png"
      ],
      manifest: {
        name: "Pi Manager",
        short_name: "PiManager",
        description: "Sistema interno da Pinciara Imóveis Exclusivos",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#d5a900",
        orientation: "portrait",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],

  server: {
    port: 5173,
    host: true,
    open: true
  },

  build: {
    outDir: "dist"
  },

  preview: {
    port: 4173,
    strictPort: true
  },

  define: {
    "process.env": process.env
  }
});
