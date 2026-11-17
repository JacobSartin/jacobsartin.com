/**
 * Verify that the `vite` alias is the Vite+ core this vite-plus was released
 * with. The two are pinned separately in pnpm-workspace.yaml and use different
 * version numbers, so an update can move one without the other.
 */
import fs from "node:fs";
import path from "node:path";

function readManifest(name) {
  const file = path.resolve("node_modules", name, "package.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const vitePlus = readManifest("vite-plus");
const vite = readManifest("vite");
// For example "npm:@voidzero-dev/vite-plus-core@8.3.8000".
const declared = vitePlus.dependencies?.vite ?? "";
const [, name, version] =
  declared.match(/^npm:(.+)@(\d+\.\d+\.\d+(?:-[\w.]+)?)$/) ?? [];

if (!name) {
  console.log(
    "Skipped the Vite+ toolchain check: vite-plus " +
      vitePlus.version +
      ' declares its core as "' +
      declared +
      '", which is not an exact alias.',
  );
} else if (vite.name !== name || vite.version !== version) {
  console.error(
    [
      "The Vite+ toolchain is out of step.",
      `  vite-plus ${vitePlus.version} was released with ${name} ${version},`,
      `  but the vite alias installs ${vite.name} ${vite.version}.`,
      "Update both catalog entries in pnpm-workspace.yaml together.",
    ].join("\n"),
  );
  process.exitCode = 1;
} else {
  console.log(
    `Verified vite-plus ${vitePlus.version} with its core ${name} ${version}.`,
  );
}
