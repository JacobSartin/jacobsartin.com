# jacobsartin.com

Personal portfolio site, built as a single-page app with [Vite](https://vite.dev/), React, [TanStack Router](https://tanstack.com/router/latest), and [React Aria Components](https://react-spectrum.adobe.com/react-aria/). It deploys to GitHub Pages.

## Getting Started

The pnpm version is pinned through the `packageManager` field in `package.json`. Run `corepack enable` once to use it. Then install dependencies and start the dev server:

```bash
pnpm install
pnpm dev
```

Open <http://localhost:5173> in your browser.

## Scripts

- `pnpm dev`: start the Vite dev server
- `pnpm build`: build the production bundle into `dist/`, then run the post-build step
- `pnpm typecheck`: type-check the project with `tsc --noEmit`
- `pnpm start`: preview the production build locally

## Project Layout

- `src/router.tsx`: route tree and root layout
- `src/page.tsx`, `src/about/`, `src/skills/`, `src/projects/`: page components and their styles
- `src/projects/<slug>/page.tsx`: project pages. Each one is registered automatically at `/projects/<slug>` and lazy-loaded.
- `src/components/`: shared UI (nav, cards, theme and accent controls, project template)
- `src/globals.css`: design tokens (spacing, colors, widths) and shared utilities

## Deployment

`.github/workflows/gh-pages.yaml` type-checks and builds on every push to `main`, then deploys `dist/` to GitHub Pages. The site base path comes from `VITE_BASE_PATH` and defaults to `/`.

The post-build step (`scripts/postbuild.mjs`) creates:

- `.nojekyll` for GitHub Pages compatibility
- `404.html` (copied from `index.html`) for SPA deep-link fallback
