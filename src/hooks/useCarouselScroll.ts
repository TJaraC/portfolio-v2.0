import { useEffect, useRef } from 'react';
import { useLenisScroll } from './useLenisScroll';

interface UseCarouselScrollOptions {
  normalDuration?: number;
  acceleratedDuration?: number;
  scrollTimeout?: number;
}

export const useCarouselScroll = ({
  normalDuration = 30,
  acceleratedDuration = 10,
  scrollTimeout = 150
}: UseCarouselScrollOptions = {}) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lenis = useLenisScroll();

  useEffect(() => {
    if (!lenis) return;

    const handleScroll = () => {
      // Acelerar la animación durante el scroll
      document.documentElement.style.setProperty('--carousel-duration', `${acceleratedDuration}s`);
      
      // Limpiar timeout anterior si existe
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Restaurar velocidad normal después del timeout
      timeoutRef.current = setTimeout(() => {
        document.documentElement.style.setProperty('--carousel-duration', `${normalDuration}s`);
      }, scrollTimeout);
    };

    // Establecer velocidad inicial
    document.documentElement.style.setProperty('--carousel-duration', `${normalDuration}s`);
    
    // Escuchar eventos de scroll
    lenis.on('scroll', handleScroll);

    return () => {
      lenis.off('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [lenis, normalDuration, acceleratedDuration, scrollTimeout]);
};