import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { PROJECT_PAGE_METADATA, renderProjectMetadataDocument } from './src/utils/pageMetadata';

const projectMetadataPages = (): Plugin => {
  let outputDirectory = '';

  return {
    name: 'project-metadata-pages',
    apply: 'build',
    configResolved(config) {
      outputDirectory = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const homeDocument = await readFile(join(outputDirectory, 'index.html'), 'utf8');

      await Promise.all(
        PROJECT_PAGE_METADATA.map(async (metadata) => {
          const destination = join(outputDirectory, 'projects', metadata.id, 'index.html');
          await mkdir(dirname(destination), { recursive: true });
          await writeFile(
            destination,
            renderProjectMetadataDocument(homeDocument, metadata),
            'utf8'
          );
        })
      );
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          lenis: ['lenis'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
    },
  },
  plugins: [react(), projectMetadataPages()],
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@assets': '/src/assets',
      '@constants': '/src/constants',
      '@styles': '/src/styles',
    },
  },
  server: {
    port: 4028,
    host: '0.0.0.0',
    strictPort: true,
  },
});
