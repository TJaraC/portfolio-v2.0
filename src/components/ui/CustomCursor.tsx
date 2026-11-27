import React, { useEffect, useRef } from 'react';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = -100;
    let mouseY = -100;
    let isVisible = false;
    let rafId: number;

    // Acumula posición en mousemove, aplica al DOM en rAF — desacopla eventos del paint
    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        cursor.style.opacity = '1';
      }
    };

    const handleMouseLeave = () => {
      isVisible = false;
      cursor.style.opacity = '0';
    };

    const updatePosition = () => {
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
      rafId = requestAnimationFrame(updatePosition);
    };

    // Event delegation: 2 listeners en document en vez de N por elemento interactivo
    const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, .clickable';

    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.(INTERACTIVE)) {
        cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (
        (e.target as Element | null)?.closest?.(INTERACTIVE) &&
        !(e.relatedTarget as Element | null)?.closest?.(INTERACTIVE)
      ) {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    };

    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    rafId = requestAnimationFrame(updatePosition);

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
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
        opacity: 0,
        pointerEvents: 'none',
        zIndex: 10000,
        transform: 'translate(-50%, -50%)',
        transition: 'opacity 0.15s ease, transform 0.15s ease',
      }}
    />
  );
};

export default CustomCursor;
