import { readFile } from "node:fs/promises";

const root = new URL(
  "../src/app/features/secretary/patient-finance/pages/patient-finance-page/",
  import.meta.url,
);

const [template, component, styles] = await Promise.all([
  readFile(new URL("patient-finance-page.component.html", root), "utf8"),
  readFile(new URL("patient-finance-page.component.ts", root), "utf8"),
  readFile(new URL("patient-finance-page.component.scss", root), "utf8"),
]);

if (!template.includes('type="submit" [disabled]="submitting"')) {
  throw new Error("Patient-finance submit must stay actionable until an API request is in progress");
}

if (template.includes('[disabled]="submitting || createForm.invalid"')) {
  throw new Error("Patient-finance submit must not hide validation feedback behind a disabled button");
}

for (const required of [
  "this.createSubmitAttempted = true;",
  "this.createForm.markAllAsTouched();",
  "this.toast.error(this.createFormErrorMessage);",
]) {
  if (!component.includes(required)) {
    throw new Error(`Patient-finance invalid-submit feedback is missing: ${required}`);
  }
}

if (!styles.includes("bottom: calc(76px + env(safe-area-inset-bottom, 0px));")) {
  throw new Error("Patient-finance mobile actions must remain above the safe-area bottom navigation");
}

console.log("OK: patient-finance mobile submit and validation feedback are reachable");
