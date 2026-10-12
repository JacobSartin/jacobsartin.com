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
- `pnpm test`: run the deploy script tests (`scripts/*.test.mjs`)
- `pnpm start`: preview the production build locally

## Project Layout

- `src/router.tsx`: route tree and root layout
- `src/page.tsx`, `src/about/`, `src/skills/`, `src/projects/`: page components and their styles
- `src/projects/<slug>/page.tsx`: project pages. Each one is registered automatically at `/projects/<slug>` and lazy-loaded.
- `src/components/`: shared UI (nav, cards, theme and accent controls, project template)
- `src/globals.css`: design tokens (spacing, colors, widths) and shared utilities

## Deployment

jacobsartin.com is deployed with Jenkins. On every change to `main`, the [`Jenkinsfile`](../Jenkinsfile) installs dependencies, runs the tests and builds the site. Then `scripts/deploy.mjs` uploads `dist/` over FTP. The build fails unless the live page references the same hashed assets as `dist/index.html`, with matching SHA-256 hashes.

`scripts/deploy-plan.mjs` keeps the site consistent during an upload:

- Files are uploaded under a temporary name and renamed into place.
- Assets go first and HTML last, so no page references an asset that isn't there yet.
- Files the build no longer has are removed afterwards. Old hashed assets are kept for 7 days, so pages that are already open can still load their chunks.
- A non-empty target directory without `index.html` is refused.

To check what is live, build the commit you expect and run:

```bash
pnpm build
node scripts/verify-live.mjs https://jacobsartin.com
```

`DRY_RUN=true` prints the deploy plan without changing anything; the other variables are listed at the top of `scripts/deploy.mjs`. To roll back, revert the commit on `main`.

`.github/workflows/ci.yaml` type-checks, tests and builds every pull request. `.github/workflows/gh-pages.yaml` builds every push to `main` and deploys `dist/` to the GitHub Pages mirror at <https://jacobsartin.github.io/jacobsartin.com/>. The site base path comes from `VITE_BASE_PATH` and defaults to `/`.

The post-build step (`scripts/postbuild.mjs`) creates:

- `.nojekyll` for GitHub Pages compatibility
- `<route>/index.html` (copied from `index.html`) for each route, so deep links such as `/projects/smesh-vpn` are real files that return 200 on any static host
- `404.html` (copied from `index.html`) so unknown paths still load the app and show its not-found page
