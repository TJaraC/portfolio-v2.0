import { useProjectsList } from './useProjectsList';
import { useProjectData } from './useProjectData';

export const useNextProject = (currentProjectId: string) => {
  const { projects, loading: projectsLoading } = useProjectsList();
  const { data: currentProject, loading: currentProjectLoading } = useProjectData(currentProjectId);
  
  if (projectsLoading || currentProjectLoading || !currentProject || !projects.length) {
    return { nextProject: null, loading: true };
  }
  
  // Encontrar el índice del proyecto actual
  const currentIndex = projects.findIndex(project => project.id === currentProjectId);
  
  if (currentIndex === -1) {
    return { nextProject: null, loading: false };
  }
  
  // Obtener el siguiente proyecto (circular: si es el último, volver al primero)
  const nextIndex = (currentIndex + 1) % projects.length;
  const nextProject = projects[nextIndex];
  
  return { nextProject, loading: false };
};