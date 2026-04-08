import React, { useRef, useEffect } from 'react';
import { gsap } from '../../utils/gsap';
import { useScrollAnimation } from '../../hooks/useLenisScroll';

interface ImageWithCurtainProps {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
}

const ImageWithCurtain: React.FC<ImageWithCurtainProps> = ({
  src,
  alt,
  className = '',
  delay = 0,
  duration = 1.2,
  threshold = 0.1,
  once = true,
}) => {
  const curtainRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const elementRef = useScrollAnimation(
    () => {
      setTimeout(() => {
        if (curtainRef.current) {
          // Animar la cortina desde arriba hacia abajo (saliendo)
          gsap.fromTo(curtainRef.current, 
            {
              y: '0%',
              scaleY: 1
            },
            {
              y: '100%',
              scaleY: 1,
              duration: duration,
              ease: 'power2.inOut',
              transformOrigin: 'top center'
            }
          );
        }
      }, delay * 1000);
    },
    { threshold, once }
  );

  // Precargar la imagen
  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    // Precargar la imagen y mostrarla inmediatamente
    img.onload = () => {
      if (imageRef.current) {
        imageRef.current.src = src;
      }
    };
    
    // En caso de error, mostrar la imagen de todos modos
    img.onerror = () => {
      if (imageRef.current) {
        imageRef.current.src = src;
      }
    };
    
    // Mostrar la imagen inmediatamente mientras se carga
    if (imageRef.current) {
      imageRef.current.src = src;
    }
  }, [src]);

  return (
    <div 
      ref={elementRef}
      className={`image-curtain-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%'
      }}
    >
      {/* Imagen precargada */}
      <img
        ref={imageRef}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: '1'
        }}
      />
      
      {/* Cortina blanca */}
      <div
        ref={curtainRef}
        className="image-curtain"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--global-bg-3, #f5f5f5)',
          zIndex: 1,
          transformOrigin: 'top center'
        }}
      />
    </div>
  );
};

export default ImageWithCurtain;