import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import '../../styles/Preloader.css';

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement[]>([]);
  const leftWordRef = useRef<HTMLSpanElement>(null);
  const rightWordRef = useRef<HTMLSpanElement>(null);


  const words = [
    'LEARN', 'EXPERIMENT', 'FUNCTIONAL', 'TECHNOLOGY', 'UX', 'UI', 
    'DESIGN', 'DEVELOP', 'CREATE', 'INNOVATE', 'DIGITAL', 'VISUAL',
    'MODERN', 'CLEAN', 'MINIMAL', 'BOLD', 'CREATIVE', 'SMART'
  ];
  
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [currentWords, setCurrentWords] = useState({ left: '', right: '' });

  useEffect(() => {
    // Add preloader-active class to body to prevent scrolling
    document.body.classList.add('preloader-active');
    
    const tl = gsap.timeline();
    
    // Inicializar columnas
    gsap.set(columnsRef.current, { scaleY: 1, transformOrigin: 'bottom' });
    gsap.set([leftWordRef.current, rightWordRef.current], { opacity: 0, y: 20 });

    const getRandomWord = () => {
      const availableWords = words.filter(word => !usedWords.includes(word));
      if (availableWords.length === 0) {
        return null; // No hay más palabras disponibles
      }
      return availableWords[Math.floor(Math.random() * availableWords.length)];
    };

    const getRandomStyle = () => {
      const colors = ['var(--global-text-2)', 'var(--global-text-3)'];
      const fontOptions = [
        {
          family: "'Geist', 'Geist-Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
          weight: '700'
        },
        {
          family: "'Gilda Display', 'Gilda-Fallback', 'Times New Roman', 'Georgia', 'Playfair Display', 'Crimson Text', serif",
          weight: '400'
        }
      ];
      const selectedFont = fontOptions[Math.floor(Math.random() * fontOptions.length)];
      return {
        color: colors[Math.floor(Math.random() * colors.length)],
        fontFamily: selectedFont.family,
        fontWeight: selectedFont.weight,
        fontSize: 'clamp(28px, 4.5vw, 56px)'
      };
    };

    const animateWords = () => {
      if (!leftWordRef.current || !rightWordRef.current) return;

      const leftWord = getRandomWord();
      const rightWord = getRandomWord();
      
      // Si no hay palabras disponibles, detener la animación
      if (!leftWord || !rightWord) {
        return;
      }
      
      const leftStyle = getRandomStyle();
      const rightStyle = getRandomStyle();
      
      setUsedWords(prev => [...prev, leftWord, rightWord]);
      setCurrentWords({ left: leftWord, right: rightWord });
      
      if (leftWordRef.current) {
        leftWordRef.current.textContent = leftWord;
        leftWordRef.current.style.color = leftStyle.color;
        leftWordRef.current.style.fontFamily = leftStyle.fontFamily;
        leftWordRef.current.style.fontWeight = leftStyle.fontWeight;
        leftWordRef.current.style.fontSize = leftStyle.fontSize;
      }
      if (rightWordRef.current) {
        rightWordRef.current.textContent = rightWord;
        rightWordRef.current.style.color = rightStyle.color;
        rightWordRef.current.style.fontFamily = rightStyle.fontFamily;
        rightWordRef.current.style.fontWeight = rightStyle.fontWeight;
        rightWordRef.current.style.fontSize = rightStyle.fontSize;
      }

      // Animate words in with smoother carousel effect
      gsap.fromTo(leftWordRef.current, 
        { opacity: 0, y: -30, rotationX: -90 },
        { opacity: 1, y: 0, rotationX: 0, duration: 0.6, ease: "power2.inOut" }
      );
      gsap.fromTo(rightWordRef.current, 
        { opacity: 0, y: 30, rotationX: 90 },
        { opacity: 1, y: 0, rotationX: 0, duration: 0.6, ease: "power2.inOut", delay: 0.05 }
      );

      setTimeout(() => {
        gsap.to(leftWordRef.current, { opacity: 0, y: 30, rotationX: 90, duration: 0.6, ease: "power2.inOut" });
        gsap.to(rightWordRef.current, { opacity: 0, y: -30, rotationX: -90, duration: 0.6, ease: "power2.inOut", delay: 0.05 });
      }, 600);
    };

    const exitAnimation = () => {
      // Detener el carrusel de palabras
      clearInterval(wordInterval);
      
      // Primero ocultar las palabras con transición más suave
      gsap.to('.preloader-word', {
        opacity: 0,
        y: (i, target) => target.classList.contains('preloader-word-left') ? 30 : -30,
        rotationX: (i, target) => target.classList.contains('preloader-word-left') ? 90 : -90,
        duration: 0.8,
        ease: "power2.inOut",
        stagger: 0.05
      });

      // Luego animar columnas subiendo para revelar la página web
      setTimeout(() => {
        gsap.to(columnsRef.current, {
          y: '-100%',
          duration: 1.2,
          ease: 'power2.inOut',
          stagger: {
            amount: 0.8,
            from: 'start'
          },
          onComplete: () => {
            gsap.set(preloaderRef.current, { display: 'none' });
            // Remove preloader-active class from body
            document.body.classList.remove('preloader-active');
            onComplete();
          }
        });
      }, 800);
    };

    // Iniciar animación de palabras con timing más suave
    const wordInterval = setInterval(() => {
      animateWords();
    }, 1000);

    // Finalizar después de 4 segundos
    setTimeout(() => {
      exitAnimation();
    }, 4000);

    return () => {
      clearInterval(wordInterval);
      tl.kill();
      // Remove preloader-active class from body on cleanup
      document.body.classList.remove('preloader-active');
    };
  }, [onComplete]);

  return (
    <div ref={preloaderRef} className="preloader">
      <div className="preloader-columns">
        <div 
          ref={(el) => el && (columnsRef.current[0] = el)} 
          className="preloader-column"
        />
        <div 
          ref={(el) => el && (columnsRef.current[1] = el)} 
          className="preloader-column preloader-column-center"
        />
        <div 
          ref={(el) => el && (columnsRef.current[2] = el)} 
          className="preloader-column preloader-column-center"
        />
        <div 
          ref={(el) => el && (columnsRef.current[3] = el)} 
          className="preloader-column"
        />
      </div>
      <div className="preloader-text-container">
        <span ref={leftWordRef} className="preloader-word preloader-word-left" />
        <span ref={rightWordRef} className="preloader-word preloader-word-right" />
      </div>
    </div>
  );
};

export default Preloader;