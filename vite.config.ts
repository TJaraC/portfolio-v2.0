import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { createServer, defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import {
  HOME_PAGE_METADATA,
  NOT_FOUND_PAGE_METADATA,
  createProjectMetadata,
  renderMetadataDocument,
  renderSitemap,
} from './src/utils/pageMetadata';
import type { ProjectData } from './src/hooks/useProjectData';

const ROOT_ELEMENT = '<div id="root"></div>';

/** Published case studies, in grid order, read from the single project registry. */
const loadPublishedProjects = async (root: string): Promise<ProjectData[]> => {
  const projectIds: string[] = JSON.parse(
    await readFile(join(root, 'src', 'data', 'published-projects.json'), 'utf8')
  );
  return Promise.all(
    projectIds.map(async (projectId) => {
      const project: ProjectData = JSON.parse(
        await readFile(join(root, 'src', 'data', 'projects', `${projectId}.json`), 'utf8')
      );
      if (project.id !== projectId) {
        throw new Error(`src/data/projects/${projectId}.json declares id "${project.id}".`);
      }
      return project;
    })
  );
};

type RenderRoute = (
  url: string,
  input: { projects: ProjectData[]; project?: ProjectData }
) => string;

/**
 * Renders the real page components in Node (see src/prerender/entry.tsx). React warns that
 * useLayoutEffect does nothing on the server; that is expected here (the markup is never
 * hydrated), so those warnings are silenced.
 */
const withPrerenderer = async <T,>(
  root: string,
  task: (renderRoute: RenderRoute) => Promise<T>
): Promise<T> => {
  const server = await createServer({
    root,
    configFile: false,
    logLevel: 'error',
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, ws: false },
  });
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('useLayoutEffect does nothing on the server')) {
      return;
    }
    originalConsoleError(...args);
  };

  try {
    const { renderRoute } = (await server.ssrLoadModule('/src/prerender/entry.tsx')) as {
      renderRoute: RenderRoute;
    };
    return await task(renderRoute);
  } finally {
    console.error = originalConsoleError;
    await server.close();
  }
};

/**
 * Preload for the case-study hero (LCP candidate). Mirrors the <img srcset> that
 * ImageWithCurtain renders, so the browser fetches the same candidate only once.
 */
const createHeroPreload = async (root: string, heroPath: string) => {
  const manifest: Record<string, { width: number; widths: number[] }> = JSON.parse(
    await readFile(join(root, 'src', 'data', 'responsive-images.json'), 'utf8')
  );
  const entry = manifest[heroPath];
  if (!entry) {
    return `<link rel="preload" as="image" href="${heroPath}" fetchpriority="high" />`;
  }
  const srcset = [
    ...entry.widths.map((width) => `${heroPath.replace(/\.webp$/, `-${width}w.webp`)} ${width}w`),
    `${heroPath} ${entry.width}w`,
  ].join(', ');
  return `<link rel="preload" as="image" href="${heroPath}" imagesrcset="${srcset}" imagesizes="100vw" fetchpriority="high" />`;
};

const injectPrerenderedContent = (documentHtml: string, markup: string) => {
  if (!documentHtml.includes(ROOT_ELEMENT)) {
    throw new Error(`Could not find ${ROOT_ELEMENT} in index.html.`);
  }
  return documentHtml.replace(
    ROOT_ELEMENT,
    `<div id="root"><div class="prerendered">${markup}</div></div>`
  );
};

/**
 * Crawler-facing HTML: every indexable route gets its own static document with the
 * right title, description, canonical, social tags, JSON-LD and prerendered content,
 * plus a sitemap and a noindex 404 shell that Vercel serves with a real 404 status.
 */
const seoDocuments = (): Plugin => {
  let outputDirectory = '';
  let projectRoot = '';
  let isBuild = false;

  return {
    name: 'seo-documents',
    configResolved(config) {
      projectRoot = config.root;
      outputDirectory = resolve(config.root, config.build.outDir);
      isBuild = config.command === 'build';
    },
    transformIndexHtml(html) {
      return renderMetadataDocument(html, HOME_PAGE_METADATA);
    },
    async closeBundle() {
      // Vite also calls closeBundle when the dev server shuts down.
      if (!isBuild) return;

      const shellDocument = await readFile(join(outputDirectory, 'index.html'), 'utf8');
      const projects = await loadPublishedProjects(projectRoot);
      const projectPages = projects.map(createProjectMetadata);

      await withPrerenderer(projectRoot, async (renderRoute) => {
        await writeFile(
          join(outputDirectory, 'index.html'),
          injectPrerenderedContent(shellDocument, renderRoute('/', { projects })),
          'utf8'
        );

        await Promise.all(
          projects.map(async (project, index) => {
            const metadata = projectPages[index];
            const destination = join(outputDirectory, 'projects', project.id, 'index.html');
            await mkdir(dirname(destination), { recursive: true });
            // Preload the hero so it starts downloading while the JS bundle loads,
            // instead of after the route + JSON chunks.
            const heroPreload = await createHeroPreload(projectRoot, metadata.heroImagePath);
            const html = injectPrerenderedContent(
              renderMetadataDocument(shellDocument, metadata),
              renderRoute(`/projects/${project.id}`, { projects, project })
            ).replace('</head>', `  ${heroPreload}\n  </head>`);
            await writeFile(destination, html, 'utf8');
          })
        );
      });

      await Promise.all([
        writeFile(
          join(outputDirectory, '404.html'),
          renderMetadataDocument(shellDocument, NOT_FOUND_PAGE_METADATA),
          'utf8'
        ),
        writeFile(join(outputDirectory, 'sitemap.xml'), renderSitemap(projectPages), 'utf8'),
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
