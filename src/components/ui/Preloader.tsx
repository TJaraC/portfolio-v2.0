import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import '../../styles/Preloader.css';

interface PreloaderProps {
  onComplete: () => void;
}

const PRELOADER_WORDS = [
  'LEARN', 'EXPERIMENT', 'FUNCTIONAL', 'TECHNOLOGY', 'UX', 'UI',
  'DESIGN', 'DEVELOP', 'CREATE', 'INNOVATE', 'DIGITAL', 'VISUAL',
  'MODERN', 'CLEAN', 'MINIMAL', 'BOLD', 'CREATIVE', 'SMART',
];

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement[]>([]);
  const leftWordRef = useRef<HTMLSpanElement>(null);
  const rightWordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Add preloader-active class to body to prevent scrolling
    document.body.classList.add('preloader-active');

    const usedWords = new Set<string>();
    const pendingTimeouts: ReturnType<typeof setTimeout>[] = [];
    let isExiting = false;

    // Inicializar columnas y palabras preservando centrado vertical (yPercent: -50)
    gsap.set(columnsRef.current, { scaleY: 1, transformOrigin: 'bottom' });
    gsap.set([leftWordRef.current, rightWordRef.current], {
      opacity: 0,
      yPercent: -50,
      y: 20,
    });

    const getRandomWord = (exclude?: string) => {
      let availableWords = PRELOADER_WORDS.filter(
        (word) => !usedWords.has(word) && word !== exclude
      );
      if (availableWords.length === 0) {
        usedWords.clear();
        availableWords = PRELOADER_WORDS.filter((word) => word !== exclude);
      }
      const chosen = availableWords[Math.floor(Math.random() * availableWords.length)];
      usedWords.add(chosen);
      return chosen;
    };

    const getRandomStyle = () => {
      const colors = ['var(--global-text-2)', 'var(--global-text-3)'];
      const fontOptions = [
        {
          family:
            "'Geist', 'Geist-Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
          weight: '700',
        },
        {
          family:
            "'Gilda Display', 'Gilda-Fallback', 'Times New Roman', 'Georgia', 'Playfair Display', 'Crimson Text', serif",
          weight: '400',
        },
      ];
      const selectedFont = fontOptions[Math.floor(Math.random() * fontOptions.length)];
      return {
        color: colors[Math.floor(Math.random() * colors.length)],
        fontFamily: selectedFont.family,
        fontWeight: selectedFont.weight,
      };
    };

    const animateWords = () => {
      if (isExiting || !leftWordRef.current || !rightWordRef.current) return;

      const leftWord = getRandomWord();
      const rightWord = getRandomWord(leftWord);

      const leftStyle = getRandomStyle();
      const rightStyle = getRandomStyle();

      leftWordRef.current.textContent = leftWord;
      leftWordRef.current.style.color = leftStyle.color;
      leftWordRef.current.style.fontFamily = leftStyle.fontFamily;
      leftWordRef.current.style.fontWeight = leftStyle.weight;

      rightWordRef.current.textContent = rightWord;
      rightWordRef.current.style.color = rightStyle.color;
      rightWordRef.current.style.fontFamily = rightStyle.fontFamily;
      rightWordRef.current.style.fontWeight = rightStyle.weight;

      gsap.killTweensOf([leftWordRef.current, rightWordRef.current]);

      // Animate words in with smoother carousel effect, preserving yPercent: -50 centering
      gsap.fromTo(
        leftWordRef.current,
        { opacity: 0, yPercent: -50, y: -30, rotationX: -90 },
        { opacity: 1, yPercent: -50, y: 0, rotationX: 0, duration: 0.55, ease: 'power2.inOut' }
      );
      gsap.fromTo(
        rightWordRef.current,
        { opacity: 0, yPercent: -50, y: 30, rotationX: 90 },
        {
          opacity: 1,
          yPercent: -50,
          y: 0,
          rotationX: 0,
          duration: 0.55,
          ease: 'power2.inOut',
          delay: 0.05,
        }
      );

      const fadeOutId = setTimeout(() => {
        if (isExiting || !leftWordRef.current || !rightWordRef.current) return;
        gsap.to(leftWordRef.current, {
          opacity: 0,
          yPercent: -50,
          y: 30,
          rotationX: 90,
          duration: 0.5,
          ease: 'power2.inOut',
        });
        gsap.to(rightWordRef.current, {
          opacity: 0,
          yPercent: -50,
          y: -30,
          rotationX: -90,
          duration: 0.5,
          ease: 'power2.inOut',
          delay: 0.05,
        });
      }, 550);
      pendingTimeouts.push(fadeOutId);
    };

    const exitAnimation = () => {
      isExiting = true;
      clearInterval(wordInterval);

      // Primero ocultar las palabras con transición más suave
      gsap.to('.preloader-word', {
        opacity: 0,
        yPercent: -50,
        y: (_i, target) => (target.classList.contains('preloader-word-left') ? 30 : -30),
        rotationX: (_i, target) => (target.classList.contains('preloader-word-left') ? 90 : -90),
        duration: 0.6,
        ease: 'power2.inOut',
        stagger: 0.05,
      });

      // Luego animar columnas subiendo para revelar la página web
      const revealId = setTimeout(() => {
        gsap.to(columnsRef.current, {
          y: '-100%',
          duration: 1.2,
          ease: 'power2.inOut',
          stagger: {
            amount: 0.8,
            from: 'start',
          },
          onComplete: () => {
            if (preloaderRef.current) {
              gsap.set(preloaderRef.current, { display: 'none' });
            }
            document.body.classList.remove('preloader-active');
            onComplete();
          },
        });
      }, 650);
      pendingTimeouts.push(revealId);
    };

    // Mostrar primer par de palabras sin esperar 1s en blanco
    const initialId = setTimeout(() => {
      animateWords();
    }, 150);
    pendingTimeouts.push(initialId);

    const wordInterval = setInterval(() => {
      animateWords();
    }, 1050);

    // Finalizar después de 4 segundos
    const exitTimeoutId = setTimeout(() => {
      exitAnimation();
    }, 4000);
    pendingTimeouts.push(exitTimeoutId);

    return () => {
      clearInterval(wordInterval);
      pendingTimeouts.forEach((id) => clearTimeout(id));
      gsap.killTweensOf([leftWordRef.current, rightWordRef.current, ...columnsRef.current]);
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