import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { setLenisInstance } from './hooks/useLenisScroll';
import Routes from './Routes';
import CustomCursor from './components/ui/CustomCursor';

const App: React.FC = () => {

  useEffect(() => {
    // Verificar que estamos en el navegador
    if (typeof window === 'undefined') return;
    
    // Esperar a que el DOM esté completamente cargado
    const initializeLenis = () => {
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



  return (
    <>
      <CustomCursor />
      <Routes />
    </>
  );

};

export default App;
