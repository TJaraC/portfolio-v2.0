# tricio_s_application — Audit Fix Milestone

## What This Is

Portfolio SPA de Patricio Jaramillo Castrillo (hellotjc.com). React 18 + TypeScript + Vite 5 con animaciones GSAP/ScrollTrigger y Lenis smooth scroll. Este milestone corrige todos los issues encontrados en la auditoría técnica del 2026-04-07: seguridad, calidad de código, rendimiento y accesibilidad, sin tocar el diseño visual.

## Core Value

El sitio debe ser seguro, libre de memory leaks y con un bundle optimizado — manteniendo exactamente el mismo diseño y experiencia visual.

## Requirements

### Validated

- ✓ Portfolio SPA con React 18 + TypeScript — existente
- ✓ Animaciones GSAP (ScrollTrigger, timelines) — existente
- ✓ Lenis smooth scroll — existente
- ✓ Preloader animado — existente
- ✓ Proyectos cargados desde JSON estático — existente
- ✓ Rutas: Home, /projects/:id, 404 — existente
- ✓ Deploy en Vercel — existente
- ✓ .env añadido a .gitignore — Phase 0: branch-infra (INFRA-01, INFRA-02)
- ✓ Rama separada de trabajo: fix/audit-2026-04 — Phase 0: branch-infra
- ✓ Headers de seguridad en vercel.json (CSP, X-Frame-Options, HSTS...) — Phase 1: security (SEC-01, SEC-02)
- ✓ window.open con noopener,noreferrer en todos los call sites — Phase 1: security (SEC-03)
- ✓ localStorage validado con parseInt radix 10 + NaN guard — Phase 1: security (SEC-04)
- ✓ drop_console: true en terserOptions — Phase 1: security (SEC-05)
- ✓ Build script corregido: tsc --noEmit en lugar de --noCheck — Phase 2: build-dependencies (BUILD-01)
- ✓ recharts y prop-types eliminados del package.json — Phase 2: build-dependencies (BUILD-02, BUILD-03)
- ✓ GSAP en manualChunks en Vite (chunk separado) — Phase 2: build-dependencies (BUILD-04)
- ✓ Geist font files añadidos (sin advertencias de build) — Phase 2: build-dependencies (BUILD-05)
- ✓ RAF loop cancelable con cancelAnimationFrame — Phase 3: runtime-bugs (BUG-01)
- ✓ Handler popstate deduplicado (solo en App.tsx) — Phase 3: runtime-bugs (BUG-02)
- ✓ Memory leak de useResponsiveAnimations corregido (listener correcto) — Phase 3: runtime-bugs (BUG-03)
- ✓ useLenisScroll dep array corregido ([] en lugar de [lenis]) — Phase 3: runtime-bugs (BUG-04)
- ✓ Memory leaks de timelines GSAP en hover (AnimatedContactHeading, NextProjectButton) — Phase 3: runtime-bugs (BUG-05)
- ✓ Preloader timeout cancelable (exitTimeoutId + clearTimeout) — Phase 3: runtime-bugs (BUG-06)

### Active
- [ ] handlePreloaderComplete estabilizado con useCallback
- [ ] animationCallback estabilizado con useCallback en AnimatedElement
- [ ] Lazy loading de rutas con React.lazy + Suspense
- [ ] ScrollTrigger integrado con Lenis (via lenis.on scroll → ScrollTrigger.update)
- [ ] useProjectsList: sequential await → Promise.allSettled
- [ ] Estado muerto en Preloader (usedWords, currentWords → useRef)
- [ ] Rutas en Routes.tsx con lógica deduplicada
- [ ] window.location.href → useNavigate donde corresponde
- [ ] Easing function extraída a utilidad compartida
- [ ] ErrorBoundary añadido al árbol de componentes
- [ ] key={index} → key por valor en listas dinámicas
- [ ] Eliminar código muerto (useParallaxEffect, currentImageIndex, tipos Home.tsx)
- [ ] loading="lazy" y width/height en imágenes
- [ ] Logo y back-to-top accesibles por teclado (role, tabIndex)
- [ ] Copyright actualizado a 2026
- [ ] ProjectCase.tsx: 6 bloques repetidos → array mapeado

### Out of Scope

- Cambios de diseño visual — el objetivo es solo calidad técnica
- Reescritura completa del sistema de scroll — mantener Lenis + GSAP
- Migración a React 19 o Vite 6 — riesgo de breaking changes
- Añadir tests automatizados — fuera del alcance de este milestone
- Implementar un contact form con backend — cambio de arquitectura

## Context

Auditoría técnica completada el 2026-04-07. Stack: React 18.3.1 + TypeScript 5.7 + Vite 5.4 + GSAP 3.13 + Lenis 1.3.8. Deploy en Vercel con SPA rewrite. Build produce un chunk principal de 344 KB (gzip 115 KB) porque GSAP no está separado. El build script usa `tsc --noCheck` que deshabilita completamente el type checking en producción.

**Archivos críticos:**
- src/App.tsx — Lenis init, RAF loop, popstate handler
- src/Routes.tsx — BrowserRouter, Preloader logic
- src/hooks/useLenisScroll.ts — singleton global mutable
- src/components/common/Header.tsx — scroll listeners, theme detection
- src/components/ui/Preloader.tsx — estado muerto, sin cancel de timers
- src/components/ui/AnimatedElement.tsx — animationCallback sin useCallback
- src/components/ui/AnimatedContactHeading.tsx / NextProjectButton.tsx — timeline leaks
- src/hooks/useResponsiveAnimations.ts — listener leak
- vite.config.ts — code splitting insuficiente
- vercel.json — sin headers de seguridad
- .gitignore — .env no incluido

## Constraints

- **Diseño**: Cero cambios visuales — CSS, layouts, colores, tipografía intactos
- **Stack**: Mantener React 18, Vite 5, GSAP, Lenis — no upgrades de versión mayor
- **Rama**: Todo el trabajo en `fix/audit-2026-04`, nunca en `main` directamente
- **Commits**: Sin co-autor de Claude. Commits limpios del autor del proyecto
- **Compatibilidad**: El sitio debe seguir funcionando exactamente igual después

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Rama separada fix/audit-2026-04 | No romper main, permite revisión antes de merge | ✓ En uso |
| Mantener Lenis + GSAP, arreglar integración | Reescribir el scroll system sería excesivo | — Pending |
| Promise.allSettled en lugar de loop await | Carga paralela de 4 JSONs independientes | — Pending |
| useCallback para callbacks críticos | Evitar destruction de observers en cada render | — Pending |
| ReturnType<typeof setTimeout> en hooks | NodeJS.Timeout no disponible en lib: [ES2020, DOM] | ✓ Aplicado Phase 2 |
| Cast as RefObject<HTMLDivElement> en ImageWithCurtain | Cambio mínimo, un solo archivo, satisface el compiler | ✓ Aplicado Phase 2 |
| Fuentes Geist en public/fonts (woff2) | Build warnings eliminados sin modificar CSS | ✓ Aplicado Phase 2 |

---
*Last updated: 2026-04-08 — Phase 3 (runtime-bugs) complete*

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
