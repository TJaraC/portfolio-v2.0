import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { setLenisInstance, useLenisScroll } from './hooks/useLenisScroll';
import { gsap, ScrollTrigger } from './utils/gsap';
import { lenisEasing } from './utils/easing';
import { prefersReducedMotion } from './utils/motion';
import Routes from './Routes';
import CustomCursor from './components/ui/CustomCursor';

const App: React.FC = () => {
  const lenisInstance = useLenisScroll();

  useEffect(() => {
    // Verificar que estamos en el navegador
    if (typeof window === 'undefined') return;

    // La comprobación de fuentes (fallbacks incluidos) ya la hace
    // initBrowserCompatibility() en main.tsx.

    let tick: ((time: number) => void) | null = null;

    // Esperar a que el DOM esté completamente cargado
    const initializeLenis = () => {
      // Asegurar que no hay scroll-behavior conflictivo
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.scrollBehavior = 'auto';
      const lenis = new Lenis({
        lerp: 0.1,
        duration: 1.2,
        // prefers-reduced-motion: rueda nativa, sin inercia/suavizado
        smoothWheel: !prefersReducedMotion(),
        wheelMultiplier: 1,
        touchMultiplier: 2,
        easing: lenisEasing,
      });

      // Establecer la instancia global
      setLenisInstance(lenis);

      // Sincronizar ScrollTrigger con el RAF loop de Lenis
      lenis.on('scroll', ScrollTrigger.update);

      // Agregar clase al body para identificar que Lenis está activo
      document.body.classList.add('lenis');

      // Conducir Lenis desde el ticker de GSAP: un único bucle rAF para
      // scroll suave, tweens y ScrollTrigger, actualizados en el mismo frame.
      tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);

      // Forzar inicialización después de un breve delay
      setTimeout(() => {
        lenis.start();
        lenis.resize();
      }, 100);

      return lenis;
    };

    let lenis: Lenis | null = null;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        lenis = initializeLenis();
      });
    } else {
      lenis = initializeLenis();
    }

    return () => {
      if (tick) gsap.ticker.remove(tick);
      if (lenis) {
        lenis.off('scroll', ScrollTrigger.update);
        lenis.destroy();
      }
    };
  }, []);

  // Manejar navegación del navegador (botón atrás/adelante)
  useEffect(() => {
    const handlePopState = () => {
      setTimeout(() => {
        if (lenisInstance) {
          // Reinicializar Lenis completamente
          lenisInstance.stop();

          // Asegurar scroll al top
          window.scrollTo(0, 0);

          setTimeout(() => {
            lenisInstance.start();
            lenisInstance.resize();

            // Forzar reactivación del smooth wheel
            const wheelEvent = new WheelEvent('wheel', {
              deltaY: 0,
              bubbles: true,
              cancelable: true,
            });
            document.dispatchEvent(wheelEvent);
          }, 50);
        }
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [lenisInstance]);

  return (
    <>
      <CustomCursor />
      <Routes />
    </>
  );
};

export default App;
