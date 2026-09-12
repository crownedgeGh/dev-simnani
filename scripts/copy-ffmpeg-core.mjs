// Copies the ffmpeg.wasm core into public/ffmpeg so the browser loads it from
// our own origin instead of a third-party CDN. The wasm blob is ~32MB, so it is
// generated at build time and git-ignored rather than committed.
import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// The ESM build, not UMD: @ffmpeg/ffmpeg spawns a `type: "module"` worker,
// so the core is pulled in with a dynamic import rather than importScripts.
const source = path.join(root, "node_modules/@ffmpeg/core/dist/esm");
const target = path.join(root, "public/ffmpeg");

await mkdir(target, { recursive: true });
for (const file of ["ffmpeg-core.js", "ffmpeg-core.wasm"]) {
  await cp(path.join(source, file), path.join(target, file));
}
console.log(`ffmpeg core copied to ${path.relative(root, target)}`);
