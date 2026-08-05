import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // A OpenSky Network não envia headers de CORS, então o navegador
      // bloqueia chamadas diretas ("Failed to fetch"). Em desenvolvimento,
      // o próprio servidor do Vite repassa a chamada (Node não sofre CORS).
      "/opensky-api": {
        target: "https://opensky-network.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/opensky-api/, "/api"),
      },
    },
  },
});
