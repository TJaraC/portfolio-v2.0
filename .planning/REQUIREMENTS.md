# Requirements: tricio_s_application — Audit Fix

**Defined:** 2026-04-07
**Core Value:** El sitio debe ser seguro, libre de memory leaks y con un bundle optimizado — manteniendo exactamente el mismo diseño y experiencia visual.

## v1 Requirements

### Security

- [ ] **SEC-01**: `.env` está en `.gitignore` y no se puede commitear accidentalmente
- [ ] **SEC-02**: `vercel.json` incluye headers de seguridad: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS
- [ ] **SEC-03**: Todos los `window.open('_blank')` usan `'noopener,noreferrer'` como tercer argumento (6 call sites: Header.tsx ×4, Contact.tsx ×2)
- [ ] **SEC-04**: `localStorage` en `useImageRotation` valida y sanitiza el valor antes de usarlo con parseInt
- [ ] **SEC-05**: `drop_console: true` en terserOptions — ningún console.log en producción

### Build & TypeScript

- [ ] **BUILD-01**: Script `build` usa `tsc --noEmit && vite build` (type checking activo en producción)
- [ ] **BUILD-02**: `recharts` eliminado del `package.json` (dependencia no usada, ~500KB)
- [ ] **BUILD-03**: `prop-types` eliminado del `package.json` (redundante con TypeScript)
- [ ] **BUILD-04**: GSAP y `@gsap/react` añadidos a `manualChunks` en `vite.config.ts` como chunk separado
- [ ] **BUILD-05**: Advertencias de fuente resueltas en build (`Geist-Regular.woff2`, `Geist-Medium.woff2`)

### Runtime Bugs (Memory Leaks & Race Conditions)

- [ ] **BUG-01**: RAF loop en `App.tsx` almacena el ID y llama `cancelAnimationFrame` en cleanup
- [ ] **BUG-02**: Handler `popstate` existe en un solo lugar (`App.tsx`); eliminado de `Home/index.tsx` y `ProjectsPage.tsx`
- [ ] **BUG-03**: `useResponsiveAnimations` cleanup elimina `debouncedCheck` (no `checkBreakpoint`) — memory leak corregido
- [ ] **BUG-04**: `useLenisScroll` tiene `[]` como dep array en lugar de `[lenis]` — storm de callbacks corregido
- [ ] **BUG-05**: Timelines GSAP en `AnimatedContactHeading` y `NextProjectButton` llaman `.kill()` antes de crear uno nuevo en cada hover
- [ ] **BUG-06**: `setTimeout` sin cancelar en `App.tsx` (initializeLenis) almacenados en refs para poder cancelarlos en cleanup

### React & Performance

- [ ] **PERF-01**: `handlePreloaderComplete` en `Routes.tsx` envuelto en `useCallback`
- [ ] **PERF-02**: `animationCallback` en `AnimatedElement` estabilizado con `useCallback` en todos los call sites
- [ ] **PERF-03**: `useProjectsList` carga proyectos con `Promise.allSettled` en lugar de `await` secuencial en loop
- [ ] **PERF-04**: Rutas en `Routes.tsx` usan `React.lazy` + `Suspense` (lazy loading de páginas)
- [ ] **PERF-05**: ScrollTrigger integrado con Lenis: `lenis.on('scroll', ScrollTrigger.update)` y `ScrollTrigger.refresh()` donde corresponde
- [ ] **PERF-06**: `detectHeaderTheme` en `Header.tsx` deja de llamar `getBoundingClientRect()` ×6 en cada scroll event sin throttle — añadir debounce o throttle
- [ ] **PERF-07**: Logo GSAP tween en scroll reutiliza tween existente con `overwrite: true` en lugar de crear uno nuevo por evento

### Code Quality & Dead Code

- [ ] **CODE-01**: Estado muerto en `Preloader.tsx` convertido a refs: `usedWords` → `useRef<string[]>`, `currentWords` → eliminado (no se usa en JSX)
- [ ] **CODE-02**: Lógica duplicada en `Routes.tsx` (useState + useEffect mismo código) — useEffect eliminado, lógica solo en useState lazy initializer
- [ ] **CODE-03**: `window.location.href = '/'` en `Header.tsx` reemplazado por `useNavigate` de React Router
- [ ] **CODE-04**: Función easing `(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))` extraída a `src/utils/easing.ts` y referenciada desde los 4 archivos
- [ ] **CODE-05**: `src/types/Home.tsx` con interfaz `ProjectCard` muerta — eliminado el archivo
- [ ] **CODE-06**: `useParallaxEffect` export muerto en `useLenisScroll.ts` — eliminado
- [ ] **CODE-07**: `currentImageIndex` retornado por `useImageRotation` pero nunca consumido — eliminado del return
- [ ] **CODE-08**: `currentBreakpoint` declarado en `Home/index.tsx` pero nunca usado — eliminado
- [ ] **CODE-09**: `console.log` de breakpoint en `Home/index.tsx` eliminado
- [ ] **CODE-10**: `ProjectsPage.tsx` — useEffect duplicado que llama `lenis.start()` eliminado
- [ ] **CODE-11**: `ProjectCase.tsx` — 6 bloques idénticos de design process refactorizados en un array mapeado
- [ ] **CODE-12**: Constante mágica `80` (header height) extraída a constante compartida en ambos archivos
- [ ] **CODE-13**: `key={index}` reemplazado por key basada en valor en `ProjectCase.tsx` y `ProjectCard.tsx`

