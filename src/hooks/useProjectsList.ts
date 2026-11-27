import { createContext, useContext, useEffect, useState } from 'react';
import { loadProjectData, type ProjectData } from './useProjectData';
import { PUBLISHED_PROJECT_IDS } from '../data/publishedProjects';

interface ProjectCard {
  id: string;
  cardNumber: string;
  featured: boolean;
  siteUrl?: string;
  cardTitle: string;
  cardTags: string[];
  heroImage: string;
  heroDescription: string;
}

export const toProjectCard = (data: ProjectData): ProjectCard => ({
  id: data.id,
  cardNumber: data.cardNumber,
  featured: Boolean(data.featured),
  siteUrl: data.siteUrl,
  cardTitle: data.cardTitle,
  cardTags: data.cardTags,
  heroImage: data.heroImage,
  heroDescription: data.heroDescription,
});

/**
 * Cards already known up front (the build-time prerender passes them in). In the browser
 * it stays null and the list is loaded on mount.
 */
export const PreloadedProjectsContext = createContext<ProjectCard[] | null>(null);

export const useProjectsList = (): {
  projects: ProjectCard[];
  loading: boolean;
  error: string | null;
} => {
  const preloaded = useContext(PreloadedProjectsContext);
  const [projects, setProjects] = useState<ProjectCard[]>(preloaded ?? []);
  const [loading, setLoading] = useState(!preloaded);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preloaded) return;
    let cancelled = false;

    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const results = await Promise.allSettled(PUBLISHED_PROJECT_IDS.map(loadProjectData));

        const projectsData = results
          .map((result, index): ProjectCard | null => {
            if (result.status === 'rejected') {
              console.warn(`Could not load project ${PUBLISHED_PROJECT_IDS[index]}:`, result.reason);
              return null;
            }
            return toProjectCard(result.value);
          })
          .filter((p): p is ProjectCard => p !== null);

        if (!cancelled) setProjects(projectsData);
      } catch (err) {
        console.error('Error loading projects list:', err);
        if (!cancelled) setError('Could not load projects list');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProjects();
    return () => {
      cancelled = true;
    };
  }, [preloaded]);

  return { projects, loading, error };
};

export type { ProjectCard };
