import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // react() is only exercised by the new jsx component tests (each opts
  // into jsdom via a `// @vitest-environment jsdom` comment — see
  // docs/superpowers/plans/2026-10-13-portfolio-micro-animations.md);
  // the existing node-environment tests don't import JSX, so adding this
  // plugin doesn't change anything about them.
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.test.js", "*.test.js"],
    setupFiles: ["./src/test/setup.js"],
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "src"),
    },
  },
});
