# Sistema de proyectos dinámicos

Las páginas de proyecto se generan desde archivos JSON y comparten un único componente React. Los cinco proyectos publicados usan una narrativa base de diez capítulos; `project-template.json` es la fuente de verdad para crear casos nuevos y permite añadir un capítulo de delivery cuando el contexto lo requiere.

## Proyectos publicados

- `areta.json`
- `ultracamp.json`
- `festgo-app.json`
- `portfolio-25.json`
- `howell-gallery.json`

`ejemplo-proyecto.json` conserva el formato antiguo para comprobar la compatibilidad del fallback, pero no debe usarse como plantilla nueva.

## Crear un proyecto

1. Duplica `project-template.json` y renombra el archivo con un slug en minúsculas.
2. Cambia `id` para que coincida exactamente con el nombre del archivo.
3. Guarda las imágenes en `public/images/projects/<slug>/` y usa rutas públicas que empiecen por `/images/`.
4. Completa todo el contenido en inglés.
5. Asigna un `cardNumber` estable; no derives la numeración de la posición en el grid.
6. Activa `featured` solo si la tarjeta debe ocupar todo el ancho del grid en escritorio.
7. Usa nombres y apellidos españoles, naturales y acordes al contexto, para todas las user personas.
8. Registra el `id` en `projectIds`, dentro de `src/hooks/useProjectsList.ts`.
9. Comprueba `/projects/<slug>` en escritorio y móvil.

## Estructura narrativa

La página siempre conserva este orden:

1. Introduction: título, resumen, hero y detalle responsive opcional.
2. Overview: contexto, objetivo y metadatos.
3. The challenge: problema, pregunta de diseño y tres prioridades.
4. Research & insights: insights, benchmark y una o varias personas.
5. Ideation: user flow y decisiones de arquitectura.
6. Design system & rationale: sistema visual, reglas, objetivos y soluciones construidas desde cero.
7. Product delivery, opcional: workflow y stack cuando el sistema de entrega sea parte relevante del caso.
8. User testing: método, observaciones y respuestas de diseño.
9. Final design: highlights y galería de mockups.
10. Impact: outcomes o métricas con unidad explícita y contexto verificable.
11. Learnings: conclusión y aprendizajes transferibles.

Si `delivery` no existe, la página conserva la numeración original de diez capítulos.

## Campos principales

```json
{
  "id": "project-slug",
  "project": "PROJECT",
  "name": "NAME",
  "date": "Month YYYY",
  "cardNumber": "00",
  "featured": false,
  "cardTitle": "Project name",
  "cardTags": ["DISCIPLINE", "PLATFORM", "CONTEXT"],
  "heroDescription": "Short introduction",
  "heroImage": "/images/projects/project-slug/hero.webp",
  "heroInsetImage": "/images/projects/project-slug/mobile.webp",
  "overview": { "description": "Project overview" },
  "projectGoal": { "description": "Project goal" },
  "fontAndColours": {
    "description": "Visual-system rationale",
    "colors": ["#000000", "#555555", "#CCCCCC", "#FFFFFF"],
    "fonts": [{ "name": "Typeface Regular" }]
  },
  "caseStudy": {
    "meta": [],
    "challenge": {},
    "research": { "personas": [] },
    "ideation": {},
    "design": {},
    "delivery": {},
    "testing": {},
    "finalDesign": {},
    "impact": {},
    "learnings": {}
  },
  "gallery": {
    "description": "Final-image context",
    "images": []
  }
}
```

Consulta `project-template.json` para ver todos los objetos y arrays obligatorios.

## Reglas de contenido

- Escribe outcomes verificables. Si el proyecto no está en producción, presenta hallazgos como validación de prototipo y evita inventar impacto comercial.
- Mantén tres prioridades, tres insights, tres hallazgos y tres aprendizajes para conservar el ritmo visual.
- El benchmark describe patrones de producto; no debe afirmar superioridad sin evidencia.
- `research.personas` admite varias personas. `research.persona` sigue disponible para los casos existentes con una sola persona.
- `delivery` es opcional. Cuando se incluye, debe explicar decisiones y responsabilidades, no limitarse a enumerar herramientas.
- `cardNumber` es obligatorio y permanece asociado al proyecto aunque cambie el orden. `featured` es opcional y por defecto es `false`.
- `heroInsetImage` es opcional. Si se usa, debe complementar el hero con otra escala o dispositivo.
- La galería acepta cualquier número de imágenes, aunque cuatro mantiene el layout editorial previsto.
- Usa textos alternativos contextuales en el componente; no incrustes información esencial únicamente dentro de una imagen.

## Validación

Usa exclusivamente pnpm:

```bash
pnpm type-check
pnpm build
pnpm test:e2e
```

Las pruebas de Playwright recorren los cinco casos en viewport de escritorio y móvil, comprueban overflow, imágenes rotas y errores de consola, y pueden guardar evidencia si se define `PORTFOLIO_EVIDENCE_DIR`.
