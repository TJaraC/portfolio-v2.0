---
phase: 03-runtime-bugs
reviewed: 2026-04-08T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - src/App.tsx
  - src/pages/Home/index.tsx
  - src/pages/Projects/ProjectsPage.tsx
  - src/components/ui/AnimatedContactHeading.tsx
  - src/components/ui/NextProjectButton.tsx
  - src/components/ui/Preloader.tsx
  - src/hooks/useResponsiveAnimations.ts
  - src/hooks/useLenisScroll.ts
findings:
  critical: 0
  warning: 6
  info: 4
  total: 10
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-04-08T00:00:00Z
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

This review covers the 8 files targeted by Phase 3 (runtime bugs / memory leaks). The phase planned to fix 6 specific bugs: BUG-01 (cancelable RAF), BUG-02 (duplicate popstate handlers), BUG-03 (resize listener cleanup), BUG-04 (useLenisScroll dep array), BUG-05 (GSAP hover timeline leaks), and BUG-06 (Preloader timeout cancel).

**BUG-01, BUG-02, BUG-05, and BUG-06 are resolved or substantially addressed.** BUG-03 and BUG-04 are not yet fixed and remain active issues in the current code. Several additional bugs were found during this review that were not in the original plan: a stale closure in `NextProjectButton` (missing `lenis` dep), broken deduplication logic in `Preloader`, a post-destroy method call in `App.tsx`, and a duplicate `useEffect` in `ProjectsPage`.

---

## Warnings

### WR-01: BUG-03 Not Fixed — Resize Listener Leaked (Wrong Reference Removed)

**File:** `src/hooks/useResponsiveAnimations.ts:77-80`

**Issue:** `window.addEventListener('resize', debouncedCheck)` is registered in the effect body, but the cleanup function removes `checkBreakpoint` (the non-debounced version) instead of `debouncedCheck`. Because `debouncedCheck` is a new function reference created inside the effect, passing a different reference to `removeEventListener` is a no-op — the listener is never actually removed.

Every time the effect re-runs (which happens whenever `duration`, `ease`, or `onBreakpointChange` changes), a new `debouncedCheck` listener is added but the previous one is never cleaned up. Since `Home/index.tsx` passes an inline arrow function as `onBreakpointChange` (line 71-73), a new function reference is created on every render of `Home`, causing the effect to re-run on every render, compounding the leak.

```ts
// CURRENT (broken) — removes wrong reference:
return () => {
  window.removeEventListener('resize', checkBreakpoint); // <-- wrong
  ...
};

// FIX — remove the debounced version that was actually added:
const debouncedCheck = debounce(checkBreakpoint, 150);
window.addEventListener('resize', debouncedCheck);

return () => {
  window.removeEventListener('resize', debouncedCheck); // <-- correct
  ...
};
```

Additionally, `Home/index.tsx` line 71-73 should wrap `onBreakpointChange` in `useCallback` to stabilize the reference:
```ts
// In Home/index.tsx
const handleBreakpointChange = useCallback((breakpoint: string) => {
  console.log(`Breakpoint changed to: ${breakpoint}`);
}, []);

const currentBreakpoint = useResponsiveAnimations({
  duration: 0.4,
  ease: 'power2.out',
  onBreakpointChange: handleBreakpointChange
});
```

---

### WR-02: BUG-04 Not Fixed — useLenisScroll Effect Re-Registers on Every Lenis State Change

**File:** `src/hooks/useLenisScroll.ts:19-36`

**Issue:** The `useEffect` dep array is `[lenis]`. Whenever `setLenis` is called (which updates `lenis` state), the effect re-runs: it cleans up the old callback from `lenisCallbacks` and pushes a new callback. This means each `setLenisInstance` call — which iterates all callbacks — triggers `setLenis` in each consumer, which triggers the effect to re-run in each consumer, which replaces their callback. While the net count stays at 1 callback per consumer, each re-registration is unnecessary work and causes extra renders.

More importantly, the condition `if (lenisInstance && !lenis)` on line 21 will never be true after the first `setLenis` call (because `lenis` is now non-null). The effect re-runs but the sync code does nothing, making the entire `[lenis]` dependency semantically wrong.

```ts
// CURRENT — re-runs on every lenis state change:
useEffect(() => {
  if (lenisInstance && !lenis) {
    setLenis(lenisInstance);
  }
  const callback = () => {
    setLenis(lenisInstance);
  };
  lenisCallbacks.push(callback);
  return () => {
    lenisCallbacks = lenisCallbacks.filter(cb => cb !== callback);
  };
}, [lenis]); // <-- causes re-registration on every state update

// FIX — register once, sync immediately on mount:
useEffect(() => {
  // Sync immediately if already set
  if (lenisInstance) {
    setLenis(lenisInstance);
  }
  const callback = () => {
    setLenis(lenisInstance);
  };
  lenisCallbacks.push(callback);
  return () => {
    lenisCallbacks = lenisCallbacks.filter(cb => cb !== callback);
  };
}, []); // <-- empty: register once, clean up on unmount only
```

---

### WR-03: Stale Lenis Closure in NextProjectButton Click Handler

**File:** `src/components/ui/NextProjectButton.tsx:144-178`

**Issue:** The effect dep array is `[nextProject, loading, navigate]` (line 193). `lenis` is used inside the `handleClick` closure (lines 154-170) but is not listed as a dependency. When `lenis` changes from `null` to a Lenis instance after async initialization, the effect does not re-run, so `handleClick` permanently captures the stale `null` value. Clicking "Next Project" before Lenis initializes causes `lenis.stop()` and `lenis.start()` to be silently skipped for the lifetime of that component instance.

```ts
// CURRENT (stale closure):
  }, [nextProject, loading, navigate]);

// FIX — add lenis to dep array:
  }, [nextProject, loading, navigate, lenis]);
```

