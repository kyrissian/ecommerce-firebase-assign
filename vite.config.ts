import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Raised slightly above default (500) because Firebase core lands
    // near ~510k after splitting. This keeps signal high without hiding
    // genuinely large regressions.
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // App source should follow route-level code splitting naturally.
          if (!id.includes("node_modules")) return undefined;

          // Split Firebase by subsystem so one giant vendor chunk isn't
          // loaded up front (core/auth/firestore are used at different times).
          if (id.includes("firestore")) return "firebase-firestore";
          if (id.includes("/auth/") || id.includes("firebase/auth")) {
            return "firebase-auth";
          }
          if (id.includes("firebase") || id.includes("@firebase")) {
            return "firebase-core";
          }

          // Keep data/query libs isolated for better long-term caching.
          if (id.includes("@tanstack/react-query")) return "query";

          // UI-related third-party deps grouped together.
          if (
            id.includes("react-toastify") ||
            id.includes("bootstrap") ||
            id.includes("@smastrom/react-rating")
          ) {
            return "ui";
          }

          // Core React runtime and router chunk.
          if (
            id.includes("react-router-dom") ||
            id.includes("react-dom") ||
            id.includes("/react/")
          ) {
            return "react";
          }

          // Fallback bucket for remaining vendor modules.
          return "vendor";
        },
      },
    },
  },
});
