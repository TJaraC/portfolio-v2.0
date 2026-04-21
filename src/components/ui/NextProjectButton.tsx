import React, { useRef, useEffect } from 'react';
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
  const buttonRef = useRef<HTMLHeadingElement>(null);
  const hoverTl = useRef<gsap.core.Timeline>();
  const isNavigating = useRef(false);
  const { transitionTo } = useTransition();

  const { nextProject, loading } = useNextProject(currentProjectId);

  // Reset navigation flag cuando cambie la ruta
  useEffect(() => {
    isNavigating.current = false;
  }, [location.pathname]);

  useEffect(() => {
    if (!buttonRef.current || loading || !nextProject) return;

    // Dividir el texto en letras individuales con efecto slot machine
    const nextText = 'NEXT';
    const projectText = 'PROJECT';
    const arrowText = '→';

    const createLetterElements = (text: string, className: string) => {
      return text.split('').map((letter, index) => {
        const letterContainer = document.createElement('span');
        letterContainer.style.display = 'inline-block';
        letterContainer.style.overflow = 'hidden';
        letterContainer.style.position = 'relative';
        letterContainer.style.height = '1em';
        letterContainer.style.verticalAlign = 'middle';
        letterContainer.className = className;

        // Letra original
        const originalLetter = document.createElement('span');
        originalLetter.textContent = letter === ' ' ? '\u00A0' : letter;
        originalLetter.style.display = 'block';
        originalLetter.style.color = 'inherit';
        originalLetter.style.transform = 'translateY(0%)';
        originalLetter.style.textAlign = 'center';
        originalLetter.style.width = '100%';

        // Letra naranja (inicialmente oculta arriba)
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
    const arrowLetters = createLetterElements(arrowText, 'next-project-arrow');

    const allLetters = [...nextLetters, ...projectLetters, ...arrowLetters];

    // Limpiar contenido anterior y agregar las letras
    buttonRef.current.innerHTML = '';

    // Crear contenedores para cada palabra
    const nextSpan = document.createElement('span');
    nextSpan.className = 'next-project-heading-gilda';
    nextLetters.forEach((letterObj) => nextSpan.appendChild(letterObj.container));

    const projectSpan = document.createElement('span');
    projectSpan.className = 'next-project-heading-geist';
    projectLetters.forEach((letterObj) => projectSpan.appendChild(letterObj.container));

    const arrowSpan = document.createElement('span');
    arrowSpan.className = 'next-project-arrow';
    arrowLetters.forEach((letterObj) => arrowSpan.appendChild(letterObj.container));

    buttonRef.current.appendChild(nextSpan);
    buttonRef.current.appendChild(projectSpan);
    buttonRef.current.appendChild(arrowSpan);

    // Event listeners para hover
    const handleMouseEnter = () => {
      hoverTl.current?.kill();
      // Crear timeline para el efecto slot machine solo en PROJECT y flecha
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
      hoverTl.current?.kill();
      // Crear timeline para volver al estado original solo en PROJECT y flecha
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

    const handleClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();

      if (nextProject && !loading && !isNavigating.current) {
        isNavigating.current = true;
        // Detener cualquier animación en curso
        hoverTl.current?.kill();

        // Usar la transición de página global (idéntica a la usada desde la home)
        transitionTo(`/projects/${nextProject.id}`);

        // Reset después de un tiempo (la transición dura ~1s en total)
        setTimeout(() => {
          isNavigating.current = false;
        }, 1500);
      }
    };

    buttonRef.current.addEventListener('mouseenter', handleMouseEnter);
    buttonRef.current.addEventListener('mouseleave', handleMouseLeave);
    buttonRef.current.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      if (buttonRef.current) {
        buttonRef.current.removeEventListener('mouseenter', handleMouseEnter);
        buttonRef.current.removeEventListener('mouseleave', handleMouseLeave);
        buttonRef.current.removeEventListener('click', handleClick);
      }
      hoverTl.current?.kill();
    };
  }, [nextProject, loading, transitionTo]);

  if (loading || !nextProject) {
    return (
      <section className="next-project-section">
        <h2 className={`next-project-button ${className}`}>
          <span className="next-project-heading-gilda">NEXT</span>
          <span className="next-project-heading-geist">PROJECT</span>
          <span className="next-project-arrow">→</span>
        </h2>
      </section>
    );
  }

  return (
    <section className="next-project-section">
      <h2
        ref={buttonRef}
        className={`next-project-button ${className}`}
        style={{
          cursor: 'pointer',
        }}
      >
        {/* El contenido se genera dinámicamente */}
      </h2>
    </section>
  );
};

export default NextProjectButton;
