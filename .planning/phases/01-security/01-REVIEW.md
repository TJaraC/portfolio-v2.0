---
phase: 01-security
reviewed: 2026-04-07T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - vercel.json
  - src/components/common/Header.tsx
  - src/components/common/Contact.tsx
  - src/hooks/useImageRotation.ts
  - vite.config.ts
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-07T00:00:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Five files were reviewed covering security headers, the main navigation component, the contact/footer component, an image rotation hook, and the Vite build config. No critical security vulnerabilities were found — the security headers added in `vercel.json` are a meaningful improvement. However, four warnings were identified: a stale closure bug in `Header.tsx` that causes incorrect theme detection under certain scroll conditions, an incorrect `window.open` usage for `mailto:` links in `Contact.tsx`, dev server binding to all network interfaces in `vite.config.ts`, and fragile magic-number timeouts in `Header.tsx`. Three informational items cover minor code quality issues.

---

## Warnings

### WR-01: Stale closure in `detectHeaderTheme` — theme may not update correctly

**File:** `src/components/common/Header.tsx:101`

**Issue:** `detectHeaderTheme` is defined as a plain function inside the component body (lines 55-104). It closes over `headerTheme` from the render scope at line 101 (`if (newTheme !== headerTheme)`). The scroll `useEffect` (lines 107-122) lists `[headerTheme]` as its dependency, which causes it to re-register the scroll listener each time the theme changes. While this means `detectHeaderTheme` is technically "fresh" after a theme update triggers a re-render, the real risk is that between the time a scroll event fires and the effect re-registers, there is a window where the captured `headerTheme` in the scroll listener closure is stale. This can cause the theme guard comparison (`newTheme !== headerTheme`) to use an outdated value, resulting in redundant `setHeaderTheme` calls or missed updates.

Additionally, the dependency on `headerTheme` in the scroll effect means the listener is torn down and re-added on every theme change, which creates unnecessary event listener churn during animated scroll sequences.

**Fix:** Extract the theme detection logic using a `useRef` to track the current theme without triggering re-registration, or wrap `detectHeaderTheme` in `useCallback` with the correct deps and include it in the effect's dependency array:

```tsx
// Option A: use a ref to avoid stale closure entirely
const headerThemeRef = useRef<'light' | 'dark'>('light');

const detectHeaderTheme = useCallback(() => {
  // ...same logic...
  const newTheme = lightPixels >= darkPixels ? 'light' : 'dark';
  if (newTheme !== headerThemeRef.current) {
    headerThemeRef.current = newTheme;
    setHeaderTheme(newTheme);
  }
}, []); // stable reference, no deps needed

useEffect(() => {
  detectHeaderTheme();
  window.addEventListener('scroll', detectHeaderTheme, { passive: true });
  return () => window.removeEventListener('scroll', detectHeaderTheme);
}, [detectHeaderTheme]); // effect only re-runs if detectHeaderTheme changes (never)
```

---

### WR-02: `window.open` used incorrectly for `mailto:` link

**File:** `src/components/common/Contact.tsx:63`

**Issue:** `window.open('mailto:triciojarac@gmail.com', '_self')` is called to open the user's email client. The `window.open` API is designed for URLs, not `mailto:` protocol handlers. When called with `_self` as the target, behavior is browser-dependent and inconsistent — some browsers will navigate away from the page or block the call as an unwanted popup. The correct approach for `mailto:` links is either a native `<a>` element or `window.location.href`.

```tsx
// Current (line 63):
onClick={() => window.open('mailto:triciojarac@gmail.com', '_self')}

// This can silently fail or produce unexpected navigation in some browsers
```

**Fix:** Use `window.location.href` for programmatic `mailto:` navigation, or replace the `<Button>` with a semantic `<a>` element:

```tsx
// Option A: programmatic
onClick={() => { window.location.href = 'mailto:triciojarac@gmail.com'; }}

// Option B: semantic anchor (preferred for accessibility)
<a
  href="mailto:triciojarac@gmail.com"
  className="footer-btn"
  rel="noopener noreferrer"
>
  EMAIL
</a>
```

---

### WR-03: Dev server binds to all network interfaces

**File:** `vite.config.ts:36`

**Issue:** `host: "0.0.0.0"` causes the Vite dev server to listen on all network interfaces, making the development server reachable from any device on the same network. This is not a production risk (this config only affects the dev server), but it exposes the local dev environment to other machines on the same network without authentication. On a shared network (coffee shop, co-working space), this is a meaningful exposure.

