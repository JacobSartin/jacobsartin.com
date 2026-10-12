import assert from "node:assert/strict";
import { test } from "node:test";
import { ASSET_GRACE_MS, parentDirs, planDeploy } from "./deploy-plan.mjs";

const now = new Date("2026-10-12T12:00:00Z");
const ago = (/** @type {number} */ ms) => new Date(now.getTime() - ms);

/** @param {Record<string, number>} files */
const local = (files) => new Map(Object.entries(files));

/**
 * @param {Record<string, { size: number, modifiedAt?: Date }>} files
 * @param {string[]} [dirs]
 */
const remote = (files, dirs = []) => ({
  files: new Map(Object.entries(files)),
  dirs: new Set(dirs),
});

test("uploads assets first and HTML last, ending with the root index.html", () => {
  const plan = planDeploy(
    local({
      "index.html": 1,
      "404.html": 1,
      "about/index.html": 1,
      "assets/index-a.js": 10,
      "favicon.ico": 5,
    }),
    remote({}),
    now,
  );
  assert.deepEqual(plan.upload, [
    "assets/index-a.js",
    "favicon.ico",
    "404.html",
    "about/index.html",
    "index.html",
  ]);
});

test("skips hashed assets the server already has, but re-uploads other files", () => {
  const plan = planDeploy(
    local({ "index.html": 2, "assets/index-a.js": 10, "favicon.ico": 5 }),
    remote({
      "index.html": { size: 2 },
      "assets/index-a.js": { size: 10 },
      "favicon.ico": { size: 5 },
    }),
    now,
  );
  assert.deepEqual(plan.upload, ["favicon.ico", "index.html"]);
});

test("re-uploads a hashed asset whose size differs, such as a partial upload", () => {
  const plan = planDeploy(
    local({ "index.html": 2, "assets/index-a.js": 10 }),
    remote({ "index.html": { size: 2 }, "assets/index-a.js": { size: 4 } }),
    now,
  );
  assert.deepEqual(plan.upload, ["assets/index-a.js", "index.html"]);
});

test("keeps recent stale assets and removes old ones and other stale files", () => {
  const plan = planDeploy(
    local({ "index.html": 2, "assets/index-new.js": 10 }),
    remote({
      "index.html": { size: 2 },
      "assets/index-recent.js": { size: 9, modifiedAt: ago(60_000) },
      "assets/index-old.js": { size: 9, modifiedAt: ago(ASSET_GRACE_MS + 1) },
      "assets/index-undated.js": { size: 9 },
      ".index.html.uploading": { size: 1, modifiedAt: ago(60_000) },
      "old-page.html": { size: 2, modifiedAt: ago(60_000) },
    }),
    now,
  );
  assert.deepEqual(plan.kept, ["assets/index-recent.js"]);
  assert.deepEqual(plan.remove, [
    ".index.html.uploading",
    "assets/index-old.js",
    "assets/index-undated.js",
    "old-page.html",
  ]);
});

test("removes only the outermost directory the build no longer has", () => {
  const plan = planDeploy(
    local({ "index.html": 2, "projects/index.html": 2 }),
    remote(
      {
        "index.html": { size: 2 },
        "projects/gone/index.html": { size: 2 },
        "projects/gone/deep/x.html": { size: 2 },
      },
      ["projects", "projects/gone", "projects/gone/deep", "empty"],
    ),
    now,
  );
  assert.deepEqual(plan.removeDirs, ["empty", "projects/gone"]);
});

test("keeps a stale directory that still holds a kept asset", () => {
  const plan = planDeploy(
    local({ "index.html": 2, "assets/index-new.js": 10 }),
    remote(
      {
        "index.html": { size: 2 },
        "assets/fonts/x-old.woff2": { size: 3, modifiedAt: ago(60_000) },
      },
      ["assets", "assets/fonts"],
    ),
    now,
  );
  assert.deepEqual(plan.kept, ["assets/fonts/x-old.woff2"]);
  assert.deepEqual(plan.removeDirs, []);
});

test("refuses a non-empty server directory without index.html", () => {
  assert.throws(
    () =>
      planDeploy(
        local({ "index.html": 2 }),
        remote({ "jacobsartin.com/index.html": { size: 2 } }, ["jacobsartin.com"]),
        now,
      ),
    /not the site root/,
  );
});

test("deploys into an empty server directory", () => {
  const plan = planDeploy(local({ "index.html": 2 }), remote({}), now);
  assert.deepEqual(plan.upload, ["index.html"]);
});

test("refuses a build without index.html", () => {
  assert.throws(
    () => planDeploy(local({ "assets/a.js": 1 }), remote({}), now),
    /no index.html/,
  );
});

test("parentDirs lists every directory above a path", () => {
  assert.deepEqual(parentDirs("a/b/c.html"), ["a", "a/b"]);
  assert.deepEqual(parentDirs("index.html"), []);
});
