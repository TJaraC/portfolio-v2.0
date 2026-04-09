import { useState, useEffect } from 'react';
import { ProjectData } from './useProjectData';

interface ProjectCard {
  id: string;
  cardTitle: string;
  cardTags: string[];
  heroImage: string;
}

export const useProjectsList = (): { projects: ProjectCard[]; loading: boolean; error: string | null } => {
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Lista de proyectos disponibles (se puede expandir dinámicamente)
        const projectIds = ['ultracamp', 'festgo-app', 'portfolio-25', 'howell-gallery'];

        const results = await Promise.allSettled(
          projectIds.map(projectId => import(`../data/projects/${projectId}.json`))
        );

        const projectsData: ProjectCard[] = results
          .map((result, index) => {
            if (result.status === 'rejected') {
              console.warn(`Could not load project ${projectIds[index]}:`, result.reason);
              return null;
            }
            const data: ProjectData = result.value.default;
            return {
              id: data.id,
              cardTitle: data.cardTitle,
              cardTags: data.cardTags,
              heroImage: data.heroImage,
            };
          })
          .filter((p): p is ProjectCard => p !== null);

        setProjects(projectsData);
      } catch (err) {
        console.error('Error loading projects list:', err);
        setError('Could not load projects list');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  return { projects, loading, error };
};

export type { ProjectCard };