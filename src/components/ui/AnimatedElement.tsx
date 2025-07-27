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
      transition: `transform ${duration}s cubic-bezier(0.4, 0, 0.2, 1), opacity ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`,
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden',
      perspective: '1000px',
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
            transform: 'translate3d(0, 50px, 0)',
          };
        case 'slideLeft':
          return {
            ...baseStyles,
            opacity: 0,
            transform: 'translate3d(50px, 0, 0)',
          };
        case 'slideRight':
          return {
            ...baseStyles,
            opacity: 0,
            transform: 'translate3d(-50px, 0, 0)',
          };
        case 'scale':
          return {
            ...baseStyles,
            opacity: 0,
            transform: 'translate3d(0, 0, 0) scale3d(0.95, 0.95, 1)',
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
      transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1)',
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