import aretaProject from '../data/projects/areta.json';
import festgoProject from '../data/projects/festgo-app.json';
import howellProject from '../data/projects/howell-gallery.json';
import portfolioProject from '../data/projects/portfolio-25.json';
import ultracampProject from '../data/projects/ultracamp.json';

const SITE_ORIGIN = 'https://hellotjc.com';
const METADATA_BLOCK_START = '<!-- portfolio-metadata:start -->';
const METADATA_BLOCK_END = '<!-- portfolio-metadata:end -->';

interface ProjectMetadataSource {
  id: string;
  cardTitle: string;
  heroDescription: string;
  heroImage: string;
}

interface PageMetadata {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  imageUrl: string;
  imageType: 'image/png' | 'image/webp';
  imageAlt?: string;
}

interface ProjectPageMetadata extends PageMetadata {
  id: string;
}

const toAbsoluteUrl = (path: string) => new URL(path, SITE_ORIGIN).toString();

const publishedProjects: ProjectMetadataSource[] = [
  aretaProject,
  ultracampProject,
  festgoProject,
  portfolioProject,
  howellProject,
];

const createProjectMetadata = (project: ProjectMetadataSource): ProjectPageMetadata => ({
  id: project.id,
  title: `${project.cardTitle} | TJC Portfolio`,
  description: project.heroDescription,
  keywords: `${project.cardTitle}, product design, UX/UI, case study, TJC Portfolio`,
  canonicalUrl: `${SITE_ORIGIN}/projects/${project.id}`,
  imageUrl: toAbsoluteUrl(project.heroImage),
  imageType: 'image/webp',
  imageAlt: `${project.cardTitle} project case-study cover`,
});

const HOME_PAGE_METADATA: PageMetadata = {
  title: 'TJC | Creative Product Designer',
  description:
    'Creative Product Designer specializing in innovative digital experiences and user-centered design solutions.',
  keywords:
    'product designer, creative designer, UX designer, UI designer, digital design, user experience',
  canonicalUrl: `${SITE_ORIGIN}/`,
  imageUrl: `${SITE_ORIGIN}/images/OpenGraph.png`,
  imageType: 'image/png',
};

const PROJECT_PAGE_METADATA = publishedProjects.map(createProjectMetadata);
const projectMetadataById = new Map(
  PROJECT_PAGE_METADATA.map((metadata) => [metadata.id, metadata])
);

