import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.js",
      name: "SbgnmlToFigure", // global name in browser
      fileName: (format) => `sbgnml-to-figure.${format}.js`,
      formats: ["es", "umd"]
    },
    rollupOptions: {
      // don't bundle dependencies if you want
      external: [],
    }
  }
});