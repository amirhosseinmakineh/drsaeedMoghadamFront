export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export function ensureCsvBlob(
  blob: Blob,
  fallback = "خطا در دریافت گزارش",
): Promise<Blob> {
  if (blob.size === 0) {
    return Promise.reject(new Error("فایل گزارش خالی است"));
  }

  return blob
    .slice(0, Math.min(blob.size, 512))
    .text()
    .then((head) => {
      const trimmed = head.trimStart();
      if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
        return blob;
      }

      try {
        const parsed = JSON.parse(trimmed) as {
          message?: string;
          title?: string;
          error?: string;
        };
        throw new Error(
          parsed.message || parsed.title || parsed.error || fallback,
        );
      } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error(fallback);
      }
    });
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
