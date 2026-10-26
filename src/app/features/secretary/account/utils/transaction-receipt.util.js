 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

 

export async function handleTransactionReceipt(
  response,
  transactionId,
  action,
) {
  const blob = response.body;
  if (!blob) throw new Error("EMPTY_RECEIPT");

  const fileName = receiptFileName(response, transactionId);
  if (action === "preview") {
    previewReceipt(blob);
    return;
  }
  if (action === "download") {
    downloadReceipt(blob, fileName);
    return;
  }

  const file = createShareableReceiptFile(blob, fileName);
  if (file && canShareReceipt(file)) {
    try {
      await navigator.share({
        title: `رسید تراکنش ${transactionId}`,
        text: "رسید تراکنش مالی",
        files: [file],
      });
      return;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      // Sharing can fail after an asynchronous HTTP request because some
      // browsers no longer consider the original click a user gesture. A
      // receipt must still remain available, so fall back to downloading it.
    }
  }

  downloadReceipt(blob, fileName);
}

function createShareableReceiptFile(blob, fileName) {
  if (typeof File !== "function") return null;
  return new File([blob], fileName, { type: blob.type || "text/html;charset=utf-8" });
}

function canShareReceipt(file) {
  if (typeof navigator.share !== "function" || typeof navigator.canShare !== "function") {
    return false;
  }
  try {
    return navigator.canShare({ files: [file] });
  } catch (e) {
    return false;
  }
}

function previewReceipt(blob) {
  const url = URL.createObjectURL(blob);
  const receiptWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (!receiptWindow) {
    URL.revokeObjectURL(url);
    throw new Error("POPUP_BLOCKED");
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function downloadReceipt(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function receiptFileName(response, transactionId) {
  const disposition = response.headers.get("Content-Disposition") || "";
  const encodedName = _optionalChain([disposition, 'access', _ => _.match, 'call', _2 => _2(/filename\*=UTF-8''([^;]+)/i), 'optionalAccess', _3 => _3[1]]);
  const regularName = _optionalChain([disposition, 'access', _4 => _4.match, 'call', _5 => _5(/filename="?([^";]+)"?/i), 'optionalAccess', _6 => _6[1]]);
  let headerName = regularName;
  if (encodedName) {
    try {
      headerName = decodeURIComponent(encodedName);
    } catch (e2) {
      headerName = encodedName;
    }
  }
  return _optionalChain([headerName, 'optionalAccess', _7 => _7.trim, 'call', _8 => _8()]) || `financial-transaction-receipt-${transactionId}.html`;
}
