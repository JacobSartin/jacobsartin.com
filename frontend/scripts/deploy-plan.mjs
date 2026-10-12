/**
 * Works out what a deploy changes on the server, without touching it.
 *
 * Paths are relative to the site root, use forward slashes and have no
 * leading or trailing slash.
 *
 * - Every file in the build is uploaded, except hashed assets the server
 *   already has: Vite puts a content hash in each name under assets/, so the
 *   same name and size means the same file. Other files go first and HTML
 *   last, ending with the root index.html, so no page is published before the
 *   assets it references.
 * - Files the build no longer has are removed after the upload. Stale files
 *   under assets/ are kept for ASSET_GRACE_MS, so a page loaded before the
 *   deploy can still lazy-load its chunks.
 * - Directories the build no longer has are removed once nothing kept is in
 *   them.
 */

export const ASSET_GRACE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * @typedef {{ size: number, modifiedAt?: Date }} RemoteFile
 * @typedef {{ files: Map<string, RemoteFile>, dirs: Set<string> }} RemoteTree
 * @typedef {{ upload: string[], remove: string[], removeDirs: string[], kept: string[] }} DeployPlan
 */

/**
 * @param {Map<string, number>} local Build files, path to size in bytes.
 * @param {RemoteTree} remote Files and directories under the server's site root.
 * @param {Date} now
 * @returns {DeployPlan}
 */
export function planDeploy(local, remote, now = new Date()) {
  if (!local.has("index.html")) {
    throw new Error("The build has no index.html; run pnpm build first");
  }
  // A wrong FTP directory must not be mistaken for an old copy of the site and
  // emptied: anything already there has to look like this site.
  if (remote.files.size > 0 && !remote.files.has("index.html")) {
    throw new Error(
      "The server directory is not empty and has no index.html, so it is not the site root; check the FTP directory",
    );
  }

  const isHashedAsset = (/** @type {string} */ path) =>
    path.startsWith("assets/");
  const isHtml = (/** @type {string} */ path) => path.endsWith(".html");

  const changed = [...local.keys()]
    .filter(
      (path) =>
        !(isHashedAsset(path) && remote.files.get(path)?.size === local.get(path)),
    )
    .sort();
  const upload = [
    ...changed.filter((path) => !isHtml(path)),
    ...changed.filter((path) => isHtml(path) && path !== "index.html"),
    ...changed.filter((path) => path === "index.html"),
  ];

  const remove = [];
  const kept = [];
  for (const [path, file] of [...remote.files].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    if (local.has(path)) continue;
    const age = file.modifiedAt ? now.getTime() - file.modifiedAt.getTime() : Infinity;
    if (isHashedAsset(path) && age < ASSET_GRACE_MS) {
      kept.push(path);
    } else {
      remove.push(path);
    }
  }

  const localDirs = new Set([...local.keys()].flatMap(parentDirs));
  const staleDirs = [...remote.dirs]
    .filter(
      (dir) =>
        !localDirs.has(dir) && !kept.some((path) => path.startsWith(`${dir}/`)),
    )
    .sort();
  // removeDir is recursive, so only the outermost stale directory is needed.
  const removeDirs = staleDirs.filter(
    (dir) => !parentDirs(dir).some((parent) => staleDirs.includes(parent)),
  );

  return { upload, remove, removeDirs, kept };
}

/**
 * The directories above a path: "a/b/c.html" gives ["a", "a/b"].
 *
 * @param {string} path
 * @returns {string[]}
 */
export function parentDirs(path) {
  const parts = path.split("/").slice(0, -1);
  return parts.map((_, i) => parts.slice(0, i + 1).join("/"));
}
