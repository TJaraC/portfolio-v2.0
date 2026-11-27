import publishedProjectIds from './published-projects.json';

/**
 * Single source of truth for the published case studies, in grid / "next project" order.
 *
 * Publishing a case study = adding its id here (the JSON lives in `src/data/projects/<id>.json`).
 * Everything else derives from this list: the home grid, the next-project sequence, the
 * per-route static HTML and metadata, the sitemap, the prerendered content and the e2e checks.
 * Vercel routes `/projects/:id` to the generated `projects/<id>/index.html`, so unknown ids
 * fall through to the real 404.
 */
export const PUBLISHED_PROJECT_IDS: readonly string[] = publishedProjectIds;

export const isPublishedProject = (projectId: string): boolean =>
  PUBLISHED_PROJECT_IDS.includes(projectId);
