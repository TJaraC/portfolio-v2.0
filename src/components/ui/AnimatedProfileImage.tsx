import React, { useEffect, useRef } from 'react';
import { gsap } from '../../utils/gsap';

interface AnimatedProfileImageProps {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
  rotations?: number;
  duration?: number;
}

const AnimatedProfileImage: React.FC<AnimatedProfileImageProps> = ({
  src,
  alt,
  className = '',
  delay = 0.5,
  rotations = 1.5,
  duration = 2
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<gsap.core.Timeline>();

  useEffect(() => {
    if (!imageRef.current) return;

    // Crear timeline de GSAP
    animationRef.current = gsap.timeline({ delay });

    // Configurar estado inicial
    gsap.set(imageRef.current, {
      rotation: 0,
      scale: 0.8,
      opacity: 0
    });

    // Animaciones simultáneas: rotación y aparición
    animationRef.current
      .to(imageRef.current, {
        rotation: 360 * rotations,
        duration: duration,
        ease: 'power2.out',
        transformOrigin: 'center center'
      }, 0) // Inicia en tiempo 0
      .to(imageRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out'
      }, 0); // También inicia en tiempo 0

    // Cleanup
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [delay, rotations, duration]);

  return (
    <img
      ref={imageRef}
      src={src}
      alt={alt}
      className={className}
    />
  );
};

export default AnimatedProfileImage;