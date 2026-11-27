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
  const projectPath = `/projects/${project.id}`;

  // The card is a real link (keyboard focusable, works with Enter, middle-click and
  // "open in new tab"); only a plain left click is intercepted for the page transition.
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    transitionTo(projectPath);
  };

  return (
    <article
      className={`portfolio-card${project.featured ? ' is-featured' : ''}`}
      data-project-number={project.cardNumber}
    >
      <div className="portfolio-card-number" aria-hidden="true">
        {project.cardNumber}
      </div>
      <div className="portfolio-card-img-wrapper">
        <ImageWithCurtain
          src={project.heroImage}
          alt=""
          className="portfolio-card-img"
          delay={0.2}
          duration={1.0}
          threshold={0.15}
        />
      </div>
      <div className="portfolio-card-info">
        <div className="portfolio-card-title-group">
          <h3 className="portfolio-card-title">
            {/* Stretched link: its ::after covers the whole card (see a11y.css) */}
            <a className="portfolio-card-link" href={projectPath} onClick={handleClick}>
              {project.cardTitle}
            </a>
          </h3>
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
