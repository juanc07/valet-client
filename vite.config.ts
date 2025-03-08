import path from "path";
import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Explicitly map Buffer imports to the buffer package
      "buffer": "buffer",
    },
  },
  optimizeDeps: {
    include: ["buffer"],
  },
  // Inject a polyfill script before other code runs
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  esbuild: {
    // Inject Buffer polyfill at the top of every module
    banner: `import { Buffer } from "buffer"; globalThis.Buffer = Buffer;`,
  },
});