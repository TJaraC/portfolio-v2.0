import React, { useRef, useEffect } from 'react';
import { gsap } from '../../utils/gsap';

interface AnimatedNavButtonProps {
  children: string;
  /** When provided the control renders as a real link (<a href>), otherwise as a <button>. */
  href?: string;
  /** Opens the link in a new tab and announces it to assistive technology. */
  external?: boolean;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  className?: string;
}

const AnimatedNavButton: React.FC<AnimatedNavButtonProps> = ({
  children,
  href,
  external = false,
  onClick,
  className = '',
}) => {
  const controlRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  // Visual slot-machine letters live in an aria-hidden container: the accessible
  // name comes from the sr-only copy of the text, so it is read once ("WORK"),
  // not letter-by-letter twice ("WWOORRKK").
  const lettersHostRef = useRef<HTMLSpanElement>(null);
  const hoverTl = useRef<gsap.core.Timeline>();

  useEffect(() => {
    const control = controlRef.current;
    const host = lettersHostRef.current;
    if (!control || !host) return;

    // Dividir el texto en letras individuales con efecto slot machine
    const letters = children.split('').map((letter) => {
      const letterContainer = document.createElement('span');
      letterContainer.style.display = 'inline-block';
      letterContainer.style.overflow = 'hidden';
      letterContainer.style.position = 'relative';
      letterContainer.style.height = '1em';
      letterContainer.style.verticalAlign = 'baseline';
      letterContainer.style.lineHeight = '1em';
      letterContainer.style.textAlign = 'center';

      // Letra original (color actual)
      const originalLetter = document.createElement('span');
      originalLetter.textContent = letter === ' ' ? ' ' : letter;
      originalLetter.style.display = 'block';
      originalLetter.style.color = 'inherit';
      originalLetter.style.transform = 'translateY(0%)';
      originalLetter.style.textAlign = 'center';
      originalLetter.style.width = '100%';
      originalLetter.style.lineHeight = '1em';
      originalLetter.style.verticalAlign = 'baseline';

      // Letra naranja (inicialmente oculta arriba)
      const orangeLetter = document.createElement('span');
      orangeLetter.textContent = letter === ' ' ? ' ' : letter;
      orangeLetter.style.display = 'block';
      orangeLetter.style.color = 'var(--global-text-3)';
      orangeLetter.style.position = 'absolute';
      orangeLetter.style.top = '0';
      orangeLetter.style.left = '0';
      orangeLetter.style.right = '0';
      orangeLetter.style.transform = 'translateY(-100%)';
      orangeLetter.style.textAlign = 'center';
      orangeLetter.style.width = '100%';
      orangeLetter.style.lineHeight = '1em';
      orangeLetter.style.verticalAlign = 'baseline';

      letterContainer.appendChild(originalLetter);
      letterContainer.appendChild(orangeLetter);

      return { container: letterContainer, original: originalLetter, orange: orangeLetter };
    });

    // Limpiar contenido anterior y agregar las letras
    host.replaceChildren(...letters.map((letterObj) => letterObj.container));

    const handleEnter = () => {
      // Matar el timeline anterior para que no se pisen en hovers rápidos
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

    // Keyboard users get the same highlight as mouse users
    const handleFocus = () => {
      if (control.matches(':focus-visible')) handleEnter();
    };

    control.addEventListener('mouseenter', handleEnter);
    control.addEventListener('mouseleave', handleLeave);
    control.addEventListener('focus', handleFocus);
    control.addEventListener('blur', handleLeave);

    return () => {
      control.removeEventListener('mouseenter', handleEnter);
      control.removeEventListener('mouseleave', handleLeave);
      control.removeEventListener('focus', handleFocus);
      control.removeEventListener('blur', handleLeave);
      hoverTl.current?.kill();
    };
  }, [children]);

  const content = (
    <>
      <span className="sr-only">
        {children}
        {external ? ' (opens in a new tab)' : ''}
      </span>
      <span ref={lettersHostRef} aria-hidden="true" style={{ display: 'inherit' }} />
    </>
  );

  if (href) {
    return (
      <a
        ref={controlRef}
        href={href}
        className={className}
        onClick={onClick}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <button ref={controlRef} type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
};

export default AnimatedNavButton;
