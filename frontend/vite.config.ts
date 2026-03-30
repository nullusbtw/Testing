import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Чтобы Vite НЕ переключался на 3001 (у нас там ожидается backend),
    // иначе `/api` проксируется "сам на себя" и начинаются ошибки.
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});

