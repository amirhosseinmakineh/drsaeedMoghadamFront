import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { runInThisContext } from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';
import { firstValueFrom, of, throwError } from 'rxjs';

// Compile only in memory. No JS, test fixture or API mock is added to src.
await import('@angular/compiler');
const nativeRequire = createRequire(import.meta.url);
const externals = new Map();
for (const name of ['@angular/core', '@angular/common', '@angular/common/http', '@angular/forms', '@angular/router', '@angular/platform-browser', '@angular/service-worker']) externals.set(name, await import(name));
const cache = new Map();
function load(file) {
  file = resolve(file);
  if (!file.endsWith('.ts')) file += '.ts';
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  const code = ts.transpileModule(readFileSync(file, 'utf8'), { fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, experimentalDecorators: true } }).outputText;
  const require = name => externals.get(name) || (name.startsWith('.') ? load(resolve(dirname(file), name)) : nativeRequire(name));
  runInThisContext(`(function(exports, require, module) { ${code}\n})`, { filename: file })(module.exports, require, module);
  return module.exports;
}
const { ConsultantDashboardService } = load('src/app/core/consultant/consultant-dashboard.service.ts');
const { ConsultantDashboardComponent } = load('src/app/pages/consultant-dashboard/consultant-dashboard.component.ts');
const { ConsultantReservationsPanelComponent } = load('src/app/pages/consultant-dashboard/consultant-reservations-panel.component.ts');
const calls = [];
let response;
let rejection;
const http = Object.fromEntries(['get', 'post', 'put'].map(method => [method, (url, bodyOrOptions, options) => {
  calls.push({ method, url, body: method === 'get' ? null : bodyOrOptions, options: method === 'get' ? bodyOrOptions : options });
  const error = rejection?.(url);
  return error ? throwError(() => error) : of(response);
}]));
const api = new ConsultantDashboardService(http, { authToken: () => 'isolated-test-token' }, { navigate: () => {} });
const filters = { profileId: 7, searchText: 'علی', userName: 'علی', phoneNumber: '0912', patientCity: 'تهران', leadAssignmentState: 2, leadAssignmentType: 1, from: '2026-10-25', to: '2026-10-26', pageNumber: 2, pageSize: 2, hasSubmittedReport: false };
const leads = [
  { id: 31, userName: 'سایت آزمایشی', phoneNumber: '09120000001', sourceType: 4, consultationServiceId: 1, consultationServiceTitle: 'خدمت آزمایش', consultationNotes: 'توضیح آزمایش', assignedAt: '2026-10-26T12:00:00Z' },
  { id: 30, userName: 'یکتانت آزمایشی', phoneNumber: '09120000002', sourceType: 1, assignedAt: '2026-10-26T11:00:00Z' },
  { id: 29, userName: 'شیت آزمایشی', phoneNumber: '09120000003', sourceType: 3, assignedAt: '2026-10-26T10:00:00Z' },
];
function reset() { calls.length = 0; rejection = null; response = { items: leads, totalCount: 8, pageNumber: 2, pageSize: 3, totalPages: 3 }; }

