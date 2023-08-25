import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  splitting: false,
  publicDir: 'src/ui',
});
