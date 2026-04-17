import { defineConfig } from "vite";

// Ensures public/ (interest form, css) is always emitted to dist/ on build.
export default defineConfig({
  publicDir: "public",
});
