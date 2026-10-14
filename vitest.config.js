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
    include: ["src/**/*.test.js", "src/**/*.test.jsx", "*.test.js"],
    setupFiles: ["./src/test/setup.js"],
    // Without this, Vite externalizes @testing-library/jest-dom (it lives
    // in node_modules) instead of running it through Vite's own module
    // graph — its `import { expect } from "vitest"` then resolves via
    // plain Node module resolution to a SEPARATE `expect` instance than
    // the one actual test files get from Vitest's runtime, so
    // `expect.extend(matchers)` registers on the wrong instance and every
    // jest-dom matcher throws "Invalid Chai property". Inlining forces it
    // through the same graph, same `expect` singleton.
    server: {
      deps: {
        inline: ["@testing-library/jest-dom"],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "src"),
    },
  },
});
