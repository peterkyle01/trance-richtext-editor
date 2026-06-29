import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
      renderer: "src/renderer.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ["react", "react-dom"],
    esbuildOptions(options) {
      options.jsx = "automatic";
    },
    treeshake: true,
    splitting: true,
    onSuccess: "cat dist/index.css dist/renderer.css > dist/styles.css",
  },
]);
