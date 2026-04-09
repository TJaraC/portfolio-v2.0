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
import './styles/pageTransition.css';

// Import page components
const HomePage = React.lazy(() => import('./pages/Home'));
const ProjectsPage = React.lazy(() => import('./pages/Projects/ProjectsPage'));
import Error404 from './pages/Error404';
import Preloader from './components/ui/Preloader';

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lenis = useLenisScroll();

  const [isLoading, setIsLoading] = useState(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedHome');
    const isHomePage = location.pathname === '/';
    return !hasVisited && isHomePage;
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
    if (!hasVisited && isHomePage) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [location.pathname]);

  // --- Page transition overlay ---
  const overlayRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement[]>([]);
  const isTransitioning = useRef(false);

  const transitionTo = useCallback(
    (path: string) => {
      if (isTransitioning.current) return;
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
      <div ref={overlayRef} className="page-transition-overlay">
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
