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
        description: "Tests con corrección oficial, tarjetas de repaso, racha y rangos para preparar Ayudantes de Instituciones Penitenciarias.",
        lang: "es",
        theme_color: "#fdf4df",
        background_color: "#fdf4df",
        display: "standalone",
        orientation: "portrait",
        // Igual que la otra webapp que sí se instala en el mismo móvil: rutas relativas al manifiesto e id estable.
        id: "./",
        start_url: "./",
        scope: "./",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
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
