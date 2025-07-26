import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

// Variable global para la instancia de Lenis
let lenisInstance: Lenis | null = null;
// Array de callbacks para notificar cuando Lenis esté disponible
let lenisCallbacks: (() => void)[] = [];

// Hook para obtener la instancia de Lenis de forma reactiva
export const useLenisScroll = () => {
  const [lenis, setLenis] = useState<Lenis | null>(lenisInstance);

  useEffect(() => {
    // Si ya existe la instancia, actualizarla inmediatamente
    if (lenisInstance && !lenis) {
      setLenis(lenisInstance);
    }

    // Registrar callback para cuando Lenis esté disponible
    const callback = () => {
      setLenis(lenisInstance);
    };
    
    lenisCallbacks.push(callback);

    // Cleanup: remover el callback cuando el componente se desmonte
    return () => {
      lenisCallbacks = lenisCallbacks.filter(cb => cb !== callback);
    };
  }, [lenis]);

  return lenis;
};

// Función para establecer la instancia de Lenis
export const setLenisInstance = (lenis: Lenis) => {
  lenisInstance = lenis;
  // Notificar a todos los componentes que están esperando
  lenisCallbacks.forEach(callback => callback());
};

export const useScrollAnimation = (
  animationCallback: () => void,
  options: ScrollAnimationOptions = {}
) => {
  const elementRef = useRef<HTMLElement>(null);
  const { threshold = 0.1, rootMargin = '0px', once = true } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animationCallback();
            if (once) {
              observer.unobserve(element);
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [animationCallback, threshold, rootMargin, once]);

  return elementRef;
};

export const useParallaxEffect = (speed: number = 0.5) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const lenis = lenisInstance;
    if (!lenis || !elementRef.current) return;
    
    const handleScroll = () => {
      const element = elementRef.current;
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const scrollY = lenis.scroll;
      const windowHeight = window.innerHeight;
      
      // Calculate parallax offset
      const offset = (scrollY - rect.top + windowHeight) * speed;
      
      element.style.transform = `translateY(${offset}px)`;
    };

    lenis.on('scroll', handleScroll);

    return () => {
      lenis.off('scroll', handleScroll);
    };
  }, [speed]);

  return elementRef;
};