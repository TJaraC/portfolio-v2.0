import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import {
  HOME_PAGE_METADATA,
  NOT_FOUND_PAGE_METADATA,
  PROJECT_PAGE_METADATA,
  renderMetadataDocument,
  renderSitemap,
} from './src/utils/pageMetadata';

/**
 * Crawler-facing HTML: every indexable route gets its own static document with the
 * right title, description, canonical, social tags and JSON-LD, plus a sitemap and a
 * noindex 404 shell that Vercel serves with a real 404 status.
 */
const seoDocuments = (): Plugin => {
  let outputDirectory = '';
  let isBuild = false;

  return {
    name: 'seo-documents',
    configResolved(config) {
      outputDirectory = resolve(config.root, config.build.outDir);
      isBuild = config.command === 'build';
    },
    transformIndexHtml(html) {
      return renderMetadataDocument(html, HOME_PAGE_METADATA);
    },
    async closeBundle() {
      // Vite also calls closeBundle when the dev server shuts down.
      if (!isBuild) return;
      const homeDocument = await readFile(join(outputDirectory, 'index.html'), 'utf8');

      await Promise.all([
        ...PROJECT_PAGE_METADATA.map(async (metadata) => {
          const destination = join(outputDirectory, 'projects', metadata.id, 'index.html');
          await mkdir(dirname(destination), { recursive: true });
          // Preload the case-study hero (LCP candidate) so it starts downloading
          // while the JS bundle loads, instead of after the route + JSON chunks.
          const html = renderMetadataDocument(homeDocument, metadata).replace(
            '</head>',
            `  <link rel="preload" as="image" href="${metadata.heroImagePath}" fetchpriority="high" />\n  </head>`
          );
          await writeFile(destination, html, 'utf8');
        }),
        writeFile(
          join(outputDirectory, '404.html'),
          renderMetadataDocument(homeDocument, NOT_FOUND_PAGE_METADATA),
          'utf8'
        ),
        writeFile(join(outputDirectory, 'sitemap.xml'), renderSitemap(), 'utf8'),
      ]);
    },
  };
};
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist',
  },
  plugins: [react(), seoDocuments()],
  server: {
    port: 4028,
    host: '0.0.0.0',
    strictPort: true,
  },
});
