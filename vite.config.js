import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@supabase/")) return "auth-provider";
        },
      },
    },
  },
  test: { environment: "jsdom", clearMocks: true },
});
