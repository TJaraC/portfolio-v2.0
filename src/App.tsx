import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { setLenisInstance, useLenisScroll } from './hooks/useLenisScroll';
import { fontLoading } from './utils/browserCompatibility';
import Routes from './Routes';
import CustomCursor from './components/ui/CustomCursor';

const App: React.FC = () => {
  const lenisInstance = useLenisScroll();

  useEffect(() => {
    // Verificar que estamos en el navegador
    if (typeof window === 'undefined') return;
    
    // Manejar errores de fuentes
    const handleFontErrors = () => {
      // Agregar fallbacks si las fuentes fallan
      fontLoading.addFontFallbacks();
      
      // Esperar a que las fuentes se carguen
      fontLoading.waitForFonts(['Geist', 'Gilda Display']).catch(() => {
        console.warn('Font loading failed, using fallbacks');
        document.documentElement.classList.add('font-fallback-active');
      });
    };
    
    // Esperar a que el DOM esté completamente cargado
    const initializeLenis = () => {
      // Asegurar que no hay scroll-behavior conflictivo
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.scrollBehavior = 'auto';
      const lenis = new Lenis({
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        normalizeWheel: true,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });

      // Establecer la instancia global
      setLenisInstance(lenis);
      
      // Agregar clase al body para identificar que Lenis está activo
      document.body.classList.add('lenis');

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      // Forzar inicialización después de un breve delay
      setTimeout(() => {
        lenis.start();
        lenis.resize();
      }, 100);

      return lenis;
    };

    let lenis: Lenis | null = null;

    // Inicializar manejo de fuentes
    handleFontErrors();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        lenis = initializeLenis();
      });
    } else {
      lenis = initializeLenis();
    }

    return () => {
      if (lenis) {
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
              cancelable: true
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
