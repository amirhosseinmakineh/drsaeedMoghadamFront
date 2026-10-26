 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export function ensureCsvBlob(
  blob,
  fallback = "خطا در دریافت گزارش",
) {
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
        const parsed = JSON.parse(trimmed) 



;
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
  contentDisposition,
  fallback,
) {
  if (!contentDisposition) return fallback;

  const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
    contentDisposition,
  );
  if (_optionalChain([match, 'optionalAccess', _ => _[1]])) {
    return match[1].replace(/['"]/g, "");
  }

  return fallback;
}

export function reportFileName(prefix) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${prefix}-${today}.csv`;
}
