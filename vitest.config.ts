import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Kept apart from vite.config.ts so unit tests don't load the app's build plugins.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
