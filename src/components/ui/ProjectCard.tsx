import React from 'react';
import { useTransition } from '../../context/TransitionContext';
import { ProjectCard as ProjectType } from '../../hooks/useProjectsList';
import ImageWithCurtain from './ImageWithCurtain';
import ProjectSiteLink from './ProjectSiteLink';

interface ProjectCardProps {
  project: ProjectType;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { transitionTo } = useTransition();

  const handleClick = () => {
    transitionTo(`/projects/${project.id}`);
  };

  return (
    <article
      className={`portfolio-card${project.featured ? ' is-featured' : ''}`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
      data-project-number={project.cardNumber}
    >
      <div className="portfolio-card-number">{project.cardNumber}</div>
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
        <div className="portfolio-card-title-group">
          <h3 className="portfolio-card-title">{project.cardTitle}</h3>
          {project.siteUrl ? (
            <ProjectSiteLink
              href={project.siteUrl}
              projectName={project.cardTitle}
              variant="icon"
            />
          ) : null}
        </div>
        <div className="portfolio-card-tags">
          {project.cardTags.map((tag) => (
            <span key={tag} className="portfolio-card-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
