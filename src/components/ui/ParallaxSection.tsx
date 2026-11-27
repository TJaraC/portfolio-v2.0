import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../utils/gsap';
import { prefersReducedMotion } from '../../utils/motion';

interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down';
  className?: string;
  zIndex?: number;
}

const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  speed = 0.5,
  direction = 'up',
  className = '',
  zIndex = 1,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;
    // Sin parallax ligado al scroll con prefers-reduced-motion
    if (prefersReducedMotion()) return;

    const element = sectionRef.current;
    const multiplier = direction === 'up' ? -1 : 1;
    const yPercent = speed * 40 * multiplier; // Efecto flotante sutil

    // Crear la animación de parallax flotante
    gsap.set(element, { yPercent: 0 });
    
    gsap.to(element, {
      yPercent: yPercent,
      ease: 'none',
      scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true, // Suavizado más natural
          invalidateOnRefresh: true,
        },
    });
  }, [speed, direction]);

  return (
    <div
      ref={sectionRef}
      className={className}
      style={{
        position: 'relative',
        zIndex: zIndex,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
};

export default ParallaxSection;