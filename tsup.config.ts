import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,             // emit types (index.d.ts)
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'es2019',
  shims: true,           // helpful for ESM/CJS interop
  outDir: 'dist',
  treeshake: true,
});
