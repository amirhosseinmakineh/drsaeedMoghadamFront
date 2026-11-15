import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as rxjs from "rxjs";

const root = new URL("../", import.meta.url);
function load(relative, dependencies = {}) {
  const code = ts.transpileModule(fs.readFileSync(new URL(relative, root), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, experimentalDecorators: true },
  }).outputText;
  const context = { exports: {}, Intl, Date, console, require: name => dependencies[name] ?? {} };
  vm.runInNewContext(code, context);
  return context.exports;
}
const dates = load("src/app/utils/iran-datetime.util.ts");
const module = load("src/app/pages/admin-dashboard/admin-installments.component.ts", {
  "@angular/core": { Component: () => target => target, inject: () => ({}), ChangeDetectionStrategy: { OnPush: 0 } },
  "@angular/core/rxjs-interop": { takeUntilDestroyed: () => source => source },
  rxjs,
  "../../utils/iran-datetime.util": dates,
});
const listRequests = [], payments = [], notices = [];
const api = {
  list: (filters, page) => { const stream = new rxjs.Subject(); listRequests.push({ filters, page, stream }); return stream; },
  recordPayment: row => { const stream = new rxjs.Subject(); payments.push({ row, stream }); return stream; },
};
const c = new module.AdminInstallmentsComponent(api, { markForCheck() {} }, { success: text => notices.push(text) });
c.filters = { search: " patient ", status: "overdue", fromDate: "2026-11-23", toDate: "2026-11-22" };
c.load(); assert.equal(listRequests.length, 0); assert.ok(c.error);
c.filters.toDate = "2026-11-30"; c.load(2);
assert.equal(listRequests[0].filters.search, "patient"); assert.equal(listRequests[0].page, 2);
c.load(); assert.equal(listRequests[0].stream.observers.length, 0, "Stale responses must be unsubscribed");
assert.equal(c.dueDate("2026-11-23"), "۲ آذر ۱۴۰۵");
const paid = { id: 1, caseId: "case", paidAtUtc: "2026-11-23T00:00:00Z" };
c.openPayment(paid); assert.equal(c.selected, null);
const unpaid = { ...paid, paidAtUtc: null };
c.openPayment(unpaid); c.recordPayment(); c.recordPayment();
assert.equal(payments.length, 1, "Double clicks must not submit two receipts");
c.closePayment(); assert.equal(c.selected.id, 1, "Pending requests keep their confirmation dialog open");
payments[0].stream.error({ error: { message: "already paid" } });
assert.equal(c.saving, false); assert.equal(c.paymentError, "already paid"); assert.equal(c.selected.id, 1);
c.recordPayment(); payments[1].stream.next({}); payments[1].stream.complete();
assert.equal(c.selected, null); assert.equal(notices.length, 1); assert.equal(c.saving, false);
assert.equal(listRequests.length, 3, "Successful payment refreshes balances and row status");
c.clear(); assert.equal(c.filters.status, ""); assert.equal(c.filters.fromDate, undefined);
console.log("PASS: installment filters, stale-request cancellation, Iran date display, duplicate payment guard, failure handling and balance refresh.");
