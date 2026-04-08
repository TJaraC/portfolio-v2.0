---
phase: 01-security
plan: 01
subsystem: infra
tags: [security-headers, vercel, csp, hsts, window.open, noopener]

# Dependency graph
requires: []
provides:
  - HTTP security headers on all Vercel CDN routes (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS)
  - Safe external link opening in Header.tsx and Contact.tsx via noopener,noreferrer
affects: [02-build, all phases modifying vercel.json or external links]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "vercel.json headers array applied to source: '/(.*) for global HTTP response headers"
    - "window.open third argument 'noopener,noreferrer' for all _blank external links"

key-files:
  created: []
  modified:
    - vercel.json
    - src/components/common/Header.tsx
    - src/components/common/Contact.tsx

key-decisions:
  - "CSP uses unsafe-inline for scripts and styles because GSAP and inline styles require it; nonce-based CSP would need a Vite plugin refactor out of scope"
  - "X-Frame-Options DENY is kept alongside CSP frame-ancestors none for legacy browser compatibility"
  - "mailto window.open with _self intentionally left unchanged — no opener leakage risk for same-window navigation"

patterns-established:
  - "All window.open calls with _blank must include noopener,noreferrer as third argument"
  - "Security headers managed in vercel.json headers array, not in application code"

requirements-completed: [SEC-01, SEC-02, SEC-03]

# Metrics
duration: 4min
completed: 2026-04-07
---

# Phase 1 Plan 01: Security Headers and Safe External Links Summary

**HTTP security headers (CSP, X-Frame-Options, HSTS, and 3 more) added to vercel.json, and all 6 window.open _blank calls in Header.tsx and Contact.tsx hardened with noopener,noreferrer**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-07T18:03:03Z
- **Completed:** 2026-04-07T18:06:23Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added 6 HTTP security headers to vercel.json applied globally to all Vercel CDN routes
- Fixed 4 window.open calls in Header.tsx (2 desktop social links + 2 mobile menu social links)
- Fixed 2 window.open calls in Contact.tsx (LinkedIn + Behance footer buttons)
- Build passes (exit 0) with no TypeScript or Vite errors after changes

## Task Commits

Each task was committed atomically:

1. **Task 1: Add security headers to vercel.json** - `d48c168` (feat)
2. **Task 2: Fix window.open calls to include noopener,noreferrer** - `01a6f30` (fix)

## Files Created/Modified
- `vercel.json` - Added `headers` array with 6 security headers applying to `/(.*)`
- `src/components/common/Header.tsx` - Fixed 4 window.open `_blank` calls to include `noopener,noreferrer`
- `src/components/common/Contact.tsx` - Fixed 2 window.open `_blank` calls to include `noopener,noreferrer`

## Decisions Made
- CSP uses `unsafe-inline` for both script-src and style-src because GSAP and inline styles are used throughout the app; a stricter nonce-based CSP would require a Vite plugin refactor out of scope for this phase
- Both `frame-ancestors 'none'` (CSP) and `X-Frame-Options: DENY` are included for complementary coverage — CSP for modern browsers, X-Frame-Options for legacy
- The `mailto:` window.open call with `_self` in Contact.tsx was intentionally left unchanged — opening in the same window has no opener leakage risk

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None — both tasks completed without errors. Build passes cleanly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Security header hardening complete; ready for Phase 01 Plan 02 (build script and dependency fixes)
- No blockers

---
*Phase: 01-security*
*Completed: 2026-04-07*

## Self-Check: PASSED

- FOUND: vercel.json (worktree)
- FOUND: src/components/common/Header.tsx (worktree)
- FOUND: src/components/common/Contact.tsx (worktree)
- FOUND: .planning/phases/01-security/01-01-SUMMARY.md
- FOUND commit: d48c168 (feat: add HTTP security headers to vercel.json)
- FOUND commit: 01a6f30 (fix: add noopener,noreferrer to all window.open _blank calls)
