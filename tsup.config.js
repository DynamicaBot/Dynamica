// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/index.ts', 'src/deploy-commands.ts', 'src/remove-commands.ts'],
  splitting: !options.watch,
  sourcemap: true,
  clean: true,
  format: ['esm'],
  platform: 'node',
  minify: !options.watch,
  dts: options.watch,
  tsconfig: 'tsconfig.json',
  bundle: true,
  metafile: true,
}));
