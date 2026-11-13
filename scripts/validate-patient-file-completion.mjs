import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as rxjs from "rxjs";

// Exercise the real component's receipt/payload logic with isolated HTTP ports.
// No browser identity, patient data, or live database is used.
const compile = path => ts.transpileModule(fs.readFileSync(path, "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true },
}).outputText;
const dateModule = { exports: {} };
vm.runInNewContext(compile("src/app/utils/iran-datetime.util.ts"), { exports: dateModule.exports, Date, Intl });
const decorator = () => () => {};
class EventEmitter { values = []; emit(value) { this.values.push(value); } }
const module = { exports: {} };
vm.runInNewContext(compile("src/app/features/secretary/patient-files/patient-file-completion.component.ts"), {
  exports: module.exports, Date, Intl,
  require(name) {
    if (name === "rxjs") return rxjs;
    if (name === "@angular/core") return { Component: decorator, Input: decorator, Output: decorator,
      EventEmitter, inject: () => ({}), ChangeDetectionStrategy: { OnPush: 0 } };
    if (name === "@angular/core/rxjs-interop") return { takeUntilDestroyed: () => source => source };
    if (name.includes("iran-datetime.util")) return dateModule.exports;
    return {};
  },
});
const Component = module.exports.PatientFileCompletionComponent;
function fixture() {
  const calls = [];
  const api = {
    getPaperRecord: () => rxjs.of({ treatments: [{ cost: 1000 }], dentalChart: { 1: { service: "composite" } } }),
    ensureFinancialIdentity: id => { calls.push(["identity", id]); return rxjs.of({ financialPatientId: "test-patient" }); },
    completeFinance: (id, body) => { calls.push(["complete", id, body]); return rxjs.of({ financialCaseId: "test-case" }); },
    linkFinance: (id, caseId) => { calls.push(["link", id, caseId]); return rxjs.of({ financialCaseId: caseId }); },
    approveService: id => { calls.push(["approve", id]); return rxjs.of({ approvedAtUtc: "test-time" }); },
  };
  const c = new Component(api, {}, { markForCheck() {} });
  c.file = { id: 42, finance: null };
  c.ngOnInit();
  return { c, calls };
}
{
  const { c, calls } = fixture();
  assert.equal(c.totalAmount, 1000);
  assert.equal(c.serviceUnits[1], 1);
  c.submit();
  assert.equal(calls.length, 0, "Receipt confirmation must precede saving");
  c.receiptConfirmed = true;
  c.submit();
  const payload = calls.find(x => x[0] === "complete")[2];
  assert.equal(payload.paymentMode, "cash");
  assert.equal(payload.cashReceived, 1000, "Cash must always record full treatment price");
  assert.equal(payload.cheques.length, 0);
  assert.equal(c.saved.values.length, 1);
}
{
  const { c, calls } = fixture();
  c.changeMode("installments"); c.cashReceived = 100;
  c.addCheque(false); c.addCheque(true); c.addNote();
  c.cheques[0] = { amount: 200, number: "۱۲۳", ownerName: " صاحب چک ", dueDate: null, installment: false };
  c.cheques[1] = { amount: 300, number: "۴۵۶", ownerName: "صاحب چک", dueDate: dateModule.exports.fromIranDateInputValue("2027-01-20"), installment: true };
  c.notes[0] = { amount: 400, number: "۷۸۹", dueDate: dateModule.exports.fromIranDateInputValue("2027-02-21") };
  c.receiptConfirmed = true; c.submit();
  const payload = calls.find(x => x[0] === "complete")[2];
  assert.equal(payload.cashReceived, 100);
  assert.equal(payload.cheques[0].number, "123");
  assert.equal(payload.cheques[0].dueDate, null);
  assert.equal(payload.cheques[1].dueDate, "2027-01-20", "Iran due day must not shift to the previous UTC day");
  assert.equal(payload.notes[0].dueDate, "2027-02-21");
  assert.equal(c.uncoveredAmount, 0);
}
{
  const { c, calls } = fixture();
  c.changeMode("installments"); c.addNote();
  c.notes[0] = { amount: 900, number: "123", dueDate: new Date() };
  c.receiptConfirmed = true; c.submit();
  assert.equal(calls.length, 0, "Under-covered installments must not be submitted");
  c.changeMode("cash");
  assert.equal(c.notes.length, 0, "Cash must discard obsolete installment documents");
  assert.equal(c.receiptConfirmed, false);
}
{
  const { c, calls } = fixture();
  c.file.finance = { cases: [{ id: "existing-case", status: 1 }] };
  c.receiptConfirmed = true; c.submit();
  assert.equal(calls.length, 0, "Existing invoices must not silently create duplicate receipts");
  c.linkExisting("existing-case");
  assert.equal(calls[0][0], "link");
  assert.equal(calls[0][2], "existing-case");
}
{
  const { c, calls } = fixture();
  c.details = { case: {} };
  c.approve();
  assert.equal(calls.length, 0, "Service release needs explicit review confirmation");
  c.reviewConfirmed = true; c.approve();
  assert.equal(calls[0][0], "approve");
}
console.log("PASS: cash receipt, mixed documents, Iran due dates, underpayment, legacy reuse, and manual service approval.");
