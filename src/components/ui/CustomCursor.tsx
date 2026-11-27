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

    let mouseX = 0;
    let mouseY = 0;
    let rafId = 0;
    let hasPosition = false;

    const syncEnabled = () => {
      const enabled = finePointer.matches && !forcedColors.matches;
      root.classList.toggle(ACTIVE_CLASS, enabled);
      return enabled;
    };

    // Acumula posición en mousemove, aplica al DOM en rAF — desacopla eventos del paint
    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!hasPosition) {
        hasPosition = true;
        cursor.style.opacity = '1';
      }
    };

    const updatePosition = () => {
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
      rafId = requestAnimationFrame(updatePosition);
    };

    // Ocultar el círculo cuando el ratón sale de la ventana
    const handleMouseLeaveWindow = () => {
      hasPosition = false;
      cursor.style.opacity = '0';
    };

    // Event delegation: 2 listeners en document en vez de N por elemento interactivo
    const INTERACTIVE = 'a, button, [role="button"], [role="switch"], input, textarea, select, .clickable';

    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as Element).closest?.(INTERACTIVE)) {
        cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if ((e.target as Element).closest?.(INTERACTIVE)) {
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
    rafId = requestAnimationFrame(updatePosition);

    return () => {
      finePointer.removeEventListener?.('change', syncEnabled);
      forcedColors.removeEventListener?.('change', syncEnabled);
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeaveWindow);
      cancelAnimationFrame(rafId);
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
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0,
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
};

export default CustomCursor;