---

### WR-04: Uncancelled setTimeout Calls Lenis Methods on a Destroyed Instance

**File:** `src/App.tsx:56-60`

**Issue:** Inside `initializeLenis`, a `setTimeout` with a 100ms delay calls `lenis.start()` and `lenis.resize()`. The cleanup function (lines 78-83) calls `cancelAnimationFrame(rafId)` and `lenis.destroy()` but does NOT cancel this timeout. If the component unmounts before 100ms elapses, the timeout fires and calls `.start()` and `.resize()` on an already-destroyed Lenis instance. Calling methods on a destroyed Lenis object will throw or produce undefined behavior depending on the Lenis version.

```ts
// FIX — track and cancel the init timeout:
let initTimeoutId: ReturnType<typeof setTimeout>;

const initializeLenis = () => {
  // ... lenis setup ...
  initTimeoutId = setTimeout(() => {
    lenis.start();
    lenis.resize();
  }, 100);
  return lenis;
};

return () => {
  cancelAnimationFrame(rafId);
  clearTimeout(initTimeoutId); // <-- add this
  if (lenis) {
    lenis.destroy();
  }
};
```

---

### WR-05: Preloader Word Deduplication Is Broken — Stale Closure

**File:** `src/components/ui/Preloader.tsx:35-38`

**Issue:** `getRandomWord()` reads `usedWords` from the closure created when the `useEffect` runs. At that point `usedWords` is the initial state value `[]`. The `setUsedWords(prev => [...prev, leftWord, rightWord])` call correctly updates state via functional updater, but `getRandomWord()` always filters against the stale initial `[]` — so all 18 words are always "available" regardless of what has been shown. Word repetition is possible even though the code intends to prevent it.

The `null` check on lines 71-73 (`if (!leftWord || !rightWord) return`) will never trigger because the available list is always the full 18 words.

```ts
// FIX — use a local ref to track used words imperatively,
// outside of React state, so the closure always sees fresh data:
const usedWordsRef = useRef<string[]>([]);

const getRandomWord = () => {
  const availableWords = words.filter(word => !usedWordsRef.current.includes(word));
  if (availableWords.length < 2) {
    usedWordsRef.current = []; // reset when exhausted
    return words[Math.floor(Math.random() * words.length)];
  }
  const word = availableWords[Math.floor(Math.random() * availableWords.length)];
  usedWordsRef.current.push(word);
  return word;
};
```

---

### WR-06: Uncancelled setTimeout in Preloader animateWords May Call gsap on Unmounted Component

**File:** `src/components/ui/Preloader.tsx:106-109`

**Issue:** Each `animateWords()` call schedules a `setTimeout` at +600ms to animate words out. This timeout is not tracked or cancelled in the cleanup function. If the Preloader unmounts (or `exitAnimation` fires and the component is hidden) while this timeout is pending, it calls `gsap.to(leftWordRef.current, ...)` after the component is gone. GSAP handles null targets without throwing, but if the ref is stale the animation targets a detached DOM node. With a 1000ms interval and 600ms timeout, multiple overlapping pending timeouts can exist simultaneously.

```ts
// FIX — track the in-flight word-out timeout and cancel it:
let wordOutTimeoutId: ReturnType<typeof setTimeout>;

// Inside animateWords():
wordOutTimeoutId = setTimeout(() => {
  gsap.to(leftWordRef.current, { ... });
  gsap.to(rightWordRef.current, { ... });
}, 600);

// In cleanup:
return () => {
  clearInterval(wordInterval);
  clearTimeout(exitTimeoutId);
  clearTimeout(wordOutTimeoutId); // <-- add this
  tl.kill();
  document.body.classList.remove('preloader-active');
};
```

---

## Info

### IN-01: console.log Left in Production Path

**File:** `src/pages/Home/index.tsx:72`

**Issue:** `console.log(`Breakpoint changed to: ${breakpoint}`)` is passed as the `onBreakpointChange` callback. Phase 1 added `drop_console: true` to the Vite build config, so this will be stripped in production builds. However it is noisy in development and is a debug artifact that should be removed from committed code.

**Fix:** Remove the `console.log` line, or replace it with a comment if documenting the callback signature.

---

### IN-02: Duplicate useEffect in ProjectsPage — Both Call lenis.start()

**File:** `src/pages/Projects/ProjectsPage.tsx:16-33`

**Issue:** Two separate `useEffect` blocks both call `lenis.start()` when `lenis` is truthy. The first (lines 16-27) runs on `[projectId, lenis]` and also handles `window.scrollTo` and `lenis.resize()`. The second (lines 29-33) runs on `[lenis]` only and does nothing the first effect does not already cover. On mount, both effects fire and `lenis.start()` is called twice.

**Fix:** Remove the second effect entirely (lines 29-33). The first effect already handles the `lenis` dependency.

---

### IN-03: Dead State Variable in Preloader

**File:** `src/components/ui/Preloader.tsx:23`

**Issue:** `const [currentWords, setCurrentWords] = useState({ left: '', right: '' })` — `currentWords` is set at line 79 but never read anywhere in the component. The JSX does not use it; word text is set directly via `textContent` imperatively. This is dead state.

**Fix:** Remove `currentWords` and `setCurrentWords` declarations and the `setCurrentWords` call at line 79.

---

### IN-04: Dead Ref Variable in NextProjectButton

**File:** `src/components/ui/NextProjectButton.tsx:16`

**Issue:** `const lettersRef = useRef<HTMLSpanElement[]>([])` is declared but never read or written in the component body. It appears to be a leftover from an earlier implementation.

**Fix:** Remove the `lettersRef` declaration.

---

_Reviewed: 2026-04-08T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
