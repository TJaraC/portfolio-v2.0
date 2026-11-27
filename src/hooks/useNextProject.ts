import { useProjectsList } from './useProjectsList';

// Solo se usa dentro de ProjectCase, que ya recibe los datos del proyecto actual
// cargados: basta con la lista de proyectos para calcular el siguiente.
export const useNextProject = (currentProjectId: string) => {
  const { projects, loading } = useProjectsList();

  if (loading || !projects.length) {
    return { nextProject: null, loading: true };
  }

  // Encontrar el índice del proyecto actual
  const currentIndex = projects.findIndex((project) => project.id === currentProjectId);

  // Siguiente proyecto (circular). Si el proyecto no está en el grid principal
  // (p. ej. plantillas en desarrollo), enlazar al primero para no dejar el CTA muerto.
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % projects.length;
  const nextProject = projects[nextIndex];

  return { nextProject, loading: false };
};
