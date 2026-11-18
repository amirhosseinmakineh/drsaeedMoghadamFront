import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as rxjs from "rxjs";

function load(path, dependencies = {}) {
  const code = ts.transpileModule(fs.readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, experimentalDecorators: true },
  }).outputText;
  const context = { exports: {}, Intl, Date, require: name => dependencies[name] ??
    (name === "rxjs" ? rxjs : name === "@angular/core" ? {
      Component: () => target => target, inject: () => ({}), ChangeDetectionStrategy: { OnPush: 0 },
    } : name === "@angular/core/rxjs-interop" ? { takeUntilDestroyed: () => source => source } : {}) };
  vm.runInNewContext(code, context);
  return context.exports;
}
const models = load("src/app/core/consultant/service-reward.models.ts");
const { AdminConsultantRewardsComponent } = load("src/app/pages/admin-dashboard/admin-consultant-rewards.component.ts", {
  "../../core/consultant/service-reward.models": models,
});
const calls = [], notices = [];
let pending;
const api = {
  adminReport: () => rxjs.of([]),
  approve: id => { calls.push(["approve", id]); return pending = new rxjs.Subject(); },
  reject: (id, reason) => { calls.push(["reject", id, reason]); return pending = new rxjs.Subject(); },
};
const c = new AdminConsultantRewardsComponent(api, { success: value => notices.push(value), error() {} }, { markForCheck() {} });
const item = { reservationId: 22, consultantName: "recipient", patientName: "patient", rewardAmount: 2000000,
  rewardCalculationJson: JSON.stringify({ Lines: [{ ServiceId: 3, ServiceName: "لمینت", NewUnits: 8, PreviousUnits: 0,
    Amount: 2000000, Rate: 1000000, Basis: "Block", UnitsPerReward: 4, RuleId: 2, Teeth: [1,2,3,4,5,6,7,8] }] }) };
c.review(item, true); assert.equal(calls.length, 0, "Approval requires explicit confirmation");
c.confirmReview(); c.confirmReview(); assert.equal(calls.length, 1); assert.equal(calls[0][1], 22);
pending.next({ message: "approved" }); pending.complete(); assert.equal(c.reviewItem, null); assert.equal(notices.length, 1);
c.review(item, false); c.confirmReview(); assert.equal(calls.length, 1, "New reward rejection requires a reason");
c.rejectionReason = "  بررسی مدیر  "; c.confirmReview(); assert.equal(calls[1][2], "بررسی مدیر");
pending.error({ error: { message: "already reviewed" } }); assert.equal(c.reviewError, "already reviewed"); assert.equal(c.reviewingId, null);
assert.equal(c.rewardLines(item)[0].amount, 2000000); assert.equal(models.readRewardLines("bad json").length, 0);

const { AdminConsultantRewardRulesComponent } = load("src/app/pages/admin-dashboard/admin-consultant-reward-rules.component.ts");
let saves = 0, loads = 0, payload, saveResponse;
const rules = new AdminConsultantRewardRulesComponent({
  rules: () => { loads++; return rxjs.of([{ serviceId: 1, serviceName: "کامپوزیت", rule: null }, { serviceId: 3, serviceName: "لمینت", rule: null }]); },
  saveRule: body => { saves++; payload = body; return saveResponse = new rxjs.Subject(); },
}, { success() {}, error() {} }, { markForCheck() {} });
rules.ngOnInit(); const row = rules.rows[0];
assert.equal(row.isActive, false, "No unapproved business rate should activate automatically");
row.basis = "Jaw"; rules.changeBasis(row); rules.save(row); assert.equal(saves, 0, "A jaw needs an explicit tooth threshold");
row.units = 8; row.amount = 1000000; row.isActive = true; rules.rows[1].amount = 900000;
rules.save(row); rules.save(row); assert.equal(saves, 1); assert.equal(payload.expectedVersionId, null);
saveResponse.next({ id: 12, createdAtUtc: "2026-11-17T00:00:00Z", message: "saved" }); saveResponse.complete();
assert.equal(row.version, 12); assert.equal(rules.rows[1].amount, 900000, "Saving one service must preserve other unsaved drafts");
assert.equal(loads, 1);
console.log("PASS: explicit wallet approval, duplicate prevention, rejection reasons, snapshot details, explicit jaw threshold and versioned rule saves.");
