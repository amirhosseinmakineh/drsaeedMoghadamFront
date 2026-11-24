import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as rxjs from 'rxjs';

const decorator = () => () => {};
class EventEmitter { values = []; emit(value) { this.values.push(value); } }
const models = load('src/app/pages/accounting-dashboard/accounting.models.ts');
const copy = load('src/app/core/consultant/service-reward.models.ts');
function load(path) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true }
  }).outputText;
  vm.runInNewContext(code, {
    exports: module.exports, Date, Intl, JSON, console,
    require(name) {
      if (name === 'rxjs') return rxjs;
      if (name === '@angular/core') return { Component: decorator, Input: decorator, Output: decorator,
        Injectable: decorator, EventEmitter, inject: () => ({}), ChangeDetectionStrategy: { OnPush: 0 } };
      if (name === '@angular/core/rxjs-interop') return { takeUntilDestroyed: () => source => source };
      if (name.endsWith('accounting.models')) return models;
      if (name.endsWith('service-reward.models')) return copy;
      if (name.endsWith('accounting-api.service')) return { accountingError: e => e.error?.message || 'error' };
      if (name.endsWith('iran-datetime.util')) return { formatIranDate: x => x, toIranDateInputValue: date => date.toISOString().slice(0, 10) };
      return {};
    }
  });
  return module.exports;
}
const Dashboard = load('src/app/pages/accounting-dashboard/accounting-dashboard.component.ts').AccountingDashboardComponent;
const Editor = load('src/app/pages/accounting-dashboard/components/accounting-editor.component.ts').AccountingEditorComponent;
const cdr = { markForCheck() {} };

{
  const dashboard = new Dashboard({}, {}, cdr, {});
  const row = { id: '12', status: 'Pending', isGuarantee: false };
  dashboard.section = 'ConsultantRewards';
  dashboard.access = { isAdmin: false, permissions: ['Accounting.View'] };
  assert.equal(dashboard.actions(row).length, 0, 'Read access never exposes reward approvals');
  dashboard.access.permissions.push('Accounting.ApproveConsultant');
  assert.equal(dashboard.actions(row).length, 2);
  assert.equal(dashboard.actions(row)[0].operation, 'ReviewConsultant', 'Must use the existing consultant reward bridge');
  dashboard.section = 'Cheques';
  dashboard.access.permissions.push('Accounting.Collect');
  row.status = '1'; row.isGuarantee = true;
  assert.equal(dashboard.actions(row).length, 1);
  assert.equal(dashboard.actions(row)[0].operation, 'CollectGuarantee', 'Guarantees cannot use ordinary cheque collection');
}
{
  const calls = [];
  const editor = new Editor({ operate: (...args) => { calls.push(args); return rxjs.of({ isSuccess: true }); } }, cdr);
  editor.operation = 'UpdateCheque';
  editor.row = { id: '7', amount: 1000, number: '123', owner: 'صاحب چک', date: null, isGuarantee: false };
  editor.ngOnInit(); editor.submit();
  assert.equal(calls.length, 0);
  assert.ok(editor.errors.dueDate, 'Missing due date has a field error');
  editor.model.dueDate = new Date('2026-11-21T20:30:00Z');
  editor.submit();
  assert.equal(calls.length, 1);
  assert.equal(calls[0][1], '7');
  assert.equal(calls[0][2].dueDate, '2026-11-21T20:30:00.000Z');
  assert.equal(editor.saved.values.length, 1);
}
{
  const calls = [];
  const editor = new Editor({ operate: (...args) => { calls.push(args); return rxjs.throwError(() => ({ error: { message: 'تغییر هم‌زمان' } })); } }, cdr);
  editor.operation = 'ReviewConsultant'; editor.initialData = { approved: false };
  editor.ngOnInit(); editor.submit();
  assert.equal(calls.length, 0, 'Rejected rewards require a reason');
  editor.model.reason = '  دلیل رد  '; editor.submit();
  assert.equal(calls[0][2].reason, 'دلیل رد');
  assert.equal(calls[0][2].approved, false);
  assert.equal(editor.error, 'تغییر هم‌زمان');
  assert.equal(editor.saved.values.length, 0);
}
{
  const inflight = new rxjs.Subject(); let calls = 0;
  const editor = new Editor({ operate: () => { calls++; return inflight; } }, cdr);
  editor.operation = 'PayInstallment'; editor.row = { id: '9' };
  editor.ngOnInit(); editor.submit(); editor.submit();
  assert.equal(calls, 1, 'Repeated clicks never issue concurrent payment requests');
  inflight.next({ isSuccess: true }); inflight.complete();
  assert.equal(editor.saving, false);
}
{
  const Auth = load('src/app/core/auth/auth.service.ts').AuthService;
  assert.equal(Auth.prototype.normalizeRole.call({}, 'Accountant'), 'accountant');
  assert.equal(Auth.prototype.roleNameFromAuthRole.call({}, 'accountant'), 'Accountant');
}
console.log('PASS: accounting role, permission-gated actions, guarantee flow, field errors, dates and duplicate-click guards.');
