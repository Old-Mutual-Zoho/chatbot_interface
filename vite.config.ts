import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
     tailwindcss()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("react-icons")) return "react-icons";
          if (id.includes("react-datepicker")) return "datepicker";
          if (id.includes("react-markdown")) return "markdown";
          return "vendor";
        },
      },
    },
  },
})
