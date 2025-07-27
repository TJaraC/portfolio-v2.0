import React from 'react';
import AnimatedElement from './AnimatedElement';

interface DividerProps {
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale';
  delay?: number;
  threshold?: number;
}

const Divider: React.FC<DividerProps> = ({ 
  className = '', 
  animation = 'slideLeft',
  delay = 0,
  threshold = 0.2
}) => {
  return (
    <AnimatedElement 
      animation={animation} 
      delay={delay} 
      threshold={threshold}
      className={`divider ${className}`}
    >
      <svg 
        width="100%" 
        height="1" 
        viewBox="0 0 100 1" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <line 
          x1="0" 
          y1="0.5" 
          x2="100" 
          y2="0.5" 
          stroke="var(--global-text-1)" 
          strokeWidth="1"
        />
      </svg>
    </AnimatedElement>
  );
};

export default Divider;