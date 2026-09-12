// Client-side image normalisation: every uploaded image becomes WebP before it
// hits the network. Videos are handled separately by lib/videoCompress.js.

const IMAGE_MAX_SIZE_MB = 1;
const IMAGE_MAX_DIMENSION = 2560;
const IMAGE_QUALITY = 0.82;

export function isImageFile(file) {
  return Boolean(file?.type?.startsWith("image/"));
}

export function isVideoFile(file) {
  return Boolean(file?.type?.startsWith("video/"));
}

function withWebpName(name) {
  return `${name.replace(/\.[^.]+$/, "") || "image"}.webp`;
}

/**
 * Convert an image File to WebP. Returns the original file untouched if it is
 * not an image, is already WebP, or if conversion fails for any reason.
 */
export async function compressImageToWebp(file) {
  if (!isImageFile(file)) return file;
  if (file.type === "image/webp") return file;

  try {
    const { default: imageCompression } = await import("browser-image-compression");

    const compressed = await imageCompression(file, {
      fileType: "image/webp",
      maxSizeMB: IMAGE_MAX_SIZE_MB,
      maxWidthOrHeight: IMAGE_MAX_DIMENSION,
      initialQuality: IMAGE_QUALITY,
      useWebWorker: true,
    });

    return new File([compressed], withWebpName(file.name), {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("WebP conversion failed, uploading original:", error);
    return file;
  }
}

export async function compressImagesToWebp(files) {
  return Promise.all(files.map((file) => compressImageToWebp(file)));
}
