import React, { useState } from 'react';
import { useScrollAnimation } from '../../hooks/useLenisScroll';

interface AnimatedElementProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale';
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  once?: boolean;
}

const AnimatedElement: React.FC<AnimatedElementProps> = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 0.8,
  threshold = 0.1,
  className = '',
  once = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const elementRef = useScrollAnimation(
    () => {
      setTimeout(() => {
        setIsVisible(true);
      }, delay * 1000);
    },
    { threshold, once }
  );

  const getAnimationStyles = () => {
    const baseStyles: React.CSSProperties = {
      transition: `all ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`,
      willChange: 'transform, opacity',
    };

    if (!isVisible) {
      switch (animation) {
        case 'fadeIn':
          return {
            ...baseStyles,
            opacity: 0,
          };
        case 'slideUp':
          return {
            ...baseStyles,
            opacity: 0,
            transform: 'translateY(50px)',
          };
        case 'slideLeft':
          return {
            ...baseStyles,
            opacity: 0,
            transform: 'translateX(50px)',
          };
        case 'slideRight':
          return {
            ...baseStyles,
            opacity: 0,
            transform: 'translateX(-50px)',
          };
        case 'scale':
          return {
            ...baseStyles,
            opacity: 0,
            transform: 'scale(0.9)',
          };
        default:
          return {
            ...baseStyles,
            opacity: 0,
          };
      }
    }

    return {
      ...baseStyles,
      opacity: 1,
      transform: 'translateY(0) translateX(0) scale(1)',
    };
  };

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={className}
      style={getAnimationStyles()}
    >
      {children}
    </div>
  );
};

export default AnimatedElement;