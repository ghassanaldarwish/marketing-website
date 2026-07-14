import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

const srcDirectory = fileURLToPath(new URL("./src", import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      "@": srcDirectory,
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts"],
    exclude: [
      "**/node_modules/**",
      "**/.next/**",
      "**/coverage/**",
      "tests/e2e/**",
    ],
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    passWithNoTests: false,
  },
})
