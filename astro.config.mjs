import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://haoly.app",
  base: "/",
  trailingSlash: "always",
  integrations: [react()],
  vite: {
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 700,
    },
  },
});
