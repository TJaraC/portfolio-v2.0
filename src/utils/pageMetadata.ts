/**
 * Page metadata (title, description, canonical, social tags, JSON-LD) shared by the build
 * (static HTML per route, sitemap) and the browser (SPA navigation). This module has no
 * data imports: project data is passed in, so it can run in Node (vite.config) and in the app.
 */

const SITE_ORIGIN = 'https://www.hellotjc.com';
const SITE_NAME = 'TJC Portfolio';
const SITE_LOCALE = 'en_US';
const METADATA_BLOCK_START = '<!-- portfolio-metadata:start -->';
const METADATA_BLOCK_END = '<!-- portfolio-metadata:end -->';
const STRUCTURED_DATA_ELEMENT_ID = 'structured-data';
const INDEXABLE_ROBOTS = 'index, follow, max-image-preview:large';
const NOT_FOUND_ROBOTS = 'noindex, follow';

const PERSON_ID = `${SITE_ORIGIN}/#person`;
const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

const PERSON = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Patricio Jaramillo Castrillo',
  alternateName: 'TJC',
  jobTitle: 'Creative Product Designer',
  url: `${SITE_ORIGIN}/`,
  image: `${SITE_ORIGIN}/images/general/profile02.webp`,
  sameAs: [
    'https://www.linkedin.com/in/patricio-jaramillo-castrillo-557427200/',
    'https://www.behance.net/tjaradesign',
  ],
};

interface ProjectMetadataSource {
  id: string;
  cardTitle: string;
  cardTags: string[];
  heroDescription: string;
  heroImage: string;
}

type StructuredData = Record<string, unknown>;

interface PageMetadata {
  title: string;
  description: string;
  keywords: string;
  /** Omitted for pages that must not be indexed (e.g. the 404 shell). */
  canonicalUrl?: string;
  robots: string;
  ogType: 'website' | 'article';
  imageUrl: string;
  imageType: 'image/png' | 'image/webp';
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  structuredData?: StructuredData;
}

interface ProjectPageMetadata extends PageMetadata {
  id: string;
  canonicalUrl: string;
  /** Site-relative path of the case-study hero (LCP candidate), preloaded in the static HTML. */
  heroImagePath: string;
}

const toAbsoluteUrl = (path: string) => new URL(path, SITE_ORIGIN).toString();

const HOME_PAGE_METADATA: PageMetadata = {
  title: 'TJC | Creative Product Designer',
  description:
    'Creative Product Designer specializing in innovative digital experiences and user-centered design solutions.',
  keywords:
    'product designer, creative designer, UX designer, UI designer, digital design, user experience',
  canonicalUrl: `${SITE_ORIGIN}/`,
  robots: INDEXABLE_ROBOTS,
  ogType: 'website',
  imageUrl: `${SITE_ORIGIN}/images/OpenGraph.png`,
  imageType: 'image/png',
  imageWidth: 1200,
  imageHeight: 630,
  structuredData: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: `${SITE_ORIGIN}/`,
        name: SITE_NAME,
        alternateName: 'TJC',
        inLanguage: 'en',
        publisher: { '@id': PERSON_ID },
      },
      PERSON,
    ],
  },
};

const NOT_FOUND_PAGE_METADATA: PageMetadata = {
  title: `Page not found | ${SITE_NAME}`,
  description: HOME_PAGE_METADATA.description,
  keywords: HOME_PAGE_METADATA.keywords,
  robots: NOT_FOUND_ROBOTS,
  ogType: 'website',
  imageUrl: HOME_PAGE_METADATA.imageUrl,
  imageType: HOME_PAGE_METADATA.imageType,
  imageWidth: HOME_PAGE_METADATA.imageWidth,
  imageHeight: HOME_PAGE_METADATA.imageHeight,
};

