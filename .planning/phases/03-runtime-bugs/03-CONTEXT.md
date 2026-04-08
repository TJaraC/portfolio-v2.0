---
phase: 3
name: Runtime Bugs
status: context_gathered
gathered: "2026-04-08"
---

# Phase 3 Context: Runtime Bugs

## Goal

Eliminar todos los memory leaks y race conditions: RAF loop cancelable, listener popstate deduplicado, cleanup de resize correcto, dep array estable de Lenis, timeline leaks en hover de GSAP, y timeout de inicialización cancelable.

## Requirements

- BUG-01 — RAF loop cancelable con cancelAnimationFrame
- BUG-02 — Handler popstate deduplicado (solo en App.tsx)
- BUG-03 — Memory leak de useResponsiveAnimations corregido
- BUG-04 — useLenisScroll dep array corregido ([] en lugar de [lenis])
- BUG-05 — Timeline leaks en hover GSAP corregidos
- BUG-06 — Timeout cancelable en Preloader

---

## Codebase Findings

### BUG-01 — RAF loop (src/App.tsx ~line 47-52)

`requestAnimationFrame(raf)` se llama sin almacenar el ID de retorno. El cleanup del `useEffect` solo llama `lenis.destroy()` pero nunca `cancelAnimationFrame`. El RAF continúa ejecutándose después del unmount.

```ts
// ACTUAL (leak)
function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);  // return value discarded
}
requestAnimationFrame(raf);    // return value discarded
return () => {
  lenis.destroy();             // RAF still running
};

// FIX
let rafId: number;
function raf(time: number) {
  lenis.raf(time);
  rafId = requestAnimationFrame(raf);
}
rafId = requestAnimationFrame(raf);
return () => {
  cancelAnimationFrame(rafId);
  lenis.destroy();
};
```

**File:** `src/App.tsx`

---

### BUG-02 — Duplicate popstate (src/pages/Home/index.tsx ~line 70)

`Home/index.tsx` registra un segundo `popstate` listener que duplica el de `App.tsx`. App.tsx tiene cleanup correcto vía `useEffect` return. El handler de Home no se limpia apropiadamente cuando se desmonta el componente en el mismo ciclo de navigación que lo activó.

```ts
// Home/index.tsx line 70:
window.addEventListener('popstate', handlePopState);
// line 73:
return () => { window.removeEventListener('popstate', handlePopState); };
```

El de App.tsx es el único que debe existir. El popstate en Home es redundante.

**Files:** `src/pages/Home/index.tsx` — remove the popstate listener block

---

### BUG-03 — Resize listener mismatch (src/hooks/useResponsiveAnimations.ts ~line 77-80)

El listener se añade como `debouncedCheck` pero se elimina como `checkBreakpoint`. Son funciones distintas → el listener nunca se elimina realmente.

```ts
// ACTUAL (leak)
const debouncedCheck = debounce(checkBreakpoint, 150);
window.addEventListener('resize', debouncedCheck);
return () => {
  window.removeEventListener('resize', checkBreakpoint);  // wrong ref!
};

// FIX
return () => {
  window.removeEventListener('resize', debouncedCheck);  // correct ref
};
```

**File:** `src/hooks/useResponsiveAnimations.ts`

---

### BUG-04 — useLenisScroll dep array (src/hooks/useLenisScroll.ts ~line 20)

El `useEffect` tiene `[lenis]` como dep array. `lenis` se establece dentro del mismo effect vía `setLenis`, creando una cadena de re-ejecuciones. El effect solo necesita ejecutarse una vez al mount para registrar el callback.

```ts
// ACTUAL (re-runs on every lenis state change)
useEffect(() => {
  if (lenisInstance && !lenis) { setLenis(lenisInstance); }
  const callback = () => { setLenis(lenisInstance); };
  lenisCallbacks.push(callback);
  return () => { lenisCallbacks = lenisCallbacks.filter(cb => cb !== callback); };
}, [lenis]);  // BUG: lenis triggers re-runs

// FIX
}, []);  // mount-only, callback cleanup is stable
```

**File:** `src/hooks/useLenisScroll.ts`

---

### BUG-05 — GSAP timeline leaks on hover (2 components)

**AnimatedContactHeading** (`src/components/ui/AnimatedContactHeading.tsx`):
Both `handleMouseEnter` and `handleMouseLeave` create `hoverTl.current = gsap.timeline()` without killing the previous timeline. The `useEffect` cleanup calls `hoverTl.current?.kill()` but the leak occurs mid-hover when the user quickly enters/leaves.

**NextProjectButton** (`src/components/ui/NextProjectButton.tsx`):
Same pattern — both `handleMouseEnter` and `handleMouseLeave` replace `hoverTl.current` without killing first.

```ts
// FIX — before creating new timeline in each handler:
const handleMouseEnter = () => {
  hoverTl.current?.kill();           // ← add this line
  hoverTl.current = gsap.timeline();
  // ...
};
const handleMouseLeave = () => {
  hoverTl.current?.kill();           // ← add this line
  hoverTl.current = gsap.timeline();
  // ...
};
```

**Files:** `src/components/ui/AnimatedContactHeading.tsx`, `src/components/ui/NextProjectButton.tsx`

---

### BUG-06 — Preloader timeout not cancelable (src/components/ui/Preloader.tsx ~line 152)

