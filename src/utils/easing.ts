/** Exponential ease-out — used by Lenis scrollTo and GSAP animations */
export const lenisEasing = (t: number): number =>
  Math.min(1, 1.001 - Math.pow(2, -10 * t));
