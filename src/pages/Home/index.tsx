import React, { useState, useEffect } from 'react';
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
import { useLenisScroll } from '../../hooks/useLenisScroll';
import { useResponsiveAnimations } from '../../hooks/useResponsiveAnimations';
import { useProjectsList } from '../../hooks/useProjectsList';
import '../../styles/home.css';

const Home: React.FC = () => {
  // Initialize Lenis scroll
  const lenis = useLenisScroll();
  
  // Get projects data
  const { projects, loading, error } = useProjectsList();
  
  // Estado para manejar el switch
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  // Asegurar que Lenis esté activo cuando se carga la página Home
  useEffect(() => {
    // Solo reactivar Lenis si existe, no crear una nueva instancia
    if (lenis) {
      lenis.start();
    }
  }, [lenis]);

  // Detectar navegación de vuelta desde otras páginas y reactivar Lenis
  useEffect(() => {
    const handlePopState = () => {
      // Cuando se usa el botón atrás del navegador, reactivar Lenis
      setTimeout(() => {
        if (lenis) {
          lenis.start();
          // Forzar actualización del scroll
          lenis.resize();
        }
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [lenis]);
  
  const handleSwitchToggle = (isOn: boolean) => {
    setIsSwitchOn(isOn);
  };
  
  // Manejar scroll automático al hash de la URL
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && lenis) {
      // Esperar un poco para que la página se cargue completamente
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          const headerHeight = 80;
          const targetPosition = element.offsetTop - headerHeight;
          lenis.scrollTo(targetPosition, {
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
          });
        }
      }, 500);
    }
  }, [lenis]);

  // Animaciones responsivas para cambios de breakpoint
  const currentBreakpoint = useResponsiveAnimations({
    duration: 0.4,
    ease: 'power2.out',
    onBreakpointChange: (breakpoint) => {
      console.log(`Breakpoint changed to: ${breakpoint}`);
    }
  });

  return (
    <div className="home-container">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <section className="hero-section">
        <AnimatedElement animation="fadeIn" duration={1.2}>
          <h1 className="hero-heading">
            <span className="hero-heading-creative">Creative</span><br />
            <span 
              className="hero-heading-product"
              style={{
                color: isSwitchOn ? 'var(--global-text-1)' : 'var(--global-text-3)'
              }}
            >
              PR
              <Switch className="switch--hero" onToggle={handleSwitchToggle} />
              UCT
            </span><br />
            <span className="hero-heading-designer">
              Des<span className="hero-heading-designer-i">i</span>gner
            </span>
          </h1>
        </AnimatedElement>
        <AnimatedElement animation="slideUp" delay={0.3} duration={1}>
          <div className="hero-bottom">
            <AnimatedProfileImage
                  src="/images/img_img.png"
                  alt="Profile"
                  className="hero-profile-img"
                  delay={0.8}
                  rotations={1.5}
                  duration={2.5}
                />
            <p className="hero-description">
              product design is where logic, research and creativity come together. I enjoy creating elegant solutions with dynamic interactions and intuitive designs that not only look good, but also feel smooth and enjoyable to use.
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
       <section id="work" className="portfolio-section" style={{ position: 'relative', zIndex: 5, backgroundColor: 'var(--global-bg-1)' }}>
         <div className="portfolio-grid">
           {loading ? (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', color: 'var(--global-text-1)' }}>
               Loading projects...
             </div>
           ) : error ? (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', color: '#ff6b6b' }}>
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
              <span className="philosophy-title-gilda philosophy-title-margin10">learn;experiment </span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-geist">functionality</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-gilda philosophy-title-margin6">& aesthetics</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-gilda philosophy-title-margin10">learn;experiment </span>
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
                   src="/images/profile01.webp"
                   alt="About"
                   delay={0.2}
                   duration={1.0}
                   threshold={0.15}
                 />
               </div>
               <div className="about-img about-img-fixed">
                 <ImageWithCurtain
                   src="/images/profile02.webp"
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
                   I studied Advertising Graphics at the School of Art in Seville, and later completed a Master's in Web Design and Front-End Development. That's when I started working as a designer in a digital marketing team, where I really got to grow — both in design and as part of a team. It helped me boost my creativity and problem-solving skills. Later on, I took a Master's in UX/UI Web Application Design, and today I am working as a Creative Product Designer.
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