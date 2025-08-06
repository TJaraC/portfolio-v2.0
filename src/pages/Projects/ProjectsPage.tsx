import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Contact from '../../components/common/Contact';
import ProjectCase from '../../components/ui/ProjectCase';
import { useProjectData } from '../../hooks/useProjectData';
import { useLenisScroll } from '../../hooks/useLenisScroll';
import '../../styles/projects.css';

const ProjectsPage: React.FC = () => {
  const { projectId } = useParams();
  const { data: projectData, loading, error } = useProjectData(projectId || 'project-template');
  const lenis = useLenisScroll();

  // Asegurar que Lenis esté activo cuando se carga la página del proyecto
  useEffect(() => {
    // Scroll al top cuando cambie el proyecto
    window.scrollTo(0, 0);
    
    // Reactivar Lenis si existe
    if (lenis) {
      lenis.start();
      // Forzar actualización del scroll
      lenis.resize();
    }
  }, [projectId, lenis]);

  // Detectar navegación de vuelta desde otras páginas y reactivar Lenis
  useEffect(() => {
    const handlePopState = () => {
      // Cuando se usa el botón atrás del navegador, reactivar Lenis
      setTimeout(() => {
        if (lenis) {
          lenis.start();
          // Forzar actualización del scroll
          lenis.resize();
        }
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [lenis]);

  // Asegurar que Lenis esté activo al montar el componente
  useEffect(() => {
    if (lenis) {
      lenis.start();
    }
  }, [lenis]);

  if (loading) {
    return (
      <div className="projects-page">
        <Header />
        <div className="loading-container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh',
          fontSize: '1.2rem',
          color: '#666'
        }}>
          Loading project data...
        </div>
        <Contact />
      </div>
    );
  }

  if (error || !projectData) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="projects-page">
      {/* Header */}
      <Header />
      
      {/* Project Case Study */}
      <ProjectCase data={projectData} />
      
      {/* Footer */}
      <Contact />
    </div>
  );
};

export default ProjectsPage;