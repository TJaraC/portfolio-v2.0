import React, { useId, useRef } from 'react';
import { gsap, useGSAP } from '../../utils/gsap';
import '../../styles/ProjectSiteLink.css';

interface ProjectSiteLinkProps {
  href: string;
  projectName: string;
  variant: 'orbit' | 'icon';
  className?: string;
}

const ProjectSiteLink: React.FC<ProjectSiteLinkProps> = ({
  href,
  projectName,
  variant,
  className = '',
}) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const orbitRef = useRef<SVGGElement>(null);
  const rotationTween = useRef<gsap.core.Tween | null>(null);
  const orbitPathId = `site-link-${useId().replace(/:/g, '')}`;

  useGSAP(
    () => {
      if (variant !== 'orbit' || !orbitRef.current) return;

      const motionPreference = gsap.matchMedia();

      motionPreference.add('(prefers-reduced-motion: no-preference)', () => {
        rotationTween.current = gsap.to(orbitRef.current, {
          rotation: '+=360',
          duration: 6,
          ease: 'none',
          repeat: -1,
          paused: true,
          transformOrigin: '50% 50%',
        });

        return () => {
          rotationTween.current = null;
        };
      });

      return () => {
        rotationTween.current = null;
        motionPreference.revert();
      };
    },
    { scope: linkRef, dependencies: [variant], revertOnUpdate: true }
  );

  const startRotation = () => rotationTween.current?.play();
  const pauseRotationWhenInactive = () => {
    const link = linkRef.current;
    if (link && !link.matches(':hover') && document.activeElement !== link) {
      rotationTween.current?.pause();
    }
  };

  const classes = ['project-site-link', `project-site-link--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <a
      ref={linkRef}
      className={classes}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${projectName} live site (opens in a new tab)`}
      data-site-link={variant}
      onClick={(event) => event.stopPropagation()}
      onMouseEnter={startRotation}
      onMouseLeave={pauseRotationWhenInactive}
      onFocus={startRotation}
      onBlur={pauseRotationWhenInactive}
    >
      {variant === 'orbit' ? (
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <g ref={orbitRef} className="project-site-link-orbit-text">
            <defs>
              <path id={orbitPathId} d="M 60,60 m -43,0 a 43,43 0 1,1 86,0 a 43,43 0 1,1 -86,0" />
            </defs>
            <text textLength="270" lengthAdjust="spacing">
              <textPath href={`#${orbitPathId}`} startOffset="0%">
                VISIT LIVE SITE • VISIT LIVE SITE •
              </textPath>
            </text>
          </g>
          <path className="project-site-link-arrow" d="M38 60h42M68 48l12 12-12 12" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14 5h5v5M19 5l-9 9M11 7H6a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-5" />
        </svg>
      )}
    </a>
  );
};

export default ProjectSiteLink;
