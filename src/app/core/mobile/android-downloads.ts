import { Capacitor, registerPlugin } from "@capacitor/core";

interface DownloadsStorage {
  save(options: { filename: string; data: string }): Promise<{ uri: string }>;
}

const downloadsStorage = registerPlugin<DownloadsStorage>("DownloadsStorage");

/** Android-only: writes to the public Downloads collection via MediaStore. */
export async function saveToAndroidDownloads(blob: Blob, filename: string): Promise<void> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
    throw new Error("Android downloads are only available in the Android app.");
  }
  if (!blob.size) throw new Error("Cannot save an empty file.");

  const bytes = new Uint8Array(await blob.arrayBuffer());
  // Convert in chunks to avoid argument-length limits on large files.
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 8192) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  }
  await downloadsStorage.save({ filename, data: btoa(binary) });
}
