import { useState, useEffect } from 'react';

interface ProjectFont {
  name: string;
  description?: string;
  sample?: string;
}

interface ProjectData {
  id: string;
  project: string;
  name: string;
  date: string;
  cardTitle: string;
  cardTags: string[];
  heroDescription: string;
  heroImage: string;
  overview: {
    description: string;
  };
  projectGoal: {
    description: string;
  };
  fontAndColours: {
    description: string;
    colors: string[];
    fonts: ProjectFont[];
  };
  designProcess: {
    description: string;
    roadmap: {
      description: string;
      image: string;
    };
    definition: {
      description: string;
      image: string;
    };
    inspiration: {
      description: string;
      image: string;
    };
    ideation: {
      description: string;
      image: string;
    };
    visualUi: {
      description: string;
      image: string;
    };
    implementation: {
      description: string;
      image: string;
    };
  };
  gallery: {
    description: string;
    images: string[];
  };
}

export const useProjectData = (projectId: string): { data: ProjectData | null; loading: boolean; error: string | null } => {
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Importar el archivo JSON dinámicamente
        const projectData = await import(`../data/projects/${projectId}.json`);
        setData(projectData.default);
      } catch (err) {
        console.error(`Error loading project data for ${projectId}:`, err);
        setError(`Could not load project data for ${projectId}`);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  return { data, loading, error };
};

export type { ProjectData, ProjectFont };