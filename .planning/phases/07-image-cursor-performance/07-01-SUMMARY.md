---
plan: "07-01"
phase: 7
status: completed
completed: "2026-04-09"
---

## Summary

3 fixes de rendimiento aplicados en un commit.

## Tasks Completed

| Task | Cambio | Impacto |
|------|--------|---------|
| CustomCursor rAF | querySelectorAll+N listeners → event delegation (2 listeners) + rAF loop | Elimina contención con animaciones hover |
| ImageWithCurtain src único | useEffect redundante eliminado, src en JSX + decoding="async" | Elimina 2 decode cycles extra al cargar imágenes |
| portfolio-card-img GPU | will-change + translateZ(0) + backface-visibility | Capa GPU pre-promovida antes del hover |

## Key Files Modified

- `src/components/ui/CustomCursor.tsx` — event delegation + rAF
- `src/components/ui/ImageWithCurtain.tsx` — src en JSX, decoding="async", useEffect eliminado
- `src/styles/home.css` — GPU hints en .portfolio-card-img

## Self-Check

- [x] CustomCursor: solo 3 listeners en document (mousemove, mouseover, mouseout)
- [x] ImageWithCurtain: sin useEffect de precarga, img tiene src y decoding="async"
- [x] .portfolio-card-img: will-change + translateZ(0) + backface-visibility
- [x] tsc --noEmit sin nuevos errores
- [x] Sin cambios visuales
