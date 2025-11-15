import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'], // your library entry
  dts: false,               // emit .d.ts
  format: ['cjs', 'esm'],
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'], // keep react as peer dep
  target: 'es2019'
});
