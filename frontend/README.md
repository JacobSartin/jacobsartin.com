# jacobsartin.com

Personal portfolio site, prerendered with [TanStack Start](https://tanstack.com/start/latest), [Vite+](https://viteplus.dev/), React, and [TanStack Router](https://tanstack.com/router/latest). jacobsartin.com is served from my homelab; CI also publishes a mirror to GitHub Pages.

The React imports run on [TanStack Redact](https://github.com/TanStack/redact) using its default feature preset, including hydration, context and Suspense. Rendering and transitions are synchronous; check Redact compatibility before introducing React action or concurrent rendering APIs. SSR dependencies are bundled together so prerendering uses the same runtime as the browser.

## Getting Started

Use Node.js 22.18+, 24.11+, or 26+ (CI uses Node.js 24). The pnpm version is pinned through the `packageManager` field in `package.json`, and pnpm switches to it automatically. From `frontend/`, install dependencies and start the dev server:

```bash
pnpm install
pnpm dev
```

Open <http://localhost:5173> in your browser.

## Scripts

- `pnpm dev`: start the Vite+ dev server
- `pnpm build`: build the production bundle into `dist/`, then run the post-build step
- `pnpm check`: check formatting, lint rules, and TypeScript types with Vite+
- `pnpm fmt`: format the project with Vite+
- `pnpm typecheck`: type-check the project with `tsc --noEmit`
- `pnpm start`: preview the production build locally
- `pnpm size`: build and report initial/deferred JS/CSS sizes (raw, gzip, and Brotli)

Vite+ is installed locally, so no global CLI is required. `vite.config.ts` holds the build, lint, and format settings; `pnpm-workspace.yaml` pins Vite+ and aliases Vite to the matching Vite+ core so plugins share one toolchain. Keep those versions aligned when upgrading. The project retains its existing 80-column formatting preference.

With the optional global `vp` CLI, use `vp install`, `vp dev`, `vp check`, and `vp run build`. Use `vp run build` instead of the bare `vp build` command when you need the complete static site, including prerendered pages and the 404 fallback. `vp build` bundles and prerenders; the complete script also verifies the static output and creates `.nojekyll`.

## Project Layout

- `src/router.tsx`: a fresh Router factory for Start, intent preloading and scroll restoration
- `src/routes/`: typed route definitions and root layout. Start generates `src/routeTree.gen.ts`; do not edit the generated file.
- `src/page.tsx`, `src/about/`, `src/skills/`, `src/projects/`: page components and their styles
- `src/projects/<slug>/page.tsx`: project pages. Register each with a thin `src/routes/projects/<slug>.tsx` route; Start splits page components automatically.
- `src/projects/cards.ts`: project metadata shared by routing and the listing
- `src/components/`: shared UI (nav, cards, theme and accent controls, project template)
- `src/globals.css`: design tokens (spacing, colors, widths) and shared utilities

Home loads eagerly. Secondary routes and their CSS load on navigation or link intent; the projects listing does not fetch every detail page. The accent picker and color libraries load only when its control is activated.

Route metadata is rendered by `HeadContent`, including page titles, descriptions and social tags. A catch-all route supplies not-found metadata. Router Devtools are available in development and excluded from production. Add new internal project links using the generated route types so invalid destinations fail type checking.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yaml`. It builds the site, then force-pushes `dist/` to the `site` branch as a single commit. jacobsartin.com serves whatever that branch holds and picks up a new build within about a minute.

To roll back, revert the commit on `main`, or re-run an earlier Deploy run.

A deploy replaces the previous build's hashed chunks. The document bootstrap in `src/utils/bootstrap.ts` reloads once when an old page cannot load a replaced chunk. That bootstrap also applies persisted theme/accent preferences before first paint.

All three workflows use `voidzero-dev/setup-vp` to install Node.js, the pinned Vite+ toolchain, and dependencies with a frozen lockfile. Builds run through `vp run build` so the post-build step is included.

`.github/workflows/ci.yaml` runs `pnpm check` and builds every pull request. `.github/workflows/gh-pages.yaml` builds every push to `main` and deploys `dist/` to the GitHub Pages mirror at <https://jacobsartin.github.io/jacobsartin.com/>. The site base path comes from `VITE_BASE_PATH` and defaults to `/`.

Start prerenders every page into `<route>/index.html`, including page content, unique titles, descriptions and sharing metadata. A separate SPA shell becomes `404.html` for static-host unknown paths. The postbuild step verifies the nine real pages and fallback, then creates `.nojekyll`.

Only `dist/` is published. `.tanstack/server/` contains the temporary server used during prerendering and is ignored by Git. Both the default `/` base and the GitHub Pages `/jacobsartin.com/` base are supported. Run the complete `pnpm build` to verify prerendered output before deployment.
