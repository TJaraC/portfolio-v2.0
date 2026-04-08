---
phase: "03-runtime-bugs"
plan: "03"
subsystem: "ui-components"
tags: ["gsap", "memory-leak", "timeline", "timeout", "cleanup"]
dependency_graph:
  requires: []
  provides: ["BUG-05", "BUG-06"]
  affects: ["src/components/ui/AnimatedContactHeading.tsx", "src/components/ui/NextProjectButton.tsx", "src/components/ui/Preloader.tsx"]
tech_stack:
  added: []
  patterns: ["hoverTl.current?.kill() before gsap.timeline()", "store timeout ID for clearTimeout in cleanup"]
key_files:
  created: []
  modified:
    - "src/components/ui/AnimatedContactHeading.tsx"
    - "src/components/ui/NextProjectButton.tsx"
    - "src/components/ui/Preloader.tsx"
decisions:
  - "Kill previous hoverTl before creating new timeline — prevents concurrent tweens on same elements"
  - "Do not cancel the inner 800ms timeout inside exitAnimation — it only runs as part of deliberate exit sequence (GA-04)"
metrics:
  duration: "~5 minutes"
  completed: "2026-04-08"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 3
---

# Phase 03 Plan 03: GSAP Timeline Leaks and Preloader Timeout Summary

**One-liner:** Kill previous GSAP timeline before creating a new one in hover handlers, and store the Preloader 4000ms timeout ID for cancellation on unmount.

## What Was Done

Fixed two categories of resource leak in GSAP-animated UI components:

1. **BUG-05 — Timeline accumulation in hover handlers** (AnimatedContactHeading, NextProjectButton): When a user hovered rapidly in/out, each mouse event created a new `gsap.timeline()` without killing the previous one. Multiple timelines would animate the same letter elements concurrently, causing visual glitches and unbounded memory growth. Fixed by adding `hoverTl.current?.kill()` as the first instruction inside `handleMouseEnter` and `handleMouseLeave` in both components.

2. **BUG-06 — Uncancellable Preloader exit timeout**: The 4000ms `setTimeout` that triggers `exitAnimation()` was fire-and-forget — if the component unmounted before 4 seconds elapsed (e.g., fast navigation), `exitAnimation` would run against a stale DOM, mutating refs and calling `onComplete` on an unmounted component. Fixed by capturing the return value in `exitTimeoutId` and calling `clearTimeout(exitTimeoutId)` in the useEffect cleanup.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | BUG-05: hoverTl.current?.kill() in hover handlers (2 components) | 3f839f3 |
| 2 | BUG-06: exitTimeoutId stored and cleared in Preloader cleanup | 14aabda |

## Verification Results

```
AnimatedContactHeading.tsx — hoverTl.current?.kill(): 3 occurrences
  line 69: handleMouseEnter
  line 88: handleMouseLeave
  line 121: useEffect cleanup

NextProjectButton.tsx — hoverTl.current?.kill(): 4 occurrences
  line 103: handleMouseEnter
  line 124: handleMouseLeave
  line 151: handleClick
  line 191: useEffect cleanup

Preloader.tsx — exitTimeoutId: 2 occurrences
  line 152: const exitTimeoutId = setTimeout(
  line 158: clearTimeout(exitTimeoutId)

npm run build: exit 0
```

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — both mitigations from the plan's threat register (T-03-03-01, T-03-03-02) were applied.

## Self-Check: PASSED

Files exist:
- src/components/ui/AnimatedContactHeading.tsx — FOUND (modified)
- src/components/ui/NextProjectButton.tsx — FOUND (modified)
- src/components/ui/Preloader.tsx — FOUND (modified)

Commits exist:
- 3f839f3 — FOUND
- 14aabda — FOUND
