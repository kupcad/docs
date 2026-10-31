// Builds the renderer page (index.html, main.js) into the folder render-examples.mjs names, so
// the viewer and three.js are bundled once and served to headless Chromium from there.
import { defineConfig } from 'vite';

export default defineConfig({
  root: new URL('.', import.meta.url).pathname,
  logLevel: 'warn',
  build: {
    outDir: process.env.RENDER_OUT,
    emptyOutDir: true,
    target: 'esnext',
  },
});
