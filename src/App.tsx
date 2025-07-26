import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { setLenisInstance } from './hooks/useLenisScroll';
import Routes from './Routes';
import CustomCursor from './components/ui/CustomCursor';

const App: React.FC = () => {

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
    });

    // Establecer la instancia global
    setLenisInstance(lenis);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
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