### Accessibility

- [x] **A11Y-01**: Logo en `Header.tsx` convertido a `<button>` o `<a>` con `tabIndex`, `role` y `aria-label`
- [x] **A11Y-02**: "Back to top" en `Contact.tsx` accesible por teclado (`tabIndex`, `role="button"`, `onKeyDown`)
- [x] **A11Y-03**: Copyright en `Contact.tsx` actualizado de "© 2025" a "© 2026"

### Branch & Infra

- [ ] **INFRA-01**: Rama `fix/audit-2026-04` creada desde `main` para aislar todo el trabajo
- [ ] **INFRA-02**: `.gitignore` incluye `.env`, `.env.local`, `dist/`, `.planning/`

## v2 Requirements

### Performance (deferred)

- **PERF-V2-01**: `React.memo` en componentes UI para evitar re-renders innecesarios
- **PERF-V2-02**: `<picture>` element con `srcset` WebP + fallback en todas las imágenes
- **PERF-V2-03**: `will-change` aplicado solo a elementos dentro del viewport (IntersectionObserver)
- **PERF-V2-04**: `width` y `height` explícitos en todas las imágenes para evitar CLS

### Architecture (deferred)

- **ARCH-V2-01**: Reemplazar singleton global Lenis con React Context
- **ARCH-V2-02**: `ErrorBoundary` por ruta para catch de errores de render
- **ARCH-V2-03**: Validación de schema en imports dinámicos de JSON (zod o manual)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cambios de diseño visual | Solo calidad técnica en este milestone |
| Reescritura del sistema de scroll | Demasiado riesgo, mantener Lenis + GSAP |
| Tests automatizados | Fuera del alcance actual |
| Contact form con backend | Cambio de arquitectura, no es un fix |
| Upgrade React 19 / Vite 6 | Breaking changes, riesgo alto |
| Añadir analytics (GA) | Cambio de funcionalidad, no un fix |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 0 | Pending |
| INFRA-02 | Phase 0 | Pending |
| SEC-01 | Phase 1 | Pending |
| SEC-02 | Phase 1 | Pending |
| SEC-03 | Phase 1 | Pending |
| SEC-04 | Phase 1 | Pending |
| SEC-05 | Phase 1 | Pending |
| BUILD-01 | Phase 2 | Pending |
| BUILD-02 | Phase 2 | Pending |
| BUILD-03 | Phase 2 | Pending |
| BUILD-04 | Phase 2 | Pending |
| BUILD-05 | Phase 2 | Pending |
| BUG-01 | Phase 3 | Pending |
| BUG-02 | Phase 3 | Pending |
| BUG-03 | Phase 3 | Pending |
| BUG-04 | Phase 3 | Pending |
| BUG-05 | Phase 3 | Pending |
| BUG-06 | Phase 3 | Pending |
| PERF-01 | Phase 4 | Pending |
| PERF-02 | Phase 4 | Pending |
| PERF-03 | Phase 4 | Pending |
| PERF-04 | Phase 4 | Pending |
| PERF-05 | Phase 4 | Pending |
| PERF-06 | Phase 4 | Pending |
| PERF-07 | Phase 4 | Pending |
| CODE-01 | Phase 5 | Pending |
| CODE-02 | Phase 5 | Pending |
| CODE-03 | Phase 5 | Pending |
| CODE-04 | Phase 5 | Pending |
| CODE-05 | Phase 5 | Pending |
| CODE-06 | Phase 5 | Pending |
| CODE-07 | Phase 5 | Pending |
| CODE-08 | Phase 5 | Pending |
| CODE-09 | Phase 5 | Pending |
| CODE-10 | Phase 5 | Pending |
| CODE-11 | Phase 5 | Pending |
| CODE-12 | Phase 5 | Pending |
| CODE-13 | Phase 5 | Pending |
| A11Y-01 | Phase 6 | Complete |
| A11Y-02 | Phase 6 | Complete |
| A11Y-03 | Phase 6 | Complete |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-07*
*Last updated: 2026-04-07 after audit initialization*
