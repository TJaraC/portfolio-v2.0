import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const projects = [
  { id: 'ultracamp', name: 'Ultracamp' },
  { id: 'festgo-app', name: 'FestGo' },
  { id: 'portfolio-25', name: "Portfolio '25" },
  { id: 'howell-gallery', name: 'Howell Gallery' },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
];

const evidenceDirectory = process.env.PORTFOLIO_EVIDENCE_DIR;

for (const project of projects) {
  for (const viewport of viewports) {
    test(`${project.name} · ${viewport.name}`, async ({ page }) => {
      const runtimeErrors: string[] = [];

      page.on('console', (message) => {
        if (message.type() === 'error') runtimeErrors.push(message.text());
      });
      page.on('pageerror', (error) => runtimeErrors.push(error.message));

      await page.setViewportSize(viewport);
      await page.goto(`/projects/${project.id}`, { waitUntil: 'networkidle' });
      await expect(page.locator('.project-case')).toBeVisible();

      const chapters = page.locator('.case-chapter');
      await expect(chapters).toHaveCount(9);

      for (let index = 0; index < (await chapters.count()); index += 1) {
        await chapters.nth(index).scrollIntoViewIfNeeded();
        await page.waitForTimeout(120);
      }

      const imageReveals = page.locator('.image-curtain-container');
      for (let index = 0; index < (await imageReveals.count()); index += 1) {
        await imageReveals.nth(index).scrollIntoViewIfNeeded();
        await page.waitForTimeout(120);
      }
      await page.waitForTimeout(1_200);

      const overflow = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
      }));
      expect(overflow.content).toBeLessThanOrEqual(overflow.viewport + 1);

      const brokenImages = await page
        .locator('img')
        .evaluateAll((images) =>
          images
            .filter((image) => !image.complete || image.naturalWidth === 0)
            .map((image) => image.getAttribute('src') ?? 'unknown image')
        );
      expect(brokenImages).toEqual([]);
      expect(runtimeErrors).toEqual([]);

      if (evidenceDirectory) {
        await mkdir(evidenceDirectory, { recursive: true });
        await page.screenshot({
          path: path.join(evidenceDirectory, `${project.id}-${viewport.name}.png`),
          fullPage: true,
          animations: 'disabled',
        });

        if (viewport.name === 'mobile') {
          await page.locator('.header').evaluate((header) => {
            header.setAttribute('data-evidence-visibility', header.style.visibility);
            header.style.visibility = 'hidden';
          });
          await page.locator('.case-final').screenshot({
            path: path.join(evidenceDirectory, `${project.id}-mobile-final-design.png`),
            animations: 'disabled',
          });
          await page.locator('.case-learnings').screenshot({
            path: path.join(evidenceDirectory, `${project.id}-mobile-learnings.png`),
            animations: 'disabled',
          });
          await page.locator('.header').evaluate((header) => {
            header.style.visibility = header.getAttribute('data-evidence-visibility') ?? '';
            header.removeAttribute('data-evidence-visibility');
          });
        }
      }
    });
  }
}

test('project template and legacy fallback remain renderable', async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto('/projects/project-template', { waitUntil: 'networkidle' });
  await expect(page.locator('.case-chapter')).toHaveCount(9);

  await page.goto('/projects/ejemplo-proyecto', { waitUntil: 'networkidle' });
  await expect(page.locator('.case-chapter')).toHaveCount(3);
  await expect(page.locator('.project-gallery-grid')).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

test('next-project interaction keeps the project sequence working', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/projects/ultracamp', { waitUntil: 'networkidle' });

  const nextProject = page.locator('.next-project-button');
  await nextProject.scrollIntoViewIfNeeded();
  await expect(nextProject).toBeVisible();
  await nextProject.click();

  await expect(page).toHaveURL(/\/projects\/festgo-app$/);
  await expect(page.locator('.project-case[data-project="festgo-app"]')).toBeVisible();
});
