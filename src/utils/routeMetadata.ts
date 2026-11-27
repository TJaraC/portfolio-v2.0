import { isPublishedProject } from '../data/publishedProjects';
import { loadProjectData } from '../hooks/useProjectData';
import { applyPageMetadata, getPageMetadata, getProjectIdFromPathname } from './pageMetadata';
import type { PageMetadata } from './pageMetadata';

/**
 * Browser-side metadata for a route: loads the case study only when the path points
 * to a published project (its JSON chunk is usually already cached by then).
 */
export const resolvePageMetadata = async (pathname: string): Promise<PageMetadata> => {
  const projectId = getProjectIdFromPathname(pathname);
  if (!projectId || !isPublishedProject(projectId)) return getPageMetadata(pathname);

  try {
    return getPageMetadata(pathname, await loadProjectData(projectId));
  } catch {
    return getPageMetadata(pathname);
  }
};

export { applyPageMetadata };
