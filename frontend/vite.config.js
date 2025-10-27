import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuração otimizada para deploy na Vercel + React Router
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    open: true,
  },
  build: {
    outDir: "dist", // diretório padrão que a Vercel vai publicar
  },
  // Fundamental para React Router funcionar em rotas diretas (ex: /placas)
  preview: {
    port: 4173,
    strictPort: true,
  },
  // Corrige fallback de rotas no ambiente de desenvolvimento e produção
  define: {
    "process.env": process.env,
  },
});
