# Roadmap: tricio_s_application — Audit Fix

**Milestone:** fix/audit-2026-04
**Defined:** 2026-04-07
**Total phases:** 7
**Total requirements:** 38
**Coverage:** 38/38 ✓

---

## Phases

### Phase 0: Branch & Infra
**Goal:** Establecer la rama de trabajo aislada y reforzar las reglas de ignore del repositorio para que ningún secreto ni artefacto generado pueda ser commitado accidentalmente.
**Requirements:** INFRA-01, INFRA-02
**Plans:** 1 plan
**UI hint:** no

Plans:
- [x] 00-01-PLAN.md — Verify branch and update .gitignore with env file patterns

**Success criteria:**
1. `git branch --list fix/audit-2026-04` devuelve la rama y está checked out.
2. `git check-ignore -v .env` imprime `.gitignore` — el archivo está cubierto.
3. `git check-ignore -v dist/index.html` imprime `.gitignore` — `dist/` está cubierto.
4. `git check-ignore -v .planning/PROJECT.md` imprime `.gitignore` — `.planning/` está cubierto.

---

### Phase 1: Security
**Goal:** Eliminar toda exposición de seguridad: secrets sin proteger, headers HTTP ausentes, popups cross-origin inseguros, lecturas de localStorage sin validar, y console.log en bundles de producción.
**Requirements:** SEC-01, SEC-02, SEC-03, SEC-04, SEC-05
**Plans:** 2 plans
**UI hint:** no

Plans:
- [x] 01-01-PLAN.md — Add HTTP security headers to vercel.json and fix window.open noopener calls
- [x] 01-02-PLAN.md — Fix localStorage parseInt validation in useImageRotation and enable drop_console in vite.config.ts

