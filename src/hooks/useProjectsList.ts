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
        const projectsData: ProjectCard[] = [];
        
        for (const projectId of projectIds) {
          try {
            const projectData = await import(`../data/projects/${projectId}.json`);
            const data: ProjectData = projectData.default;
            
            projectsData.push({
              id: data.id,
              cardTitle: data.cardTitle,
              cardTags: data.cardTags,
              heroImage: data.heroImage
            });
          } catch (err) {
            console.warn(`Could not load project ${projectId}:`, err);
          }
        }
        
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