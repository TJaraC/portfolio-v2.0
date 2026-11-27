/**
 * Build-time prerender (run by the `seo-documents` plugin in vite.config.ts, never shipped
 * to the browser). Renders the real page components to static HTML so that crawlers that
 * do not execute JavaScript (Bing, AI crawlers, link unfurlers) still get the full text,
 * headings and internal links of every route. In the browser, `createRoot` replaces this
 * markup on first render, so it never needs to hydrate.
 */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Header from '../components/common/Header';
import Contact from '../components/common/Contact';
import ProjectCase from '../components/ui/ProjectCase';
import { PreloadedProjectsContext, toProjectCard } from '../hooks/useProjectsList';
import type { ProjectData } from '../hooks/useProjectData';

interface PrerenderInput {
  /** Published case studies, in grid order. */
  projects: ProjectData[];
  /** The case study rendered at this URL, if any. */
  project?: ProjectData;
}

export const renderRoute = (url: string, { projects, project }: PrerenderInput): string => {
  const cards = projects.map(toProjectCard);

  return renderToString(
    <StaticRouter location={url}>
      <PreloadedProjectsContext.Provider value={cards}>
        {project ? (
          <div className="projects-page">
            <Header />
            <ProjectCase data={project} />
            <Contact />
          </div>
        ) : (
          <Home />
        )}
      </PreloadedProjectsContext.Provider>
    </StaticRouter>
  );
};
