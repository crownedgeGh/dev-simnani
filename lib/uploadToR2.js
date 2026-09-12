import { compressImageToWebp, isImageFile, isVideoFile } from "@/lib/mediaCompress";
import { compressVideoToWebm } from "@/lib/videoCompress";

async function presign(file, folder) {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, folder }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to prepare upload");
  }
  return data;
}

async function putToR2(uploadUrl, file) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Upload to storage failed for ${file.name}`);
  }
}

/**
 * Single entry point for property media. Everything is optimised in the browser
 * before upload — images to WebP, videos to WebM — then stored in R2 as a plain
 * public URL, exactly as before.
 */
export async function uploadFileToR2(file, folder = "properties", onStatus) {
  let upload = file;
  if (isVideoFile(file)) upload = await compressVideoToWebm(file, onStatus);
  else if (isImageFile(file)) upload = await compressImageToWebp(file);

  onStatus?.("Uploading…");
  const { uploadUrl, publicUrl } = await presign(upload, folder);
  await putToR2(uploadUrl, upload);
  return publicUrl;
}

export async function uploadFilesToR2(files, folder = "properties") {
  return Promise.all(files.map((file) => uploadFileToR2(file, folder)));
}
