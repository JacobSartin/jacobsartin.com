/**
 * Uploads dist/ over FTP, then checks that the live site serves the build.
 * Jenkins runs it after `pnpm build` (see ../../Jenkinsfile). deploy-plan.mjs
 * decides what to upload and remove.
 *
 * Each file is uploaded under a temporary name and renamed into place, so a
 * request never reads a half-written file.
 *
 * Environment:
 * - FTP_HOST, FTP_USER, FTP_PASSWORD
 * - FTP_DIR: the site root on the server, relative to the login directory or
 *   absolute
 * - FTP_SECURE=true: require explicit TLS (FTPS)
 * - SITE_URL: the live site to verify afterwards; skipped when unset
 * - DRY_RUN=true: print the plan without changing anything
 */

import { Client } from "basic-ftp";
import fs from "node:fs";
import path from "node:path";
import { planDeploy } from "./deploy-plan.mjs";
import { verifyLive } from "./verify-live.mjs";

const distDir = path.resolve("dist");

/** @param {string} name */
function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

/**
 * @param {string} dir
 * @param {string} [prefix]
 * @returns {Map<string, number>} Path relative to dir, to size in bytes.
 */
function listLocal(dir, prefix = "") {
  const files = new Map();
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      for (const [file, size] of listLocal(full, rel)) files.set(file, size);
    } else {
      files.set(rel, fs.statSync(full).size);
    }
  }
  return files;
}

/**
 * @param {Client} client
 * @param {string} root
 * @returns {Promise<import("./deploy-plan.mjs").RemoteTree>}
 */
async function listRemote(client, root) {
  const tree = { files: new Map(), dirs: new Set() };
  /** @param {string} prefix */
  const walk = async (prefix) => {
    const dir = prefix ? remotePath(root, prefix) : root;
    for (const entry of await client.list(dir)) {
      if (entry.name === "." || entry.name === "..") continue;
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory) {
        tree.dirs.add(rel);
        await walk(rel);
      } else if (entry.isFile) {
        tree.files.set(rel, { size: entry.size, modifiedAt: entry.modifiedAt });
      }
    }
  };
  await walk("");
  return tree;
}

/**
 * @param {string} root
 * @param {string} rel
 */
function remotePath(root, rel) {
  return root.endsWith("/") ? `${root}${rel}` : `${root}/${rel}`;
}

async function main() {
  const local = listLocal(distDir);
  const siteDir = requireEnv("FTP_DIR");
  const client = new Client(60_000);
  try {
    await client.access({
      host: requireEnv("FTP_HOST"),
      user: requireEnv("FTP_USER"),
      password: requireEnv("FTP_PASSWORD"),
      secure: process.env.FTP_SECURE === "true",
    });
    const loginDir = await client.pwd();
    const describeLogin = async () =>
      `the login directory ${loginDir} has: ${(await client.list(loginDir))
        .map((entry) => entry.name)
        .join(", ")}`;

    try {
      await client.cd(siteDir);
    } catch (error) {
      throw new Error(
        `Cannot open FTP_DIR ${siteDir} (${error instanceof Error ? error.message : error}); ${await describeLogin()}`,
      );
    }
    const root = await client.pwd();
    console.log(`Site root on the server: ${root}`);

    let plan;
    try {
      plan = planDeploy(local, await listRemote(client, root));
    } catch (error) {
      throw new Error(
        `${error instanceof Error ? error.message : error}; ${await describeLogin()}`,
      );
    }
    console.log(
      `Uploading ${plan.upload.length} of ${local.size} files, removing ${plan.remove.length} files and ${plan.removeDirs.length} directories, keeping ${plan.kept.length} recent stale assets`,
    );
    for (const rel of plan.remove) console.log(`  remove ${rel}`);
    for (const rel of plan.removeDirs) console.log(`  remove ${rel}/`);
    if (process.env.DRY_RUN === "true") {
      for (const rel of plan.upload) console.log(`  upload ${rel}`);
      console.log("DRY_RUN=true, nothing changed");
      return;
    }

    const ensured = new Set();
    for (const rel of plan.upload) {
      const target = remotePath(root, rel);
      const dir = path.posix.dirname(target);
      if (!ensured.has(dir)) {
        await client.ensureDir(dir);
        ensured.add(dir);
      }
      const temp = `${dir}/.${path.posix.basename(target)}.uploading`;
      await client.uploadFrom(path.join(distDir, rel), temp);
      try {
        await client.rename(temp, target);
      } catch {
        // Some servers refuse to rename onto an existing file.
        await client.remove(target, true);
        await client.rename(temp, target);
      }
    }
    for (const rel of plan.remove) await client.remove(remotePath(root, rel));
    for (const rel of plan.removeDirs) {
      await client.removeDir(remotePath(root, rel));
    }
    console.log("Upload complete");
  } finally {
    client.close();
  }

  const siteUrl = process.env.SITE_URL;
  if (siteUrl) {
    await verifyLive(siteUrl, distDir);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
