#!/usr/bin/env node
/**
 * Nitro's Vercel bundle inlines PGLite JS but not pglite.data / pglite.wasm.
 * Copy them next to the bundled module so `vite preview` and a DATABASE_URL-less
 * deploy can still boot the demonstration floor.
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "node_modules/@electric-sql/pglite/dist");
const destDir = join(root, ".vercel/output/functions/__server.func/_libs");

if (!existsSync(destDir)) {
  console.log("[pglite] no Vercel function output — skip");
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
for (const name of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
  const from = join(srcDir, name);
  if (!existsSync(from)) continue;
  copyFileSync(from, join(destDir, name));
  console.log(`[pglite] copied ${name}`);
}
