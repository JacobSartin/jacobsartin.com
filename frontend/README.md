# jacobsartin.com

Personal portfolio site, built as a single-page app with [Vite](https://vite.dev/), React, [TanStack Router](https://tanstack.com/router/latest), and [React Aria Components](https://react-spectrum.adobe.com/react-aria/). jacobsartin.com is served from my homelab; CI also publishes a mirror to GitHub Pages.

## Getting Started

The pnpm version is pinned through the `packageManager` field in `package.json`, and pnpm switches to it automatically. Install dependencies and start the dev server:

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

Every push to `main` runs `.github/workflows/deploy.yaml`. It builds the site, then force-pushes `dist/` to the `site` branch as a single commit. jacobsartin.com serves whatever that branch holds and picks up a new build within about a minute.

To roll back, revert the commit on `main`, or re-run an earlier Deploy run.

A deploy replaces the previous build's hashed chunks. A page opened before the deploy reloads once when it fails to load one (the `vite:preloadError` handler in `index.html`).

`.github/workflows/ci.yaml` type-checks and builds every pull request. `.github/workflows/gh-pages.yaml` builds every push to `main` and deploys `dist/` to the GitHub Pages mirror at <https://jacobsartin.github.io/jacobsartin.com/>. The site base path comes from `VITE_BASE_PATH` and defaults to `/`.

The post-build step (`scripts/postbuild.mjs`) creates:

- `.nojekyll` for GitHub Pages compatibility
- `<route>/index.html` (copied from `index.html`) for each route, so deep links such as `/projects/smesh-vpn` are real files that return 200 on any static host
- `404.html` (copied from `index.html`) so unknown paths still load the app and show its not-found page
