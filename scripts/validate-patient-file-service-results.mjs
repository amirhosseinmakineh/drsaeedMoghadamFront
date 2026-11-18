import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as rxjs from "rxjs";

const decorator = () => () => {};
class EventEmitter { values = []; emit(value) { this.values.push(value); } }
const exports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(
  "src/app/features/secretary/patient-files/patient-file-service-results.component.ts", "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true },
}).outputText, {
  exports, Date,
  require(name) {
    if (name === "rxjs") return rxjs;
    return { Component: decorator, Input: decorator, Output: decorator, EventEmitter, ChangeDetectionStrategy: { OnPush: 0 } };
  },
});
const Component = exports.PatientFileServiceResultsComponent;
const reservation = id => ({ id, reservationAt: new Date(Date.now() - 86400000).toISOString(), patientReceivedService: null });
function fixture() {
  const calls = [];
  const items = [reservation(11), reservation(22)];
  let response;
  let refreshes = 0;
  const api = {
    getServiceResults: (id, page) => { calls.push(["load", id, page]); return rxjs.of({ items, reviewableReservationIds: [11, 22], pageNumber: page, totalPages: 1 }); },
    getServiceRewardContext: () => rxjs.of({ consultants: [{ id: 9, name: "مشاور" }], linkedConsultantProfileId: 9,
      canChooseConsultant: false, options: [{ serviceId: 3, serviceName: "لمینت", toothId: 1, toothLabel: "دندان" }], rules: [] }),
    previewServiceReward: (_id, body) => { calls.push(["preview", body]); return rxjs.of({ hash: "quote", snapshot: { total: 1000000, lines: [] } }); },
    reviewServiceResult: (id, payload) => { calls.push(["review", id, payload]); response = new rxjs.Subject(); return response; },
  };
  const c = new Component(api, { markForCheck() {} }, { requestRefresh() { refreshes++; } });
  c.file = { id: 42, serviceApproved: true }; c.ngOnInit();
  return { c, calls, items, finish: value => response.next(value), fail: () => response.error({ error: { message: "مجوز معتبر نیست" } }), refreshes: () => refreshes };
}
{
  const { c, calls, items } = fixture();
  c.file.serviceApproved = false; c.review(items[0], false);
  assert.equal(calls.filter(x => x[0] === "review").length, 0, "Unapproved files must not submit results");
  c.file.serviceApproved = true;
  assert.equal(c.canReview({ ...items[0], isCanceled: true }), false);
  assert.equal(c.canReview({ ...items[0], isAttendanceScoreApplied: true }), false);
  assert.equal(c.canReview({ ...items[0], patientReceivedService: false }), false);
  assert.equal(c.canReview({ ...items[0], reservationAt: new Date(Date.now() + 86400000).toISOString() }), false);
  assert.equal(c.canReview(reservation(999)), false, "Reservation permissions must be respected");
}
{
  const { c, calls, items, finish, refreshes } = fixture();
  c.start(items[1]); c.review(items[1], true);
  assert.equal(calls.filter(x => x[0] === "review").length, 0, "Doctor name is required");
  c.doctorName = " دکتر تست "; c.note = " مراجعه دوم ";
  c.toggle(3, 1, true); c.preview(items[1]); c.review(items[1], true); c.review(items[1], true);
  const reviews = calls.filter(x => x[0] === "review");
  assert.equal(reviews.length, 1, "Repeated clicks while saving must not submit twice");
  assert.equal(reviews[0][1], 42);
  assert.equal(reviews[0][2].reservationId, 22, "The selected reservation must receive the result and reward");
  assert.equal(reviews[0][2].doctorName, "دکتر تست");
  assert.equal(reviews[0][2].note, "مراجعه دوم");
  assert.equal(reviews[0][2].rewardConsultantProfileId, 9);
  assert.equal(reviews[0][2].expectedRewardHash, "quote");
  assert.equal(reviews[0][2].performedServices[0].toothIds[0], 1);
  finish({ isSuccess: true });
  assert.equal(c.saving, false); assert.equal(refreshes(), 1);
  assert.equal(c.busyChange.values.join(","), "true,false");
}
{
  const { c, calls, items, fail, refreshes } = fixture();
  c.doctorName = "stale"; c.review(items[0], false);
  const payload = calls.find(x => x[0] === "review")[2];
  assert.equal(payload.patientReceivedService, false); assert.equal(payload.doctorName, null);
  fail(); assert.equal(c.error, "مجوز معتبر نیست"); assert.equal(c.saving, false); assert.equal(refreshes(), 0);
}
{
  const { c, calls, items } = fixture(); c.start(items[0]);
  c.context = { ...c.context, canChooseConsultant: true, linkedConsultantProfileId: null };
  c.selectedConsultant = null; c.doctorName = "doctor"; c.toggle(3, 1, true); c.preview(items[0]);
  assert.equal(calls.filter(x => x[0] === "preview").length, 0, "An unlinked consultant must be chosen first");
  c.selectedConsultant = 9; c.preview(items[0]); assert.ok(c.quote);
  c.toggle(3, 1, false); assert.equal(c.quote, null, "Changing performed services invalidates the quote");
  c.review(items[0], true); assert.equal(calls.filter(x => x[0] === "review").length, 0);
  c.toggle(3, 1, true); c.preview(items[0]); c.cancel(); assert.equal(c.approvingId, null); assert.equal(c.quote, null);
}
console.log("Patient file service result checks passed: approval, permissions, selected reservation, doctor, duplicate click, failure and refresh.");
