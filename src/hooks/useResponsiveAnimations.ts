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
  onBreakpointChange,
}: ResponsiveAnimationOptions = {}) => {
  const currentBreakpoint = useRef<string>('');
  const animationContext = useRef<gsap.Context>();
  const animationManager = useRef<ResponsiveAnimationManager>();
  const lenis = useLenisScroll();
  // Ref para leer siempre la instancia actual de Lenis sin recrear el efecto
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  useEffect(() => {
    // Crear contexto de GSAP para las animaciones
    animationContext.current = gsap.context(() => {});

    // Inicializar el manager de animaciones responsivas
    animationManager.current = new ResponsiveAnimationManager({
      lenis: lenisRef.current || undefined,
      duration,
      ease,
    });

    const checkBreakpoint = () => {
      let newBreakpoint: string;

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

        // Animaciones específicas solo en cambios reales de breakpoint (no en montaje inicial)
        if (previousBreakpoint) {
          animateBreakpointChange(previousBreakpoint, newBreakpoint);
        }
      }
    };

    const animateBreakpointChange = (from: string, to: string) => {
      if (!animationManager.current) return;

      // Actualizar Lenis en el manager si está disponible
      if (lenisRef.current) {
        animationManager.current.setLenis(lenisRef.current);
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
      window.removeEventListener('resize', debouncedCheck);
      debouncedCheck.cancel();
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
function debounce<Args extends unknown[]>(func: (...args: Args) => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: Args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
}

export default useResponsiveAnimations;
