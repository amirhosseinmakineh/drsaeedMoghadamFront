export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export function extractFilename(
  contentDisposition: string | null,
  fallback: string,
): string {
  if (!contentDisposition) return fallback;

  const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
    contentDisposition,
  );
  if (match?.[1]) {
    return match[1].replace(/['"]/g, "");
  }

  return fallback;
}

export function reportFileName(prefix: string): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${prefix}-${today}.csv`;
}
