import React, { useRef, useEffect } from 'react';
import { gsap } from '../../utils/gsap';

interface AnimatedNavButtonProps {
  children: string;
  onClick?: () => void;
  className?: string;
  role?: string;
}

const AnimatedNavButton: React.FC<AnimatedNavButtonProps> = ({
  children,
  onClick,
  className = '',
  role
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lettersRef = useRef<HTMLSpanElement[]>([]);
  const hoverTl = useRef<gsap.core.Timeline>();

  useEffect(() => {
    if (!buttonRef.current) return;

    // Dividir el texto en letras individuales con efecto slot machine
    const text = children;
    const letters = text.split('').map((letter, index) => {
      const letterContainer = document.createElement('span');
      letterContainer.style.display = 'inline-block';
      letterContainer.style.overflow = 'hidden';
      letterContainer.style.position = 'relative';
      letterContainer.style.height = '1em';
      letterContainer.style.verticalAlign = 'top';
      letterContainer.style.lineHeight = '1em';
      
      // Letra original (color actual)
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

    // Limpiar contenido anterior y agregar las letras
    buttonRef.current.innerHTML = '';
    letters.forEach((letterObj, index) => {
      buttonRef.current?.appendChild(letterObj.container);
      lettersRef.current[index] = letterObj.container;
    });

    // Event listeners para hover
    const handleMouseEnter = () => {
      // Crear timeline para el efecto slot machine
      hoverTl.current = gsap.timeline();
      
      letters.forEach((letterObj, index) => {
        hoverTl.current?.to(letterObj.original, {
          y: '150%', // Mover más abajo para que no se vea
          duration: 0.2,
          ease: 'power2.in'
        }, index * 0.05)
        .to(letterObj.orange, {
          y: '0%',
          duration: 0.2,
          ease: 'power2.out'
        }, index * 0.05);
      });
    };

    const handleMouseLeave = () => {
      // Crear timeline para volver al estado original
      hoverTl.current = gsap.timeline();
      
      letters.forEach((letterObj, index) => {
        hoverTl.current?.to(letterObj.orange, {
          y: '-150%', // Mover más arriba para que no se vea
          duration: 0.2,
          ease: 'power2.in'
        }, index * 0.05)
        .to(letterObj.original, {
          y: '0%',
          duration: 0.2,
          ease: 'power2.out'
        }, index * 0.05);
      });
    };

    buttonRef.current.addEventListener('mouseenter', handleMouseEnter);
    buttonRef.current.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup
    return () => {
      if (buttonRef.current) {
        buttonRef.current.removeEventListener('mouseenter', handleMouseEnter);
        buttonRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
      hoverTl.current?.kill();
    };
  }, [children]);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={className}
      role={role}
    >
      {/* El contenido se genera dinámicamente */}
    </button>
  );
};

export default AnimatedNavButton;