El timeout principal de 4000ms que dispara `exitAnimation()` no almacena su ID, por lo que el cleanup del `useEffect` no puede cancelarlo. Si el componente se desmonta antes de los 4s, `exitAnimation` se ejecuta en un componente ya desmontado (DOM refs null, GSAP tweens sobre elementos que ya no existen).

El `wordInterval` SÍ se cancela correctamente. Solo falta el `setTimeout`.

```ts
// ACTUAL (no cancel of setTimeout)
const wordInterval = setInterval(() => { animateWords(); }, 1000);
setTimeout(() => { exitAnimation(); }, 4000);   // ID not stored

return () => {
  clearInterval(wordInterval);  // ✓ correct
  tl.kill();                    // ✓ correct
  document.body.classList.remove('preloader-active');
  // ✗ missing: clearTimeout(exitTimeoutId)
};

// FIX
const exitTimeoutId = setTimeout(() => { exitAnimation(); }, 4000);

return () => {
  clearInterval(wordInterval);
  clearTimeout(exitTimeoutId);   // ← add this
  tl.kill();
  document.body.classList.remove('preloader-active');
};
```

**File:** `src/components/ui/Preloader.tsx`

Note: The 800ms `setTimeout` inside `exitAnimation()` is acceptable — it only runs as part of a deliberate exit sequence and doesn't outlive the animation.

---

## Gray Areas & Decisions

### GA-01 — BUG-01: rafId storage location

**Question:** Should `rafId` be stored in a `let` inside the `useEffect` closure or in a `useRef`?

**Options:**
- A (Recommended): `let rafId: number` inside the `useEffect` closure — clean, no ref required, works because the cleanup function is a closure over the same scope.
- B: `useRef<number>` at component level — overkill for this use case; refs are for values that persist across renders, but the RAF is fully scoped to the effect lifecycle.

**Decision:** Option A — `let rafId: number` inside the effect closure.

---

### GA-02 — BUG-02: What to do with handlePopState in Home/index.tsx

**Question:** Remove only the `addEventListener`/`removeEventListener` lines, or the entire `handlePopState` function?

**Analysis:** `handlePopState` in Home handles scroll restoration on back navigation. App.tsx's handler is more general. Removing the entire Home handler may break scroll restoration when navigating back to Home.

**Decision:** Keep the `handlePopState` function logic but **remove** the `window.addEventListener('popstate', ...)` call and its cleanup. The handler in App.tsx already provides the global popstate response. If scroll restoration to Home is needed, it can be done via App.tsx or on route mount, not via a duplicate global listener.

**Decision: Remove the addEventListener/removeEventListener pair only** — preserve any scroll restoration logic if it targets a local element (not a global window listener).

*After reading Home/index.tsx more carefully:* The `handlePopState` in Home scrolls to a specific section on back nav. This is a UX concern, but adding a second global `popstate` is the wrong mechanism. **Remove the window.addEventListener/removeEventListener pair** — accept the scroll restoration may need to be handled via route enter logic in Phase 4.

---

### GA-03 — BUG-05: Where to call `timeline.kill()`

**Question:** Kill in the handler before creating new, or deduplicate by checking `isAnimating` state?

**Decision:** Kill before creating in each handler. Simplest, most reliable. No state needed.

---

### GA-04 — BUG-06: exitAnimation inner setTimeout

**Question:** Should the 800ms `setTimeout` inside `exitAnimation` also be stored and cancelled?

**Decision:** No. The `exitAnimation` function is only called from the 4000ms timeout (which we're making cancelable). If the component unmounts before 4000ms, `exitAnimation` never fires. If it fires, the 800ms inner delay is fine — it's a sequential animation, not a leak.

---

## Files to Touch

| File | Bugs | Change |
|------|------|--------|
| `src/App.tsx` | BUG-01 | Store rafId, cancelAnimationFrame in cleanup |
| `src/pages/Home/index.tsx` | BUG-02 | Remove window.addEventListener/removeEventListener for popstate |
| `src/hooks/useResponsiveAnimations.ts` | BUG-03 | Fix cleanup to reference debouncedCheck |
| `src/hooks/useLenisScroll.ts` | BUG-04 | Change dep array from [lenis] to [] |
| `src/components/ui/AnimatedContactHeading.tsx` | BUG-05 | Add hoverTl.current?.kill() before new timeline |
| `src/components/ui/NextProjectButton.tsx` | BUG-05 | Add hoverTl.current?.kill() before new timeline |
| `src/components/ui/Preloader.tsx` | BUG-06 | Store exitTimeoutId, clearTimeout in cleanup |

**Total files: 7** — All surgical, minimal-diff fixes.

---

## Risks

- **BUG-02 scroll restoration**: Removing the popstate from Home may change back-nav UX. Accept this as the correct fix; duplicate global listeners are worse.
- **BUG-04 dep array**: Changing `[lenis]` to `[]` is safe here because the effect only registers a callback — it doesn't need to re-run if `lenis` changes; the callback itself reads `lenisInstance` from module scope.
- No design changes. No new dependencies. All fixes are one-liners or two-liners per location.

---

## Constraints Carried Forward

- No visual changes — CSS and animation timing must remain identical
- All commits on `fix/audit-2026-04`, no co-author
- `npm run build` must exit 0 after all changes
