import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { assetRefs, verifyLive } from "./verify-live.mjs";

const html = (/** @type {string} */ js) =>
  `<script type="module" crossorigin src="${js}"></script><link rel="stylesheet" crossorigin href="/assets/index-b.css">`;

/** A dist/ directory holding index.html and its assets. */
function makeDist() {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), "verify-live-"));
  fs.mkdirSync(path.join(dist, "assets"));
  fs.writeFileSync(path.join(dist, "index.html"), html("/assets/index-a.js"));
  fs.writeFileSync(path.join(dist, "assets/index-a.js"), "console.log(1)");
  fs.writeFileSync(path.join(dist, "assets/index-b.css"), "body{}");
  return dist;
}

/**
 * A fetch that serves the given paths, switching to `later` after `switchAfter` calls.
 *
 * @param {Record<string, string>} pages
 * @param {Record<string, string>} [later]
 * @param {number} [switchAfter]
 */
function fakeFetch(pages, later = pages, switchAfter = Infinity) {
  let calls = 0;
  return /** @type {typeof fetch} */ (
    async (/** @type {URL} */ url) => {
      const body = (calls++ < switchAfter ? pages : later)[url.pathname];
      return new Response(body ?? "not found", { status: body ? 200 : 404 });
    }
  );
}

test("assetRefs lists each /assets/ reference once, sorted", () => {
  assert.deepEqual(
    assetRefs(html("/assets/index-a.js") + html("/assets/index-a.js")),
    ["/assets/index-a.js", "/assets/index-b.css"],
  );
  assert.deepEqual(assetRefs('<link href="https://fonts.example/x.css">'), []);
});

test("passes when the live page and assets match the build", async () => {
  const dist = makeDist();
  const refs = await verifyLive("https://site.test", dist, {
    attempts: 1,
    fetchImpl: fakeFetch({
      "/": html("/assets/index-a.js"),
      "/assets/index-a.js": "console.log(1)",
      "/assets/index-b.css": "body{}",
    }),
  });
  assert.deepEqual(refs, ["/assets/index-a.js", "/assets/index-b.css"]);
});

test("retries until the new build is live", async () => {
  const dist = makeDist();
  const current = {
    "/": html("/assets/index-a.js"),
    "/assets/index-a.js": "console.log(1)",
    "/assets/index-b.css": "body{}",
  };
  await verifyLive("https://site.test", dist, {
    attempts: 3,
    delayMs: 0,
    fetchImpl: fakeFetch({ "/": html("/assets/index-old.js") }, current, 1),
  });
});

test("fails when an asset differs from the build", async () => {
  const dist = makeDist();
  await assert.rejects(
    verifyLive("https://site.test", dist, {
      attempts: 2,
      delayMs: 0,
      fetchImpl: fakeFetch({
        "/": html("/assets/index-a.js"),
        "/assets/index-a.js": "console.log(2)",
        "/assets/index-b.css": "body{}",
      }),
    }),
    /\/assets\/index-a\.js has SHA-256/,
  );
});

test("retries network errors and reports the last one", async () => {
  const dist = makeDist();
  let calls = 0;
  await assert.rejects(
    verifyLive("https://site.test", dist, {
      attempts: 2,
      delayMs: 0,
      fetchImpl: /** @type {typeof fetch} */ (
        async () => {
          calls++;
          throw new TypeError("fetch failed");
        }
      ),
    }),
    /request failed: fetch failed/,
  );
  assert.equal(calls, 2);
});

test("fails when the live page still references the old build", async () => {
  const dist = makeDist();
  await assert.rejects(
    verifyLive("https://site.test", dist, {
      attempts: 1,
      fetchImpl: fakeFetch({ "/": html("/assets/index-old.js") }),
    }),
    /references \/assets\/index-b\.css, \/assets\/index-old\.js/,
  );
});