test('all recovered component methods and reservation-panel methods survive from 87c4825', () => {
  function methods(text) {
    const source = ts.createSourceFile('component.ts', text, ts.ScriptTarget.Latest, true);
    const component = source.statements.find(ts.isClassDeclaration);
    return new Map(component.members.filter(ts.isMethodDeclaration).map(method => [method.name.getText(source), method.getText(source)]));
  }
  for (const file of ['consultant-dashboard.component.ts', 'consultant-reservations-panel.component.ts']) {
    const path = `src/app/pages/consultant-dashboard/${file}`;
    const original = methods(execFileSync('git', ['show', `87c4825:${path}`], { encoding: 'utf8' }));
    const current = methods(readFileSync(path, 'utf8'));
    assert.deepEqual([...current.keys()], [...original.keys()]);
    for (const [name, text] of original) {
      const expected = text.replace('.updateReservation(reservationId, payload)', `.updateReservation(reservationId, payload, ${file === 'consultant-dashboard.component.ts' ? 'profileId' : 'this.profileId'})`);
      assert.equal(current.get(name), expected, `Unexpected business change: ${file}:${name}`);
    }
  }
});
test('new leads use the real endpoint, keep filters and omit HasSubmittedReport', async () => {
  reset(); const result = await firstValueFrom(api.getNewLeads(filters));
  assert(calls[0].url.endsWith('/Consultant/GetNewLeads'));
  for (const key of Object.keys(filters).filter(key => key !== 'hasSubmittedReport')) assert.equal(calls[0].options.params.get(key), String(filters[key]));
  assert.equal(calls[0].options.params.has('hasSubmittedReport'), false);
  assert.equal(calls[0].options.headers.get('Authorization'), 'Bearer isolated-test-token');
  assert.deepEqual(result.items, leads); assert.equal(result.pageNumber, 2); assert.equal(result.totalPages, 3);
});
test('all three actual source values and Website metadata retain backend order', async () => {
  reset(); const result = await firstValueFrom(api.getNewLeads(filters));
  assert.deepEqual(result.items.map(x => x.sourceType), [4, 1, 3]);
  assert.equal(result.items[0].consultationServiceTitle, 'خدمت آزمایش');
  assert.equal(result.items[0].consultationNotes, 'توضیح آزمایش');
  const context = { applyPendingReportPatches: x => x, highlightedLeadAssignmentId: null, syncReportedLeadIdsFromLeads() {}, syncReservedLeadIdsFromLeads() {}, syncCallInitiatedFromLeads() {} };
  ConsultantDashboardComponent.prototype.commitLeadsFromApi.call(context, result.items);
  assert.deepEqual(context.leads.map(x => x.id), [31, 30, 29]);
});
test('existing report-history filters and wrapped pagination still work', async () => {
  reset(); response = { isSuccess: true, data: response };
  const result = await firstValueFrom(api.getLeads({ ...filters, hasSubmittedReport: true }));
  assert(calls[0].url.endsWith('/Consultant/GetLeads')); assert.equal(calls[0].options.params.get('hasSubmittedReport'), 'true');
  assert.deepEqual(result.items, leads); assert.equal(result.totalCount, 8);
});
test('reservation list retains date/status filters, cancellation option and pagination', async () => {
  reset(); response = { items: [{ id: 41, reservationId: 41, patientName: 'آزمایش', attendanceConfirmationStatus: 1 }], totalCount: 6, pageNumber: 2, pageSize: 2, totalPages: 3 };
  const query = { consultantProfileId: 7, fromDate: '2026-10-25', toDate: '2026-10-26', attendanceConfirmationStatus: 'PendingConsultantConfirmation', includeCanceled: true, onlySecretaryReviewed: false, pageNumber: 2, pageSize: 2 };
  const result = await firstValueFrom(api.getReservations(query));
  assert(calls[0].url.endsWith('/Reservation/GetConsultantReservations'));
  for (const [key, value] of Object.entries(query)) assert.equal(calls[0].options.params.get(key), String(value));
  assert.equal(result.items[0].attendanceConfirmationStatus, 1); assert.equal(result.pageNumber, 2);
});
test('reservation update preserves the existing codex-lflotm token-owned route', async () => {
  reset(); response = { isSuccess: true, data: { reservationId: 41 }, message: 'ok' };
  await firstValueFrom(api.updateReservation(41, { reservationAt: '2026-10-27T10:00:00Z', patientCount: 2, dentalServices: [1, 3] }, 7));
  assert.equal(calls.length, 1); assert(calls[0].url.endsWith('/Reservation/ConsultantReservations/41')); assert.deepEqual(calls[0].body.dentalServices, [1, 3]);
});
for (const status of [404, 405]) test(`reservation update supports confirmed main controller on ${status} only`, async () => {
  reset(); rejection = url => url.endsWith('/ConsultantReservations/41') ? { status } : null;
  response = { isSuccess: true, data: { reservationId: 41 }, message: 'ok' };
  await firstValueFrom(api.updateReservation(41, { reservationAt: '2026-10-27T10:00:00Z', patientCity: 'تهران' }, 7));
  assert.equal(calls.length, 2); assert(calls[1].url.endsWith('/Reservation'));
  assert.equal(calls[1].body.reservationId, 41); assert.equal(calls[1].body.consultantProfileId, 7);
});
for (const status of [400, 401, 403, 409, 500, 0]) test(`reservation business/network rejection ${status} never replays mutation`, async () => {
  reset(); rejection = () => ({ status });
  await assert.rejects(firstValueFrom(api.updateReservation(41, { reservationAt: '2026-10-27T10:00:00Z' }, 7)));
  assert.equal(calls.length, 1);
});
test('business failure in a successful HTTP response is never replayed', async () => {
  reset(); response = { isSuccess: false, message: 'ویرایش مجاز نیست' };
  await assert.rejects(firstValueFrom(api.updateReservation(41, { reservationAt: '2026-10-27T10:00:00Z' }, 7)), /ویرایش مجاز نیست/);
  assert.equal(calls.length, 1);
});
test('attendance confirmation and report submission preserve their actual command endpoints', async () => {
  reset(); response = { isSuccess: true, message: 'ok', data: {} };
  const confirmation = { reservationId: 41, consultantProfileId: 7, patientAttended: true, note: 'تست' };
  await firstValueFrom(api.confirmAttendance(confirmation));
  assert(calls[0].url.endsWith('/Reservation/ConfirmAttendance')); assert.deepEqual(calls[0].body, confirmation);
  const report = { leadAssignmentId: 31, consultantProfileId: 7, callResult: 1, reportDescription: 'آزمایش', patientCity: 'تهران', patientRegion: 'مرکز' };
  await firstValueFrom(api.submitLeadCallReport(report));
  assert(calls[1].url.endsWith('/Consultant/SubmitLeadCallReport')); assert.deepEqual(calls[1].body, report);
});
if (process.env.CLINIC_BACKEND_SOURCE) test('contract audit matches inspected backend controllers and source DTO', () => {
  const root = resolve(process.env.CLINIC_BACKEND_SOURCE);
  const consultant = readFileSync(resolve(root, 'DentalDashboard/Controllers/ConsultantController.cs'), 'utf8');
  const reservation = readFileSync(resolve(root, 'DentalDashboard/Controllers/ReservationController.cs'), 'utf8');
  const dto = readFileSync(resolve(root, 'DentalDashboard.ApplicationService.Contract/Responses/LeadResponse/LeadsAssignmentItemsResponse.cs'), 'utf8');
  for (const route of ['GetNewLeads', 'GetLeads', 'SubmitLeadCallReport', 'RecordLeadCallInitiated', 'GetDashboardStatus']) assert(consultant.includes(`("${route}")`), route);
  for (const field of ['SourceType', 'ConsultationServiceId', 'ConsultationServiceTitle', 'ConsultationNotes']) assert(dto.includes(field), field);
  for (const route of ['GetConsultantReservations', 'ConfirmAttendance', 'DueConfirmations', 'CompletePatientProfile']) assert(reservation.includes(`("${route}")`), route);
  assert(reservation.includes('[HttpPut]')); assert(existsSync(resolve(root, 'DentalDashboard/Controllers/ConsultationRequestsController.cs')));
});
