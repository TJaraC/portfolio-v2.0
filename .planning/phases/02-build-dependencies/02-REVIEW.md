---
phase: 02-build-dependencies
reviewed: 2026-04-08T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - package.json
  - src/components/common/Contact.tsx
  - src/components/common/Header.tsx
  - vercel.json
  - vite.config.ts
  - src/App.tsx
  - src/components/ui/ImageWithCurtain.tsx
  - src/hooks/useCarouselScroll.ts
  - src/hooks/useResponsiveAnimations.ts
findings:
  critical: 0
  warning: 6
  info: 4
  total: 10
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-08T00:00:00Z
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Se revisaron 9 archivos del milestone de corrección de auditoría. Los cambios de la Fase 1 (seguridad: vercel.json con headers, `noopener,noreferrer`, radix en parseInt, drop_console) y Fase 2 (vite.config.ts con manualChunks para GSAP/Lenis, terser, `tsc --noEmit`) están correctamente aplicados.

Se encontraron 6 warnings y 4 items informativos. No hay issues críticos. Los warnings más relevantes son: un RAF loop sin cancelar en `App.tsx` (memory leak real), una dependencia de `useEffect` que provoca re-registros infinitos del listener de scroll en `Header.tsx`, y un mismatch entre la función debouncedada que se agrega al listener vs la referencia original que se elimina en `useResponsiveAnimations.ts`.

---

## Warnings

### WR-01: RAF loop sin ID de cancelación — memory leak en App.tsx

**File:** `src/App.tsx:47-52`
**Issue:** La función `raf` llama a `requestAnimationFrame(raf)` de forma recursiva sin almacenar el ID devuelto. El cleanup del efecto llama a `lenis.destroy()` pero no cancela el frame pendiente. Esto significa que después de que Lenis se destruye, el loop de RAF sigue ejecutándose indefinidamente con un objeto destruido, causando un memory leak en cada hot-reload y potencialmente en navegaciones SPA.
**Fix:**
```typescript
let rafId: number;

function raf(time: number) {
  lenis.raf(time);
  rafId = requestAnimationFrame(raf);
}

rafId = requestAnimationFrame(raf);

// En el return del useEffect:
return () => {
  cancelAnimationFrame(rafId);
  if (lenis) {
    lenis.destroy();
  }
};
```

---

### WR-02: useEffect con headerTheme en deps causa re-registro de listener en cada scroll — Header.tsx

**File:** `src/components/common/Header.tsx:107-122`
**Issue:** El `useEffect` que registra el listener de scroll tiene `[headerTheme]` en el array de dependencias (línea 122). Cada vez que `detectHeaderTheme()` llama a `setHeaderTheme(newTheme)` y el tema cambia, React desmonta y vuelve a montar el listener. Esto causa un ciclo: scroll → tema cambia → effect re-corre → nuevo listener → scroll → ... Aunque `passive: true` lo hace funcional, implica N re-registros innecesarios del listener y re-ejecución de `detectHeaderTheme()` en el efecto de montaje con cada cambio de tema.
**Fix:** Eliminar `headerTheme` de las dependencias. Para acceder al valor actual dentro del handler, usar una ref:
```typescript
const headerThemeRef = useRef(headerTheme);
useEffect(() => {
  headerThemeRef.current = headerTheme;
}, [headerTheme]);

useEffect(() => {
  const handleScroll = () => {
    // usa headerThemeRef.current en lugar de headerTheme
    detectHeaderTheme();
  };
  detectHeaderTheme();
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []); // sin headerTheme en deps
```

---

### WR-03: Listener de resize elimina función diferente a la que se agregó — useResponsiveAnimations.ts

**File:** `src/hooks/useResponsiveAnimations.ts:77-80`
**Issue:** El listener se registra con la función debouncedada (`debouncedCheck`) pero el cleanup elimina la función sin debounce (`checkBreakpoint`). Esto significa que el listener real nunca se elimina al desmontar el hook, causando un memory leak y llamadas a `checkBreakpoint` en un componente ya desmontado.

```typescript
// Línea 77 — se agrega debouncedCheck:
window.addEventListener('resize', debouncedCheck);

// Línea 80 — se elimina checkBreakpoint (función diferente):
window.removeEventListener('resize', checkBreakpoint); // BUG
```
**Fix:**
```typescript
return () => {
  window.removeEventListener('resize', debouncedCheck); // misma referencia
  if (animationContext.current) {
    animationContext.current.kill();
  }
  if (animationManager.current) {
    animationManager.current.destroy();
  }
};
```

---

### WR-04: useScrollAnimation tiene animationCallback en deps pero no está estabilizado — ImageWithCurtain.tsx

