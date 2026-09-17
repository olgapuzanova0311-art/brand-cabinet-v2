import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  preview: {
    // Разрешаем любой хост, т.к. Railway отдаёт публичный домен вида *.up.railway.app
    allowedHosts: true,
  },
});
