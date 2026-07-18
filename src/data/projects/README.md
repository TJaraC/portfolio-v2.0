# Sistema de proyectos dinámicos

Las páginas de proyecto se generan desde archivos JSON y comparten un único componente React. Los cuatro proyectos publicados usan una narrativa de diez capítulos; `project-template.json` es la fuente de verdad para crear casos nuevos.

## Proyectos publicados

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
5. Usa un nombre y apellido españoles, naturales y acordes al contexto, para la user persona.
6. Registra el `id` en `projectIds`, dentro de `src/hooks/useProjectsList.ts`.
7. Comprueba `/projects/<slug>` en escritorio y móvil.

## Estructura narrativa

La página siempre conserva este orden:

1. Introduction: título, resumen, hero y detalle responsive opcional.
2. Overview: contexto, objetivo y metadatos.
3. The challenge: problema, pregunta de diseño y tres prioridades.
4. Research & insights: insights, benchmark y persona.
5. Ideation: user flow y decisiones de arquitectura.
6. Design system & rationale: sistema visual, reglas, objetivos y soluciones construidas desde cero.
7. User testing: método, observaciones y respuestas de diseño.
8. Final design: highlights y galería de mockups.
9. Impact: outcomes o métricas con unidad explícita y contexto verificable.
10. Learnings: conclusión y aprendizajes transferibles.

## Campos principales

```json
{
  "id": "project-slug",
  "project": "PROJECT",
  "name": "NAME",
  "date": "Month YYYY",
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
    "research": {},
    "ideation": {},
    "design": {},
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

Las pruebas de Playwright recorren los cuatro casos en viewport de escritorio y móvil, comprueban overflow, imágenes rotas y errores de consola, y pueden guardar evidencia si se define `PORTFOLIO_EVIDENCE_DIR`.
