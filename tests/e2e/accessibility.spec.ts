import { expect, test, type Page } from '@playwright/test';

// Keyboard, semantics and motion guarantees from the WCAG 2.2 AA audit.
// No axe dependency: these assertions cover the regressions that matter most here.

const skipPreloader = async (page: Page) => {
  await page.addInitScript(() => sessionStorage.setItem('hasVisitedHome', 'true'));
};

const focusedOutline = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return null;
    const styles = getComputedStyle(el);
    return { style: styles.outlineStyle, width: parseFloat(styles.outlineWidth) };
  });

test.describe('accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await skipPreloader(page);
  });

  test('home exposes landmarks, a skip link and readable control names', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(page.locator('main#main-content')).toHaveCount(1);
    await expect(page.getByRole('contentinfo')).toHaveCount(1);
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();

    // Slot-machine letters must not leak into accessible names ("WWOORRKK")
    const mainNav = page.getByRole('navigation', { name: 'Main' });
    await expect(mainNav.getByRole('link', { name: 'WORK', exact: true })).toBeVisible();
    await expect(mainNav.getByRole('link', { name: 'ABOUT', exact: true })).toBeVisible();
    await expect(mainNav.getByRole('link', { name: 'CONTACT', exact: true })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'BEHANCE (opens in a new tab)' }).first()
    ).toHaveAttribute('target', '_blank');
    await expect(page.locator('[role="menuitem"]')).toHaveCount(0);

    // Skip link is the first tab stop and moves focus into <main>
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toBeFocused();
    expect(await focusedOutline(page)).toMatchObject({ style: 'solid' });
    await page.keyboard.press('Enter');
    await expect(page.locator('main#main-content')).toBeFocused();

    // Hero switch: real switch semantics, operable with the keyboard
    const heroSwitch = page.getByRole('switch', { name: 'Product designer' });
    await expect(heroSwitch).toHaveAttribute('aria-checked', 'false');
    await heroSwitch.focus();
    await page.keyboard.press('Space');
    await expect(heroSwitch).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Creative Product Designer'
    );
  });

  test('project cards and next project are reachable and operable with the keyboard', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });

    const cardLink = page.getByRole('link', { name: 'Areta', exact: true });
    await expect(cardLink).toHaveAttribute('href', '/projects/areta');
    await cardLink.focus();
    await expect(cardLink).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/projects\/areta$/);

    // Route change moves focus to the new page heading and announces the title
    await expect(page.locator('#project-title')).toBeFocused();
    await expect(page.getByRole('status')).not.toBeEmpty();
    // Wait for the column curtain to finish before triggering another transition
    await expect(page.locator('body')).not.toHaveClass(/transition-active/);

    const nextProject = page.getByRole('link', { name: /^Next project:/ });
    await expect(nextProject).toHaveAttribute('href', /\/projects\/ultracamp$/);
    await nextProject.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/projects\/ultracamp$/);
  });

  test('mobile menu exposes its state, traps Tab and closes with Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });

    const toggle = page.getByRole('button', { name: 'Open menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();

    const closeToggle = page.getByRole('button', { name: 'Close menu' });
    await expect(closeToggle).toHaveAttribute('aria-expanded', 'true');
    const mobileNav = page.getByRole('navigation', { name: 'Mobile' });
    await expect(mobileNav.getByRole('link', { name: 'ABOUT' })).toBeFocused();

    // Tab cycles inside the menu instead of escaping to the page behind it
    for (let index = 0; index < 6; index += 1) await page.keyboard.press('Tab');
    const focusInsideMenu = await page.evaluate(() => {
      const active = document.activeElement;
      return Boolean(
        active &&
        (document.getElementById('mobile-menu')?.contains(active) ||
          active.classList.contains('hamburger-menu'))
      );
    });
    expect(focusInsideMenu).toBe(true);

    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
    await expect(page.locator('#mobile-menu')).toBeHidden();
  });

  test('404 keeps its navigation visible and inside landmarks', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    // Visit home first so Header.css is loaded (it used to override the 404 colours)
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.goto('/this-page-does-not-exist', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/404$/);

    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/404/);
    const workLink = page.getByRole('link', { name: 'WORK', exact: true });
    await expect(workLink).toHaveAttribute('href', '/#work');
    const color = await workLink.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(226, 225, 223)');
  });

  test('custom cursor never hides the native cursor without a fine pointer', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await skipPreloader(page);
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).not.toHaveClass(/has-custom-cursor/);
    await context.close();
  });
});

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('skips the preloader and the page transition curtain', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('.preloader')).toHaveCount(0);

    await page.getByRole('link', { name: 'Areta', exact: true }).click();
    await expect(page).toHaveURL(/\/projects\/areta$/);
    await expect(page.locator('body')).not.toHaveClass(/transition-active/);
    await expect(page.locator('#project-title')).toBeFocused();
  });

  test('philosophy marquee stays still', async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('hasVisitedHome', 'true'));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
      true
    );
    const row = page.locator('.philosophy-carousel-gsap').first();
    await page.waitForTimeout(300);
    const before = await row.evaluate((el) => getComputedStyle(el).transform);
    await page.waitForTimeout(600);
    const after = await row.evaluate((el) => getComputedStyle(el).transform);
    expect(after).toBe(before);
  });
});