**File:** `src/components/ui/ImageWithCurtain.tsx:27-49` / `src/hooks/useLenisScroll.ts:81`
**Issue:** `useScrollAnimation` lista `animationCallback` en su array de dependencias (línea 81 de `useLenisScroll.ts`). El callback se pasa como arrow function inline desde `ImageWithCurtain` (línea 28-49), lo que significa que se crea una nueva referencia en cada render. Esto provoca que el `IntersectionObserver` se destruya y re-cree en cada render de `ImageWithCurtain`, potencialmente disparando la animación de cortina varias veces o nunca si el componente se re-renderiza durante la intersección.
**Fix:** En `ImageWithCurtain`, estabilizar el callback con `useCallback`:
```typescript
import React, { useRef, useEffect, RefObject, useCallback } from 'react';

const animationFn = useCallback(() => {
  setTimeout(() => {
    if (curtainRef.current) {
      gsap.fromTo(curtainRef.current,
        { y: '0%', scaleY: 1 },
        { y: '100%', scaleY: 1, duration: duration, ease: 'power2.inOut', transformOrigin: 'top center' }
      );
    }
  }, delay * 1000);
}, [delay, duration]);

const elementRef = useScrollAnimation(animationFn, { threshold, once });
```

---

### WR-05: setTimeout en animación de cortina no se cancela si el componente se desmonta — ImageWithCurtain.tsx

**File:** `src/components/ui/ImageWithCurtain.tsx:29-46`
**Issue:** El callback de `useScrollAnimation` usa `setTimeout` para retrasar la animación GSAP. Si el componente se desmonta durante el delay (ej. navegación SPA), el timeout sigue activo y el callback intenta animar `curtainRef.current`. Aunque React no crashea (la ref quedará `null`), GSAP recibe `null` como target. El check `if (curtainRef.current)` lo protege del crash, pero el timeout sigue corriendo sin propósito y es un leak.
**Fix:** Convertir el `setTimeout` en un delay nativo de GSAP para que la animación sea cancelable:
```typescript
gsap.fromTo(curtainRef.current,
  { y: '0%', scaleY: 1 },
  {
    y: '100%',
    scaleY: 1,
    duration: duration,
    delay: delay,  // delay nativo de GSAP, se puede cancelar con killTweensOf
    ease: 'power2.inOut',
    transformOrigin: 'top center'
  }
);
```
Agregar cleanup en un `useEffect` de desmontaje:
```typescript
useEffect(() => {
  return () => {
    if (curtainRef.current) {
      gsap.killTweensOf(curtainRef.current);
    }
  };
}, []);
```

---

### WR-06: Logo onClick usa window.location.href en lugar de router navigation — Header.tsx

**File:** `src/components/common/Header.tsx:302-310`
**Issue:** El click handler del logo usa `window.location.href = '/'` para navegar a home desde rutas distintas. Esto provoca una recarga completa de la página, destruyendo el estado React, Lenis y GSAP, en lugar de usar la navegación client-side del router. El patrón correcto en React Router v7 es usar `useNavigate`.

Nótese que `scrollToSection` también usa `window.location.href = \`/#${sectionId}\`` (línea 29) con el mismo problema.
**Fix:**
```typescript
import { useLocation, useNavigate } from 'react-router-dom';
const navigate = useNavigate();

// En el click del logo:
onClick={() => {
  if (location.pathname === '/') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    navigate('/');
  }
}}

// En scrollToSection:
if (location.pathname !== '/') {
  navigate(`/#${sectionId}`);
  return;
}
```

---

## Info

### IN-01: useLenisScroll tiene lenis en sus propias deps causando effect re-runs innecesarios

**File:** `src/hooks/useLenisScroll.ts:36`
**Issue:** El `useEffect` dentro de `useLenisScroll` tiene `[lenis]` en sus dependencias. El efecto llama a `setLenis(lenisInstance)` cuando `lenis` es null, lo que actualiza `lenis`, lo que re-corre el efecto. El segundo paso el guard `if (lenisInstance && !lenis)` es false (lenis ya no es null), por lo que no hay loop infinito, pero el re-run es innecesario. Las deps deberían ser `[]`.

---

### IN-02: vercel.json — CSP permite 'unsafe-inline' en script-src

**File:** `vercel.json:14`
**Issue:** La política `script-src 'self' 'unsafe-inline'` anula en gran parte la protección XSS que aporta la CSP. `'unsafe-inline'` permite ejecutar cualquier script inline, que es el vector de XSS más común. En una SPA generada por Vite con hash de assets, es posible usar `nonce` o hashes de script para eliminar `'unsafe-inline'`.

Esto es un item informativo y no crítico porque el sitio no tiene inputs de usuario ni contenido externo que pueda inyectarse, pero es una mejora de seguridad recomendada para el futuro.

---

### IN-03: Magic number para headerHeight en scrollToSection — Header.tsx

**File:** `src/components/common/Header.tsx:36`
**Issue:** `const headerHeight = 80;` es un magic number que duplica la altura real del header. Si el CSS del header cambia, este valor queda desincronizado.
**Fix:** Leer la altura real del DOM: `const headerHeight = headerRef.current?.offsetHeight ?? 80;`

---

### IN-04: package.json — script "serve" duplica "preview"

**File:** `package.json:11`
**Issue:** El script `"serve": "vite preview"` es idéntico a `"preview": "vite preview"`. Uno de los dos es redundante.

---

_Reviewed: 2026-04-08T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
