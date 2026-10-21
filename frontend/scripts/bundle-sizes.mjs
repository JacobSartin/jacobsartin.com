import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, gzipSync } from "node:zlib";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const manifest = JSON.parse(
  await readFile(resolve(dist, ".vite/manifest.json"), "utf8"),
);
const initial = new Set();
const visited = new Set();

function visit(key) {
  if (visited.has(key)) return;
  visited.add(key);
  const chunk = manifest[key];
  initial.add(chunk.file);
  for (const css of chunk.css ?? []) initial.add(css);
  for (const dependency of chunk.imports ?? []) visit(dependency);
}

for (const [key, chunk] of Object.entries(manifest)) {
  if (chunk.isEntry) visit(key);
}

const files = new Set();
for (const chunk of Object.values(manifest)) {
  files.add(chunk.file);
  for (const css of chunk.css ?? []) files.add(css);
}

const totals = { initial: [0, 0, 0], deferred: [0, 0, 0] };
const rows = [];
for (const file of [...files].sort()) {
  if (!/\.(js|css)$/.test(file)) continue;
  const content = await readFile(resolve(dist, file));
  const sizes = [
    content.length,
    gzipSync(content).length,
    brotliCompressSync(content).length,
  ];
  const phase = initial.has(file) ? "initial" : "deferred";
  sizes.forEach((size, index) => { totals[phase][index] += size; });
  rows.push({ file, phase, raw: sizes[0], gzip: sizes[1], brotli: sizes[2] });
}

console.table(rows);
for (const [phase, [raw, gzip, brotli]] of Object.entries(totals)) {
  console.log(`${phase}: ${raw} raw / ${gzip} gzip / ${brotli} Brotli bytes`);
}
console.log(
  "Initial = static entry imports and their CSS. Deferred chunks may still be fetched by application code; verify in a cold browser session. External fonts, HTML and images are excluded. Compression is a local estimate, not measured wire transfer.",
);
