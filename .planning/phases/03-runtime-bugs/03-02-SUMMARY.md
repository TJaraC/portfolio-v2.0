---
phase: 03-runtime-bugs
plan: 02
subsystem: ui
tags: [react, hooks, memory-leaks, event-listeners, useEffect]

# Dependency graph
requires:
  - phase: 02-build-dependencies
    provides: TypeScript strict compliance and correct ReturnType<typeof setTimeout> pattern
provides:
  - removeEventListener en useResponsiveAnimations ahora usa referencia correcta (debouncedCheck)
  - useEffect de useLenisScroll con dep array [] (mount-only, no re-ejecuciones)
affects:
  - 03-runtime-bugs (BUG-03 y BUG-04 completados)
  - cualquier fase que toque hooks de scroll o animaciones responsive

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "addEventListener/removeEventListener deben usar la misma referencia de funcion"
    - "useEffect con dep array [] para effects que solo deben ejecutarse al mount"

key-files:
  created: []
  modified:
    - src/hooks/useResponsiveAnimations.ts
    - src/hooks/useLenisScroll.ts

key-decisions:
  - "BUG-03: removeEventListener debe referenciar debouncedCheck (misma referencia que addEventListener), no checkBreakpoint"
  - "BUG-04: dep array [] en useLenisScroll porque el callback referencia lenisInstance (modulo scope), no lenis (estado local)"
  - "Agregar eslint-disable-next-line react-hooks/exhaustive-deps como documentacion de la intencion explicita del dep array []"

patterns-established:
  - "Siempre verificar que addEventListener y removeEventListener reciben la misma referencia de funcion"
  - "useEffect con setLenis dentro del effect no debe incluir el estado como dependencia si el proposito es mount-only"

requirements-completed:
  - BUG-03
  - BUG-04

# Metrics
duration: 8min
completed: 2026-04-08
---

# Phase 3 Plan 02: Hook Memory Leaks Summary

**Dos memory leaks eliminados en hooks React: listener de resize nunca se eliminaba (referencia incorrecta), y dep array [lenis] causaba re-ejecuciones en bucle del useEffect de Lenis.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-08T12:00:00Z
- **Completed:** 2026-04-08T12:08:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- BUG-03: `window.removeEventListener('resize', debouncedCheck)` — la referencia coincide con el `addEventListener`, el listener se elimina correctamente al desmontar
- BUG-04: `useEffect(..., [])` en `useLenisScroll` — el effect se ejecuta solo al mount, el callback queda registrado sin re-ejecuciones en bucle
- Mantenido el patrón `ReturnType<typeof setTimeout>` de Phase 2 en la funcion debounce

## Task Commits

Cada tarea fue commiteada atomicamente:

1. **Task 1: BUG-03 — Corregir removeEventListener en useResponsiveAnimations** - `d07821c` (fix)
2. **Task 2: BUG-04 — Corregir dep array de useLenisScroll a []** - `6148c6b` (fix)

## Files Created/Modified

- `src/hooks/useResponsiveAnimations.ts` — `removeEventListener('resize', checkBreakpoint)` cambiado a `removeEventListener('resize', debouncedCheck)`
- `src/hooks/useLenisScroll.ts` — dep array del useEffect cambiado de `[lenis]` a `[]`, con eslint-disable comment

## Decisions Made

- Usar el mismo patrón de eslint-disable comment que recomienda el plan para documentar la intencion del dep array vacio — aunque el build script usa `tsc --noCheck` y no ejecuta eslint, el comentario sirve de documentacion explicita para futuros desarrolladores
- Revertir la regresion `NodeJS.Timeout` (que estaba en el working tree previo) de vuelta a `ReturnType<typeof setTimeout>` para mantener el fix de Phase 2

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Revertida regresion NodeJS.Timeout en debounce de useResponsiveAnimations**
- **Found during:** Task 1 (al leer el diff antes de commitear)
- **Issue:** El working tree del worktree tenia `NodeJS.Timeout` en lugar de `ReturnType<typeof setTimeout>` en la funcion debounce — regresion del trabajo de Phase 2
- **Fix:** Revertido a `ReturnType<typeof setTimeout>` para mantener la correccion de Phase 2 (TypeScript strict compliance)
- **Files modified:** `src/hooks/useResponsiveAnimations.ts`
- **Verification:** `git diff` muestra solo el cambio de BUG-03, no la regresion
- **Committed in:** d07821c (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — regresion de Phase 2 revertida)
**Impact on plan:** Correccion necesaria para mantener la integridad del trabajo previo. Sin scope creep.

## Issues Encountered

- El worktree fue creado desde un commit anterior (`88d9c33`) en lugar del base correcto (`7bd89f6`). Se realizo `git reset --soft` para reposicionar el branch en el base correcto antes de ejecutar los cambios del plan.
- El working tree del worktree contenia modificaciones previas (del trabajo anterior al reset). Se identificaron y se revirtio la regresion de `NodeJS.Timeout` antes de commitear.

## User Setup Required

None — no external service configuration required.

## Known Stubs

None — los cambios son correcciones de una linea cada uno. No se introdujeron datos hardcodeados ni placeholders.

## Next Phase Readiness

- BUG-03 y BUG-04 completados. El resize listener se elimina correctamente y el hook useLenisScroll ya no causa re-ejecuciones en bucle.
- Los planes 03-01 y 03-03 (ejecutandose en paralelo) cubren los otros bugs de la fase: RAF loop cancelable/popstate duplicado, y GSAP timeline leaks/Preloader timeout.
- Una vez los tres planes de fase 3 se mergeen, todos los requirements BUG-01 a BUG-06 deben estar completos.

---
*Phase: 03-runtime-bugs*
*Completed: 2026-04-08*
