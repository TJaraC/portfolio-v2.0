import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useLenisScroll } from '../../hooks/useLenisScroll';
import '../../styles/Header.css';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLButtonElement | HTMLDivElement)[]>([]);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline>();
  const lenis = useLenisScroll();
  const lastScrollY = useRef(0);
  const logoRotation = useRef(0);

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

  useGSAP(() => {
    // Crear timeline para las animaciones
    tl.current = gsap.timeline({ paused: true });
  }, []);

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

  // Configurar animaciones cuando el menú se abre/cierra
  useEffect(() => {
    if (!tl.current || !menuRef.current || !overlayRef.current) return;

    // Limpiar timeline anterior
    tl.current.clear();

    // Animación del overlay
    tl.current.fromTo(overlayRef.current, 
      { opacity: 0 },
      { opacity: 1, duration: 0.1, ease: "power2.out" }
    );

    // Animación del menú
    tl.current.fromTo(menuRef.current,
      { 
        opacity: 0, 
        scale: 0.9, 
        y: -30,
        backdropFilter: "blur(0px)"
      },
      { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        backdropFilter: "blur(25px)", 
        duration: 0.15, 
        ease: "back.out(1.7)" 
      },
      "-=0.05"
    );

    // Animación de los elementos del menú
    const menuItems = menuItemsRef.current.filter(item => item !== null);
    menuItems.forEach((item, index) => {
      if (item && tl.current) {
        tl.current.fromTo(item,
          { 
            opacity: 0, 
            y: 30, 
            x: -20,
            rotationX: -10,
            scale: 0.9
          },
          { 
            opacity: 1, 
            y: 0, 
            x: 0,
            rotationX: 0,
            scale: 1,
            duration: 0.2,
            ease: "back.out(1.7)"
          },
          index === 0 ? 0.02 : `+=${0.02}`
        );
      }
    });

    // Configurar animaciones de hover solo para botones, no para el contenedor social
    menuItems.forEach((item, index) => {
      if (item && item.tagName === 'BUTTON') {
        const handleMouseEnter = () => {
          gsap.to(item, {
            scale: 1.05,
            x: 10,
            color: "#ff6b6b",
            duration: 0.3,
            ease: "power2.out"
          });
        };

        const handleMouseLeave = () => {
          gsap.to(item, {
            scale: 1,
            x: 0,
            color: "inherit",
            duration: 0.3,
            ease: "power2.out"
          });
        };

        item.addEventListener('mouseenter', handleMouseEnter);
        item.addEventListener('mouseleave', handleMouseLeave);
      }
    });
  }, [menuOpen]);

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
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <div className="logo" ref={logoRef}>
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
            <button 
              role="menuitem"
              className="nav-button"
            >
              WORK
            </button>
            <button 
              role="menuitem"
              className="nav-button"
            >
              ABOUT
            </button>
            <button 
              role="menuitem"
              className="nav-button"
            >
              CONTACT
            </button>
          </nav>

          {/* Desktop Social Links */}
          <div className="desktop-social">
            <button 
              role="menuitem"
              className="nav-button"
            >
              BEHANCE
            </button>
            <button 
              role="menuitem"
              className="nav-button"
            >
              LINKEDIN
            </button>
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
          className={`mobile-menu ${!menuOpen ? 'mobile-menu--hidden' : ''}`} 
          onClick={() => setMenuOpen(false)}
        >
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            <button 
              ref={(el) => el && (menuItemsRef.current[0] = el)}
              role="menuitem"
              className="nav-button nav-button--left mobile-menu-item"
            >
              ABOUT
            </button>
            <button 
              ref={(el) => el && (menuItemsRef.current[1] = el)}
              role="menuitem"
              className="nav-button nav-button--left mobile-menu-item"
            >
              WORK
            </button>
            <button 
              ref={(el) => el && (menuItemsRef.current[2] = el)}
              role="menuitem"
              className="nav-button nav-button--left mobile-menu-item"
            >
              CONTACT
            </button>
            <button 
              ref={(el) => el && (menuItemsRef.current[3] = el)}
              role="menuitem"
              className="nav-button nav-button--left mobile-menu-item"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Behance clicked');
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
                console.log('LinkedIn clicked');
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