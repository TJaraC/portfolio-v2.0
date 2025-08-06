# Sistema de Proyectos Dinámicos

Este sistema permite crear nuevos proyectos de manera dinámica utilizando archivos JSON como fuente de datos.

## Estructura de Archivos

```
src/data/projects/
├── README.md
├── project-template.json
└── ejemplo-proyecto.json
```

## Cómo Agregar un Nuevo Proyecto

1. **Crear el archivo JSON**: Crea un nuevo archivo en `src/data/projects/` con el nombre del proyecto (ej: `mi-nuevo-proyecto.json`)

2. **Estructura del JSON**: Usa la siguiente estructura:

```json
{
  "id": "mi-nuevo-proyecto",
  "project": "TIPO DE PROYECTO",
  "name": "NOMBRE DEL PROYECTO",
  "date": "DD Month YYYY",
  "heroDescription": "Descripción que aparece debajo del nombre del proyecto",
  "heroImage": "/images/imagen-principal.jpg",
  "overview": {
    "description": "Descripción general del proyecto"
  },
  "projectGoal": {
    "description": "Descripción del objetivo del proyecto"
  },
  "fontAndColours": {
    "description": "Descripción de las decisiones de fuentes y colores",
    "colors": [
      "#color1",
      "#color2",
      "#color3",
      "#color4"
    ],
    "fonts": [
      {
        "name": "Nombre de la Fuente",
        "description": "Descripción del uso",
        "sample": "Aa"
      }
    ]
  },
  "designProcess": {
    "description": "Descripción del proceso de diseño",
    "research": {
      "description": "Descripción de la investigación",
      "image": "/images/research-image.jpg"
    }
  },
  "gallery": {
    "description": "Descripción de la galería",
    "images": [
      "/images/gallery1.jpg",
      "/images/gallery2.jpg",
      "/images/gallery3.jpg",
      "/images/gallery4.jpg"
    ]
  }
}
```

3. **Registrar el proyecto en el sistema**: Una vez creado el archivo JSON, debes añadir su ID al array de proyectos en `src/hooks/useProjectsList.ts`:

   - Abre el archivo `src/hooks/useProjectsList.ts`
   - Busca la línea 22 donde está definido el array `projectIds`:
     ```javascript
     const projectIds = ['festgo-app', 'howell-gallery'];
     ```
   - Añade el ID de tu nuevo proyecto al array:
     ```javascript
     const projectIds = ['festgo-app', 'howell-gallery', 'mi-nuevo-proyecto'];
     ```

4. **Verificar el resultado**: El proyecto será accesible automáticamente en `/projects/mi-nuevo-proyecto` y aparecerá en la lista de proyectos del home

## Campos Configurables

- **project**: Nombre del tipo de proyecto (ej: "BRANDING", "WEB DESIGN", "UI/UX")
- **name**: Nombre específico del proyecto
- **date**: Fecha del proyecto
- **cardTitle**: Título que aparece en la card de la página home
- **cardTags**: Array de 3 palabras clave que aparecen en la card de la home
- **heroDescription**: Descripción principal que aparece en el hero
- **heroImage**: Imagen principal (misma que aparecerá en la home)
- **overview.description**: Descripción general en la sección Overview
- **projectGoal.description**: Descripción del objetivo del proyecto
- **fontAndColours.description**: Descripción de las decisiones de diseño
- **fontAndColours.colors**: Array de 4 colores en formato hexadecimal
- **fontAndColours.fonts**: Array de fuentes con nombre, descripción y muestra
- **designProcess.description**: Descripción del proceso de diseño
- **designProcess.roadmap.description**: Descripción de la planificación del proyecto
- **designProcess.roadmap.image**: Imagen de la sección roadmap
- **designProcess.definition.description**: Descripción de la definición del problema
- **designProcess.definition.image**: Imagen de la sección definition
- **designProcess.inspiration.description**: Descripción de la fase de inspiración
- **designProcess.inspiration.image**: Imagen de la sección inspiration
- **designProcess.ideation.description**: Descripción de la fase de ideación
- **designProcess.ideation.image**: Imagen de la sección ideation
- **designProcess.visualUi.description**: Descripción del diseño visual UI
- **designProcess.visualUi.image**: Imagen de la sección visual UI
- **designProcess.implementation.description**: Descripción de la implementación
- **designProcess.implementation.image**: Imagen de la sección implementation
- **gallery.description**: Descripción de la galería
- **gallery.images**: Array de 4 imágenes para la galería

## Ejemplos Disponibles

- `project-template.json`: Plantilla base con datos de ejemplo
- `ejemplo-proyecto.json`: Ejemplo de un proyecto de branding para una cafetería

## URLs de Acceso

- Plantilla base: `/projects/project-template`
- Proyecto de ejemplo: `/projects/ejemplo-proyecto`
- Nuevo proyecto: `/projects/[nombre-del-archivo-sin-extension]`