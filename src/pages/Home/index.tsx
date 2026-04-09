import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import Header from '../../components/common/Header';
import Contact from '../../components/common/Contact';
import Button from '../../components/ui/Button';
import AnimatedElement from '../../components/ui/AnimatedElement';
import AnimatedProfileImage from '../../components/ui/AnimatedProfileImage';
import ImageWithCurtain from '../../components/ui/ImageWithCurtain';
import ParallaxSection from '../../components/ui/ParallaxSection';
import GSAPCarousel from '../../components/ui/GSAPCarousel';
import ProjectCard from '../../components/ui/ProjectCard';
import Switch from '../../components/ui/Switch';
import { gsap } from '../../utils/gsap';
import { useLenisScroll } from '../../hooks/useLenisScroll';
import { lenisEasing } from '../../utils/easing';
import { HEADER_HEIGHT } from '../../utils/constants';
import { useResponsiveAnimations } from '../../hooks/useResponsiveAnimations';
import { useProjectsList } from '../../hooks/useProjectsList';
import { useImageRotation } from '../../hooks/useImageRotation';
import '../../styles/home.css';

const Home: React.FC = () => {
  // Initialize Lenis scroll
  const lenis = useLenisScroll();

  // Get projects data
  const { projects, loading, error } = useProjectsList();

  // Get rotating image for designer I
  const { currentImage } = useImageRotation();

  // Estado para manejar el switch
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  // Refs para texto animado del hero (GSAP controla el textContent, no React)
  const creativeRef = useRef<HTMLSpanElement>(null);
  const beforeSwitchRef = useRef<HTMLSpanElement>(null);
  const afterSwitchRef = useRef<HTMLSpanElement>(null);
  const floatTween = useRef<gsap.core.Tween | null>(null);
  const strikeRef = useRef<SVGSVGElement>(null);

  // Texto inicial Estado A, rotación, float y línea garabato vía GSAP
  useLayoutEffect(() => {
    if (creativeRef.current) {
      creativeRef.current.textContent = '¿Creative?';
      gsap.set(creativeRef.current, { rotation: -5 });
      floatTween.current = gsap.to(creativeRef.current, {
        y: -8,
        duration: 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    }
    if (strikeRef.current) {
      gsap.set(strikeRef.current, { clipPath: 'inset(0 100% 0 0)' });
      gsap.to(strikeRef.current, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.4,
      });
    }
    if (beforeSwitchRef.current) beforeSwitchRef.current.textContent = 'ENGIN';
    if (afterSwitchRef.current) afterSwitchRef.current.textContent = 'R';
  }, []);

  // Asegurar que Lenis esté activo cuando se carga la página Home
  useEffect(() => {
    // Solo reactivar Lenis si existe, no crear una nueva instancia
    if (lenis) {
      lenis.start();
    }
  }, [lenis]);

  // Aplicar la imagen rotativa como CSS custom property
  useEffect(() => {
    document.documentElement.style.setProperty('--designer-i-image', `url('${currentImage}')`);
  }, [currentImage]);

  const handleSwitchToggle = (isOn: boolean) => {
    setIsSwitchOn(isOn);

    const duration = 0.8;

    if (isOn) {
      // Estado A → B: borrar línea, parar float, scramble ENGINEER → PRODUCT
      gsap.to(strikeRef.current, {
        clipPath: 'inset(0 100% 0 0)',
        duration: 0.3,
        ease: 'power2.in',
      });
      floatTween.current?.kill();
      floatTween.current = null;
      gsap.to(creativeRef.current, { y: 0, duration: 0.3, ease: 'power2.out' });
      gsap.to(creativeRef.current, {
        rotation: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
      gsap.to(creativeRef.current, {
        duration,
        scrambleText: {
          text: 'Creative',
          chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
          revealDelay: 0.2,
        },
      });
      gsap.to(beforeSwitchRef.current, {
        duration,
        scrambleText: { text: 'PR', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', revealDelay: 0.2 },
      });
      gsap.to(afterSwitchRef.current, {
        duration,
        scrambleText: { text: 'UCT', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', revealDelay: 0.2 },
      });
    } else {
      // Estado B → A: scramble PRODUCT → ENGINEER, Creative → ¿Creative?, reiniciar float
      gsap.to(creativeRef.current, {
        rotation: -5,
        duration: 0.5,
        ease: 'power2.in',
      });
      gsap.to(creativeRef.current, {
        duration,
        scrambleText: {
          text: '¿Creative?',
          chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz?¿',
          revealDelay: 0.2,
        },
        onComplete: () => {
          gsap.to(strikeRef.current, {
            clipPath: 'inset(0 0% 0 0)',
            duration: 0.6,
            ease: 'power2.out',
          });
          floatTween.current = gsap.to(creativeRef.current, {
            y: -8,
            duration: 2,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          });
        },
      });
      gsap.to(beforeSwitchRef.current, {
        duration,
        scrambleText: { text: 'ENGIN', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', revealDelay: 0.2 },
      });
      gsap.to(afterSwitchRef.current, {
        duration,
        scrambleText: { text: 'R', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', revealDelay: 0.2 },
      });
    }
  };

  // Manejar scroll automático al hash de la URL
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && lenis) {
      // Esperar un poco para que la página se cargue completamente
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          const targetPosition = element.offsetTop - HEADER_HEIGHT;
          lenis.scrollTo(targetPosition, {
            duration: 1.2,
            easing: lenisEasing,
          });
        }
      }, 500);
    }
  }, [lenis]);

  // Animaciones responsivas para cambios de breakpoint
  useResponsiveAnimations({
    duration: 0.4,
    ease: 'power2.out',
  });

  return (
    <div className="home-container">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <AnimatedElement animation="fadeIn" duration={1.2}>
          <h1 className={`hero-heading${!isSwitchOn ? ' hero-heading--stateA' : ''}`}>
            <div className="hero-creative-wrapper">
              <span ref={creativeRef} className="hero-heading-creative" />
              <svg
                ref={strikeRef}
                className="hero-strikethrough"
                viewBox="0 -10 100 20"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M 0,0 L 8,-7 L 16,7 L 24,-7 L 32,7 L 40,-7 L 48,7 L 56,-7 L 64,7 L 72,-7 L 80,7 L 88,-7 L 96,7 L 100,0"
                  stroke="var(--global-text-3)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
            <br />
            <span
              className="hero-heading-product"
              style={{
                color: isSwitchOn ? 'var(--global-text-1)' : 'var(--global-text-3)',
              }}
            >
              <span ref={beforeSwitchRef} />
              <Switch className="switch--hero" onToggle={handleSwitchToggle} />
              <span ref={afterSwitchRef} />
            </span>
            <br />
            <span className="hero-heading-designer">
              Des<span className="hero-heading-designer-i">i</span>gner
            </span>
          </h1>
        </AnimatedElement>
        <AnimatedElement animation="slideUp" delay={0.3} duration={1}>
          <div className="hero-bottom">
            <AnimatedProfileImage
              src="/images/general/img_img.png"
              alt="Profile"
              className="hero-profile-img"
              delay={0.8}
              rotations={1.5}
              duration={2.5}
            />
            <p className="hero-description">
              product design is where logic, research and creativity come together. I enjoy creating
              elegant solutions with dynamic interactions and intuitive designs that not only look
              good, but also feel smooth and enjoyable to use.
            </p>
          </div>
        </AnimatedElement>
      </section>

      {/* Featured Work Section */}
      <ParallaxSection speed={1.5} direction="down" className="featured-section" zIndex={1}>
        <AnimatedElement animation="slideUp" threshold={0.2}>
          <h2 className="featured-heading">
            <span className="featured-heading-gilda">FEATURED </span>
            <span className="featured-heading-geist">WORK</span>
          </h2>
        </AnimatedElement>
      </ParallaxSection>

      {/* Portfolio Grid */}
      <section
        id="work"
        className="portfolio-section"
        style={{ position: 'relative', zIndex: 5, backgroundColor: 'var(--global-bg-1)' }}
      >
        <div className="portfolio-grid">
          {loading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
                color: 'var(--global-text-1)',
              }}
            >
              Loading projects...
            </div>
          ) : error ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
                color: '#ff6b6b',
              }}
            >
              {error}
            </div>
          ) : (
            projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                number={String(index + 1).padStart(2, '0')}
              />
            ))
          )}
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="philosophy-section">
        <div className="philosophy-content">
          <div className="philosophy-titles">
            {/* Primera fila - se mueve hacia la izquierda */}
            <GSAPCarousel direction="left" baseSpeed={35}>
              <span className="philosophy-title-geist">functionality</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-gilda philosophy-title-margin6">& aesthetics</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-gilda philosophy-title-margin10">
                learn;experiment{' '}
              </span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-geist">functionality</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-gilda philosophy-title-margin6">& aesthetics</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-gilda philosophy-title-margin10">
                learn;experiment{' '}
              </span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
            </GSAPCarousel>
            {/* Segunda fila - se mueve hacia la derecha */}
            <GSAPCarousel direction="right" baseSpeed={35}>
              <span className="philosophy-title-gilda">experiences</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-gilda">technology</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-geist">& creativity</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-gilda">experiences</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-gilda">technology</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-geist">& creativity</span>
            </GSAPCarousel>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="about-content">
          <div className="about-images">
            <div className="about-images-row">
              <div className="about-img about-img-flexible">
                <ImageWithCurtain
                  src="/images/general/profile01.webp"
                  alt="About"
                  delay={0.2}
                  duration={1.0}
                  threshold={0.15}
                />
              </div>
              <div className="about-img about-img-fixed">
                <ImageWithCurtain
                  src="/images/general/profile02.webp"
                  alt="Profile"
                  delay={0.4}
                  duration={1.0}
                  threshold={0.15}
                />
              </div>
            </div>
          </div>
          <AnimatedElement animation="slideRight" delay={0.2} threshold={0.2}>
            <div className="about-who">
              <h3 className="about-who-title">
                <span className="about-who-title-gilda">WHO</span>
                <span className="about-who-title-geist">IS TJC?</span>
              </h3>
              <div className="about-description-wrapper">
                <p className="about-description">
                  I studied Advertising Graphics at the School of Art in Seville, and later
                  completed a Master's in Web Design and Front-End Development. That's when I
                  started working as a designer in a digital marketing team, where I really got to
                  grow — both in design and as part of a team. It helped me boost my creativity and
                  problem-solving skills. Later on, I took a Master's in UX/UI Web Application
                  Design, and today I am working as a Creative Product Designer.
                </p>
              </div>
            </div>
          </AnimatedElement>
        </div>
      </section>

      {/* Contact Section */}
      <div id="contact">
        <Contact />
      </div>
    </div>
  );
};

export default Home;
