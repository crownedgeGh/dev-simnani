export async function uploadFileToR2(file, folder = "properties") {
  const presignRes = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, folder }),
  });
  const presignData = await presignRes.json();
  if (!presignRes.ok || !presignData.success) {
    throw new Error(presignData.error || "Failed to prepare upload");
  }

  const putRes = await fetch(presignData.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putRes.ok) {
    throw new Error(`Upload to storage failed for ${file.name}`);
  }

  return presignData.publicUrl;
}

export async function uploadFilesToR2(files, folder = "properties") {
  return Promise.all(files.map((file) => uploadFileToR2(file, folder)));
}
