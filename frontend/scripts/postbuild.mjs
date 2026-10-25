/**
 * Post-build script for the Vite static output.
 *
 * 1. Adds `.nojekyll` so GitHub Pages serves underscore-prefixed assets.
 * 2. Copies `index.html` to `<route>/index.html` for every client-side route,
 *    so deep links such as /projects/smesh-vpn are real files and return 200
 *    from any static host.
 * 3. Creates `404.html` as a copy of `index.html`, so unknown paths still load
 *    the app and show its not-found page.
 */

import fs from "fs";
import path from "path";

const outDir = path.resolve("dist");
const projectsDir = path.resolve("src/routes/projects");

// Project pages own their file routes in src/routes/projects/<slug>/index.tsx.
const staticRoutes = ["about", "skills", "projects"];
const projectRoutes = fs
  .readdirSync(projectsDir, { withFileTypes: true })
  .filter(
    (entry) =>
      entry.isDirectory() &&
      fs.existsSync(path.join(projectsDir, entry.name, "index.tsx")),
  )
  .map((entry) => `projects/${entry.name}`);

const indexPath = path.join(outDir, "index.html");
if (!fs.existsSync(indexPath)) {
  throw new Error(`${indexPath} not found; run pnpm build first`);
}

// ── 1. .nojekyll ────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(outDir, ".nojekyll"), "");
console.log("Created .nojekyll");

// ── 2. Per-route index.html ─────────────────────────────────────────────────────
const routes = [...staticRoutes, ...projectRoutes];
for (const route of routes) {
  const routeDir = path.join(outDir, route);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.copyFileSync(indexPath, path.join(routeDir, "index.html"));
}
console.log(`Created index.html for ${routes.length} routes`);

// ── 3. 404.html ─────────────────────────────────────────────────────────────────
fs.copyFileSync(indexPath, path.join(outDir, "404.html"));
console.log("Created 404.html fallback");

console.log("Post-build complete.");
