import { build } from "esbuild";
await build({
  entryPoints: ["src/browser/motion-runtime.ts"],
  bundle: true,
  platform: "browser",
  format: "iife",
  globalName: "ParallaxMotion",
  target: "es2022",
  minify: true,
  outfile: "assets/motion-runtime.js",
});
