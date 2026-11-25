import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into outDir (dist/ or docs/) so relative URLs like
      // "./src/assets/images/..." still resolve in production builds.
      (() => {
        let resolvedOutDir = 'dist';
        return {
          name: 'copy-unbundled-src-assets',
          apply: 'build' as const,
          configResolved(config: {build: {outDir: string}}): void {
            resolvedOutDir = config.build.outDir || 'dist';
          },
          closeBundle(error?: Error): void {
            if (error) {
              return;
            }
            const outPath = path.resolve(__dirname, resolvedOutDir);
            const srcAssets = path.resolve(__dirname, 'src/assets');
            const destAssets = path.resolve(outPath, 'src/assets');
            if (fs.existsSync(outPath) && fs.existsSync(srcAssets)) {
              fs.cpSync(srcAssets, destAssets, {recursive: true, force: true});
            }
          },
        };
      })(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
