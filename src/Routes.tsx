import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import { gsap } from './utils/gsap';
import { useLenisScroll } from './hooks/useLenisScroll';
import { TransitionContext } from './context/TransitionContext';
import { focusElement, prefersReducedMotion } from './utils/motion';
import './styles/pageTransition.css';

// Import page components
const HomePage = React.lazy(() => import('./pages/Home'));
const ProjectsPage = React.lazy(() => import('./pages/Projects/ProjectsPage'));
const Error404 = React.lazy(() => import('./pages/Error404'));
import Preloader from './components/ui/Preloader';

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lenis = useLenisScroll();

  const [isLoading, setIsLoading] = useState(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedHome');
    const isHomePage = location.pathname === '/';
    return !hasVisited && isHomePage && !prefersReducedMotion();
  });

  // Precargar chunk de ProjectsPage en background tras la carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      import('./pages/Projects/ProjectsPage');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
    sessionStorage.setItem('hasVisitedHome', 'true');
  }, []);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedHome');
    const isHomePage = location.pathname === '/';
    if (!hasVisited && isHomePage && !prefersReducedMotion()) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [location.pathname]);

  // pageMetadata importa los JSON completos de todos los proyectos; cargarlo bajo
  // demanda los saca del chunk inicial. El HTML servido ya trae los metadatos
  // correctos de cada ruta (plugin project-metadata-pages), así que esto solo
  // los sincroniza en la navegación SPA.
  useEffect(() => {
    let cancelled = false;
    import('./utils/pageMetadata').then(({ applyPageMetadata, getPageMetadata }) => {
      if (!cancelled) applyPageMetadata(getPageMetadata(location.pathname));
    });
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  // --- SPA route change: move focus to the new page and announce it (WCAG 2.4.3 / 4.1.3) ---
  const [routeAnnouncement, setRouteAnnouncement] = useState('');
  const lastPathname = useRef(location.pathname);

  useEffect(() => {
    // Carga inicial (o re-ejecución de StrictMode): el navegador ya anuncia el documento
    if (lastPathname.current === location.pathname) return;
    lastPathname.current = location.pathname;

    let attempts = 0;
    let timer = 0;
    let cancelled = false;
    const pathname = location.pathname;

    // Las páginas son lazy y pueden pasar por un estado "loading": esperar a su <main>
    const focusNewPage = () => {
      const main = document.querySelector<HTMLElement>('main');
      const heading = main?.querySelector<HTMLElement>('h1');
      if (!main && attempts < 40) {
        attempts += 1;
        timer = window.setTimeout(focusNewPage, 50);
        return;
      }
      focusElement(heading ?? main ?? document.body);
      // pageMetadata se carga bajo demanda: anunciar el título de la ruta nueva
      // aunque document.title todavía no se haya actualizado.
      import('./utils/pageMetadata').then(({ getPageMetadata }) => {
        if (!cancelled) setRouteAnnouncement(getPageMetadata(pathname).title);
      });
    };

    timer = window.setTimeout(focusNewPage, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [location.pathname]);

  const handleSkipLink = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    const main = document.querySelector<HTMLElement>('main');
    if (!main) return;
    event.preventDefault();
    focusElement(main);
    main.scrollIntoView({ block: 'start' });
  }, []);

  // --- Page transition overlay ---
  const overlayRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement[]>([]);
  const isTransitioning = useRef(false);

  const transitionTo = useCallback(
    (path: string) => {
      if (isTransitioning.current) return;

      // prefers-reduced-motion: navegación directa, sin cortina de columnas
      if (prefersReducedMotion()) {
        window.scrollTo(0, 0);
        navigate(path);
        return;
      }

      isTransitioning.current = true;

      if (lenis) lenis.stop();
      document.body.classList.add('transition-active');

      const overlay = overlayRef.current;
      const columns = columnsRef.current;

      // Reset columns to start position (below screen)
      gsap.set(columns, { y: '100%' });
      if (overlay) overlay.style.pointerEvents = 'all';

      // Navigate when col0 finishes entering — page mounts hidden behind columns
      gsap.delayedCall(0.4, () => {
        window.scrollTo(0, 0);
        navigate(path);
      });

      // Timeline: exit starts 0.15s before enter completes → wave overlap effect
      const tl = gsap.timeline();
      tl.to(columns, {
        y: '0%',
        duration: 0.4,
        ease: 'power2.inOut',
        stagger: { amount: 0.25, from: 'start' },
      }).to(
        columns,
        {
          y: '-100%',
          duration: 0.5,
          ease: 'power2.inOut',
          stagger: { amount: 0.3, from: 'start' },
          onComplete: () => {
            if (overlay) overlay.style.pointerEvents = 'none';
            gsap.set(columns, { y: '100%' });
            document.body.classList.remove('transition-active');
            if (lenis) lenis.start();
            isTransitioning.current = false;
          },
        },
        '-=0.15'
      );
    },
    [navigate, lenis]
  );

  return (
    <TransitionContext.Provider value={{ transitionTo }}>
      {/* Skip link (WCAG 2.4.1): primer elemento enfocable de cada página */}
      <a className="skip-link" href="#main-content" onClick={handleSkipLink}>
        Skip to main content
      </a>

      {/* Anuncio del cambio de página para lectores de pantalla */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {routeAnnouncement}
      </div>

      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<Navigate to="/#work" replace />} />
          <Route path="/projects/" element={<Navigate to="/#work" replace />} />
          <Route path="/projects/:projectId" element={<ProjectsPage />} />
          <Route path="/404" element={<Error404 />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>

      {/* Page transition overlay */}
      <div ref={overlayRef} className="page-transition-overlay" aria-hidden="true">
        <div ref={(el) => el && (columnsRef.current[0] = el)} className="page-transition-column" />
        <div
          ref={(el) => el && (columnsRef.current[1] = el)}
          className="page-transition-column page-transition-column-center"
        />
        <div
          ref={(el) => el && (columnsRef.current[2] = el)}
          className="page-transition-column page-transition-column-center"
        />
        <div ref={(el) => el && (columnsRef.current[3] = el)} className="page-transition-column" />
      </div>

      {isLoading && <Preloader onComplete={handlePreloaderComplete} />}
    </TransitionContext.Provider>
  );
};

const AppRoutes = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default AppRoutes;
