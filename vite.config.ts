/**
 * Сборка Koubou: Vite, React, Tailwind и алиас @ на каталог src.
 * Dev-сервер слушает 127.0.0.1, чтобы страница открывалась в браузере на Windows.
 * imageProxyPlugin проксирует CloseRouter и подставляет CLOSEROUTER_API_KEY из .env.
 */
import path from "path";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { imageProxyPlugin } from "./vite.imageProxy";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [imageProxyPlugin(env.CLOSEROUTER_API_KEY || ""), react(), tailwindcss()],
    server: {
      host: "127.0.0.1",
      port: 5173,
    },
    preview: {
      host: "127.0.0.1",
      port: 4173,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
