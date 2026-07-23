import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const siteOrigin = 'https://hellotjc.com';
const projectIds = ['areta', 'ultracamp', 'festgo-app', 'portfolio-25', 'howell-gallery'];

const decodeHtml = (value) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
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

const assertMetadata = (documentHtml, expected, label) => {
  assert.equal(readTitle(documentHtml), expected.title, `${label} has the expected title`);
  assert.equal(
    readMetaContent(documentHtml, 'name', 'description'),
    expected.description,
    `${label} has the expected description`
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
    readMetaContent(documentHtml, 'property', 'og:image'),
    expected.imageUrl,
    `${label} has the expected Open Graph image`
  );
  assert.equal(
    readMetaContent(documentHtml, 'property', 'twitter:image'),
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
      readMetaContent(documentHtml, 'property', 'twitter:image:alt'),
      expected.imageAlt,
      `${label} has Twitter image alt text`
    );
  }
};

const indexHtml = await readFile(join(repositoryRoot, 'dist', 'index.html'), 'utf8');
assertMetadata(
  indexHtml,
  {
    title: 'TJC | Creative Product Designer',
    description:
      'Creative Product Designer specializing in innovative digital experiences and user-centered design solutions.',
    url: `${siteOrigin}/`,
    imageUrl: `${siteOrigin}/images/OpenGraph.png`,
  },
  'Home page'
);

for (const projectId of projectIds) {
  const projectPath = join(repositoryRoot, 'src', 'data', 'projects', `${projectId}.json`);
  const project = JSON.parse(await readFile(projectPath, 'utf8'));
  const projectHtml = await readFile(
    join(repositoryRoot, 'dist', 'projects', projectId, 'index.html'),
    'utf8'
  );
  const imageUrl = new URL(project.heroImage, siteOrigin).toString();

  assertMetadata(
    projectHtml,
    {
      title: `${project.cardTitle} | TJC Portfolio`,
      description: project.heroDescription,
      url: `${siteOrigin}/projects/${projectId}`,
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
}

const vercelConfig = JSON.parse(await readFile(join(repositoryRoot, 'vercel.json'), 'utf8'));
const fallbackIndex = vercelConfig.rewrites.findIndex((rewrite) => rewrite.source === '/(.*)');
assert.notEqual(fallbackIndex, -1, 'Vercel retains the SPA fallback rewrite');

for (const projectId of projectIds) {
  const matchingRewriteIndex = vercelConfig.rewrites.findIndex(
    (rewrite) =>
      rewrite.source === `/projects/${projectId}` &&
      rewrite.destination === `/projects/${projectId}/index.html`
  );
  assert.notEqual(matchingRewriteIndex, -1, `${projectId} has a crawler-facing Vercel rewrite`);
  assert.ok(
    matchingRewriteIndex < fallbackIndex,
    `${projectId} rewrite precedes the SPA fallback rewrite`
  );
}

console.log(
  `Verified Open Graph output for ${projectIds.length} project routes and the unchanged home page.`
);
