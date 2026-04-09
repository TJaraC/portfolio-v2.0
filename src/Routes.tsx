import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Import page components
const HomePage = React.lazy(() => import('./pages/Home'));
const ProjectsPage = React.lazy(() => import('./pages/Projects/ProjectsPage'));
import Error404 from './pages/Error404';
import Preloader from './components/ui/Preloader';

const AppContent = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(() => {
    // Solo mostrar preloader si:
    // 1. Es la primera visita de la sesión (no hay flag en sessionStorage)
    // 2. Y estamos en la página home (ruta '/')
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
    // Marcar que ya se visitó la home en esta sesión
    sessionStorage.setItem('hasVisitedHome', 'true');
  }, []);

  // Verificar si debemos mostrar el preloader cuando cambie la ruta
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedHome');
    const isHomePage = location.pathname === '/';
    
    // Solo mostrar preloader si no se ha visitado y estamos en home
    if (!hasVisited && isHomePage) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [location.pathname]);

  return (
    <>
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
      {isLoading && <Preloader onComplete={handlePreloaderComplete} />}
    </>
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