import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDirectory = join(repositoryRoot, 'dist');
const siteOrigin = 'https://www.hellotjc.com';
// Single project registry (same list the app, the build and the tests use)
const projectIds = JSON.parse(
  await readFile(join(repositoryRoot, 'src', 'data', 'published-projects.json'), 'utf8')
);
const indexableRobots = 'index, follow, max-image-preview:large';

const decodeHtml = (value) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const readMetaContent = (documentHtml, attribute, key) => {
  const tag = (documentHtml.match(/<meta\b[^>]*>/g) ?? []).find((candidate) =>
    candidate.includes(`${attribute}="${key}"`)
  );
  const content = tag?.match(/\bcontent="([^"]*)"/)?.[1];
  return content ? decodeHtml(content) : undefined;
};

const readCanonicalUrl = (documentHtml) =>
  documentHtml.match(/<link\s+rel="canonical"\s+href="([^"]*)"\s*\/?\s*>/)?.[1];

const readTitle = (documentHtml) => {
  const title = documentHtml.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  return title ? decodeHtml(title) : undefined;
};

const readStructuredData = (documentHtml) => {
  const blocks = [
    ...documentHtml.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ];
  assert.ok(blocks.length <= 1, 'At most one JSON-LD block per document');
  return blocks[0] ? JSON.parse(blocks[0][1]) : undefined;
};

const findNode = (structuredData, type) =>
  structuredData?.['@graph']?.find((node) => node['@type'] === type);

const assertSingle = (documentHtml, pattern, label) => {
  assert.equal((documentHtml.match(pattern) ?? []).length, 1, `${label} appears exactly once`);
};

const assertMetadata = (documentHtml, expected, label) => {
  assert.match(documentHtml, /<html lang="en">/, `${label} declares its language`);
  assertSingle(documentHtml, /<title>/g, `${label} <title>`);
  assertSingle(documentHtml, /<meta name="description"/g, `${label} meta description`);
  assertSingle(documentHtml, /<link rel="canonical"/g, `${label} canonical`);
  assert.equal(readTitle(documentHtml), expected.title, `${label} has the expected title`);
  assert.equal(
    readMetaContent(documentHtml, 'name', 'description'),
    expected.description,
    `${label} has the expected description`
  );
  assert.equal(
    readMetaContent(documentHtml, 'name', 'robots'),
    indexableRobots,
    `${label} is indexable`
  );
  assert.equal(
    readCanonicalUrl(documentHtml),
    expected.url,
    `${label} has the expected canonical URL`
  );
  assert.equal(
    readMetaContent(documentHtml, 'property', 'og:url'),
    expected.url,
    `${label} has the expected og:url`
  );
  assert.equal(
    readMetaContent(documentHtml, 'property', 'og:type'),
    expected.ogType,
    `${label} has the expected og:type`
  );
  assert.equal(readMetaContent(documentHtml, 'property', 'og:locale'), 'en_US');
  assert.equal(
    readMetaContent(documentHtml, 'property', 'og:image'),
    expected.imageUrl,
    `${label} has the expected Open Graph image`
  );
  assert.equal(
    readMetaContent(documentHtml, 'name', 'twitter:card'),
    'summary_large_image',
    `${label} has a Twitter card`
  );
  assert.equal(
    readMetaContent(documentHtml, 'name', 'twitter:image'),
    expected.imageUrl,
    `${label} has the expected Twitter image`
  );

  if (expected.imageAlt) {
    assert.equal(
      readMetaContent(documentHtml, 'property', 'og:image:alt'),
      expected.imageAlt,
      `${label} has Open Graph image alt text`
    );
    assert.equal(
      readMetaContent(documentHtml, 'name', 'twitter:image:alt'),
      expected.imageAlt,
      `${label} has Twitter image alt text`
    );
  }
};

// Home page
const indexHtml = await readFile(join(distDirectory, 'index.html'), 'utf8');
assertMetadata(
  indexHtml,
  {
    title: 'TJC | Creative Product Designer',
    description:
      'Creative Product Designer specializing in innovative digital experiences and user-centered design solutions.',
    url: `${siteOrigin}/`,
    ogType: 'website',
    imageUrl: `${siteOrigin}/images/OpenGraph.png`,
  },
  'Home page'
);
const homeStructuredData = readStructuredData(indexHtml);
assert.equal(
  findNode(homeStructuredData, 'WebSite')?.url,
  `${siteOrigin}/`,
  'Home page has WebSite JSON-LD'
);
assert.equal(
  findNode(homeStructuredData, 'Person')?.name,
  'Patricio Jaramillo Castrillo',
  'Home page has Person JSON-LD'
);

