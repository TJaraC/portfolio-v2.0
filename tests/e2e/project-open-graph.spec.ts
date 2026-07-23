import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface ProjectMetadataSource {
  id: string;
  cardTitle: string;
  heroDescription: string;
  heroImage: string;
}

interface PageMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string;
  imageType: 'image/png' | 'image/webp';
  imageAlt?: string;
}

const siteOrigin = 'https://hellotjc.com';
const projectIds = ['areta', 'ultracamp', 'festgo-app', 'portfolio-25', 'howell-gallery'];
const projectSources: ProjectMetadataSource[] = projectIds.map((projectId) =>
  JSON.parse(
    readFileSync(join(process.cwd(), 'src', 'data', 'projects', `${projectId}.json`), 'utf8')
  )
);

const HOME_PAGE_METADATA: PageMetadata = {
  title: 'TJC | Creative Product Designer',
  description:
    'Creative Product Designer specializing in innovative digital experiences and user-centered design solutions.',
  canonicalUrl: `${siteOrigin}/`,
  imageUrl: `${siteOrigin}/images/OpenGraph.png`,
  imageType: 'image/png',
};

const PROJECT_PAGE_METADATA: (PageMetadata & { id: string })[] = projectSources.map((project) => ({
  id: project.id,
  title: `${project.cardTitle} | TJC Portfolio`,
  description: project.heroDescription,
  canonicalUrl: `${siteOrigin}/projects/${project.id}`,
  imageUrl: new URL(project.heroImage, siteOrigin).toString(),
  imageType: 'image/webp',
  imageAlt: `${project.cardTitle} project case-study cover`,
}));

const expectPageMetadata = async (page: Page, metadata: PageMetadata) => {
  await expect(page).toHaveTitle(metadata.title);
  await expect(page.locator('meta[name="title"]')).toHaveAttribute('content', metadata.title);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    metadata.description
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    metadata.canonicalUrl
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    'content',
    metadata.canonicalUrl
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    metadata.title
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    'content',
    metadata.description
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    metadata.imageUrl
  );
  await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute(
    'content',
    metadata.imageType
  );
  await expect(page.locator('meta[property="twitter:url"]')).toHaveAttribute(
    'content',
    metadata.canonicalUrl
  );
  await expect(page.locator('meta[property="twitter:image"]')).toHaveAttribute(
    'content',
    metadata.imageUrl
  );

  if (metadata.imageAlt) {
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
      'content',
      metadata.imageAlt
    );
    await expect(page.locator('meta[property="twitter:image:alt"]')).toHaveAttribute(
      'content',
      metadata.imageAlt
    );
  } else {
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveCount(0);
    await expect(page.locator('meta[property="twitter:image:alt"]')).toHaveCount(0);
  }
};

for (const project of PROJECT_PAGE_METADATA) {
  test(`${project.id} applies its primary project image as Open Graph metadata`, async ({
    page,
  }) => {
    const runtimeErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(message.text());
    });
    page.on('pageerror', (error) => runtimeErrors.push(error.message));

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/projects/${project.id}`, { waitUntil: 'networkidle' });
    await expect(page.locator(`.project-case[data-project="${project.id}"]`)).toBeVisible();
    await expectPageMetadata(page, project);

    expect(runtimeErrors).toEqual([]);
  });
}

test('metadata remains correct after client navigation and restores the unchanged home image', async ({
  page,
}) => {
  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('.preloader')).toBeHidden({ timeout: 10_000 });
  await expectPageMetadata(page, HOME_PAGE_METADATA);

  await page.locator('.portfolio-card[data-project-number="01"]').click();
  await expect(page).toHaveURL(/\/projects\/areta$/);
  await expect(page.locator('.project-case[data-project="areta"]')).toBeVisible();
  await expectPageMetadata(page, PROJECT_PAGE_METADATA[0]);

  await page.goBack({ waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('.preloader')).toBeHidden({ timeout: 10_000 });
  await expectPageMetadata(page, HOME_PAGE_METADATA);

  expect(runtimeErrors).toEqual([]);
});

test('project Open Graph metadata remains stable on a mobile direct route', async ({ page }) => {
  const project = PROJECT_PAGE_METADATA.find((metadata) => metadata.id === 'portfolio-25');
  expect(project).toBeDefined();

  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/projects/${project!.id}`, { waitUntil: 'networkidle' });
  await expect(page.locator(`.project-case[data-project="${project!.id}"]`)).toBeVisible();
  await expectPageMetadata(page, project!);

  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(overflow.content).toBeLessThanOrEqual(overflow.viewport + 1);
  expect(runtimeErrors).toEqual([]);
});
