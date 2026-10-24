/** Verify real prerendered pages before publishing the static directory. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const output = path.resolve("dist");
const routes = [
  "",
  "about",
  "skills",
  "projects",
  "projects/this-site",
  "projects/smesh-vpn",
  "projects/cluster",
  "projects/game-of-life",
  "projects/solitaire",
];
const titles = new Set();
for (const route of routes) {
  const html = fs.readFileSync(path.join(output, route, "index.html"), "utf8");
  assert.match(html, /<h1[ >]/, "Missing prerendered content for /" + route);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  assert.ok(
    title && !titles.has(title),
    "Missing or duplicate page title for /" + route,
  );
  assert.equal((html.match(/<title>/g) ?? []).length, 1);
  assert.match(
    html,
    /property="og:title"/,
    "Missing sharing metadata for /" + route,
  );
  titles.add(title);
}
assert.ok(
  fs.existsSync(path.join(output, "404.html")),
  "Missing static-host fallback",
);
assert.ok(
  !fs.existsSync(path.join(output, "server")),
  "Server build must not be published",
);
fs.writeFileSync(path.join(output, ".nojekyll"), "");
console.log(
  "Verified " +
    routes.length +
    " prerendered routes, unique metadata and 404 fallback.",
);