const createProjectMetadata = (project: ProjectMetadataSource): ProjectPageMetadata => {
  const canonicalUrl = `${SITE_ORIGIN}/projects/${project.id}`;
  const imageUrl = toAbsoluteUrl(project.heroImage);

  return {
    id: project.id,
    heroImagePath: project.heroImage,
    title: `${project.cardTitle} | ${SITE_NAME}`,
    description: project.heroDescription,
    keywords: `${project.cardTitle}, product design, UX/UI, case study, ${SITE_NAME}`,
    canonicalUrl,
    robots: INDEXABLE_ROBOTS,
    ogType: 'article',
    imageUrl,
    imageType: 'image/webp',
    imageAlt: `${project.cardTitle} project case-study cover`,
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CreativeWork',
          '@id': `${canonicalUrl}#case-study`,
          name: project.cardTitle,
          headline: `${project.cardTitle} case study`,
          description: project.heroDescription,
          url: canonicalUrl,
          image: imageUrl,
          inLanguage: 'en',
          keywords: project.cardTags.join(', '),
          creator: { '@type': 'Person', '@id': PERSON_ID, name: PERSON.name, url: PERSON.url },
          isPartOf: { '@type': 'WebSite', '@id': WEBSITE_ID, name: SITE_NAME, url: `${SITE_ORIGIN}/` },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: project.cardTitle, item: canonicalUrl },
          ],
        },
      ],
    },
  };
};

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

/** JSON safe to inline inside a <script> element. */
const serialiseStructuredData = (data: StructuredData) =>
  JSON.stringify(data).replace(/</g, '\\u003c');

