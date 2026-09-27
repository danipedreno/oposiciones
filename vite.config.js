import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages sirve el proyecto en /recuento/
const BASE = process.env.BASE_PATH || "/recuento/";

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*.png", "illustrations/*"],
      manifest: {
        name: "Recuento · Oposiciones IIPP",
        short_name: "Recuento",
        description: "Simulacros con penalización, test desde tus apuntes, racha y rangos para Ayudantes de Instituciones Penitenciarias.",
        lang: "es",
        theme_color: "#191919",
        background_color: "#191919",
        display: "standalone",
        orientation: "portrait",
        start_url: BASE,
        scope: BASE,
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,png,svg,webp}"],
        // Solo alfabeto latino: el resto de subconjuntos de las fuentes no se usa
        globIgnores: ["**/*-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese}-*.woff2"],
      },
    }),
  ],
});
