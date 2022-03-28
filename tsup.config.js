import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts", "src/deploy-commands.ts", "src/remove-commands.ts"],
  splitting: true,
  sourcemap: true,
  clean: true,
  format: ["esm"],
  platform: "node",
  minify: !options.watch,
  tsconfig: "tsconfig.json",
  bundle: true,
  dts: !!process.env.TYPE_CHECKING,
  metafile: true,
}));