const createMetadataTags = (metadata: PageMetadata) => {
  const title = escapeHtml(metadata.title);
  const description = escapeHtml(metadata.description);
  const keywords = escapeHtml(metadata.keywords);
  const canonicalUrl = metadata.canonicalUrl ? escapeHtml(metadata.canonicalUrl) : null;
  const imageUrl = escapeHtml(metadata.imageUrl);
  const imageAlt = metadata.imageAlt ? escapeHtml(metadata.imageAlt) : null;

  return [
    '    <!-- Primary Meta Tags -->',
    `    <title>${title}</title>`,
    `    <meta name="title" content="${title}" />`,
    `    <meta name="description" content="${description}" />`,
    `    <meta name="keywords" content="${keywords}" />`,
    '    <meta name="author" content="TJC" />',
    `    <meta name="robots" content="${metadata.robots}" />`,
    ...(canonicalUrl
      ? ['', '    <!-- Canonical URL -->', `    <link rel="canonical" href="${canonicalUrl}" />`]
      : []),
    '',
    '    <!-- Open Graph / Facebook -->',
    `    <meta property="og:type" content="${metadata.ogType}" />`,
    `    <meta property="og:locale" content="${SITE_LOCALE}" />`,
    ...(canonicalUrl ? [`    <meta property="og:url" content="${canonicalUrl}" />`] : []),
    `    <meta property="og:title" content="${title}" />`,
    `    <meta property="og:description" content="${description}" />`,
    `    <meta property="og:image" content="${imageUrl}" />`,
    `    <meta property="og:image:type" content="${metadata.imageType}" />`,
    ...(metadata.imageWidth && metadata.imageHeight
      ? [
          `    <meta property="og:image:width" content="${metadata.imageWidth}" />`,
          `    <meta property="og:image:height" content="${metadata.imageHeight}" />`,
        ]
      : []),
    ...(imageAlt ? [`    <meta property="og:image:alt" content="${imageAlt}" />`] : []),
    `    <meta property="og:site_name" content="${SITE_NAME}" />`,
    '',
    '    <!-- Twitter -->',
    '    <meta name="twitter:card" content="summary_large_image" />',
    `    <meta name="twitter:title" content="${title}" />`,
    `    <meta name="twitter:description" content="${description}" />`,
    `    <meta name="twitter:image" content="${imageUrl}" />`,
    ...(imageAlt ? [`    <meta name="twitter:image:alt" content="${imageAlt}" />`] : []),
    '',
    '    <!-- Additional Meta Tags -->',
    '    <meta name="theme-color" content="#fd601a" />',
    '    <meta name="msapplication-TileColor" content="#fd601a" />',
    ...(metadata.structuredData
      ? [
          '',
          '    <!-- Structured data -->',
          `    <script type="application/ld+json" id="${STRUCTURED_DATA_ELEMENT_ID}">${serialiseStructuredData(
            metadata.structuredData
          )}</script>`,
        ]
      : []),
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

const setCanonicalUrl = (canonicalUrl?: string) => {
  const existingElement = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!canonicalUrl) {
    existingElement?.remove();
    return;
  }

  const element = existingElement ?? document.createElement('link');
  element.rel = 'canonical';
  element.href = canonicalUrl;

  if (!existingElement) {
    document.head.append(element);
  }
};

const setStructuredData = (structuredData?: StructuredData) => {
  const existingElement = document.getElementById(STRUCTURED_DATA_ELEMENT_ID);

  if (!structuredData) {
    existingElement?.remove();
    return;
  }

  const element = existingElement ?? document.createElement('script');
  element.id = STRUCTURED_DATA_ELEMENT_ID;
  element.setAttribute('type', 'application/ld+json');
  element.textContent = JSON.stringify(structuredData);

  if (!existingElement) {
    document.head.append(element);
  }
};

const getProjectIdFromPathname = (pathname: string) => {
  const match = normalisePathname(pathname).match(/^\/projects\/([^/]+)$/);
  return match?.[1];
};

/**
 * Metadata for a pathname. `project` is the published case study the path points to,
 * if any: unknown routes, `/404` and unpublished project files (templates, legacy
 * examples) must never be indexed or canonicalised to the home page.
 */
const getPageMetadata = (pathname: string, project?: ProjectMetadataSource): PageMetadata => {
  const normalisedPathname = normalisePathname(pathname);

  // `/projects` only redirects to the home grid.
  if (normalisedPathname === '/' || normalisedPathname === '/projects') {
    return HOME_PAGE_METADATA;
  }

  const projectId = getProjectIdFromPathname(normalisedPathname);
  if (project && projectId === project.id) {
    return createProjectMetadata(project);
  }

  return NOT_FOUND_PAGE_METADATA;
};

const applyPageMetadata = (metadata: PageMetadata) => {
  if (typeof document === 'undefined') return;

  document.title = metadata.title;
  setMetaTag('name', 'title', metadata.title);
  setMetaTag('name', 'description', metadata.description);
  setMetaTag('name', 'keywords', metadata.keywords);
  setMetaTag('name', 'robots', metadata.robots);
  setCanonicalUrl(metadata.canonicalUrl);
  setMetaTag('property', 'og:type', metadata.ogType);
  setMetaTag('property', 'og:locale', SITE_LOCALE);
  setMetaTag('property', 'og:url', metadata.canonicalUrl);
  setMetaTag('property', 'og:title', metadata.title);
  setMetaTag('property', 'og:description', metadata.description);
  setMetaTag('property', 'og:image', metadata.imageUrl);
  setMetaTag('property', 'og:image:type', metadata.imageType);
  setMetaTag('property', 'og:image:width', metadata.imageWidth?.toString());
  setMetaTag('property', 'og:image:height', metadata.imageHeight?.toString());
  setMetaTag('property', 'og:image:alt', metadata.imageAlt);
  setMetaTag('property', 'og:site_name', SITE_NAME);
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', metadata.title);
  setMetaTag('name', 'twitter:description', metadata.description);
  setMetaTag('name', 'twitter:image', metadata.imageUrl);
  setMetaTag('name', 'twitter:image:alt', metadata.imageAlt);
  setStructuredData(metadata.structuredData);
};

const renderMetadataDocument = (documentHtml: string, metadata: PageMetadata) => {
  const startIndex = documentHtml.indexOf(METADATA_BLOCK_START);
  const endIndex = documentHtml.indexOf(METADATA_BLOCK_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error('Could not find the portfolio metadata block in index.html.');
  }

  const metadataBlock = `${METADATA_BLOCK_START}\n${createMetadataTags(metadata)}\n    ${METADATA_BLOCK_END}`;

  return `${documentHtml.slice(0, startIndex)}${metadataBlock}${documentHtml.slice(
    endIndex + METADATA_BLOCK_END.length
  )}`;
};

const renderSitemap = (projectPages: ProjectPageMetadata[]) => {
  const entries = [
    { loc: HOME_PAGE_METADATA.canonicalUrl!, image: HOME_PAGE_METADATA.imageUrl },
    ...projectPages.map((metadata) => ({
      loc: metadata.canonicalUrl,
      image: metadata.imageUrl,
    })),
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries.map((entry) =>
      [
        '  <url>',
        `    <loc>${escapeHtml(entry.loc)}</loc>`,
        '    <image:image>',
        `      <image:loc>${escapeHtml(entry.image)}</image:loc>`,
        '    </image:image>',
        '  </url>',
      ].join('\n')
    ),
    '</urlset>',
    '',
  ].join('\n');
};

export {
  HOME_PAGE_METADATA,
  NOT_FOUND_PAGE_METADATA,
  SITE_ORIGIN,
  applyPageMetadata,
  createProjectMetadata,
  getPageMetadata,
  getProjectIdFromPathname,
  renderMetadataDocument,
  renderSitemap,
};
export type { PageMetadata, ProjectMetadataSource, ProjectPageMetadata };
