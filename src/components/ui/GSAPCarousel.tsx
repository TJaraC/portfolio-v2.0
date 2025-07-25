import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../utils/gsap';

interface GSAPCarouselProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  baseSpeed?: number;
  className?: string;
}

const GSAPCarousel: React.FC<GSAPCarouselProps> = ({
  children,
  direction = 'left',
  baseSpeed = 35,
  className = ''
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  useGSAP(() => {
    if (!carouselRef.current) return;

    const carousel = carouselRef.current;
    
    // Configurar animación según dirección
    if (direction === 'left') {
      // Izquierda: de 0% a -50%
      gsap.set(carousel, { x: '0%' });
      animationRef.current = gsap.to(carousel, {
        x: '-50%',
        duration: baseSpeed,
        ease: 'none',
        repeat: -1,
        immediateRender: false
      });
    } else {
      // Derecha: de -50% a 0%
      gsap.set(carousel, { x: '-50%' });
      animationRef.current = gsap.to(carousel, {
        x: '0%',
        duration: baseSpeed,
        ease: 'none',
        repeat: -1,
        immediateRender: false
      });
    }
    
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [direction, baseSpeed]);

  // Función para clonar elementos y aplicar hover individual
  const cloneWithIndividualHover = (element: React.ReactNode, index: number): React.ReactNode => {
    if (React.isValidElement(element)) {
      if (element.type === 'span') {
        const elementId = `span-${index}`;
        return React.cloneElement(element, {
          ...element.props,
          onMouseEnter: () => {
            setHoveredElement(elementId);
            if (animationRef.current) {
              animationRef.current.pause();
            }
          },
          onMouseLeave: () => {
            setHoveredElement(null);
            if (animationRef.current) {
              animationRef.current.resume();
            }
          },
          style: {
            ...element.props.style,
            color: hoveredElement === elementId ? 'var(--global-text-3)' : undefined,
            transition: 'color 0.3s ease',
            cursor: 'default'
          }
        });
      } else if (element.type === 'img') {
        // Mantener las imágenes sin cambios para preservar su alineación
        return element;
      } else if (element.props && element.props.children) {
        return React.cloneElement(element, {
          ...element.props,
          children: React.Children.map(element.props.children, (child, childIndex) => 
            cloneWithIndividualHover(child, index * 100 + childIndex)
          )
        });
      }
    }
    return element;
  };

  return (
    <div className={`philosophy-row ${className}`}>
      <div 
        ref={carouselRef}
        className="philosophy-carousel-gsap"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          willChange: 'transform'
        }}
      >
        {/* Contenido original */}
        <div>
          {React.Children.map(children, (child, index) => cloneWithIndividualHover(child, index))}
        </div>
        {/* Contenido duplicado para loop infinito */}
        <div>
          {React.Children.map(children, (child, index) => cloneWithIndividualHover(child, index + 1000))}
        </div>
      </div>
    </div>
  );
};

export default GSAPCarousel;