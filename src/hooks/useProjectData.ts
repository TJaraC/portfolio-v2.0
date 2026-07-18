import { useState, useEffect } from 'react';

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

interface ProjectIteration {
  component: string;
  before: string;
  after: string;
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
    persona: ProjectPersona;
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
    iterations: ProjectIteration[];
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

export const useProjectData = (
  projectId: string
): { data: ProjectData | null; loading: boolean; error: string | null } => {
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

export type {
  ProjectData,
  ProjectFont,
  ProjectCaseStudy,
  ProjectDecision,
  ProjectHighlight,
  ProjectInsight,
  ProjectLearning,
  ProjectMetric,
  ProjectTestFinding,
};