**Success criteria:**
1. `vercel.json` contiene `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y `Strict-Transport-Security` — verificable inspeccionando el archivo.
2. Búsqueda de `window.open` en `src/` devuelve cero resultados sin `'noopener,noreferrer'` como tercer argumento.
3. `useImageRotation` llama `parseInt(value, 10)` y guarda contra `NaN` antes de usar el valor almacenado.
4. `vite.config.ts` terserOptions incluye `drop_console: true`; `npm run build` produce un bundle sin ningún `console.log`.

---

### Phase 2: Build & Dependencies
**Goal:** Hacer el build de producción type-safe, reducir el peso del bundle eliminando dependencias no usadas, separar GSAP en su propio chunk, y eliminar las advertencias de fuentes en el build.
**Requirements:** BUILD-01, BUILD-02, BUILD-03, BUILD-04, BUILD-05
**Plans:** 3 plans
**UI hint:** no

Plans:
- [ ] 02-01-PLAN.md — Fix 4 TypeScript errors so tsc --noEmit exits 0 (prerequisite for BUILD-01)
- [ ] 02-02-PLAN.md — Add GSAP manual chunk to vite.config.ts and add missing Geist font files
- [ ] 02-03-PLAN.md — Update build script to tsc --noEmit and remove recharts + prop-types

**Success criteria:**
1. `npm run build` finaliza con código 0 y `tsc --noEmit` completa sin errores antes de que Vite corra — confirmado por la secuencia del log de build.
2. `package.json` no contiene `recharts` ni `prop-types` en ninguna sección de dependencias; `npm install` limpio.
3. `npm run build` produce un chunk `dist/assets/gsap-*.js`; el chunk principal de entrada es ≤ 250 KB gzip.
4. `npm run build` no produce líneas con `Could not resolve` o `Failed to load` para archivos de fuente Geist.

---

### Phase 3: Runtime Bugs
**Goal:** Eliminar todos los memory leaks y race conditions: RAF loop cancelable, listener popstate deduplicado, cleanup de resize correcto, dep array estable de Lenis, timeline leaks en hover de GSAP, y timeout de inicialización cancelable.
**Requirements:** BUG-01, BUG-02, BUG-03, BUG-04, BUG-05, BUG-06
**UI hint:** no
**Success criteria:**
1. El cleanup del RAF en `App.tsx` llama `cancelAnimationFrame(rafId)` donde `rafId` es el valor retornado por el último `requestAnimationFrame` — verificable por inspección de código.
2. Búsqueda de `popstate` en `src/` devuelve exactamente un resultado, en `App.tsx`.
3. La función de cleanup de `useResponsiveAnimations` referencia `debouncedCheck` (no `checkBreakpoint`) en su llamada a `removeEventListener`.
4. El effect de `useLenisScroll` tiene `[]` como dep array; `AnimatedContactHeading` y `NextProjectButton` llaman `timeline.kill()` antes de crear uno nuevo en hover.

---

### Phase 4: React & Performance
**Goal:** Estabilizar referencias de callback para prevenir destrucción innecesaria de observers, habilitar code splitting a nivel de ruta, arreglar la integración Lenis/ScrollTrigger, y eliminar el thrash de DOM y creación de tweens por scroll event.
**Requirements:** PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06, PERF-07
**UI hint:** no
**Success criteria:**
1. `Routes.tsx` envuelve `handlePreloaderComplete` en `useCallback`; `AnimatedElement` envuelve `animationCallback` en `useCallback` — verificable por inspección de código.
2. `Routes.tsx` usa `React.lazy(() => import(...))` para las páginas y las envuelve en `<Suspense>` — DevTools Network muestra chunks JS separados en la primera navegación.
3. El código de inicialización de scroll incluye `lenis.on('scroll', ScrollTrigger.update)` — verificable por inspección de código.
4. `detectHeaderTheme` en `Header.tsx` está envuelto en throttle o debounce; el tween de logo GSAP usa `overwrite: true` o reutiliza una referencia de tween existente en lugar de crear uno nuevo por scroll event.

---

### Phase 5: Code Quality & Dead Code
**Goal:** Eliminar todo el código muerto, duplicaciones, extraer constantes y utilidades compartidas, y reemplazar keys de lista basadas en índice por keys basadas en valor — sin exports inalcanzables ni números mágicos para la altura del header.
**Requirements:** CODE-01, CODE-02, CODE-03, CODE-04, CODE-05, CODE-06, CODE-07, CODE-08, CODE-09, CODE-10, CODE-11, CODE-12, CODE-13
**UI hint:** no
**Success criteria:**
1. `src/types/Home.tsx` no existe; búsqueda de `useParallaxEffect` y `currentImageIndex` (como return value) en `src/` devuelve cero resultados; `currentBreakpoint` y el `console.log` de breakpoint están ausentes de `Home/index.tsx`.
2. `src/utils/easing.ts` existe y exporta la función easing; la lambda inline `(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))` aparece cero veces en `src/` (los 4 archivos que la usaban importan desde la utilidad).
3. `Header.tsx` usa `useNavigate` para la navegación del click del logo; `Header.tsx` y los otros consumidores comparten una constante nombrada para el valor `80` de altura del header.
4. `ProjectCase.tsx` renderiza los bloques de design process via `.map()` sobre un array; `ProjectCase.tsx` y `ProjectCard.tsx` usan `key` props basadas en valor en todos los list renders.

---

### Phase 6: Accessibility
**Goal:** Hacer los controles de logo y "back to top" completamente navegables por teclado con roles ARIA correctos y labels, y actualizar el año del copyright a 2026.
**Requirements:** A11Y-01, A11Y-02, A11Y-03
**UI hint:** no
**Success criteria:**
1. El elemento logo en `Header.tsx` es un `<button>` o `<a>` con `aria-label` explícito y alcanzable via navegación Tab — verificable por test de teclado manual e inspección de código.
2. El elemento "Back to top" en `Contact.tsx` tiene `role="button"`, `tabIndex={0}` y un handler `onKeyDown` que se dispara en Enter/Space.
3. `Contact.tsx` muestra "© 2026" — verificable por inspección visual y búsqueda de `2025`.

---

## Requirement Coverage

| Req | Phase | Category |
|-----|-------|----------|
| INFRA-01 | 0 | Infra |
| INFRA-02 | 0 | Infra |
| SEC-01 | 1 | Security |
| SEC-02 | 1 | Security |
| SEC-03 | 1 | Security |
| SEC-04 | 1 | Security |
| SEC-05 | 1 | Security |
| BUILD-01 | 2 | Build |
| BUILD-02 | 2 | Build |
| BUILD-03 | 2 | Build |
| BUILD-04 | 2 | Build |
| BUILD-05 | 2 | Build |
| BUG-01 | 3 | Bugs |
| BUG-02 | 3 | Bugs |
| BUG-03 | 3 | Bugs |
| BUG-04 | 3 | Bugs |
| BUG-05 | 3 | Bugs |
| BUG-06 | 3 | Bugs |
| PERF-01 | 4 | Perf |
| PERF-02 | 4 | Perf |
| PERF-03 | 4 | Perf |
| PERF-04 | 4 | Perf |
| PERF-05 | 4 | Perf |
| PERF-06 | 4 | Perf |
| PERF-07 | 4 | Perf |
| CODE-01 | 5 | Code |
| CODE-02 | 5 | Code |
| CODE-03 | 5 | Code |
| CODE-04 | 5 | Code |
| CODE-05 | 5 | Code |
| CODE-06 | 5 | Code |
| CODE-07 | 5 | Code |
| CODE-08 | 5 | Code |
| CODE-09 | 5 | Code |
| CODE-10 | 5 | Code |
| CODE-11 | 5 | Code |
| CODE-12 | 5 | Code |
| CODE-13 | 5 | Code |
| A11Y-01 | 6 | A11y |
| A11Y-02 | 6 | A11y |
| A11Y-03 | 6 | A11y |

---

## Dependency Order Rationale

```
Phase 0 (Infra)     → must be first; all work happens on the branch it creates
Phase 1 (Security)  → no code deps; high risk if deferred; .env fix needed before any commit
Phase 2 (Build)     → type checking must pass before refactors in later phases catch TS errors
Phase 3 (Bugs)      → memory-leak fixes in App.tsx / hooks before adding useCallback wrappers
Phase 4 (Perf)      → depends on stable hooks from Phase 3; lazy routes need clean build from Phase 2
Phase 5 (Code)      → dead-code removal safest after all fixes are in (no accidental removal)
Phase 6 (A11y)      → purely additive; safe last; no cross-phase deps
```

---
*Roadmap defined: 2026-04-07*
*Branch: fix/audit-2026-04*
