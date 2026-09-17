// Client-side video transcoding with ffmpeg.wasm.
// Runs entirely in the browser so there is no server CPU, no transcoding
// service, and no cost beyond storage. Only files over 20MB are transcoded —
// small clips aren't worth the wasm startup + encode time.

export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const SKIP_COMPRESSION_BYTES = 20 * 1024 * 1024;

const CORE_URL = "/ffmpeg/ffmpeg-core.js";
const WASM_URL = "/ffmpeg/ffmpeg-core.wasm";
// Served from public/ rather than bundled — see scripts/copy-ffmpeg-core.mjs.
// Must be absolute: ffmpeg resolves it against `import.meta.url`, which the
// bundler rewrites to a file:// path.
const WORKER_PATH = "/ffmpeg/worker.js";

// H.264 "ultrafast" rather than VP8/VP9: ffmpeg.wasm runs single-threaded in
// the browser, and libx264's ultrafast preset encodes several times faster
// than libvpx at the same quality — the difference between a 10s clip taking
// ~15s vs. several minutes. MP4/H.264 also plays natively on iOS Safari,
// which WebM does not.
// 720p cap and 24fps rather than 960p/30fps: property walkthroughs don't need
// more, and fewer pixels/frames is the only real lever for encode speed once
// the preset is already at "ultrafast" on a single wasm thread.
const FFMPEG_ARGS = [
  "-i", "input",
  "-vf", "scale='min(720,iw)':-2,fps=24",
  "-c:v", "libx264",
  "-preset", "ultrafast",
  "-crf", "30",
  "-pix_fmt", "yuv420p",
  "-c:a", "aac",
  "-b:a", "96k",
  "-ac", "1",
  "-movflags", "+faststart",
  "-f", "mp4",
  "output.mp4",
];

let ffmpegPromise = null;

function loadFfmpeg(onStatus) {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const ffmpeg = new FFmpeg();
      onStatus?.("Loading video compressor…");
      await ffmpeg.load({
        classWorkerURL: new URL(WORKER_PATH, window.location.origin).href,
        coreURL: CORE_URL,
        wasmURL: WASM_URL,
      });
      return ffmpeg;
    })().catch((error) => {
      ffmpegPromise = null; // allow a retry on the next upload
      throw error;
    });
  }
  return ffmpegPromise;
}

function mp4Name(name) {
  return `${name.replace(/\.[^.]+$/, "") || "video"}.mp4`;
}

/**
 * Converts a video File to MP4 (H.264 ultrafast + AAC, 540p/30fps cap).
 * Returns the original file untouched if it's already under 20MB (not worth
 * the transcode time), if compression fails, or if the result somehow came
 * out bigger — an upload should never be blocked by the optimiser.
 */
export async function compressVideo(file, onStatus) {
  if (!file?.type?.startsWith("video/")) return file;

  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(
      `Video is too large (max ${Math.round(MAX_VIDEO_BYTES / (1024 * 1024))} MB)`
    );
  }

  if (file.size <= SKIP_COMPRESSION_BYTES) return file;

  let ffmpeg;
  try {
    ffmpeg = await loadFfmpeg(onStatus);
  } catch (error) {
    console.error("ffmpeg.wasm failed to load, uploading original video:", error);
    onStatus?.("Compressor unavailable — uploading original video…");
    return file;
  }

  const onProgress = ({ progress }) => {
    const pct = Math.min(99, Math.max(0, Math.round(progress * 100)));
    onStatus?.(`Compressing video… ${pct}%`);
  };

  try {
    ffmpeg.on("progress", onProgress);
    onStatus?.("Compressing video… 0%");

    const { fetchFile } = await import("@ffmpeg/util");
    await ffmpeg.writeFile("input", await fetchFile(file));
    await ffmpeg.exec(FFMPEG_ARGS);
    const data = await ffmpeg.readFile("output.mp4");

    const blob = new Blob([data], { type: "video/mp4" });
    if (blob.size >= file.size) return file;

    return new File([blob], mp4Name(file.name), {
      type: "video/mp4",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("MP4 conversion failed, uploading original video:", error);
    onStatus?.("Compression failed — uploading original video…");
    return file;
  } finally {
    ffmpeg.off("progress", onProgress);
    await ffmpeg.deleteFile("input").catch(() => {});
    await ffmpeg.deleteFile("output.mp4").catch(() => {});
  }
}
