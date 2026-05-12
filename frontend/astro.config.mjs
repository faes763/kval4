// @ts-check
import { defineConfig } from "astro/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  server: {
      port: 3000,
      host: true,
	},

  vite: {
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
		},

    plugins: [tailwindcss()],

    build: {
      sourcemap: false,
      reportCompressedSize: false,
    },
  },

  integrations: [react()],
});