// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'tsup';

export default defineConfig(({ watch }) => ({
  entry: ['src/index.ts', 'src/deploy-commands.ts', 'src/remove-commands.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ['esm'],
  platform: 'node',
  minify: false,
  dts: true,
  bundle: true,
  metafile: true,
  onSuccess: watch
    ? 'node --enable-source-maps dist/index.js --inspect'
    : undefined,
}));
