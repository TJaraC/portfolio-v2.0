import React, { useEffect, useRef } from 'react';

// The custom cursor only replaces the native one on devices with a precise, hovering
// pointer and outside forced-colours mode. Everywhere else (touch, keyboard-only,
// Windows High Contrast, JS failure) the system cursor stays untouched.
const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';
const FORCED_COLORS_QUERY = '(forced-colors: active)';
const ACTIVE_CLASS = 'has-custom-cursor';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || typeof window.matchMedia !== 'function') return;

    const finePointer = window.matchMedia(FINE_POINTER_QUERY);
    const forcedColors = window.matchMedia(FORCED_COLORS_QUERY);
    const root = document.documentElement;

    let mouseX = -100;
    let mouseY = -100;
    let rafId = 0;
    let hasPosition = false;

    const syncEnabled = () => {
      const enabled = finePointer.matches && !forcedColors.matches;
      root.classList.toggle(ACTIVE_CLASS, enabled);
      return enabled;
    };

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
      // El círculo no aparece hasta el primer movimiento (evita verlo en 0,0)
      if (!hasPosition) {
        hasPosition = true;
        cursor.style.opacity = '1';
      }
    };

    // Ocultar el círculo cuando el ratón sale de la ventana
    const handleMouseLeaveWindow = () => {
      hasPosition = false;
      cursor.style.opacity = '0';
    };

    // Event delegation: 2 listeners en document en vez de N por elemento interactivo
    const INTERACTIVE =
      'a, button, [role="button"], [role="switch"], input, textarea, select, .clickable';

    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.(INTERACTIVE)) {
        cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
      }
    };

    // Solo encoger al salir de verdad del elemento interactivo (no al cruzar sus hijos)
    const handleMouseOut = (e: MouseEvent) => {
      if (
        (e.target as Element | null)?.closest?.(INTERACTIVE) &&
        !(e.relatedTarget as Element | null)?.closest?.(INTERACTIVE)
      ) {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    };

    syncEnabled();
    finePointer.addEventListener?.('change', syncEnabled);
    forcedColors.addEventListener?.('change', syncEnabled);
    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.documentElement.addEventListener('mouseleave', handleMouseLeaveWindow);

    return () => {
      finePointer.removeEventListener?.('change', syncEnabled);
      forcedColors.removeEventListener?.('change', syncEnabled);
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeaveWindow);
      if (rafId) cancelAnimationFrame(rafId);
      root.classList.remove(ACTIVE_CLASS);
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
        // Por encima del preloader (9999)
        zIndex: 10000,
        transform: 'translate(-50%, -50%)',
        transition: 'opacity 0.15s ease, transform 0.15s ease',
      }}
    />
  );
};

export default CustomCursor;
