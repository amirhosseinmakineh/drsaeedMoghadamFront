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
const chartModels = { exports: {} };
vm.runInNewContext(compile("src/app/features/secretary/patient-files/dental-chart/dental-chart.models.ts"), { exports: chartModels.exports });
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
    if (name.includes("dental-chart.models")) return chartModels.exports;
    return {};
  },
});
const Component = module.exports.PatientFileCompletionComponent;
function fixture(chart = { 1: { service: "composite" } }) {
  const calls = [];
  const api = {
    getPaperRecord: () => rxjs.of({ treatments: [{ cost: 1000 }], dentalChart: chart }),
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
{
  const { c } = fixture({ 1: { services: ["composite", "root", "composite"] },
    2: { services: ["root", "crown"] }, 3: { service: "crown" } });
  assert.equal(c.serviceUnits[1], 1, "A repeated service on one tooth counts once");
  assert.equal(c.serviceUnits[5], 2, "The same service on two teeth counts as two units");
  assert.equal(c.serviceUnits[4], 2, "Old and new chart entries both count toward finance");
}
{
  const chartModule = { exports: {} };
  vm.runInNewContext(compile("src/app/features/secretary/patient-files/dental-chart/dental-chart.component.ts"), {
    exports: chartModule.exports,
    require(name) {
      if (name.includes("dental-chart.models")) return chartModels.exports;
      return { Component: decorator, Input: decorator, Output: decorator, EventEmitter, ChangeDetectionStrategy: { OnPush: 0 } };
    },
  });
  const chart = new chartModule.exports.SecretaryDentalChartComponent();
  const historical = { 1: { service: "root", description: "old note" } };
  chart.value = historical;
  assert.equal(chart.treatments[1].services[0], "root");
  chart.select(chart.teeth[0]);
  chart.toggleService("crown", true);
  chart.closeEditor();
  assert.equal(chart.treatments[1].services.length, 1, "Cancelling must preserve the saved selection");
  chart.select(chart.teeth[0]); chart.toggleService("crown", true); chart.save();
  const saved = chart.valueChange.values.at(-1);
  assert.equal(saved[1].services.length, 2);
  assert.equal(saved[1].description, "old note");
  assert.equal(historical[1].services, undefined, "Editing must not mutate incoming historical records");
  chart.value = JSON.parse(JSON.stringify(saved)); chart.select(chart.teeth[0]);
  assert.equal(chart.draftServices.length, 2, "Reopening must restore every saved service");
  assert.ok(chart.fillFor(1).startsWith("url(#"), "Multiple services must use the multi-colour fill");
  chart.toggleService("root", false); chart.save();
  assert.equal(chart.treatments[1].services.length, 1);
  assert.equal(chart.treatments[1].services[0], "crown");
  chart.select(chart.teeth[0]); chart.toggleService("crown", false); chart.save();
  assert.ok(chart.validationError, "Clearing every service must ask for explicit removal");
  chart.remove();
  assert.equal(chart.treatments[1], undefined);
  chart.value = saved; chart.readOnly = true; chart.select(chart.teeth[0]); chart.remove();
  assert.equal(chart.selectedTooth, null);
  assert.equal(chart.treatments[1].services.length, 2, "Read-only views must preserve all services");
}
{
  const calls = [];
  const draft = { expectedFinanceHash: "snapshot-1", finance: {
    installmentDescription: "اقساط ماهانه با سفته ضمانت",
    patientId: "original-patient", paymentMode: "installments", totalAmount: 1000, cashReceived: 100,
    serviceUnitCounts: { 1: 2 },
    cheques: [{ id: 71, amount: 500, number: "123", ownerName: "owner", installment: true, dueDate: "2026-01-20" }],
    notes: [{ id: 81, amount: 400, number: "456", dueDate: "2026-02-21" }],
  } };
  let failSave = false;
  const api = {
    getFinanceEdit: id => { calls.push(["load-edit", id]); return rxjs.of(draft); },
    updateFinance: (id, body) => { calls.push(["edit", id, body]); return failSave
      ? rxjs.throwError(() => ({ error: { message: "stale" } })) : rxjs.of({ financialCaseId: "same-case" }); },
    ensureFinancialIdentity: () => { throw new Error("Editing must preserve the existing financial identity"); },
    completeFinance: () => { throw new Error("Editing must never create another invoice"); },
  };
  const c = new Component(api, {}, { markForCheck() {} });
  c.file = { id: 42, financeCompleted: true, finance: { cases: [{ id: "same-case", status: 1 }] } };
  c.editFinance = true; c.ngOnInit();
  assert.equal(c.loading, false); assert.equal(c.totalAmount, 1000);
  assert.equal(c.cheques[0].id, 71); assert.equal(c.notes[0].id, 81);
  c.submit(); assert.equal(calls.filter(x => x[0] === "edit").length, 0, "Corrections require receipt review");
  c.totalAmount = 1100; c.cashReceived = 200; c.receiptConfirmed = true; c.submit();
  const body = calls.find(x => x[0] === "edit")[2];
  assert.equal(body.expectedFinanceHash, "snapshot-1");
  assert.equal(body.finance.patientId, "original-patient");
  assert.equal(body.finance.installmentDescription, "اقساط ماهانه با سفته ضمانت");
  assert.equal(body.finance.cheques[0].id, 71);
  assert.equal(body.finance.cheques[0].dueDate, "2026-01-20", "Existing past due dates must remain unchanged");
  assert.equal(body.finance.notes[0].id, 81);
  assert.equal(body.finance.notes[0].dueDate, "2026-02-21");
  assert.equal(c.saved.values.length, 1); assert.equal(c.saving, false);
  failSave = true; c.submit();
  assert.equal(c.error, "stale"); assert.equal(c.saved.values.length, 1); assert.equal(c.saving, false);
}
{
  const { c, calls } = fixture({});
  c.receiptConfirmed = true; c.totalAmount = 1000; c.submit();
  assert.equal(calls.length, 0, "An empty chart must not create a financial identity or invoice");
  assert.equal(c.hasChartServices, false);
  assert.ok(c.error.includes("چارت"));
  assert.equal(c.toggleService, undefined, "The finance component must not offer manual service selection");
}
{
  const { c } = fixture({ 1: { services: ["root", "crown"] }, 33: { service: "root" },
    "01": { service: "root" }, anything: { service: "root" } });
  assert.equal(c.serviceUnits[5], 1, "Only valid chart teeth may contribute units");
  assert.equal(c.chartServices.length, 2);
}
{
  const pageModule = { exports: {} };
  vm.runInNewContext(compile("src/app/features/secretary/patient-files/patient-files-page.component.ts"), {
    exports: pageModule.exports,
    require(name) {
      if (name === "rxjs") return rxjs;
      if (name.includes("iran-datetime.util")) return dateModule.exports;
      return { Component: decorator, ChangeDetectionStrategy: { OnPush: 0 } };
    },
  });
  for (const edit of [false, true]) {
    const file = { id: 42, firstName: "test", lastName: "patient", phoneNumber: "09123456789", financeCompleted: edit };
    const fresh = { ...file, refreshed: true };
    const calls = [];
    const api = {
      getPaperRecord: () => rxjs.of({ intake: { medicalHistory: {} }, treatments: [], dentalChart: {} }),
      updatePatientFile: id => { calls.push(["identity", id]); return rxjs.of({}); },
      savePaperRecord: (id, record) => { calls.push(["paper", id, record]); return rxjs.of({}); },
      getPatientFiles: () => rxjs.of({ items: [fresh], totalCount: 1 }),
      getPatientFileById: id => { calls.push(["refresh", id]); return rxjs.of(fresh); },
    };
    const page = new pageModule.exports.PatientFilesPageComponent(api, { success() {}, error() {} }, { markForCheck() {} }, {});
    page.completionFile = file; page.financeEditMode = edit; page.editChartFromFinance();
    assert.equal(page.completionFile, null); assert.equal(page.editing.id, 42);
    page.paperRecord.dentalChart = { 1: { services: ["root", "crown"] } };
    page.update();
    assert.equal(calls.find(x => x[0] === "paper")[1], 42);
    assert.equal(page.editOpen, false); assert.equal(page.completionFile.refreshed, true);
    assert.equal(page.financeEditMode, edit, "Return must preserve whether finance was being created or edited");
  }
}
{
  const { c, calls } = fixture();
  c.changeMode("installments"); c.totalAmount = 150_000_000; c.cashReceived = 0;
  c.addNote();
  c.notes[0] = { isGuarantee: true, amount: 300_000_000, number: "۱۲۳", dueDate: dateModule.exports.fromIranDateInputValue("2027-01-20") };
  c.installmentDescription = "  ۱۰ قسط ماهانه ۱۵ میلیون تومان  ";
  c.receiptConfirmed = true; c.submit();
  const payload = calls.find(x => x[0] === "complete")[2];
  assert.equal(payload.totalAmount, 150_000_000);
  assert.equal(payload.cashReceived, 0, "A guarantee must not become a patient payment");
  assert.equal(payload.notes[0].amount, 300_000_000);
  assert.equal(payload.notes[0].isGuarantee, true);
  assert.equal(payload.installmentDescription, "۱۰ قسط ماهانه ۱۵ میلیون تومان");
  assert.equal(c.uncoveredAmount, 0); assert.equal(c.excessGuarantee, 150_000_000);
}
{
  const { c, calls } = fixture();
  c.changeMode("installments"); c.totalAmount = 150_000_000;
  c.notes = [{ isGuarantee: false, amount: 300_000_000, number: "123", dueDate: new Date() }];
  c.receiptConfirmed = true; c.submit();
  assert.equal(calls.length, 0, "Ordinary payment notes must retain the overpayment guard");
}
{
  const { c, calls } = fixture();
  c.changeMode("installments"); c.totalAmount = 150_000_000; c.cashReceived = 0;
  c.addCheque(true);
  assert.equal(c.cheques[0].isGuarantee, true);
  assert.equal(c.cheques[0].installment, true);
  Object.assign(c.cheques[0], { amount: 300_000_000, number: "guarantee", ownerName: "owner", dueDate: dateModule.exports.fromIranDateInputValue("2027-01-20") });
  c.receiptConfirmed = true; c.submit();
  const payload = calls.find(x => x[0] === "complete")[2];
  assert.equal(payload.cheques[0].isGuarantee, true);
  assert.equal(c.paymentDocumentTotal, 0);
  assert.equal(c.guaranteeTotal, 300_000_000);
  assert.equal(c.excessGuarantee, 150_000_000);
}
{
  const { c } = fixture(); c.changeMode("installments"); c.addCheque(false);
  assert.equal(c.cheques[0].isGuarantee, false);
  assert.equal(c.cheques[0].installment, true, "Ordinary installment cheques require a selectable due date");
}
console.log("PASS: chart-only services, financial corrections, guarantee notes above treatment cost, installment descriptions, payment guards and due dates.");
