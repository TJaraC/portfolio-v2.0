import React, { useEffect, useRef } from 'react';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let rafId = 0;

    // Acumula posición en mousemove y aplica al DOM en un único rAF por frame.
    // Solo se programa un frame cuando el ratón se mueve: sin movimiento no hay
    // bucle rAF ni escrituras de estilo/layout.
    const updatePosition = () => {
      rafId = 0;
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    };

    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!rafId) rafId = requestAnimationFrame(updatePosition);
    };

    // Event delegation: 2 listeners en document en vez de N por elemento interactivo
    const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, .clickable';

    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as Element).closest(INTERACTIVE)) {
        cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if ((e.target as Element).closest(INTERACTIVE)) {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    };

    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    rafId = requestAnimationFrame(updatePosition);

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="custom-cursor"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%)'
      }}
    />
  );
};

export default CustomCursor;
