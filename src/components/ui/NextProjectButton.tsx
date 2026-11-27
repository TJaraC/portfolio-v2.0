import React, { useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from '../../utils/gsap';
import { useNextProject } from '../../hooks/useNextProject';
import { useTransition } from '../../context/TransitionContext';

interface NextProjectButtonProps {
  currentProjectId: string;
  className?: string;
}

const NextProjectButton: React.FC<NextProjectButtonProps> = ({
  currentProjectId,
  className = '',
}) => {
  const location = useLocation();
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const buttonRef = useRef<HTMLHeadingElement>(null);
  const hoverTl = useRef<gsap.core.Timeline>();
  const isNavigating = useRef(false);
  const { transitionTo } = useTransition();

  const { nextProject, loading } = useNextProject(currentProjectId);

  // Reset navigation flag cuando cambie la ruta
  useEffect(() => {
    isNavigating.current = false;
  }, [location.pathname]);

  const navigateToNext = useCallback(() => {
    if (nextProject && !loading && !isNavigating.current) {
      isNavigating.current = true;
      hoverTl.current?.kill();
      transitionTo(`/projects/${nextProject.id}`);

      window.setTimeout(() => {
        isNavigating.current = false;
      }, 1500);
    }
  }, [nextProject, loading, transitionTo]);

  useEffect(() => {
    const headingEl = buttonRef.current;
    const triggerEl = triggerRef.current;
    if (!headingEl || !triggerEl || loading || !nextProject) return;

    const nextText = 'NEXT';
    const projectText = 'PROJECT';
    const arrowText = '→';

    const createLetterElements = (text: string, letterClassName: string) => {
      return text.split('').map((letter) => {
        const letterContainer = document.createElement('span');
        letterContainer.style.display = 'inline-block';
        letterContainer.style.overflow = 'hidden';
        letterContainer.style.position = 'relative';
        letterContainer.style.height = '1em';
        letterContainer.style.verticalAlign = 'middle';
        letterContainer.className = letterClassName;

        const originalLetter = document.createElement('span');
        originalLetter.textContent = letter === ' ' ? '\u00A0' : letter;
        originalLetter.style.display = 'block';
        originalLetter.style.color = 'inherit';
        originalLetter.style.transform = 'translateY(0%)';
        originalLetter.style.textAlign = 'center';
        originalLetter.style.width = '100%';

        const orangeLetter = document.createElement('span');
        orangeLetter.textContent = letter === ' ' ? '\u00A0' : letter;
        orangeLetter.style.display = 'block';
        orangeLetter.style.color = 'var(--global-text-3)';
        orangeLetter.style.position = 'absolute';
        orangeLetter.style.top = '0';
        orangeLetter.style.left = '0';
        orangeLetter.style.right = '0';
        orangeLetter.style.transform = 'translateY(-100%)';
        orangeLetter.style.textAlign = 'center';
        orangeLetter.style.width = '100%';

        letterContainer.appendChild(originalLetter);
        letterContainer.appendChild(orangeLetter);

        return { container: letterContainer, original: originalLetter, orange: orangeLetter };
      });
    };

    const nextLetters = createLetterElements(nextText, 'next-project-heading-gilda');
    const projectLetters = createLetterElements(projectText, 'next-project-heading-geist');
    const arrowLetters = createLetterElements(arrowText, '');

    headingEl.innerHTML = '';

    const nextSpan = document.createElement('span');
    nextSpan.className = 'next-project-heading-gilda';
    nextLetters.forEach((letterObj) => nextSpan.appendChild(letterObj.container));

    const projectSpan = document.createElement('span');
    projectSpan.className = 'next-project-heading-geist';
    projectLetters.forEach((letterObj) => projectSpan.appendChild(letterObj.container));

    const arrowSpan = document.createElement('span');
    arrowSpan.className = 'next-project-arrow';
    arrowLetters.forEach((letterObj) => arrowSpan.appendChild(letterObj.container));

    headingEl.appendChild(nextSpan);
    headingEl.appendChild(projectSpan);
    headingEl.appendChild(arrowSpan);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleMouseEnter = () => {
      if (prefersReducedMotion) return;
      hoverTl.current?.kill();
      hoverTl.current = gsap.timeline();

      const projectAndArrowLetters = [...projectLetters, ...arrowLetters];

      projectAndArrowLetters.forEach((letterObj, index) => {
        hoverTl.current
          ?.to(
            letterObj.original,
            {
              y: '150%',
              duration: 0.2,
              ease: 'power2.in',
            },
            index * 0.03
          )
          .to(
            letterObj.orange,
            {
              y: '0%',
              duration: 0.2,
              ease: 'power2.out',
            },
            index * 0.03
          );
      });
    };

    const handleMouseLeave = () => {
      if (prefersReducedMotion) return;
      hoverTl.current?.kill();
      hoverTl.current = gsap.timeline();

      const projectAndArrowLetters = [...projectLetters, ...arrowLetters];

      projectAndArrowLetters.forEach((letterObj, index) => {
        hoverTl.current
          ?.to(
            letterObj.orange,
            {
              y: '-150%',
              duration: 0.2,
              ease: 'power2.in',
            },
            index * 0.03
          )
          .to(
            letterObj.original,
            {
              y: '0%',
              duration: 0.2,
              ease: 'power2.out',
            },
            index * 0.03
          );
      });
    };

    // Usuarios de teclado ven el mismo efecto que con el ratón
    const handleFocus = () => {
      if (triggerEl.matches(':focus-visible')) handleMouseEnter();
    };

    triggerEl.addEventListener('mouseenter', handleMouseEnter);
    triggerEl.addEventListener('mouseleave', handleMouseLeave);
    triggerEl.addEventListener('focus', handleFocus);
    triggerEl.addEventListener('blur', handleMouseLeave);

    return () => {
      triggerEl.removeEventListener('mouseenter', handleMouseEnter);
      triggerEl.removeEventListener('mouseleave', handleMouseLeave);
      triggerEl.removeEventListener('focus', handleFocus);
      triggerEl.removeEventListener('blur', handleMouseLeave);
      hoverTl.current?.kill();
    };
  }, [nextProject, loading]);

  if (loading || !nextProject) {
    return (
      <section className="next-project-section">
        <div className="next-project-inner">
          <h2 className={`next-project-button ${className}`}>
            <span className="next-project-heading-gilda">NEXT</span>
            <span className="next-project-heading-geist">PROJECT</span>
            <span className="next-project-arrow">→</span>
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section className="next-project-section">
      <div className="next-project-inner">
        {/* Enlace real: alcanzable con teclado, Enter navega y funciona "abrir en pestaña".
            aria-label evita que se lean las letras duplicadas del efecto slot machine. */}
        <a
          ref={triggerRef}
          className="next-project-trigger"
          href={`/projects/${nextProject.id}`}
          aria-label={`Next project: ${nextProject.cardTitle}`}
          onClick={(event) => {
            // Ctrl/Cmd/Shift/clic central: dejar que el navegador abra el enlace normalmente
            if (
              event.button !== 0 ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            ) {
              return;
            }
            event.preventDefault();
            navigateToNext();
          }}
        >
          <span className="next-project-meta" aria-hidden="true">
            <span className="next-project-meta-kicker">Up next · {nextProject.cardNumber}</span>
            <span className="next-project-meta-title">{nextProject.cardTitle}</span>
            {nextProject.cardTags?.length ? (
              <span className="next-project-meta-tags">{nextProject.cardTags.join(' · ')}</span>
            ) : null}
          </span>
          <h2 ref={buttonRef} className={`next-project-button ${className}`} aria-hidden="true">
            <span className="next-project-heading-gilda">NEXT</span>
            <span className="next-project-heading-geist">PROJECT</span>
            <span className="next-project-arrow">→</span>
          </h2>
        </a>
      </div>
    </section>
  );
};

export default NextProjectButton;
