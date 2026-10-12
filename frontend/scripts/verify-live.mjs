/**
 * Checks that a live site serves this build: its index.html must reference the
 * same hashed assets as dist/index.html, and each of those assets must have the
 * same SHA-256 as the local file. The Deploy workflow runs it after publishing
 * a build; to check by hand after `pnpm build`:
 *
 *   node scripts/verify-live.mjs https://jacobsartin.com
 *
 * It retries for up to three minutes, because the web server picks up a new
 * build about a minute after it is published.
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * The asset paths an HTML page references, such as /assets/index-y7VCn-zT.js.
 *
 * @param {string} html
 * @returns {string[]}
 */
export function assetRefs(html) {
  const refs = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(
    (match) => match[1],
  );
  return [...new Set(refs)].sort();
}

/**
 * @param {string} siteUrl
 * @param {string} distDir
 * @param {{ attempts?: number, delayMs?: number, fetchImpl?: typeof fetch }} [options]
 * @returns {Promise<string[]>} The verified asset paths.
 */
export async function verifyLive(
  siteUrl,
  distDir,
  { attempts = 18, delayMs = 10_000, fetchImpl = fetch } = {},
) {
  const expected = assetRefs(
    fs.readFileSync(path.join(distDir, "index.html"), "utf8"),
  );
  if (expected.length === 0) {
    throw new Error(`${distDir}/index.html references no /assets/ files`);
  }

  const get = (/** @type {string} */ ref) =>
    fetchImpl(new URL(ref, siteUrl), {
      cache: "no-store",
      headers: { "cache-control": "no-cache" },
    });

  const check = async () => {
    const page = await get("/");
    if (!page.ok) return `/ returned ${page.status}`;
    const live = assetRefs(await page.text());
    if (live.join() !== expected.join()) {
      return `the live page references ${live.join(", ") || "no assets"}, the build ${expected.join(", ")}`;
    }
    for (const ref of expected) {
      const asset = await get(ref);
      if (!asset.ok) return `${ref} returned ${asset.status}`;
      const liveHash = sha256(Buffer.from(await asset.arrayBuffer()));
      const buildHash = sha256(fs.readFileSync(path.join(distDir, ref)));
      if (liveHash !== buildHash) {
        return `${ref} has SHA-256 ${liveHash} live and ${buildHash} in the build`;
      }
    }
    return "";
  };

  let problem = "";
  for (let attempt = 1; attempt <= attempts; attempt++) {
    problem = await check().catch(
      (error) => `request failed: ${error instanceof Error ? error.message : error}`,
    );
    if (!problem) {
      for (const ref of expected) {
        const hash = sha256(fs.readFileSync(path.join(distDir, ref)));
        console.log(`Live: ${ref} sha256:${hash}`);
      }
      console.log(`${siteUrl} serves this build`);
      return expected;
    }
    console.log(`Not live yet (${attempt}/${attempts}): ${problem}`);
    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error(`${siteUrl} does not serve this build: ${problem}`);
}

/** @param {Buffer} data */
function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const siteUrl = process.argv[2] ?? "https://jacobsartin.com";
  verifyLive(siteUrl, path.resolve("dist")).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
