import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "**/*.d.ts",
        "**/*.test.ts",
        "**/*.config.ts",
        "**/types.ts",
      ],
      all: true,
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
});