const normalisePathname = (pathname: string) => {
  const withoutTrailingSlash = pathname.replace(/\/+$/, '');
  return withoutTrailingSlash || '/';
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const createMetadataTags = (metadata: PageMetadata) => {
  const title = escapeHtml(metadata.title);
  const description = escapeHtml(metadata.description);
  const keywords = escapeHtml(metadata.keywords);
  const canonicalUrl = escapeHtml(metadata.canonicalUrl);
  const imageUrl = escapeHtml(metadata.imageUrl);
  const imageAlt = metadata.imageAlt ? escapeHtml(metadata.imageAlt) : null;

  return [
    '    <!-- Primary Meta Tags -->',
    `    <title>${title}</title>`,
    `    <meta name="title" content="${title}" />`,
    `    <meta name="description" content="${description}" />`,
    `    <meta name="keywords" content="${keywords}" />`,
    '    <meta name="author" content="TJC" />',
    '',
    '    <!-- Canonical URL -->',
    `    <link rel="canonical" href="${canonicalUrl}" />`,
    '',
    '    <!-- Open Graph / Facebook -->',
    '    <meta property="og:type" content="website" />',
    `    <meta property="og:url" content="${canonicalUrl}" />`,
    `    <meta property="og:title" content="${title}" />`,
    `    <meta property="og:description" content="${description}" />`,
    `    <meta property="og:image" content="${imageUrl}" />`,
    `    <meta property="og:image:type" content="${metadata.imageType}" />`,
    ...(imageAlt ? [`    <meta property="og:image:alt" content="${imageAlt}" />`] : []),
    '    <meta property="og:site_name" content="TJC Portfolio" />',
    '',
    '    <!-- Twitter -->',
    '    <meta property="twitter:card" content="summary_large_image" />',
    `    <meta property="twitter:url" content="${canonicalUrl}" />`,
    `    <meta property="twitter:title" content="${title}" />`,
    `    <meta property="twitter:description" content="${description}" />`,
    `    <meta property="twitter:image" content="${imageUrl}" />`,
    ...(imageAlt ? [`    <meta property="twitter:image:alt" content="${imageAlt}" />`] : []),
    '',
    '    <!-- Additional Meta Tags -->',
    '    <meta name="robots" content="index, follow" />',
    '    <meta name="theme-color" content="#fd601a" />',
    '    <meta name="msapplication-TileColor" content="#fd601a" />',
  ].join('\n');
};

const setMetaTag = (attribute: 'name' | 'property', key: string, value?: string) => {
  const selector = `meta[${attribute}="${key}"]`;
  const existingElement = document.head.querySelector<HTMLMetaElement>(selector);

  if (!value) {
    existingElement?.remove();
    return;
  }

  const element = existingElement ?? document.createElement('meta');
  element.setAttribute(attribute, key);
  element.content = value;

  if (!existingElement) {
    document.head.append(element);
  }
};

const setCanonicalUrl = (canonicalUrl: string) => {
  const existingElement = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const element = existingElement ?? document.createElement('link');
  element.rel = 'canonical';
  element.href = canonicalUrl;

  if (!existingElement) {
    document.head.append(element);
  }
};

const getProjectIdFromPathname = (pathname: string) => {
  const match = normalisePathname(pathname).match(/^\/projects\/([^/]+)$/);
  return match?.[1];
};

const getPageMetadata = (pathname: string): PageMetadata => {
  const projectId = getProjectIdFromPathname(pathname);
  if (!projectId) return HOME_PAGE_METADATA;

  return projectMetadataById.get(projectId) ?? HOME_PAGE_METADATA;
};

const applyPageMetadata = (metadata: PageMetadata) => {
  if (typeof document === 'undefined') return;

  document.title = metadata.title;
  setMetaTag('name', 'title', metadata.title);
  setMetaTag('name', 'description', metadata.description);
  setMetaTag('name', 'keywords', metadata.keywords);
  setCanonicalUrl(metadata.canonicalUrl);
  setMetaTag('property', 'og:type', 'website');
  setMetaTag('property', 'og:url', metadata.canonicalUrl);
  setMetaTag('property', 'og:title', metadata.title);
  setMetaTag('property', 'og:description', metadata.description);
  setMetaTag('property', 'og:image', metadata.imageUrl);
  setMetaTag('property', 'og:image:type', metadata.imageType);
  setMetaTag('property', 'og:image:alt', metadata.imageAlt);
  setMetaTag('property', 'og:site_name', 'TJC Portfolio');
  setMetaTag('property', 'twitter:card', 'summary_large_image');
  setMetaTag('property', 'twitter:url', metadata.canonicalUrl);
  setMetaTag('property', 'twitter:title', metadata.title);
  setMetaTag('property', 'twitter:description', metadata.description);
  setMetaTag('property', 'twitter:image', metadata.imageUrl);
  setMetaTag('property', 'twitter:image:alt', metadata.imageAlt);
};

const renderProjectMetadataDocument = (documentHtml: string, metadata: ProjectPageMetadata) => {
  const startIndex = documentHtml.indexOf(METADATA_BLOCK_START);
  const endIndex = documentHtml.indexOf(METADATA_BLOCK_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error('Could not find the portfolio metadata block in the built index.html.');
  }

  const metadataBlock = `${METADATA_BLOCK_START}\n${createMetadataTags(metadata)}\n    ${METADATA_BLOCK_END}`;

  return `${documentHtml.slice(0, startIndex)}${metadataBlock}${documentHtml.slice(
    endIndex + METADATA_BLOCK_END.length
  )}`;
};

export {
  HOME_PAGE_METADATA,
  PROJECT_PAGE_METADATA,
  applyPageMetadata,
  getPageMetadata,
  renderProjectMetadataDocument,
};
export type { PageMetadata, ProjectPageMetadata };
