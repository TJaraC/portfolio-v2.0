import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const projects = [
  {
    id: 'ultracamp',
    title: 'Ultracamp',
    persona: 'Javier Morales',
    metricUnits: ['page templates', 'entry paths', 'design language'],
  },
  {
    id: 'festgo-app',
    title: 'FestGo App',
    persona: 'Lucía Navarro',
    metricUnits: ['product journey', 'trust layers', 'destinations'],
  },
  {
    id: 'portfolio-25',
    title: "Portfolio '25",
    persona: 'Marta Ríos',
    metricUnits: ['case studies', 'type families', 'content model'],
  },
  {
    id: 'howell-gallery',
    title: 'Howell Gallery',
    persona: 'Carmen Vidal',
    metricUnits: ['content types', 'reading levels', 'responsive system'],
  },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
];

const evidenceDirectory = process.env.PORTFOLIO_EVIDENCE_DIR;

for (const project of projects) {
  for (const viewport of viewports) {
    test(`${project.title} - ${viewport.name}`, async ({ page }) => {
      const runtimeErrors: string[] = [];

      page.on('console', (message) => {
        if (message.type() === 'error') runtimeErrors.push(message.text());
      });
      page.on('pageerror', (error) => runtimeErrors.push(error.message));

      await page.setViewportSize(viewport);
      await page.goto(`/projects/${project.id}`, { waitUntil: 'networkidle' });
      await expect(page.locator('.project-case')).toBeVisible();

      const projectHeading = page.locator('.project-title-heading');
      const headingText = (await projectHeading.innerText()).replace(/\s+/g, ' ').trim();
      expect(headingText.toLocaleLowerCase()).toBe(project.title.toLocaleLowerCase());
      await expect(page.locator('.case-persona-intro h3')).toHaveText(project.persona);
      await expect(page.getByText('Before', { exact: true })).toHaveCount(0);
      await expect(page.getByText('After', { exact: true })).toHaveCount(0);

      const applicationLabels = await page
        .locator('.case-application-detail > span')
        .allTextContents();
      expect(applicationLabels).toEqual([
        'Design objective',
        'Built solution',
        'Design objective',
        'Built solution',
        'Design objective',
        'Built solution',
      ]);

      const metricUnits = await page.locator('.case-metric-value > span').allTextContents();
      expect(metricUnits.map((unit) => unit.toLocaleLowerCase())).toEqual(project.metricUnits);

      const headingLayout = await projectHeading.evaluate((heading) => {
        const parts = Array.from(heading.querySelectorAll<HTMLElement>('span'));
        const headingRect = heading.getBoundingClientRect();
        const partRects = parts.map((part) => part.getBoundingClientRect());
        const tops = parts.map((part) => part.getBoundingClientRect().top);

        return {
          fitsWidth: heading.scrollWidth <= heading.clientWidth + 1,
          partsFit: partRects.every(
            (rect) => rect.left >= headingRect.left - 1 && rect.right <= headingRect.right + 1
          ),
          sameLine: tops.every((top) => Math.abs(top - tops[0]) <= 1),
        };
      });
      expect(headingLayout).toEqual({ fitsWidth: true, partsFit: true, sameLine: true });

      if (viewport.name === 'desktop' && (await projectHeading.locator('span').count()) === 2) {
        const headingBox = await projectHeading.boundingBox();
        const subtitleBox = await projectHeading.locator('.project-title-sub').boundingBox();
        expect(headingBox).not.toBeNull();
        expect(subtitleBox).not.toBeNull();
        expect(subtitleBox!.x).toBeGreaterThanOrEqual(headingBox!.x + headingBox!.width / 2 - 1);
      }

      if (viewport.name === 'mobile') {
        const titleBox = await projectHeading.boundingBox();
        const dateBox = await page.locator('.project-date').boundingBox();
        expect(titleBox).not.toBeNull();
        expect(dateBox).not.toBeNull();
        expect(dateBox!.y + dateBox!.height).toBeLessThanOrEqual(titleBox!.y + 1);
      }

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

        await page.locator('.header').evaluate((header) => {
          header.setAttribute('data-evidence-visibility', header.style.visibility);
          header.style.visibility = 'hidden';
        });
        await page.locator('.project-header').screenshot({
          path: path.join(evidenceDirectory, `${project.id}-${viewport.name}-header.png`),
          animations: 'disabled',
        });
        await page.locator('.case-impact').screenshot({
          path: path.join(evidenceDirectory, `${project.id}-${viewport.name}-impact.png`),
          animations: 'disabled',
        });
        if (viewport.name === 'desktop') {
          await page.locator('.case-design').screenshot({
            path: path.join(evidenceDirectory, `${project.id}-desktop-rationale.png`),
            animations: 'disabled',
          });
        }
        await page.locator('.header').evaluate((header) => {
          header.style.visibility = header.getAttribute('data-evidence-visibility') ?? '';
          header.removeAttribute('data-evidence-visibility');
        });
      }
    });
  }
}

test('complete project headings fit compact and intermediate widths', async ({ page }) => {
  for (const width of [320, 600]) {
    await page.setViewportSize({ width, height: 720 });

    for (const project of projects) {
      await page.goto(`/projects/${project.id}`, { waitUntil: 'networkidle' });

      const heading = page.locator('.project-title-heading');
      const headingText = (await heading.innerText()).replace(/\s+/g, ' ').trim();
      expect(headingText.toLocaleLowerCase()).toBe(project.title.toLocaleLowerCase());

      const layout = await heading.evaluate((element) => {
        const headingRect = element.getBoundingClientRect();
        const partRects = Array.from(element.querySelectorAll<HTMLElement>('span')).map((part) =>
          part.getBoundingClientRect()
        );

        return {
          partsFit: partRects.every(
            (rect) => rect.left >= headingRect.left - 1 && rect.right <= headingRect.right + 1
          ),
          sameLine: partRects.every((rect) => Math.abs(rect.top - partRects[0].top) <= 1),
        };
      });
      expect(layout).toEqual({ partsFit: true, sameLine: true });

      const titleBox = await heading.boundingBox();
      const dateBox = await page.locator('.project-date').boundingBox();
      expect(dateBox!.y + dateBox!.height).toBeLessThanOrEqual(titleBox!.y + 1);

      const overflow = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
      }));
      expect(overflow.content).toBeLessThanOrEqual(overflow.viewport + 1);
    }
  }
});

test('project template and legacy fallback remain renderable', async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto('/projects/project-template', { waitUntil: 'networkidle' });
  await expect(page.locator('.case-chapter')).toHaveCount(9);
  await expect(page.locator('.case-application-detail')).toHaveCount(6);
  await expect(page.locator('.case-metric-value > span')).toHaveCount(3);
  await expect(page.locator('.case-persona-intro h3')).toHaveText('Spanish persona name');
  await expect(page.getByText('Before', { exact: true })).toHaveCount(0);
  await expect(page.getByText('After', { exact: true })).toHaveCount(0);

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