```ts
// Current (line 36):
host: "0.0.0.0",
```

**Fix:** Restrict to localhost unless cross-device testing is actively needed. If mobile device testing requires LAN access, keep it but document the intent:

```ts
// For local-only development:
host: "localhost",  // or simply omit — localhost is the default

// If LAN access for mobile testing is needed, document it:
host: "0.0.0.0",  // intentional: enables LAN access for mobile testing
```

---

### WR-04: Magic-number `setTimeout` delays are fragile

**File:** `src/components/common/Header.tsx:405,421,437`

**Issue:** Three mobile menu item click handlers use `setTimeout(() => scrollToSection(...), 150)` with a hardcoded 150ms delay. This is a timing assumption — the delay is intended to let the menu close animation complete before scrolling starts. If animation duration ever changes, these timeouts silently break (scroll fires before/during animation). The magic number is also duplicated across three identical patterns.

```tsx
// Lines 405, 421, 437 — same pattern repeated:
setTimeout(() => scrollToSection('about'), 150);
setTimeout(() => scrollToSection('work'), 150);
setTimeout(() => scrollToSection('contact'), 150);
```

**Fix:** Extract the delay into a named constant and co-locate it with the animation duration it depends on:

```tsx
// At the top of the component or in a constants file:
const MENU_CLOSE_ANIMATION_MS = 150; // matches mobile menu close animation duration

// Usage:
setTimeout(() => scrollToSection('about'), MENU_CLOSE_ANIMATION_MS);
```

---

## Info

### IN-01: CSP `'unsafe-inline'` for `script-src` and `style-src`

**File:** `vercel.json:14`

**Issue:** The Content-Security-Policy includes `'unsafe-inline'` for both `script-src` and `style-src`. This weakens XSS protection because it allows inline scripts and styles. For a React/Vite SPA with GSAP, this is common due to inline styles injected by animation libraries. However, it is worth documenting as a known trade-off.

`style-src 'unsafe-inline'` is required by GSAP (it sets inline CSS properties). `script-src 'unsafe-inline'` may be removable if no inline `<script>` tags are used — Vite bundles everything into files, not inline tags. A nonce-based approach would be more secure but requires server-side rendering integration.

**Fix:** Audit whether `'unsafe-inline'` is actually required for `script-src` (it likely is not for a pure Vite build). If no inline `<script>` tags exist, remove it from `script-src`:

```json
"script-src 'self'"
```

Leave `'unsafe-inline'` in `style-src` as GSAP requires it.

---

### IN-02: `localStorage` key uses a generic name

**File:** `src/hooks/useImageRotation.ts:15,27`

**Issue:** The localStorage key `'designerImageIndex'` is a generic string with no namespace prefix. If this application were to grow or embed third-party scripts, a key collision is possible. This is low risk for a portfolio SPA but is a code quality concern.

```ts
// Line 15:
const savedIndex = localStorage.getItem('designerImageIndex');
// Line 27:
localStorage.setItem('designerImageIndex', nextIndex.toString());
```

**Fix:** Namespace the key with a project prefix:

```ts
const LS_KEY = 'tjc:designerImageIndex';
const savedIndex = localStorage.getItem(LS_KEY);
localStorage.setItem(LS_KEY, nextIndex.toString());
```

---

### IN-03: Logo `div` used as interactive element without keyboard accessibility

**File:** `src/components/common/Header.tsx:299-316`

**Issue:** The logo is a `<div>` with an `onClick` handler and `cursor: pointer` style (lines 299-316). A `<div>` is not natively keyboard-focusable or announced as interactive to assistive technology. This means keyboard-only users and screen reader users cannot activate the logo to navigate home.

```tsx
// Lines 299-316:
<div
  className="logo"
  ref={logoRef}
  onClick={() => { ... }}
  style={{ cursor: 'pointer' }}
>
```

**Fix:** Replace with a `<button>` element (or an `<a>` tag if navigating to a URL):

```tsx
// If navigating to '/' from other pages:
<a href="/" className="logo" ref={logoRef as React.Ref<HTMLAnchorElement>}>
  <span className="logo-text">TJC</span>
</a>

// Or use a button with the existing onClick logic:
<button
  className="logo"
  ref={logoRef as React.Ref<HTMLButtonElement>}
  onClick={() => { ... }}
  aria-label="Go to homepage"
>
  <span className="logo-text">TJC</span>
</button>
```

---

_Reviewed: 2026-04-07T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
