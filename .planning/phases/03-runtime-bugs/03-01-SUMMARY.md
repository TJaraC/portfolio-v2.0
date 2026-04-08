---
phase: 03-runtime-bugs
plan: 01
subsystem: ui
tags: [react, lenis, gsap, animation, memory-leak, event-listener]

# Dependency graph
requires:
  - phase: 02-build-dependencies
    provides: working build with tsc --noEmit and clean package.json
provides:
  - cancelable RAF loop in App.tsx (cancelAnimationFrame on cleanup)
  - single popstate handler across entire src/ (only App.tsx)
affects: [04-react-performance, 05-code-quality]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Store requestAnimationFrame return value in let rafId at useEffect scope for cancelability"
    - "Centralize window event listeners (popstate) in App.tsx only — not in page components"

key-files:
  created: []
  modified:
    - src/App.tsx
    - src/pages/Home/index.tsx
    - src/pages/Projects/ProjectsPage.tsx

key-decisions:
  - "Declare rafId outside initializeLenis but inside useEffect so both raf() and cleanup closure share the same variable"
  - "Remove popstate handlers from both Home and ProjectsPage — App.tsx handles popstate globally and completely"

patterns-established:
  - "RAF cancel pattern: let rafId declared at useEffect scope, assigned on both initial call and inside loop, cancelled in cleanup"
  - "Centralized event handling: window-level events belong in App.tsx, not page components"

requirements-completed: [BUG-01, BUG-02]

# Metrics
duration: 8min
completed: 2026-04-08
---

# Phase 3 Plan 01: RAF Cancelation and Popstate Deduplication Summary

**RAF loop made cancelable via rafId closure pattern; popstate listener deduplicated to App.tsx only — eliminating CPU ghost loop and handler race condition**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-08T19:12:00Z
- **Completed:** 2026-04-08T19:20:08Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- App.tsx RAF loop now stores return value of requestAnimationFrame in `rafId` (declared at useEffect scope) and calls `cancelAnimationFrame(rafId)` in cleanup — eliminates ghost RAF running indefinitely after unmount
- Removed popstate useEffect from Home/index.tsx — App.tsx was already the canonical handler
- Also removed popstate useEffect from ProjectsPage.tsx (discovered during verification, same bug) — now only 2 popstate references in all of src/, both in App.tsx

## Task Commits

Each task was committed atomically:

1. **Task 1: BUG-01 - RAF loop cancelable in App.tsx** - `1e396fb` (fix)
2. **Task 2: BUG-02 - Remove duplicate popstate listeners** - `dfe6d6d` (fix)

## Files Created/Modified
- `src/App.tsx` - Added `let rafId: number` at useEffect scope, assigned on `requestAnimationFrame` calls, `cancelAnimationFrame(rafId)` in cleanup
- `src/pages/Home/index.tsx` - Deleted popstate useEffect block (lines 44-75)
- `src/pages/Projects/ProjectsPage.tsx` - Deleted popstate useEffect block (Rule 2 deviation — same bug found during verification)

## Decisions Made
- `rafId` declared outside `initializeLenis` but inside `useEffect` so the cleanup closure can reference it — if declared inside `initializeLenis`, the cleanup scope would not see it
- Both Home and ProjectsPage popstate handlers removed, not just Home — plan mentioned 3 duplicate handlers in audit notes and verification criteria required exactly 2 lines (both in App.tsx)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Also removed popstate from ProjectsPage.tsx**
- **Found during:** Task 2 (popstate deduplication)
- **Issue:** Plan's acceptance criteria required `grep -rn "popstate" src/` to return exactly 2 lines (both in App.tsx). After removing from Home, grep still showed 2 additional lines in ProjectsPage.tsx — same duplicate pattern.
- **Fix:** Removed the identical popstate useEffect block from `src/pages/Projects/ProjectsPage.tsx`
- **Files modified:** src/pages/Projects/ProjectsPage.tsx
- **Verification:** `grep -rn "popstate" src/` returns exactly 2 lines, both in App.tsx
- **Committed in:** dfe6d6d (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 - missing critical)
**Impact on plan:** Required to satisfy plan's own acceptance criteria. No scope creep — ProjectsPage had the identical bug as Home.

## Issues Encountered
- Worktree was initialized from old base commit (88d9c33) instead of correct base (84bf132). Fixed with `git reset --soft 84bf132`. This caused staged index to contain diffs from earlier commits which were included in Task 1 commit — no functional impact as the working tree files were correct.

## Known Stubs
None — no stub values or placeholder text introduced.

## Threat Flags
None — changes reduce attack surface (fewer event listeners running simultaneously).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- BUG-01 and BUG-02 complete. Phase 3 wave 1 has 3 parallel plans (03-01, 03-02, 03-03).
- This plan's changes are isolated to scroll infrastructure — no impact on other wave 1 plans.
- After wave 1 merges: BUG-03 through BUG-06 remain for Phase 3 completion.

## Self-Check: PASSED

- FOUND: src/App.tsx
- FOUND: src/pages/Home/index.tsx
- FOUND: src/pages/Projects/ProjectsPage.tsx
- FOUND: .planning/phases/03-runtime-bugs/03-01-SUMMARY.md
- FOUND commit: 1e396fb (fix(03-01): make RAF loop cancelable in App.tsx)
- FOUND commit: dfe6d6d (fix(03-01): remove duplicate popstate listeners from Home and ProjectsPage)

---
*Phase: 03-runtime-bugs*
*Completed: 2026-04-08*