// Project pages
for (const projectId of projectIds) {
  const projectPath = join(repositoryRoot, 'src', 'data', 'projects', `${projectId}.json`);
  const project = JSON.parse(await readFile(projectPath, 'utf8'));
  const projectHtml = await readFile(
    join(distDirectory, 'projects', projectId, 'index.html'),
    'utf8'
  );
  const imageUrl = new URL(project.heroImage, siteOrigin).toString();
  const url = `${siteOrigin}/projects/${projectId}`;

  assertMetadata(
    projectHtml,
    {
      title: `${project.cardTitle} | TJC Portfolio`,
      description: project.heroDescription,
      url,
      ogType: 'article',
      imageUrl,
      imageAlt: `${project.cardTitle} project case-study cover`,
    },
    `${project.cardTitle} project page`
  );
  assert.equal(
    projectHtml.includes(`${siteOrigin}/images/OpenGraph.png`),
    false,
    `${project.cardTitle} does not fall back to the home social image`
  );

  const structuredData = readStructuredData(projectHtml);
  const creativeWork = findNode(structuredData, 'CreativeWork');
  assert.equal(creativeWork?.url, url, `${project.cardTitle} has CreativeWork JSON-LD`);
  assert.equal(creativeWork?.image, imageUrl, `${project.cardTitle} CreativeWork image`);
  assert.equal(
    findNode(structuredData, 'BreadcrumbList')?.itemListElement?.at(-1)?.item,
    url,
    `${project.cardTitle} has breadcrumb JSON-LD`
  );
}

// 404 shell: Vercel serves it with a real 404 status; it must never be indexable.
const notFoundHtml = await readFile(join(distDirectory, '404.html'), 'utf8');
assert.equal(
  readMetaContent(notFoundHtml, 'name', 'robots'),
  'noindex, follow',
  '404 shell is noindex'
);
assert.equal(readCanonicalUrl(notFoundHtml), undefined, '404 shell has no canonical');
assert.equal(
  readMetaContent(notFoundHtml, 'property', 'og:url'),
  undefined,
  '404 shell has no og:url'
);
assert.equal(readStructuredData(notFoundHtml), undefined, '404 shell has no JSON-LD');
assert.match(notFoundHtml, /<script type="module"[^>]*src="\/assets\//, '404 shell boots the SPA');

// Sitemap and robots.txt
const sitemap = await readFile(join(distDirectory, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.deepEqual(
  sitemapUrls.sort(),
  [`${siteOrigin}/`, ...projectIds.map((projectId) => `${siteOrigin}/projects/${projectId}`)].sort(),
  'Sitemap lists the home page and every published project, nothing else'
);
const robots = await readFile(join(distDirectory, 'robots.txt'), 'utf8');
assert.ok(robots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`), 'robots.txt links the sitemap');

// Vercel routing
const vercelConfig = JSON.parse(await readFile(join(repositoryRoot, 'vercel.json'), 'utf8'));
assert.equal(vercelConfig.trailingSlash, false, 'Trailing-slash URLs redirect to the canonical');
assert.equal(
  vercelConfig.rewrites.some((rewrite) => rewrite.source === '/(.*)'),
  false,
  'No catch-all rewrite: unknown URLs must fall through to the 404 shell with a 404 status'
);
// One pattern rewrite serves every generated case-study document; ids without a generated
// document (unpublished, removed or mistyped) have no destination file and get the 404.
const projectRewrite = vercelConfig.rewrites.find(
  (candidate) => candidate.source === '/projects/:projectId'
);
assert.equal(
  projectRewrite?.destination,
  '/projects/:projectId/index.html',
  'Case-study routes rewrite to their generated document'
);
for (const projectId of projectIds) {
  await access(join(distDirectory, 'projects', projectId, 'index.html'));
}
for (const rewrite of vercelConfig.rewrites.filter((candidate) => candidate !== projectRewrite)) {
  await access(join(distDirectory, rewrite.destination));
}

// Prerendered content: crawlers that do not run JavaScript get the real text and links.
const readPrerenderedText = (documentHtml) =>
  decodeHtml(
    (documentHtml.match(/<div class="prerendered">([\s\S]*)<\/div><\/div>\s*<\/body>/)?.[1] ?? '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
  );

const homeText = readPrerenderedText(indexHtml);
assert.ok(homeText.includes('Creative Product Designer') || homeText.includes('Engineer Designer'), 'Home prerenders the hero heading');
for (const projectId of projectIds) {
  const project = JSON.parse(
    await readFile(join(repositoryRoot, 'src', 'data', 'projects', `${projectId}.json`), 'utf8')
  );
  assert.ok(
    indexHtml.includes(`href="/projects/${projectId}"`),
    `Home prerenders a crawlable link to ${projectId}`
  );
  assert.ok(homeText.includes(project.cardTitle), `Home prerenders the ${projectId} card`);

  const projectHtml = await readFile(join(distDirectory, 'projects', projectId, 'index.html'), 'utf8');
  const projectText = readPrerenderedText(projectHtml);
  assert.ok(projectText.includes(project.heroDescription), `${projectId} prerenders its description`);
  assert.ok(
    projectText.includes(project.gallery.description),
    `${projectId} prerenders the full case study`
  );
}
assert.equal(notFoundHtml.includes('class="prerendered"'), false, '404 shell has no prerendered content');

console.log(
  `Verified SEO output: home, ${projectIds.length} project routes (with prerendered content), 404 shell, sitemap and Vercel routing.`
);
