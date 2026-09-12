// Client-side video transcoding with ffmpeg.wasm.
// Runs entirely in the browser so there is no server CPU, no transcoding
// service, and no cost beyond storage. The trade-off is the user's CPU: a
// single-threaded wasm VP8 encode is several times slower than real time.

export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const CORE_URL = "/ffmpeg/ffmpeg-core.js";
const WASM_URL = "/ffmpeg/ffmpeg-core.wasm";

// VP8 rather than VP9: in wasm, VP9 is slow enough to be unusable on a phone.
// Constrained-quality mode keeps the bitrate honest on flat/simple footage.
const FFMPEG_ARGS = [
  "-i", "input",
  "-vf", "scale='min(1280,iw)':-2,fps=30",
  "-c:v", "libvpx",
  "-b:v", "1200k",
  "-crf", "32",
  "-deadline", "good",
  "-cpu-used", "5",
  "-pix_fmt", "yuv420p",
  "-c:a", "libopus",
  "-b:a", "96k",
  "-f", "webm",
  "output.webm",
];

let ffmpegPromise = null;

function loadFfmpeg(onStatus) {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const ffmpeg = new FFmpeg();
      onStatus?.("Loading video compressor…");
      await ffmpeg.load({ coreURL: CORE_URL, wasmURL: WASM_URL });
      return ffmpeg;
    })().catch((error) => {
      ffmpegPromise = null; // allow a retry on the next upload
      throw error;
    });
  }
  return ffmpegPromise;
}

function webmName(name) {
  return `${name.replace(/\.[^.]+$/, "") || "video"}.webm`;
}

/**
 * Converts a video File to WebM (VP8 + Opus, 720p/30fps cap).
 * Returns the original file untouched if it is already WebM, if compression
 * fails, or if the result somehow came out bigger — an upload should never be
 * blocked by the optimiser.
 */
export async function compressVideoToWebm(file, onStatus) {
  if (!file?.type?.startsWith("video/")) return file;
  if (file.type === "video/webm") return file;

  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(
      `Video is too large (max ${Math.round(MAX_VIDEO_BYTES / (1024 * 1024))} MB)`
    );
  }

  let ffmpeg;
  try {
    ffmpeg = await loadFfmpeg(onStatus);
  } catch (error) {
    console.error("ffmpeg.wasm failed to load, uploading original video:", error);
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
    const data = await ffmpeg.readFile("output.webm");

    const blob = new Blob([data], { type: "video/webm" });
    if (blob.size >= file.size) return file;

    return new File([blob], webmName(file.name), {
      type: "video/webm",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("WebM conversion failed, uploading original video:", error);
    return file;
  } finally {
    ffmpeg.off("progress", onProgress);
    await ffmpeg.deleteFile("input").catch(() => {});
    await ffmpeg.deleteFile("output.webm").catch(() => {});
  }
}
