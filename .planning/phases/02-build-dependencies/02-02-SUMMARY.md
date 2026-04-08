---
phase: 02-build-dependencies
plan: 02
subsystem: infra
tags: [vite, rollup, gsap, fonts, woff2, manual-chunks, build-optimization]

requires:
  - phase: 01-security
    provides: vite.config.ts with drop_console:true and terser already configured

provides:
  - GSAP isolated in a separate rollup chunk (gsap-*.js, ~77 KB)
  - Main entry bundle reduced from 342.74 KB to 264.99 KB
  - Geist-Regular.woff2 and Geist-Medium.woff2 present in public/fonts/
  - Zero font resolution warnings at build time

affects: [03-runtime-bugs, 04-react-performance]

tech-stack:
  added: []
  patterns:
    - "manualChunks in rollupOptions separates heavy libraries into lazily-loadable JS chunks"

key-files:
  created:
    - public/fonts/Geist-Regular.woff2
    - public/fonts/Geist-Medium.woff2
  modified:
    - vite.config.ts

key-decisions:
  - "Downloaded real woff2 files from official vercel/geist-font repo (MIT license); stub fallback not needed"
  - "GSAP chunk keyed as 'gsap' with both 'gsap' and '@gsap/react' to ensure @gsap/react is not left in main bundle"

patterns-established:
  - "Pattern: separate vendor chunks for large animation libraries (lenis, gsap) in manualChunks"

requirements-completed: [BUILD-04, BUILD-05]

duration: 15min
completed: 2026-04-08
---

# Phase 02 Plan 02: Build Optimization — GSAP Chunk + Missing Geist Fonts Summary

**GSAP extracted into its own 77 KB rollup chunk (main bundle: 342 KB -> 265 KB) and missing Geist-Regular/Medium woff2 files added from official Vercel repo, eliminating all font build warnings.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-08T12:35:00Z
- **Completed:** 2026-04-08T12:50:00Z
- **Tasks:** 2
- **Files modified:** 3 (vite.config.ts, +2 binary font files)

## Accomplishments

- GSAP and @gsap/react moved to a dedicated `gsap` manual chunk via rollupOptions — main entry bundle dropped from 342.74 KB to 264.99 KB (gzip: 114 KB -> 85 KB)
- Downloaded Geist-Regular.woff2 (45,228 bytes) and Geist-Medium.woff2 (46,464 bytes) from the official `vercel/geist-font` GitHub repository (MIT license); both confirmed as valid wOF2 format via `file` command
- Build produces zero lines containing `didn't resolve at build time` or any other font-related warning

## Task Commits

Each task was committed atomically:

1. **Task 1: Add GSAP manual chunk to vite.config.ts** - `7c1d560` (feat)
2. **Task 2: Add missing Geist-Regular.woff2 and Geist-Medium.woff2 font files** - `837029a` (feat)

## Files Created/Modified

- `vite.config.ts` - Added `gsap: ['gsap', '@gsap/react']` entry to `rollupOptions.output.manualChunks`
- `public/fonts/Geist-Regular.woff2` - Real Geist Regular weight 400 woff2 font (downloaded from vercel/geist-font)
- `public/fonts/Geist-Medium.woff2` - Real Geist Medium weight 500 woff2 font (downloaded from vercel/geist-font)

## Decisions Made

- Used the real woff2 files from the official `vercel/geist-font` repo rather than the stub fallback (copying the .woff file as .woff2). The stub was described as a last resort; network access was available, so the correct files were downloaded.
- Verified file integrity via `file` command: both reported "Web Open Font Format (Version 2), TrueType" — not HTML error pages.

## Deviations from Plan

None - plan executed exactly as written. The primary URL for both font downloads succeeded on the first attempt.

## Issues Encountered

The worktree was created via `git reset --soft` to the base commit, which left staged changes from the Phase 1 security fixes conflicting with the working tree state. Resolved by restoring all tracked files from the base commit (`git restore --source=<hash> --staged --worktree`) before beginning task execution. This was a worktree setup concern, not a code issue.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- BUILD-04 and BUILD-05 complete. Bundle is now properly split.
- Phase 03 (runtime bugs) can proceed independently; no build-config dependencies.
- The `lenis` and `gsap` chunk pattern is established for any future additions to manualChunks.

---

*Phase: 02-build-dependencies*
*Completed: 2026-04-08*

## Self-Check: PASSED

- FOUND: vite.config.ts (modified with gsap manualChunk)
- FOUND: public/fonts/Geist-Regular.woff2 (45,228 bytes, valid wOF2)
- FOUND: public/fonts/Geist-Medium.woff2 (46,464 bytes, valid wOF2)
- FOUND: 02-02-SUMMARY.md
- FOUND: commit 7c1d560 (Task 1 — GSAP manual chunk)
- FOUND: commit 837029a (Task 2 — Geist font files)
