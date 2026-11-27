import React, { useRef, useEffect } from 'react';
import { gsap } from '../utils/gsap';
import { prefersReducedMotion } from '../utils/motion';
import AnimatedNavButton from '../components/ui/AnimatedNavButton';
import '../styles/Error404.css';

const Error404: React.FC = () => {
  const digit1Ref = useRef<HTMLSpanElement>(null);
  const digit2Ref = useRef<HTMLSpanElement>(null);
  const digit3Ref = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Referencias a elementos
    const digit1 = digit1Ref.current;
    const digit2 = digit2Ref.current;
    const digit3 = digit3Ref.current;
    const content = contentRef.current;

    if (!digit1 || !digit2 || !digit3 || !content) return;

    // Sin rebote ni desplazamiento con prefers-reduced-motion
    if (prefersReducedMotion()) return;

    // Configurar estado inicial
    gsap.set([digit1, digit2, digit3], {
      y: -200,
      opacity: 0,
      scale: 0.5,
    });

    gsap.set(content, {
      opacity: 0,
      y: 30,
    });

    // Crear timeline con solo 2 animaciones
    const tl = gsap.timeline({ delay: 0.2 });

    // 1. Animación de números 404 rebotando
    tl.to([digit1, digit2, digit3], {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 1.2,
      ease: 'bounce.out',
      stagger: 0.1,
    })

      // 2. Animación del bloque de contenido completo
      .to(
        content,
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
        },
        '-=0.5'
      );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="error-404">
      {/* Logo */}
      <header className="error-404-logo">
        <a href="/" className="logo-link" aria-label="TJC, go to home">
          <span className="logo-text">TJC</span>
        </a>
      </header>

      <main id="main-content" className="error-404-content">
        <h1 className="error-404-number">
          <span className="sr-only">Error 404</span>
          <span ref={digit1Ref} className="error-404-digit" aria-hidden="true">
            4
          </span>
          <span ref={digit2Ref} className="error-404-digit" aria-hidden="true">
            0
          </span>
          <span ref={digit3Ref} className="error-404-digit" aria-hidden="true">
            4
          </span>
        </h1>

        <div ref={contentRef} className="error-404-text-content">
          <h2 className="error-404-title">
            <span className="error-404-title-gilda">PAGE NOT </span>
            <span className="error-404-title-geist">FOUND</span>
          </h2>
          <p className="error-404-subtitle">Lets get you back to the good stuff</p>

          <nav className="error-404-links" aria-label="Back to the portfolio">
            <AnimatedNavButton href="/#work" className="nav-button error-404-link">
              WORK
            </AnimatedNavButton>
            <AnimatedNavButton href="/#about" className="nav-button error-404-link">
              ABOUT
            </AnimatedNavButton>
            <AnimatedNavButton href="/#contact" className="nav-button error-404-link">
              CONTACT
            </AnimatedNavButton>
          </nav>
        </div>
      </main>
    </div>
  );
};

export default Error404;
