import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: './',
  plugins: [
    react({
      include: /\.[jt]sx?$/,
      jsxRuntime: 'automatic',
      babel: {
        plugins: ['macros']
      }
    }),
    tsconfigPaths()
  ],
  esbuild: {
    loader: { '.js': 'jsx' }
  },
  build: {
    outDir: 'build'
  },
  test: {
    environment: 'jsdom',
    setupFiles: 'src/setupTests.js'
  }
});
