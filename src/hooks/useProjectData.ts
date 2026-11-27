import { useState, useEffect } from 'react';
import { PUBLISHED_PROJECT_IDS } from '../data/publishedProjects';

interface ProjectFont {
  name: string;
  description?: string;
  sample?: string;
}

interface ProjectMetaItem {
  label: string;
  value: string;
}

interface ProjectPriority {
  title: string;
  description: string;
}

interface ProjectBenchmarkRow {
  name: string;
  values: string[];
  featured?: boolean;
}

interface ProjectPersona {
  name: string;
  archetype: string;
  context: string;
  quote: string;
  goals: string[];
  frustrations: string[];
}

interface ProjectInsight {
  label: string;
  title: string;
  description: string;
}

interface ProjectFlowStep {
  title: string;
  description: string;
}

interface ProjectDecision {
  label: string;
  title: string;
  description: string;
}

interface ProjectDesignApplication {
  component: string;
  objective: string;
  solution: string;
  outcome: string;
}

interface ProjectTestFinding {
  task: string;
  observation: string;
  decision: string;
}

interface ProjectHighlight {
  title: string;
  description: string;
}

interface ProjectMetric {
  value: string;
  unit: string;
  label: string;
  description: string;
}

interface ProjectLearning {
  title: string;
  description: string;
}

interface ProjectCaseStudy {
  meta: ProjectMetaItem[];
  challenge: {
    description: string;
    question: string;
    priorities: ProjectPriority[];
  };
  research: {
    description: string;
    benchmark: {
      criteria: string[];
      rows: ProjectBenchmarkRow[];
      note: string;
    };
    persona?: ProjectPersona;
    personas?: ProjectPersona[];
    insights: ProjectInsight[];
  };
  ideation: {
    description: string;
    flow: ProjectFlowStep[];
    decisions: ProjectDecision[];
  };
  design: {
    description: string;
    decisions: ProjectDecision[];
    applications: ProjectDesignApplication[];
  };
  delivery?: {
    title: string;
    description: string;
    workflow: ProjectFlowStep[];
    stack: ProjectDecision[];
  };
  testing: {
    description: string;
    method: string;
    findings: ProjectTestFinding[];
  };
  finalDesign: {
    description: string;
    highlights: ProjectHighlight[];
  };
  impact: {
    description: string;
    metrics: ProjectMetric[];
  };
  learnings: {
    description: string;
    items: ProjectLearning[];
  };
}

interface ProjectData {
  id: string;
  project: string;
  name: string;
  date: string;
  cardNumber: string;
  featured?: boolean;
  siteUrl?: string;
  cardTitle: string;
  cardTags: string[];
  heroDescription: string;
  heroImage: string;
  heroInsetImage?: string;
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
  caseStudy?: ProjectCaseStudy;
  designProcess?: {
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

type ProjectModule = { default: ProjectData };

const projectPath = (projectId: string) => `../data/projects/${projectId}.json`;

// Solo los casos registrados en `published-projects.json` se pueden cargar en producción.
// La plantilla y el ejemplo legacy son fixtures de desarrollo: solo se incluyen en
// `pnpm start` (y en los tests e2e), nunca en el build de producción.
const allProjectLoaders = import.meta.glob<ProjectModule>([
  '../data/projects/*.json',
  '!../data/projects/project-template.json',
  '!../data/projects/ejemplo-proyecto.json',
]);

const projectLoaders: Record<string, () => Promise<ProjectModule>> = {
  ...Object.fromEntries(
    PUBLISHED_PROJECT_IDS.map((projectId) => [
      projectPath(projectId),
      allProjectLoaders[projectPath(projectId)],
    ])
  ),
  ...(import.meta.env.DEV
    ? import.meta.glob<ProjectModule>([
        '../data/projects/project-template.json',
        '../data/projects/ejemplo-proyecto.json',
      ])
    : {}),
};

/** Carga el JSON de un proyecto por su id. Rechaza si el id no existe. */
export const loadProjectData = async (projectId: string): Promise<ProjectData> => {
  const loader = projectLoaders[projectPath(projectId)];
  if (!loader) {
    throw new Error(`Unknown project "${projectId}"`);
  }
  return (await loader()).default;
};

export const useProjectData = (
  projectId: string
): { data: ProjectData | null; loading: boolean; error: string | null } => {
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    // Evita que una respuesta lenta de un proyecto anterior sobrescriba la actual
    let cancelled = false;

    setLoading(true);
    setError(null);

    loadProjectData(projectId)
      .then((projectData) => {
        if (!cancelled) setData(projectData);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(`Error loading project data for ${projectId}:`, err);
        setError(`Could not load project data for ${projectId}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return { data, loading, error };
};

export type {
  ProjectData,
  ProjectFont,
  ProjectCaseStudy,
  ProjectDecision,
  ProjectHighlight,
  ProjectInsight,
  ProjectLearning,
  ProjectMetric,
  ProjectPersona,
  ProjectTestFinding,
};
