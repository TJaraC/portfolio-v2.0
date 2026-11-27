import React, { useRef, useEffect } from 'react';
import { gsap } from '../../utils/gsap';

export const CONTACT_EMAIL = 'triciojarac@gmail.com';

interface AnimatedContactHeadingProps {
  className?: string;
}

const AnimatedContactHeading: React.FC<AnimatedContactHeadingProps> = ({ className = '' }) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const touchLettersRef = useRef<HTMLSpanElement[]>([]);
  const hoverTl = useRef<gsap.core.Timeline>();

  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;

    // Encontrar el span de TOUCH y dividirlo en letras
    const touchSpan = heading.querySelector('.contact-heading-geist');
    if (!touchSpan) return;

    const touchText = 'TOUCH';
    const letters = touchText.split('').map((letter) => {
      const letterContainer = document.createElement('span');
      letterContainer.style.display = 'inline-block';
      letterContainer.style.overflow = 'hidden';
      letterContainer.style.position = 'relative';
      letterContainer.style.height = '1em';
      letterContainer.style.verticalAlign = 'top';
      letterContainer.style.lineHeight = '1em';

      // Letra original (blanca)
      const originalLetter = document.createElement('span');
      originalLetter.textContent = letter;
      originalLetter.style.display = 'block';
      originalLetter.style.color = 'var(--global-text-2)';
      originalLetter.style.transform = 'translateY(0%)';
      originalLetter.style.textAlign = 'center';
      originalLetter.style.width = '100%';

      // Letra naranja (inicialmente oculta arriba)
      const orangeLetter = document.createElement('span');
      orangeLetter.textContent = letter;
      orangeLetter.style.display = 'block';
      orangeLetter.style.color = 'var(--global-bg-5)';
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

    // Reemplazar el contenido de TOUCH con las letras individuales
    touchSpan.innerHTML = '';
    letters.forEach((letterObj, index) => {
      touchSpan.appendChild(letterObj.container);
      touchLettersRef.current[index] = letterObj.container;
    });

    const handleEnter = () => {
      hoverTl.current?.kill();
      hoverTl.current = gsap.timeline();

      letters.forEach((letterObj, index) => {
        hoverTl.current
          ?.to(letterObj.original, { y: '150%', duration: 0.2, ease: 'power2.in' }, index * 0.05)
          .to(letterObj.orange, { y: '0%', duration: 0.2, ease: 'power2.out' }, index * 0.05);
      });
    };

    const handleLeave = () => {
      hoverTl.current?.kill();
      hoverTl.current = gsap.timeline();

      letters.forEach((letterObj, index) => {
        hoverTl.current
          ?.to(letterObj.orange, { y: '-150%', duration: 0.2, ease: 'power2.in' }, index * 0.05)
          .to(letterObj.original, { y: '0%', duration: 0.2, ease: 'power2.out' }, index * 0.05);
      });
    };

    // Same highlight for keyboard focus as for mouse hover
    const handleFocusIn = (event: FocusEvent) => {
      if ((event.target as Element).matches?.(':focus-visible')) handleEnter();
    };

    heading.addEventListener('mouseenter', handleEnter);
    heading.addEventListener('mouseleave', handleLeave);
    heading.addEventListener('focusin', handleFocusIn);
    heading.addEventListener('focusout', handleLeave);

    return () => {
      heading.removeEventListener('mouseenter', handleEnter);
      heading.removeEventListener('mouseleave', handleLeave);
      heading.removeEventListener('focusin', handleFocusIn);
      heading.removeEventListener('focusout', handleLeave);
      hoverTl.current?.kill();
    };
  }, []);

  return (
    <h2 ref={headingRef} className={className}>
      {/* Real mailto link: keyboard-operable and announced once (visual letters are aria-hidden) */}
      <a className="contact-heading-link" href={`mailto:${CONTACT_EMAIL}`}>
        <span className="sr-only">Get in touch (send an email)</span>
        <span className="contact-heading-gilda" aria-hidden="true">
          GET IN
        </span>
        <span className="contact-heading-geist" aria-hidden="true">
          TOUCH
        </span>
      </a>
    </h2>
  );
};

export default AnimatedContactHeading;
