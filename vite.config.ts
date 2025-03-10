import path from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills"; // Correct import

export default defineConfig({
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true, // Polyfill Buffer globally
      },
    }),
  ],
  base: "/", // Ensure assets load from root
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      external: [], // Ensure no externalization of built-ins
    },
  },
});