import { HttpResponse } from "@angular/common/http";

export type ReceiptAction = "preview" | "share" | "download";

export async function handleTransactionReceipt(
  response: HttpResponse<Blob>,
  transactionId: number,
  action: ReceiptAction,
): Promise<void> {
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

  const file = new File([blob], fileName, { type: "text/html;charset=utf-8" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: `رسید تراکنش ${transactionId}`,
        text: "رسید تراکنش مالی",
        files: [file],
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      throw error;
    }
    return;
  }

  downloadReceipt(blob, fileName);
}

function previewReceipt(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const receiptWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (!receiptWindow) {
    URL.revokeObjectURL(url);
    throw new Error("POPUP_BLOCKED");
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function downloadReceipt(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function receiptFileName(response: HttpResponse<Blob>, transactionId: number): string {
  const disposition = response.headers.get("Content-Disposition") || "";
  const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const regularName = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  let headerName = regularName;
  if (encodedName) {
    try {
      headerName = decodeURIComponent(encodedName);
    } catch {
      headerName = encodedName;
    }
  }
  return headerName?.trim() || `financial-transaction-receipt-${transactionId}.html`;
}
