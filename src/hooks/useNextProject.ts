import { useProjectsList } from './useProjectsList';
import { useProjectData } from './useProjectData';

export const useNextProject = (currentProjectId: string) => {
  const { projects, loading: projectsLoading } = useProjectsList();
  const { data: currentProject, loading: currentProjectLoading } = useProjectData(currentProjectId);

  if (projectsLoading || currentProjectLoading || !currentProject || !projects.length) {
    return { nextProject: null, loading: true };
  }

  // Encontrar el índice del proyecto actual
  const currentIndex = projects.findIndex((project) => project.id === currentProjectId);

  // Si el proyecto no está en el grid principal (p. ej. Howell Gallery o plantillas),
  // enlazar al primer proyecto publicado para mantener la navegación continua
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % projects.length;
  const nextProject = projects[nextIndex];

  return { nextProject, loading: false };
};
