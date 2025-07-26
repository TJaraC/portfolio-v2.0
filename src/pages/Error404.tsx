import React, { useRef, useEffect } from 'react';
import { gsap } from '../utils/gsap';
import AnimatedNavButton from '../components/ui/AnimatedNavButton';
import '../styles/Error404.css';



const Error404: React.FC = () => {
  const digit1Ref = useRef<HTMLSpanElement>(null);
  const digit2Ref = useRef<HTMLSpanElement>(null);
  const digit3Ref = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);


  const scrollToSection = (sectionId: string) => {
    // Redirigir a la home con el hash de la sección
    window.location.href = `/#${sectionId}`;
  };

  useEffect(() => {
    // Referencias a elementos
    const digit1 = digit1Ref.current;
    const digit2 = digit2Ref.current;
    const digit3 = digit3Ref.current;
    const content = contentRef.current;
    
    if (!digit1 || !digit2 || !digit3 || !content) return;
    
    // Configurar estado inicial
    gsap.set([digit1, digit2, digit3], {
      y: -200,
      opacity: 0,
      scale: 0.5
    });
    
    gsap.set(content, {
      opacity: 0,
      y: 30
    });
    
    // Crear timeline con solo 2 animaciones
    const tl = gsap.timeline({ delay: 0.2 });
    
    // 1. Animación de números 404 rebotando
    tl.to([digit1, digit2, digit3], {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 1.2,
      ease: "bounce.out",
      stagger: 0.1
    })
    
    // 2. Animación del bloque de contenido completo
    .to(content, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.3");
    
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="error-404">
      {/* Logo */}
      <div className="error-404-logo">
        <a href="/" className="logo-link">
          <span className="logo-text">TJC</span>
        </a>
      </div>
      
      <div className="error-404-content">
        <h1 className="error-404-number">
          <span ref={digit1Ref} className="error-404-digit">4</span>
          <span ref={digit2Ref} className="error-404-digit">0</span>
          <span ref={digit3Ref} className="error-404-digit">4</span>
        </h1>
        
        <div ref={contentRef} className="error-404-text-content">
          <h2 className="error-404-title">
            <span className="error-404-title-gilda">PAGE NOT</span>
            <span className="error-404-title-geist">FOUND</span>
          </h2>
          <p className="error-404-subtitle">Lets get you back to the good stuff</p>
          
          <div className="error-404-links">
            <AnimatedNavButton 
              className="nav-button error-404-link"
              onClick={() => scrollToSection('work')}
            >
              WORK
            </AnimatedNavButton>
            <AnimatedNavButton 
              className="nav-button error-404-link"
              onClick={() => scrollToSection('about')}
            >
              ABOUT
            </AnimatedNavButton>
            <AnimatedNavButton 
              className="nav-button error-404-link"
              onClick={() => scrollToSection('contact')}
            >
              CONTACT
            </AnimatedNavButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error404;