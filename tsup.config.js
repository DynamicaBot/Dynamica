import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts", "src/deploy-commands.ts", "src/remove-commands.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ["esm"],
  platform: "node",
  minify: !options.watch,
  tsconfig: "tsconfig.json",
}));
