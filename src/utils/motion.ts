import type Lenis from 'lenis';
import { lenisEasing } from './easing';

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** True when the user asked the OS/browser to minimise non-essential motion. */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(REDUCED_MOTION_QUERY).matches;

/**
 * Scrolls to a vertical position honouring `prefers-reduced-motion`:
 * smooth (Lenis or native) by default, instant when reduced motion is requested.
 */
export const scrollToY = (lenis: Lenis | null | undefined, top: number) => {
  const reduce = prefersReducedMotion();

  if (lenis) {
    lenis.scrollTo(top, reduce ? { immediate: true } : { duration: 1.2, easing: lenisEasing });
    return;
  }

  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
};

/**
 * Moves keyboard/screen-reader focus to a non-interactive target (section, main, heading)
 * without causing an extra scroll jump.
 */
export const focusElement = (element: HTMLElement | null | undefined) => {
  if (!element) return;
  if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '-1');
  element.focus({ preventScroll: true });
};
