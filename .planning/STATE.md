---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: planning
last_updated: "2026-04-08T20:15:47.296Z"
progress:
  total_phases: 7
  completed_phases: 4
  total_plans: 9
  completed_plans: 9
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-08)

**Core value:** El sitio debe ser seguro, libre de memory leaks y con un bundle optimizado — manteniendo exactamente el mismo diseño y experiencia visual.
**Current focus:** Phase 03 — runtime-bugs

---

## Current Phase

**Phase:** 4
**Name:** Runtime Bugs
**Goal:** Eliminar todos los memory leaks y race conditions: RAF loop cancelable, listener popstate deduplicado, cleanup de resize correcto, dep array estable de Lenis, timeline leaks en hover de GSAP, y timeout de inicialización cancelable.
**Status:** Ready to plan

### Open requirements

- [ ] BUG-01 — RAF loop cancelable con cancelAnimationFrame
- [ ] BUG-02 — Handler popstate deduplicado (solo en App.tsx)
- [ ] BUG-03 — Memory leak de useResponsiveAnimations corregido
- [ ] BUG-04 — useLenisScroll dep array corregido ([] en lugar de [lenis])
- [ ] BUG-05 — Timeline leaks en hover GSAP corregidos
- [ ] BUG-06 — Timeout cancelable en Preloader

### Success criteria

1. Cleanup del RAF en App.tsx llama cancelAnimationFrame(rafId).
2. Búsqueda de `popstate` en src/ devuelve exactamente un resultado, en App.tsx.
3. Cleanup de useResponsiveAnimations referencia debouncedCheck en removeEventListener.
4. Effect de useLenisScroll tiene [] como dep array; hover handlers llaman timeline.kill().

---

## Phase Progress

| Phase | Name | Requirements | Status |
|-------|------|-------------|--------|
| 0 | Branch & Infra | INFRA-01, INFRA-02 | ✓ Complete (2026-04-07) |
| 1 | Security | SEC-01–SEC-05 | ✓ Complete (2026-04-07) |
| 2 | Build & Dependencies | BUILD-01–BUILD-05 | ✓ Complete (2026-04-08) |
| 3 | Runtime Bugs | BUG-01–BUG-06 | Ready to plan |
| 4 | React & Performance | PERF-01–PERF-07 | Not started |
| 5 | Code Quality & Dead Code | CODE-01–CODE-13 | Not started |
| 6 | Accessibility | A11Y-01–A11Y-03 | Not started |

**Overall:** 14 / 38 requirements complete (37%)

---

## Requirement Status

| Req | Phase | Done |
|-----|-------|------|
| INFRA-01 | 0 | [x] |
| INFRA-02 | 0 | [x] |
| SEC-01 | 1 | [x] |
| SEC-02 | 1 | [x] |
| SEC-03 | 1 | [x] |
| SEC-04 | 1 | [x] |
| SEC-05 | 1 | [x] |
| BUILD-01 | 2 | [x] |
| BUILD-02 | 2 | [x] |
| BUILD-03 | 2 | [x] |
| BUILD-04 | 2 | [x] |
| BUILD-05 | 2 | [x] |
| BUG-01 | 3 | [ ] |
| BUG-02 | 3 | [ ] |
| BUG-03 | 3 | [ ] |
| BUG-04 | 3 | [ ] |
| BUG-05 | 3 | [ ] |
| BUG-06 | 3 | [ ] |
| PERF-01 | 4 | [ ] |
| PERF-02 | 4 | [ ] |
| PERF-03 | 4 | [ ] |
| PERF-04 | 4 | [ ] |
| PERF-05 | 4 | [ ] |
| PERF-06 | 4 | [ ] |
| PERF-07 | 4 | [ ] |
| CODE-01 | 5 | [ ] |
| CODE-02 | 5 | [ ] |
| CODE-03 | 5 | [ ] |
| CODE-04 | 5 | [ ] |
| CODE-05 | 5 | [ ] |
| CODE-06 | 5 | [ ] |
| CODE-07 | 5 | [ ] |
| CODE-08 | 5 | [ ] |
| CODE-09 | 5 | [ ] |
| CODE-10 | 5 | [ ] |
| CODE-11 | 5 | [ ] |
| CODE-12 | 5 | [ ] |
| CODE-13 | 5 | [ ] |
| A11Y-01 | 6 | [ ] |
| A11Y-02 | 6 | [ ] |
| A11Y-03 | 6 | [ ] |

---

## Notes

- Work branch: fix/audit-2026-04
- No design changes — CSS, layouts, colors, typography must remain identical
- No Claude co-author in commits
- config.json mode: yolo (auto-approve), granularity: standard
- Milestone complete when all 38 requirements are checked and `npm run build` exits 0 on the fix branch
