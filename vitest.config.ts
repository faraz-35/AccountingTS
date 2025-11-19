import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./app/(common)/lib/test-setup.ts"],
    coverage: {
      reporter: ["text", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "**/*.d.ts",
        "**/*.config.*",
        "app/(common)/lib/test-setup.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@/": path.resolve(__dirname, "./app/"),
    },
  },
});
