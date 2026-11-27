import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useLenisScroll } from '../../hooks/useLenisScroll';
import { focusElement, prefersReducedMotion, scrollToY } from '../../utils/motion';
import { HEADER_HEIGHT } from '../../utils/constants';
import AnimatedNavButton from '../ui/AnimatedNavButton';
import { useTransition } from '../../context/TransitionContext';
import '../../styles/Header.css';

const BEHANCE_URL = 'https://www.behance.net/tjaradesign';
const LINKEDIN_URL = 'https://www.linkedin.com/in/patricio-jaramillo-castrillo-557427200/';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerTheme, setHeaderTheme] = useState<'light' | 'dark'>('light');
  const location = useLocation();
  const navigate = useNavigate();
  const lenis = useLenisScroll();
  const { transitionTo } = useTransition();

  // Referencias para elementos del DOM
  const logoRef = useRef<HTMLButtonElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const logoRotation = useRef(0);

  // Función para hacer scroll suave a una sección
  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      // Navegar a la home pasando la sección como estado (sin hash en la URL)
      // Usamos la transición de página y pasamos la sección vía sessionStorage
      sessionStorage.setItem('pendingScrollTo', sectionId);
      transitionTo('/');
      return;
    }

    const element = document.getElementById(sectionId);
    if (!element) return;

    scrollToY(lenis, element.offsetTop - HEADER_HEIGHT);
    // Keyboard/screen-reader users continue from the section they jumped to
    focusElement(element);
  };

  // Enlaces de sección: <a href="/#id"> reales (abrir en pestaña nueva sigue funcionando),
  // interceptando solo el clic normal para mantener el scroll suave / transición.
  const handleSectionLink =
    (sectionId: string, closeMenuFirst = false) =>
    (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      event.preventDefault();
      if (closeMenuFirst) {
        // Reactivar Lenis antes del scroll y cerrar el menú
        if (lenis) lenis.start();
        setMenuOpen(false);
        setTimeout(() => scrollToSection(sectionId), 150);
        return;
      }
      scrollToSection(sectionId);
    };

  // Scroll a sección pendiente cuando llegamos a la home desde otra página
  useEffect(() => {
    if (location.pathname !== '/') return;

    // Soportar tanto location.state (navegación directa) como sessionStorage
    // (navegación a través de la transición de página, que no preserva el state)
    const stateScrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo;
    const storedScrollTo = sessionStorage.getItem('pendingScrollTo');
    const targetSection = stateScrollTo || storedScrollTo;

    if (!targetSection) return;

    // Limpiar tanto el estado como el sessionStorage para que no se repita
    if (stateScrollTo) {
      window.history.replaceState(null, '', '/');
    }
    if (storedScrollTo) {
      sessionStorage.removeItem('pendingScrollTo');
    }

    const timer = setTimeout(() => {
      const element = document.getElementById(targetSection);
      if (!element) return;
      scrollToY(lenis, element.offsetTop - HEADER_HEIGHT);
      focusElement(element);
      // Esperar a que la cortina de la transición de página termine antes de desplazar
    }, 750);
    return () => clearTimeout(timer);
  }, [location.pathname, location.state, lenis]);

  // Función para detectar el tema del header basándose en el scroll
  const detectHeaderTheme = () => {
    if (!headerRef.current) return;

    const headerRect = headerRef.current.getBoundingClientRect();
    const headerTop = headerRect.top;
    const headerBottom = headerRect.bottom;

    // Obtener todas las secciones
    const heroSection = document.querySelector('.hero-section') as HTMLElement | null;
    const featuredSection = document.querySelector('.featured-section') as HTMLElement | null;
    const projectCase = document.querySelector('.project-case') as HTMLElement | null;
    const portfolioSection = document.querySelector('.portfolio-section') as HTMLElement | null;
    const philosophySection = document.querySelector('.philosophy-section') as HTMLElement | null;
    const aboutSection = document.querySelector('.about-section') as HTMLElement | null;
    const contactSection = document.querySelector('.contact-section') as HTMLElement | null;

    // Definir qué secciones son claras u oscuras (contact-section usa --global-bg-1 oscuro)
    const lightSections = [heroSection, featuredSection, projectCase];
    const darkSections = [portfolioSection, philosophySection, aboutSection, contactSection];
    const portfolioTop = portfolioSection ? portfolioSection.getBoundingClientRect().top : Infinity;

    let lightPixels = 0;
    let darkPixels = 0;

    // Calcular cuántos píxeles del header están sobre secciones claras vs oscuras
    [...lightSections, ...darkSections].forEach((section) => {
      if (!section) return;

      const sectionRect = section.getBoundingClientRect();
      const sectionTop = sectionRect.top;
      // .portfolio-section (z-index: 5) cubre visualmente a .featured-section (z-index: 1 con parallax)
      const sectionBottom =
        section === featuredSection
          ? Math.min(sectionRect.bottom, portfolioTop)
          : sectionRect.bottom;

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

    // Determinar el tema basándose en qué tipo de sección domina.
    // React descarta el update si el valor no cambia, así que no hace falta
    // comparar con el estado (y evitamos closures obsoletos).
    setHeaderTheme(lightPixels >= darkPixels ? 'light' : 'dark');
  };

  // useEffect para detectar scroll y cambiar tema del header.
  // Se suscribe una sola vez y agrupa las lecturas de layout en un rAF por frame
  // (el throttle anterior podía descartar el último evento de scroll).
  useEffect(() => {
    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        detectHeaderTheme();
      });
    };

    // Detectar tema inicial y tras cambio de ruta
    detectHeaderTheme();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      cancelAnimationFrame(frame);
    };
  }, [location.pathname]);

  // Animación del logo con scroll (desactivada con prefers-reduced-motion).
  // quickTo reutiliza un único tween en vez de crear uno nuevo en cada evento de scroll.
  useEffect(() => {
    if (prefersReducedMotion() || !logoRef.current) return;
    const rotateLogo = gsap.quickTo(logoRef.current, 'rotation', {
      duration: 0.3,
      ease: 'power2.out',
    });

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;

      // Calcular la rotación basada en la dirección del scroll
      logoRotation.current += scrollDelta * 0.5; // Factor de velocidad de rotación
      rotateLogo(logoRotation.current);

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Animar apertura y cierre del menú móvil
  useEffect(() => {
    if (tl.current) {
      tl.current.kill();
      tl.current = null;
    }

    if (menuOpen) {
      if (menuRef.current && overlayRef.current) {
        const menuItems = menuItemsRef.current.filter(
          (item): item is HTMLAnchorElement => item !== null
        );
        const timeline = gsap.timeline();
        timeline.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.15, ease: 'power2.out' },
          0
        );
        timeline.fromTo(
          menuRef.current,
          { opacity: 0, scale: 0.94, y: -20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: 'back.out(1.5)' },
          0.03
        );
        if (menuItems.length > 0) {
          timeline.fromTo(
            menuItems,
            { opacity: 0, y: 20, x: -12 },
            {
              opacity: 1,
              y: 0,
              x: 0,
              duration: 0.2,
              ease: 'power2.out',
              stagger: 0.04,
            },
            0.08
          );
        }
        tl.current = timeline;
      }

      if (hamburgerRef.current) {
        gsap.killTweensOf(hamburgerRef.current);
        gsap.to(hamburgerRef.current, {
          rotation: 180,
          scale: 1.1,
          duration: 0.2,
          ease: 'elastic.out(1, 0.8)',
        });
      }
    } else if (hamburgerRef.current) {
      gsap.killTweensOf(hamburgerRef.current);
      gsap.to(hamburgerRef.current, {
        rotation: 0,
        scale: 1,
        duration: 0.2,
        ease: 'elastic.out(1, 0.8)',
      });
    }

    return () => {
      if (tl.current) {
        tl.current.kill();
        tl.current = null;
      }
    };
  }, [menuOpen]);

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

  // Gestión de foco del menú móvil: foco al primer enlace al abrir, Escape para cerrar
  // devolviendo el foco al botón, y Tab contenido entre el botón y los enlaces.
  const wasMenuOpen = useRef(false);
  useEffect(() => {
    if (!menuOpen) {
      if (wasMenuOpen.current && menuRef.current?.contains(document.activeElement)) {
        hamburgerRef.current?.focus();
      }
      wasMenuOpen.current = false;
      return;
    }
    wasMenuOpen.current = true;

    const focusTimer = window.setTimeout(() => menuItemsRef.current[0]?.focus(), 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
        hamburgerRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable: HTMLElement[] = [];
      if (hamburgerRef.current) focusable.push(hamburgerRef.current);
      menuItemsRef.current.forEach((item) => item && focusable.push(item));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const inside = active ? focusable.includes(active) : false;

      if (event.shiftKey && (active === first || !inside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !inside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  // Cleanup general al desmontar el componente
  useEffect(() => {
    return () => {
      // Limpiar todas las animaciones GSAP
      if (tl.current) {
        tl.current.kill();
      }
      if (hamburgerRef.current) {
        gsap.killTweensOf(hamburgerRef.current);
      }
      if (logoRef.current) {
        gsap.killTweensOf(logoRef.current);
      }
      // Limpiar clases del body
      document.body.classList.remove('menu-open');
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={`header ${headerTheme === 'dark' ? 'header--dark' : 'header--light'} ${menuOpen ? 'header--menu-open' : ''}`}
    >
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <button
            type="button"
            className="logo"
            ref={logoRef}
            aria-label="TJC, go to home"
            onClick={() => {
              if (location.pathname === '/') {
                // Si estamos en la home, hacer scroll to top
                scrollToY(lenis, 0);
              } else {
                // Si estamos en otra página, navegar a la home con transición
                transitionTo('/');
              }
            }}
          >
            <span className="logo-text">TJC</span>
          </button>

          {/* Hamburger Menu Icon (Mobile only) */}
          <button
            ref={hamburgerRef}
            type="button"
            className="hamburger-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="hamburger-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Main">
            <AnimatedNavButton
              href="/#work"
              className="nav-button"
              onClick={handleSectionLink('work')}
            >
              WORK
            </AnimatedNavButton>
            <AnimatedNavButton
              href="/#about"
              className="nav-button"
              onClick={handleSectionLink('about')}
            >
              ABOUT
            </AnimatedNavButton>
            <AnimatedNavButton
              href="/#contact"
              className="nav-button"
              onClick={handleSectionLink('contact')}
            >
              CONTACT
            </AnimatedNavButton>
          </nav>

          {/* Desktop Social Links */}
          <div className="desktop-social">
            <AnimatedNavButton href={BEHANCE_URL} external className="nav-button">
              BEHANCE
            </AnimatedNavButton>
            <AnimatedNavButton href={LINKEDIN_URL} external className="nav-button">
              LINKEDIN
            </AnimatedNavButton>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div
            ref={overlayRef}
            className="mobile-menu-overlay"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Mobile Menu */}
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          ref={menuRef}
          className={`mobile-menu ${!menuOpen ? 'mobile-menu--hidden' : ''} ${headerTheme === 'dark' ? 'mobile-menu--dark' : 'mobile-menu--light'}`}
          onClick={() => setMenuOpen(false)}
        >
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            <a
              ref={(el) => {
                menuItemsRef.current[0] = el;
              }}
              href="/#about"
              className="nav-button nav-button--left mobile-menu-item"
              onClick={handleSectionLink('about', true)}
            >
              ABOUT
            </a>
            <a
              ref={(el) => {
                menuItemsRef.current[1] = el;
              }}
              href="/#work"
              className="nav-button nav-button--left mobile-menu-item"
              onClick={handleSectionLink('work', true)}
            >
              WORK
            </a>
            <a
              ref={(el) => {
                menuItemsRef.current[2] = el;
              }}
              href="/#contact"
              className="nav-button nav-button--left mobile-menu-item"
              onClick={handleSectionLink('contact', true)}
            >
              CONTACT
            </a>
            <a
              ref={(el) => {
                menuItemsRef.current[3] = el;
              }}
              href={BEHANCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-button nav-button--left mobile-menu-item"
              onClick={(e) => e.stopPropagation()}
            >
              BEHANCE<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a
              ref={(el) => {
                menuItemsRef.current[4] = el;
              }}
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-button nav-button--left mobile-menu-item"
              onClick={(e) => e.stopPropagation()}
            >
              LINKEDIN<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
