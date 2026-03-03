import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBase = env.VITE_API_BASE_URL;
  const proxyTarget = apiBase && apiBase.startsWith("http") ? new URL(apiBase).origin : null;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      ...(proxyTarget
        ? {
            proxy: {
              // Same-origin dev proxy to avoid CORS issues when calling the API from localhost.
              "/api/v1": {
                target: proxyTarget,
                changeOrigin: true,
                secure: false,
                ws: true,
              },
            },
          }
        : {}),
    },
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
  };
});
