import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const projects = [
  {
    id: 'areta',
    title: 'Areta',
    personas: ['Daniel Ortega', 'Marta Soler', 'Sergio Martín'],
    metricUnits: ['products', 'slices', 'doc routes'],
    applicationCount: 4,
    chapterCount: 10,
    hasDelivery: true,
    siteUrl: 'https://areta-landing.vercel.app/',
  },
  {
    id: 'ultracamp',
    title: 'Ultracamp',
    personas: ['Javier Morales'],
    metricUnits: ['page templates', 'entry paths', 'design language'],
    applicationCount: 3,
    chapterCount: 9,
    hasDelivery: false,
    siteUrl: 'https://ultracamp.es/',
  },
  {
    id: 'festgo-app',
    title: 'FestGo App',
    personas: ['Lucía Navarro'],
    metricUnits: ['product journey', 'trust layers', 'destinations'],
    applicationCount: 3,
    chapterCount: 9,
    hasDelivery: false,
  },
  {
    id: 'portfolio-25',
    title: "Portfolio '25",
    personas: ['Marta Ríos'],
    metricUnits: ['case studies', 'type families', 'content model'],
    applicationCount: 3,
    chapterCount: 9,
    hasDelivery: false,
    siteUrl: 'https://www.hellotjc.com/',
  },
  {
    id: 'howell-gallery',
    title: 'Howell Gallery',
    personas: ['Carmen Vidal'],
    metricUnits: ['content types', 'reading levels', 'responsive system'],
    applicationCount: 3,
    chapterCount: 9,
    hasDelivery: false,
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
      const headerSiteLink = page.locator('.project-header .project-site-link--orbit');
      const heroMedia = page.locator('.project-hero-media');
      const heroSiteLink = heroMedia.locator('.project-site-link--orbit');
      await expect(headerSiteLink).toHaveCount(0);
      if (project.siteUrl) {
        await expect(heroSiteLink).toHaveCount(1);
        await expect(heroSiteLink).toHaveAttribute('href', project.siteUrl);
        await expect(heroSiteLink).toHaveAttribute('target', '_blank');
        await expect(heroSiteLink).toHaveAttribute('rel', 'noopener noreferrer');

        const heroPresentation = await heroSiteLink.evaluate((link) => {
          const hero = link.closest<HTMLElement>('.project-hero-media');
          const heroRect = hero!.getBoundingClientRect();
          const linkRect = link.getBoundingClientRect();
          const styles = window.getComputedStyle(link);

          return {
            position: styles.position,
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            blendMode: styles.mixBlendMode,
            topInset: linkRect.top - heroRect.top,
            rightInset: heroRect.right - linkRect.right,
          };
        });
        expect(heroPresentation.position).toBe('absolute');
        expect(heroPresentation.color).toBe('rgb(255, 255, 255)');
        expect(heroPresentation.backgroundColor).toBe('rgba(0, 0, 0, 0)');
        expect(heroPresentation.blendMode).toBe('difference');
        expect(heroPresentation.topInset).toBeGreaterThanOrEqual(14);
        expect(heroPresentation.topInset).toBeLessThanOrEqual(34);
        expect(heroPresentation.rightInset).toBeGreaterThanOrEqual(14);
        expect(heroPresentation.rightInset).toBeLessThanOrEqual(34);
      } else {
        await expect(heroSiteLink).toHaveCount(0);
      }
      await expect(page.locator('.case-persona-intro h3')).toHaveText(project.personas);
      await expect(page.getByText('Before', { exact: true })).toHaveCount(0);
      await expect(page.getByText('After', { exact: true })).toHaveCount(0);

      const applicationLabels = await page
        .locator('.case-application-detail > span')
        .allTextContents();
      expect(applicationLabels).toEqual(
        Array.from({ length: project.applicationCount }).flatMap(() => [
          'Design objective',
          'Built solution',
        ])
      );

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
      await expect(chapters).toHaveCount(project.chapterCount);

      if (project.hasDelivery) {
        await expect(page.locator('.case-delivery')).toBeVisible();
        await expect(page.locator('.case-delivery-stack .case-decision-card')).toHaveCount(8);
        await expect(page.locator('.case-testing .case-chapter-number')).toHaveText('08');
        await expect(page.locator('.case-final .case-chapter-number')).toHaveText('09');
        await expect(page.locator('.case-impact .case-chapter-number')).toHaveText('10');
        await expect(page.locator('.case-learnings .case-chapter-number')).toHaveText('11');
        await expect(page.locator('.project-case-study img')).toHaveCount(7);
      } else {
        await expect(page.locator('.case-delivery')).toHaveCount(0);
        await expect(page.locator('.case-testing .case-chapter-number')).toHaveText('07');
      }

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
        if (viewport.name === 'desktop') {
          await page.screenshot({
            path: path.join(evidenceDirectory, `${project.id}-desktop.png`),
            fullPage: true,
            animations: 'disabled',
          });
        }

        await page.locator('.header').evaluate((header) => {
          header.setAttribute('data-evidence-visibility', header.style.visibility);
          header.style.visibility = 'hidden';
        });
        await page.locator('.project-header').screenshot({
          path: path.join(evidenceDirectory, `${project.id}-${viewport.name}-header.png`),
          animations: 'disabled',
        });
        if (project.siteUrl) {
          await heroMedia.screenshot({
            path: path.join(evidenceDirectory, `${project.id}-${viewport.name}-hero-site-link.png`),
            animations: 'disabled',
          });
        }
        await page.locator('.case-impact').screenshot({
          path: path.join(evidenceDirectory, `${project.id}-${viewport.name}-impact.png`),
          animations: 'disabled',
        });
        if (project.hasDelivery) {
          await page.locator('.case-final').screenshot({
            path: path.join(evidenceDirectory, `${project.id}-${viewport.name}-final.png`),
            animations: 'disabled',
          });
        }
        if (viewport.name === 'desktop') {
          await page.locator('.case-design').screenshot({
            path: path.join(evidenceDirectory, `${project.id}-desktop-rationale.png`),
            animations: 'disabled',
          });
          if (project.hasDelivery) {
            await page.locator('.case-delivery').screenshot({
              path: path.join(evidenceDirectory, `${project.id}-desktop-delivery.png`),
              animations: 'disabled',
            });
          }
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
  await expect(page.locator('.case-chapter')).toHaveCount(10);
  await expect(page.locator('.case-application-detail')).toHaveCount(6);
  await expect(page.locator('.case-metric-value > span')).toHaveCount(3);
  await expect(page.locator('.case-persona-intro h3')).toHaveText([
    'Lucía Moreno',
    'Javier Martín',
  ]);
  await expect(page.locator('.case-delivery')).toBeVisible();
  await expect(page.getByText('Before', { exact: true })).toHaveCount(0);
  await expect(page.getByText('After', { exact: true })).toHaveCount(0);

  await page.goto('/projects/ejemplo-proyecto', { waitUntil: 'networkidle' });
  await expect(page.locator('.case-chapter')).toHaveCount(3);
  await expect(page.locator('.project-gallery-grid')).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

test('next-project interaction keeps the project sequence working', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const sequence = ['areta', 'ultracamp', 'festgo-app', 'portfolio-25'];

  for (let index = 0; index < sequence.length; index += 1) {
    const current = sequence[index];
    const next = sequence[(index + 1) % sequence.length];

    await page.goto(`/projects/${current}`, { waitUntil: 'networkidle' });
    const nextProject = page.locator('.next-project-button');
    await nextProject.scrollIntoViewIfNeeded();
    await expect(nextProject).toBeVisible();
    await nextProject.click();

    await expect(page).toHaveURL(new RegExp(`/projects/${next}$`));
    await expect(page.locator(`.project-case[data-project="${next}"]`)).toBeVisible();
  }
});

test('the visible portfolio is a stable four-project grid', async ({ page }) => {
  const runtimeErrors: string[] = [];
  const expectedCards = [
    { number: '01', title: 'Areta', siteUrl: 'https://areta-landing.vercel.app/' },
    { number: '02', title: 'Ultracamp', siteUrl: 'https://ultracamp.es/' },
    { number: '03', title: 'FestGo App' },
    { number: '04', title: 'Personal Portfolio', siteUrl: 'https://www.hellotjc.com/' },
  ];

  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('.preloader')).toBeHidden({ timeout: 10_000 });

    const cards = page.locator('.portfolio-card');
    await expect(cards).toHaveCount(4);
    await expect(cards.locator('.portfolio-card-number')).toHaveText(
      expectedCards.map((project) => project.number)
    );
    await expect(cards.locator('.portfolio-card-title')).toHaveText(
      expectedCards.map((project) => project.title)
    );
    await expect(page.locator('.portfolio-card.is-featured')).toHaveCount(0);
    await expect(page.getByText('Howell Gallery', { exact: true })).toHaveCount(0);
    await expect(cards.locator('.portfolio-card-title + .project-site-link--icon')).toHaveCount(3);

    for (let index = 0; index < expectedCards.length; index += 1) {
      const siteLink = cards.nth(index).locator('.project-site-link--icon');
      const expected = expectedCards[index];
      if (expected.siteUrl) {
        await expect(siteLink).toHaveCount(1);
        await expect(siteLink).toHaveAttribute('href', expected.siteUrl);
        await expect(siteLink).toHaveAttribute('target', '_blank');
        await expect(siteLink).toHaveAttribute('rel', 'noopener noreferrer');

        const iconPresentation = await siteLink.evaluate((link) => {
          const styles = window.getComputedStyle(link);
          const linkRect = link.getBoundingClientRect();
          const iconRect = link.querySelector('svg')!.getBoundingClientRect();

          return {
            backgroundColor: styles.backgroundColor,
            borderTopWidth: styles.borderTopWidth,
            borderTopStyle: styles.borderTopStyle,
            borderRadius: styles.borderRadius,
            boxShadow: styles.boxShadow,
            width: linkRect.width,
            height: linkRect.height,
            iconWidth: iconRect.width,
          };
        });
        expect(iconPresentation.backgroundColor).toBe('rgba(0, 0, 0, 0)');
        expect(iconPresentation.borderTopWidth).toBe('0px');
        expect(iconPresentation.borderTopStyle).toBe('none');
        expect(iconPresentation.borderRadius).toBe('0px');
        expect(iconPresentation.boxShadow).toBe('none');
        expect(iconPresentation.width).toBeGreaterThanOrEqual(31);
        expect(iconPresentation.height).toBeGreaterThanOrEqual(31);
        expect(iconPresentation.iconWidth).toBeLessThan(iconPresentation.width);
      } else {
        await expect(siteLink).toHaveCount(0);
      }
    }

    const boxes = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const box = element.getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      })
    );
    const gridBox = await page.locator('.portfolio-grid').boundingBox();
    expect(gridBox).not.toBeNull();

    if (viewport.name === 'desktop') {
      expect(Math.abs(boxes[0].y - boxes[1].y)).toBeLessThanOrEqual(1);
      expect(boxes[1].x).toBeGreaterThan(boxes[0].x);
      expect(Math.abs(boxes[2].y - boxes[3].y)).toBeLessThanOrEqual(1);
      expect(boxes[2].y).toBeGreaterThan(boxes[0].y + boxes[0].height - 1);
      expect(boxes.every((box) => box.width < gridBox!.width)).toBe(true);
    } else {
      expect(boxes.every((box) => Math.abs(box.width - gridBox!.width) <= 1)).toBe(true);
      expect(boxes.slice(1).every((box, index) => box.y > boxes[index].y)).toBe(true);
    }

    const overflow = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(overflow.content).toBeLessThanOrEqual(overflow.viewport + 1);

    const brokenImages = await page
      .locator('.portfolio-card img')
      .evaluateAll((images) =>
        images
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.getAttribute('src') ?? 'unknown image')
      );
    expect(brokenImages).toEqual([]);

    if (evidenceDirectory) {
      await mkdir(evidenceDirectory, { recursive: true });
      const cardReveals = page.locator('.portfolio-card .image-curtain-container');
      for (let index = 0; index < (await cardReveals.count()); index += 1) {
        await cardReveals.nth(index).scrollIntoViewIfNeeded();
        await page.waitForTimeout(1_400);
      }
      await page.waitForTimeout(400);
      await page.locator('.portfolio-card img').evaluateAll(async (images) => {
        await Promise.all(images.map((image) => image.decode()));
      });
      await page.addStyleTag({
        content:
          '.portfolio-card-img, .portfolio-card-img img { transform: none !important; will-change: auto !important; backface-visibility: visible !important; } .portfolio-card .image-curtain { display: none !important; } .custom-cursor { display: none !important; }',
      });
      await page.locator('.header').evaluate((header) => {
        header.setAttribute('data-evidence-visibility', header.style.visibility);
        header.style.visibility = 'hidden';
      });
      await page.locator('.portfolio-section').screenshot({
        path: path.join(evidenceDirectory, `home-${viewport.name}-projects.png`),
        animations: 'disabled',
      });
      await page.locator('.header').evaluate((header) => {
        header.style.visibility = header.getAttribute('data-evidence-visibility') ?? '';
        header.removeAttribute('data-evidence-visibility');
      });
    }
  }

  expect(runtimeErrors).toEqual([]);
});

