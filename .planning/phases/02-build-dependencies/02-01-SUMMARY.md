---
phase: 02-build-dependencies
plan: 01
subsystem: infra
tags: [typescript, types, lenis, hooks, browser-api]

# Dependency graph
requires: []
provides:
  - TypeScript codebase compiles clean with tsc --noEmit (exit 0)
  - Prerequisite for switching build script from tsc --noCheck to tsc --noEmit (Plan 02-03)
affects:
  - 02-03-build-script

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout for browser-targeted TypeScript"
    - "Cast narrower ref types (HTMLDivElement) at usage site when hook returns broader type (HTMLElement)"

key-files:
  created: []
  modified:
    - src/hooks/useCarouselScroll.ts
    - src/hooks/useResponsiveAnimations.ts
    - src/App.tsx
    - src/components/ui/ImageWithCurtain.tsx

key-decisions:
  - "Use type cast (as RefObject<HTMLDivElement>) in ImageWithCurtain.tsx rather than making useScrollAnimation generic — minimal change, single file touched, satisfies compiler"
  - "Remove normalizeWheel from LenisOptions — option removed in Lenis v1.x API, no functional replacement needed"

patterns-established:
  - "Pattern 1: Browser-targeted hooks must use ReturnType<typeof setTimeout> — NodeJS.Timeout not available in lib: [ES2020, DOM, DOM.Iterable]"

requirements-completed: [BUILD-01]

# Metrics
duration: 8min
completed: 2026-04-08
---

# Phase 02 Plan 01: TypeScript Strict Compliance Summary

**Fixed all 4 tsc --noEmit errors: NodeJS.Timeout namespace in 2 hooks, normalizeWheel removed from LenisOptions, RefObject<HTMLElement> narrowed to HTMLDivElement in ImageWithCurtain**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-08T10:31:00Z
- **Completed:** 2026-04-08T10:39:18Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- `npx tsc --noEmit` now exits 0 with zero error lines (was 4 errors)
- NodeJS namespace dependency removed from 2 browser-targeted hooks
- Lenis constructor call corrected for Lenis v1.x API (normalizeWheel removed)
- RefObject type mismatch fixed in ImageWithCurtain without modifying the scroll hook
- `npm run build` continues to succeed

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix NodeJS.Timeout namespace errors in hooks** - `3abd689` (fix)
2. **Task 2: Fix LenisOptions and RefObject type errors in App.tsx and ImageWithCurtain.tsx** - `b0a4dd4` (fix)

## Files Created/Modified
- `src/hooks/useCarouselScroll.ts` - `NodeJS.Timeout` → `ReturnType<typeof setTimeout>` on line 15
- `src/hooks/useResponsiveAnimations.ts` - `NodeJS.Timeout` → `ReturnType<typeof setTimeout>` on line 98
- `src/App.tsx` - Removed `normalizeWheel: true` from Lenis constructor options object
- `src/components/ui/ImageWithCurtain.tsx` - Added `RefObject` import; cast `elementRef as RefObject<HTMLDivElement>` on ref prop

## Decisions Made
- Used a type cast (`as RefObject<HTMLDivElement>`) in ImageWithCurtain.tsx rather than making `useScrollAnimation` generic. This touches only one file, is safe (a div satisfies HTMLElement contract), and keeps the hook signature stable for all other consumers.
- No replacement for `normalizeWheel` — the Lenis v1.x API removed it with no direct substitute. The scroll behavior remains correct without it.

## Deviations from Plan

None — plan executed exactly as written. All 4 fixes applied to the exact files and lines specified.

## Issues Encountered

During git reset --soft to rebase onto the correct base commit, the git index had planning files staged for deletion (they existed in older commits but not in the expected base). These were inadvertently included in an intermediate commit (0299824). The actual source code hook fixes were committed cleanly in the final commits (3abd689, b0a4dd4). The planning files continue to exist in the main repository at `E:/tricio_s_application/.planning/`.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness
- Codebase is now type-correct; Plan 02-03 can switch the build script from `tsc --noCheck` to `tsc --noEmit`
- No blockers or concerns

---
*Phase: 02-build-dependencies*
*Completed: 2026-04-08*
