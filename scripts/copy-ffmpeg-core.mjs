// Copies ffmpeg.wasm's runtime into public/ffmpeg so the browser loads it from
// our own origin instead of a bundle or a third-party CDN.
//
// The worker has to be served unbundled: it resolves the wasm core with
// `await import(coreURL)` on a runtime variable, which Turbopack/webpack cannot
// statically analyse ("Cannot find module as expression is too dynamic"). Served
// as a plain module it is a native browser import and just works.
//
// The wasm blob is ~32MB, so this is generated at build time and git-ignored.
import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "public/ffmpeg");

await mkdir(target, { recursive: true });

// The ESM core, not UMD: @ffmpeg/ffmpeg spawns a `type: "module"` worker.
const coreSource = path.join(root, "node_modules/@ffmpeg/core/dist/esm");
for (const file of ["ffmpeg-core.js", "ffmpeg-core.wasm"]) {
  await cp(path.join(coreSource, file), path.join(target, file));
}

// worker.js plus the modules it imports (const.js, errors.js).
const workerSource = path.join(root, "node_modules/@ffmpeg/ffmpeg/dist/esm");
for (const file of ["worker.js", "const.js", "errors.js"]) {
  await cp(path.join(workerSource, file), path.join(target, file));
}

console.log(`ffmpeg runtime copied to ${path.relative(root, target)}`);
