import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLenisScroll } from '../../hooks/useLenisScroll';
import { ProjectCard as ProjectType } from '../../hooks/useProjectsList';
import ImageWithCurtain from './ImageWithCurtain';

interface ProjectCardProps {
  project: ProjectType;
  number: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, number }) => {
  const navigate = useNavigate();
  const lenis = useLenisScroll();

  const handleClick = () => {
    // Detener Lenis temporalmente para evitar interferencias durante la navegación
    if (lenis) {
      lenis.stop();
    }
    
    // Forzar scroll al top de manera inmediata
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    // Navegar inmediatamente
    navigate(`/projects/${project.id}`);
    
    // Reactivar Lenis después de un pequeño delay
    setTimeout(() => {
      if (lenis) {
        lenis.start();
      }
    }, 100);
  };

  return (
    <article 
      className="portfolio-card" 
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="portfolio-card-number">{number}</div>
      <div className="portfolio-card-img-wrapper">
        <ImageWithCurtain
          src={project.heroImage}
          alt={project.cardTitle}
          className="portfolio-card-img"
          delay={0.2}
          duration={1.0}
          threshold={0.15}
        />
      </div>
      <div className="portfolio-card-info">
        <h3 className="portfolio-card-title">{project.cardTitle}</h3>
        <div className="portfolio-card-tags">
          {project.cardTags.map((tag, index) => (
            <span key={index} className="portfolio-card-tag">{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;