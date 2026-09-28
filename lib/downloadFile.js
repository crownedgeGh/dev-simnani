// Forces a real "save to disk" download instead of the browser just
// navigating to / opening the URL in a new tab — which is what a plain
// `<a download>` does for cross-origin files (Unsplash, R2, etc.) since the
// `download` attribute is ignored across origins. Fetching the file and
// downloading it as a blob works regardless of origin as long as the host
// allows CORS reads, which image/video CDNs generally do.
export async function downloadFile(url, filename) {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error("Fetch failed");
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch {
    // Fallback for hosts that block cross-origin fetch — still better than
    // nothing, and works fine for same-origin files.
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export async function downloadFiles(urls, filenamePrefix) {
  for (let i = 0; i < urls.length; i++) {
    await downloadFile(urls[i], `${filenamePrefix}-${i + 1}`);
  }
}
