import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useLenisScroll } from '../../hooks/useLenisScroll';
import AnimatedNavButton from '../ui/AnimatedNavButton';
import '../../styles/Header.css';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerTheme, setHeaderTheme] = useState<'light' | 'dark'>('light');
  const lenis = useLenisScroll();
  
  // Referencias para elementos del DOM
  const logoRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const logoRotation = useRef(0);

  // Función para hacer scroll suave a una sección
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element && lenis) {
      const headerHeight = 80; // Altura aproximada del header
      const targetPosition = element.offsetTop - headerHeight;
      
      lenis.scrollTo(targetPosition, {
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    }
  };

  // Función para detectar el tema del header basándose en el scroll
  const detectHeaderTheme = () => {
    if (!headerRef.current) return;
    
    const headerRect = headerRef.current.getBoundingClientRect();
    const headerHeight = headerRect.height;
    const headerTop = headerRect.top;
    const headerBottom = headerRect.bottom;
    
    // Obtener todas las secciones
    const heroSection = document.querySelector('.hero-section') as HTMLElement;
    const featuredSection = document.querySelector('.featured-section') as HTMLElement;
    const portfolioSection = document.querySelector('.portfolio-section') as HTMLElement;
    const philosophySection = document.querySelector('.philosophy-section') as HTMLElement;
    const aboutSection = document.querySelector('.about-section') as HTMLElement;
    const contactSection = document.querySelector('.contact-section') as HTMLElement;
    
    // Definir qué secciones son claras u oscuras
    const lightSections = [heroSection, featuredSection, contactSection];
    const darkSections = [portfolioSection, philosophySection, aboutSection];
    
    let lightPixels = 0;
    let darkPixels = 0;
    
    // Calcular cuántos píxeles del header están sobre secciones claras vs oscuras
    [...lightSections, ...darkSections].forEach(section => {
      if (!section) return;
      
      const sectionRect = section.getBoundingClientRect();
      const sectionTop = sectionRect.top;
      const sectionBottom = sectionRect.bottom;
      
      // Calcular la intersección entre el header y la sección
      const intersectionTop = Math.max(headerTop, sectionTop);
      const intersectionBottom = Math.min(headerBottom, sectionBottom);
      const intersectionHeight = Math.max(0, intersectionBottom - intersectionTop);
      
      if (lightSections.includes(section)) {
        lightPixels += intersectionHeight;
      } else {
        darkPixels += intersectionHeight;
      }
    });
    
    // Determinar el tema basándose en qué tipo de sección domina
    const newTheme = lightPixels >= darkPixels ? 'light' : 'dark';
    
    if (newTheme !== headerTheme) {
      setHeaderTheme(newTheme);
    }
  };

  // useEffect para detectar scroll y cambiar tema del header
  useEffect(() => {
    const handleScroll = () => {
      detectHeaderTheme();
    };
    
    // Detectar tema inicial
    detectHeaderTheme();
    
    // Agregar listener de scroll
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headerTheme]);

  // Animación del logo con scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;
      
      // Calcular la rotación basada en la dirección del scroll
      logoRotation.current += scrollDelta * 0.5; // Factor de velocidad de rotación
      
      if (logoRef.current) {
        gsap.to(logoRef.current, {
          rotation: logoRotation.current,
          duration: 0.3,
          ease: "power2.out"
        });
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Configurar animaciones del menú móvil
  useEffect(() => {
    if (!menuRef.current || !overlayRef.current) return;

    // Crear timeline para las animaciones
    tl.current = gsap.timeline({ paused: true });

    // Animación del overlay
    tl.current.fromTo(overlayRef.current, 
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    // Animación del menú
    tl.current.fromTo(menuRef.current,
      { 
        opacity: 0, 
        scale: 0.9, 
        y: -30
      },
      { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        duration: 0.4, 
        ease: "back.out(1.7)" 
      },
      "-=0.1"
    );

    // Animación de los elementos del menú
    const menuItems = menuItemsRef.current.filter(item => item !== null);
    menuItems.forEach((item, index) => {
      if (item && tl.current) {
        tl.current.fromTo(item,
          { 
            opacity: 0, 
            y: 30, 
            x: -20
          },
          { 
            opacity: 1, 
            y: 0, 
            x: 0,
            duration: 0.3,
            ease: "back.out(1.7)"
          },
          index === 0 ? 0.1 : `+=${0.05}`
        );
      }
    });
  }, []);

  // Controlar apertura/cierre del menú
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('menu-open');
      // Desactivar Lenis cuando el menú está abierto
      if (lenis) {
        lenis.stop();
      }
    } else {
      document.body.classList.remove('menu-open');
      // Reactivar Lenis cuando el menú se cierra
      if (lenis) {
        lenis.start();
      }
    }

    return () => {
      document.body.classList.remove('menu-open');
      if (lenis) {
        lenis.start();
      }
    };
  }, [menuOpen, lenis]);

  useEffect(() => {
    if (tl.current) {
      if (menuOpen) {
        tl.current.play();
        // Animar el icono hamburguesa cuando se abre
        if (hamburgerRef.current) {
          gsap.to(hamburgerRef.current, {
            rotation: 180,
            scale: 1.1,
            duration: 0.2,
            ease: "elastic.out(1, 0.8)"
          });
        }
      } else {
        tl.current.reverse();
        // Animar el icono hamburguesa cuando se cierra
        if (hamburgerRef.current) {
          gsap.to(hamburgerRef.current, {
            rotation: 0,
            scale: 1,
            duration: 0.2,
            ease: "elastic.out(1, 0.8)"
          });
        }
      }
    }
  }, [menuOpen]);

  return (
    <header 
      ref={headerRef}
      className={`header ${headerTheme === 'dark' ? 'header--dark' : 'header--light'} ${menuOpen ? 'header--menu-open' : ''}`}
    >
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <div 
            className="logo" 
            ref={logoRef}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="logo-text">
              TJC
            </span>
          </div>

          {/* Hamburger Menu Icon (Mobile only) */}
          <button 
            ref={hamburgerRef}
            className="hamburger-menu" 
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="hamburger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <AnimatedNavButton 
              role="menuitem"
              className="nav-button"
              onClick={() => scrollToSection('work')}
            >
              WORK
            </AnimatedNavButton>
            <AnimatedNavButton 
              role="menuitem"
              className="nav-button"
              onClick={() => scrollToSection('about')}
            >
              ABOUT
            </AnimatedNavButton>
            <AnimatedNavButton 
              role="menuitem"
              className="nav-button"
              onClick={() => scrollToSection('contact')}
            >
              CONTACT
            </AnimatedNavButton>
          </nav>

          {/* Desktop Social Links */}
          <div className="desktop-social">
            <AnimatedNavButton 
              role="menuitem"
              className="nav-button"
              onClick={() => window.open('https://www.behance.net/tjaradesign', '_blank')}
            >
              BEHANCE
            </AnimatedNavButton>
            <AnimatedNavButton 
              role="menuitem"
              className="nav-button"
              onClick={() => window.open('https://www.linkedin.com/in/patricio-jaramillo-castrillo-557427200/', '_blank')}
            >
              LINKEDIN
            </AnimatedNavButton>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div 
            ref={overlayRef}
            className="mobile-menu-overlay" 
            onClick={() => setMenuOpen(false)} 
          />
        )}
        
        {/* Mobile Menu */}
        <nav 
          ref={menuRef}
          className={`mobile-menu ${!menuOpen ? 'mobile-menu--hidden' : ''} ${headerTheme === 'dark' ? 'mobile-menu--dark' : 'mobile-menu--light'}`} 
          onClick={() => setMenuOpen(false)}
        >
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            <button 
              ref={(el) => el && (menuItemsRef.current[0] = el)}
              role="menuitem"
              className="nav-button nav-button--left mobile-menu-item"
              onClick={() => {
                // Reactivar Lenis antes del scroll
                if (lenis) {
                  lenis.start();
                }
                setMenuOpen(false);
                // Hacer scroll después de un pequeño delay
                setTimeout(() => scrollToSection('about'), 150);
              }}
            >
              ABOUT
            </button>
            <button 
              ref={(el) => el && (menuItemsRef.current[1] = el)}
              role="menuitem"
              className="nav-button nav-button--left mobile-menu-item"
              onClick={() => {
                // Reactivar Lenis antes del scroll
                if (lenis) {
                  lenis.start();
                }
                setMenuOpen(false);
                // Hacer scroll después de un pequeño delay
                setTimeout(() => scrollToSection('work'), 150);
              }}
            >
              WORK
            </button>
            <button 
              ref={(el) => el && (menuItemsRef.current[2] = el)}
              role="menuitem"
              className="nav-button nav-button--left mobile-menu-item"
              onClick={() => {
                // Reactivar Lenis antes del scroll
                if (lenis) {
                  lenis.start();
                }
                setMenuOpen(false);
                // Hacer scroll después de un pequeño delay
                setTimeout(() => scrollToSection('contact'), 150);
              }}
            >
              CONTACT
            </button>
            <button 
              ref={(el) => el && (menuItemsRef.current[3] = el)}
              role="menuitem"
              className="nav-button nav-button--left mobile-menu-item"
              onClick={(e) => {
                e.stopPropagation();
                window.open('https://www.behance.net/tjaradesign', '_blank');
              }}
            >
              BEHANCE
            </button>
            <button 
              ref={(el) => el && (menuItemsRef.current[4] = el)}
              role="menuitem"
              className="nav-button nav-button--left mobile-menu-item"
              onClick={(e) => {
                e.stopPropagation();
                window.open('https://www.linkedin.com/in/patricio-jaramillo-castrillo-557427200/', '_blank');
              }}
            >
              LINKEDIN
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;