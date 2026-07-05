import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Красивые ссылки /s/<slug> и /view обслуживаются SPA-роутером.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
});