test('live-site controls rotate continuously around a fixed centre and isolate navigation', async ({
  page,
}) => {
  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.context().route('https://areta-landing.vercel.app/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><title>Areta live site</title>',
    });
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('.preloader')).toBeHidden({ timeout: 10_000 });

  const cardLink = page
    .locator('.portfolio-card')
    .filter({ has: page.getByRole('heading', { name: 'Areta' }) })
    .getByRole('link', { name: /Visit Areta live site/ });
  const homeUrl = page.url();
  const popupPromise = page.waitForEvent('popup');
  await cardLink.click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');

  expect(page.url()).toBe(homeUrl);
  expect(popup.url()).toBe('https://areta-landing.vercel.app/');
  await popup.close();

  await page.goto('/projects/areta', { waitUntil: 'networkidle' });
  const orbitLink = page.getByRole('link', { name: /Visit Areta live site/ });
  const orbitText = orbitLink.locator('.project-site-link-orbit-text');
  const centreArrow = orbitLink.locator('.project-site-link-arrow');
  const readTransform = (locator: typeof orbitText) =>
    locator.evaluate((element) => window.getComputedStyle(element).transform);

  await orbitLink.scrollIntoViewIfNeeded();
  await page.mouse.move(4, 4);
  await expect(orbitLink).not.toBeFocused();
  expect(await orbitLink.evaluate((link) => link.matches(':hover'))).toBe(false);

  const beforeWait = await readTransform(orbitText);
  const arrowBefore = await readTransform(centreArrow);
  await page.waitForTimeout(400);
  const afterWait = await readTransform(orbitText);
  const arrowAfter = await readTransform(centreArrow);
  expect(afterWait).not.toBe(beforeWait);
  expect(arrowAfter).toBe(arrowBefore);

  const centreGeometry = await orbitText.evaluate((element) => {
    const group = element as SVGGElement;
    const svg = group.ownerSVGElement;
    const groupMatrix = group.getScreenCTM();
    const svgMatrix = svg?.getScreenCTM();
    if (!svg || !groupMatrix || !svgMatrix) return null;

    const origin = svg.createSVGPoint();
    origin.x = 60;
    origin.y = 60;
    const animatedCentre = origin.matrixTransform(groupMatrix);
    const fixedCentre = origin.matrixTransform(svgMatrix);
    const styles = window.getComputedStyle(group);
    const bounds = group.getBBox();
    return {
      distance: Math.hypot(animatedCentre.x - fixedCentre.x, animatedCentre.y - fixedCentre.y),
      transform: styles.transform,
      transformOrigin: styles.transformOrigin,
      inlineStyle: group.getAttribute('style'),
      svgOrigin: group.getAttribute('data-svg-origin'),
      bounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
    };
  });
  expect(centreGeometry).not.toBeNull();
  expect(
    centreGeometry!.distance,
    `Unexpected orbit geometry: ${JSON.stringify(centreGeometry)}`
  ).toBeLessThan(0.75);

  const caseUrl = page.url();
  const casePopupPromise = page.waitForEvent('popup');
  await orbitLink.click();
  const casePopup = await casePopupPromise;
  await casePopup.waitForLoadState('domcontentloaded');
  expect(page.url()).toBe(caseUrl);
  expect(casePopup.url()).toBe('https://areta-landing.vercel.app/');
  await casePopup.close();

  if (evidenceDirectory) {
    await mkdir(evidenceDirectory, { recursive: true });
    await page.addStyleTag({ content: '.custom-cursor { display: none !important; }' });
    await page.waitForTimeout(400);
    await page.locator('.project-hero-media').screenshot({
      path: path.join(evidenceDirectory, 'live-site-orbit-active-desktop.png'),
    });
  }

  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(overflow.content).toBeLessThanOrEqual(overflow.viewport + 1);
  expect(runtimeErrors).toEqual([]);
});

test('the continuous circular live-site link respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/projects/areta', { waitUntil: 'networkidle' });

  const orbitLink = page.getByRole('link', { name: /Visit Areta live site/ });
  const orbitText = orbitLink.locator('.project-site-link-orbit-text');
  await orbitLink.scrollIntoViewIfNeeded();
  const beforeWait = await orbitText.evaluate(
    (element) => window.getComputedStyle(element).transform
  );
  await page.waitForTimeout(450);
  const afterWait = await orbitText.evaluate(
    (element) => window.getComputedStyle(element).transform
  );

  expect(afterWait).toBe(beforeWait);
});
