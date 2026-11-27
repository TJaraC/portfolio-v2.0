# Patricio Jaramillo — Portfolio

Personal portfolio site built with React and TypeScript, featuring smooth animations and a custom cursor experience.

Live at [www.hellotjc.com](https://www.hellotjc.com)

## Stack

React 18, TypeScript, Vite 8, GSAP, Lenis

## Development

This repository uses pnpm exclusively.

```bash
pnpm install
pnpm start
```

Create a production build with `pnpm build` and run the TypeScript checks with `pnpm type-check`.

| Command | What it does |
|---|---|
| `pnpm build` | Type-checks and builds; also writes one static HTML per route (metadata, JSON-LD, prerendered content), `404.html` and `sitemap.xml`. |
| `pnpm verify:opengraph` | Checks the built SEO output (run after `pnpm build`). |
| `pnpm lint` | ESLint, including the React hooks rules. |
| `pnpm test:e2e` | Playwright end-to-end suite. |
| `pnpm images` | Regenerates responsive image variants, their manifest and the 1200×630 social previews. Run it after adding or replacing an image. |

Published case studies are listed in `src/data/published-projects.json` (see `src/data/projects/README.md`).
