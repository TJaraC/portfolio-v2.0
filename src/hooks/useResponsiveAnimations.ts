import { useEffect, useRef } from 'react';
import { gsap } from '../utils/gsap';
import { ResponsiveAnimationManager } from '../utils/responsiveAnimations';
import { useLenisScroll } from './useLenisScroll';

interface ResponsiveAnimationOptions {
  duration?: number;
  ease?: string;
  onBreakpointChange?: (breakpoint: string) => void;
}

export const useResponsiveAnimations = ({
  duration = 0.4,
  ease = 'power2.out',
  onBreakpointChange
}: ResponsiveAnimationOptions = {}) => {
  const currentBreakpoint = useRef<string>('');
  const animationContext = useRef<gsap.Context>();
  const animationManager = useRef<ResponsiveAnimationManager>();
  const lenis = useLenisScroll();

  useEffect(() => {
    // Crear contexto de GSAP para las animaciones
    animationContext.current = gsap.context(() => {});
    
    // Inicializar el manager de animaciones responsivas
    animationManager.current = new ResponsiveAnimationManager({
      lenis: lenis || undefined,
      duration,
      ease
    });

    const checkBreakpoint = () => {
      let newBreakpoint = '';
      
      if (window.matchMedia('(max-width: 580px)').matches) {
        newBreakpoint = 'mobile';
      } else if (window.matchMedia('(max-width: 768px)').matches) {
        newBreakpoint = 'tablet';
      } else if (window.matchMedia('(max-width: 1024px)').matches) {
        newBreakpoint = 'laptop';
      } else {
        newBreakpoint = 'desktop';
      }

      if (newBreakpoint !== currentBreakpoint.current) {
        const previousBreakpoint = currentBreakpoint.current;
        currentBreakpoint.current = newBreakpoint;
        
        // Callback para cambios de breakpoint
        if (onBreakpointChange) {
          onBreakpointChange(newBreakpoint);
        }

        // Animaciones específicas por breakpoint
        animateBreakpointChange(previousBreakpoint, newBreakpoint);
      }
    };

    const animateBreakpointChange = (from: string, to: string) => {
      if (!animationManager.current) return;

      // Actualizar Lenis en el manager si está disponible
      if (lenis) {
        animationManager.current.setLenis(lenis);
      }

      // Ejecutar animaciones sofisticadas del manager
      animationManager.current.animateBreakpointTransition(from, to);
    };

    // Verificar breakpoint inicial
    checkBreakpoint();

    // Escuchar cambios de tamaño de ventana
    const debouncedCheck = debounce(checkBreakpoint, 150);
    window.addEventListener('resize', debouncedCheck);

    return () => {
      window.removeEventListener('resize', checkBreakpoint);
      if (animationContext.current) {
        animationContext.current.kill();
      }
      if (animationManager.current) {
        animationManager.current.destroy();
      }
    };
  }, [duration, ease, onBreakpointChange]);

  return currentBreakpoint.current;
};

// Función de debounce para optimizar el rendimiento
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default useResponsiveAnimations;