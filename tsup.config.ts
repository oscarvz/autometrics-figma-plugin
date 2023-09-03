import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  outDir: 'dist',
  publicDir: 'src/ui',
  splitting: false,
  minify: !options.watch,
  clean: !options.watch,
  sourcemap: !!options.watch,
}));
