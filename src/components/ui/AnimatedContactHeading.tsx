import React, { useRef, useEffect } from 'react';
import { gsap } from '../../utils/gsap';

interface AnimatedContactHeadingProps {
  className?: string;
}

const AnimatedContactHeading: React.FC<AnimatedContactHeadingProps> = ({
  className = ''
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const touchLettersRef = useRef<HTMLSpanElement[]>([]);
  const hoverTl = useRef<gsap.core.Timeline>();

  useEffect(() => {
    if (!headingRef.current) return;

    // Encontrar el span de TOUCH y dividirlo en letras
    const touchSpan = headingRef.current.querySelector('.contact-heading-geist');
    if (!touchSpan) return;

    const touchText = 'TOUCH';
    const letters = touchText.split('').map((letter, index) => {
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

    // Event listeners para hover en todo el heading
    const handleMouseEnter = () => {
      // Crear timeline para el efecto slot machine
      hoverTl.current = gsap.timeline();
      
      letters.forEach((letterObj, index) => {
        hoverTl.current?.to(letterObj.original, {
          y: '150%', // Mover más abajo para que no se vea
          duration: 0.2, // Más rápido
          ease: 'power2.in'
        }, index * 0.05) // Stagger más rápido
        .to(letterObj.orange, {
          y: '0%',
          duration: 0.2, // Más rápido
          ease: 'power2.out'
        }, index * 0.05); // Stagger más rápido
      });
    };

    const handleMouseLeave = () => {
      // Crear timeline para volver al estado original
      hoverTl.current = gsap.timeline();
      
      letters.forEach((letterObj, index) => {
        hoverTl.current?.to(letterObj.orange, {
          y: '-150%', // Mover más arriba para que no se vea
          duration: 0.2, // Más rápido
          ease: 'power2.in'
        }, index * 0.05) // Stagger más rápido
        .to(letterObj.original, {
          y: '0%',
          duration: 0.2, // Más rápido
          ease: 'power2.out'
        }, index * 0.05); // Stagger más rápido
      });
    };

    const handleClick = () => {
      window.location.href = 'mailto:triciojarac@gmail.com';
    };

    headingRef.current.addEventListener('mouseenter', handleMouseEnter);
    headingRef.current.addEventListener('mouseleave', handleMouseLeave);
    headingRef.current.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      if (headingRef.current) {
        headingRef.current.removeEventListener('mouseenter', handleMouseEnter);
        headingRef.current.removeEventListener('mouseleave', handleMouseLeave);
        headingRef.current.removeEventListener('click', handleClick);
      }
      hoverTl.current?.kill();
    };
  }, []);

  return (
    <h2 ref={headingRef} className={className} style={{ cursor: 'pointer' }}>
      <span className="contact-heading-gilda">GET IN</span>
      <span className="contact-heading-geist">TOUCH</span>
    </h2>
  );
};

export default AnimatedContactHeading;