import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import '@angular/compiler';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

// Compile into an ignored directory, never emit JS next to the application's TS files.
const temp = await mkdtemp(new URL('../node_modules/.website-lead-test-', import.meta.url));
let passed = 0;
try {
  const output = join(temp, 'home.mjs');
  await build({entryPoints: ['src/app/pages/home/home.component.ts'], outfile: output, bundle: true,
    platform: 'node', format: 'esm', packages: 'external', tsconfig: 'tsconfig.app.json'});
  const { HomeComponent } = await import(pathToFileURL(output));
  const cases = [];
  const test = (name, fn) => cases.push([name, fn]);
  const setup = () => {
    const calls = [], subjects = [], events = [];
    const component = new HomeComponent({post: (url, body) => {
      calls.push({url, body}); const subject = new Subject(); subjects.push(subject); return subject;
    }}, {success: () => {}, error: () => {}}, {track: (...event) => events.push(event)});
    component.lead = {fullName: '  علی   رضایی  ', phone: '۰۹۱۲۳۴۵۶۷۸۹'};
    return {component, calls, subjects, events};
  };
  const fail = (subject, status, message) => subject.error(new HttpErrorResponse({status, error: message ? {message} : null}));

  test('SSR-safe construction sends no request and creates no submission key', () => {
    const {component, calls} = setup(); assert.equal(calls.length, 0); assert.equal(component.requestId, '');
  });
  test('valid Persian input produces exactly name, normalized mobile and UUID', () => {
    const {component, calls, subjects} = setup(); component.submitLead();
    assert.equal(calls.length, 1); assert.match(calls[0].url, /\/api\/consultation-requests$/);
    assert.deepEqual(Object.keys(calls[0].body).sort(), ['fullName', 'phoneNumber', 'requestId']);
    assert.equal(calls[0].body.fullName, 'علی رضایی'); assert.equal(calls[0].body.phoneNumber, '09123456789');
    assert.match(calls[0].body.requestId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    fail(subjects[0], 503);
  });
  test('Iranian Persian/Arabic/English mobile and country-code normalization', () => {
    const {component} = setup();
    for (const input of ['09123456789', '۰۹۱۲۳۴۵۶۷۸۹', '٠٩١٢٣٤٥٦٧٨٩', '+98 (912) 345-6789', '00989123456789', '989123456789'])
      assert.equal(component.normalizePhone(input), '09123456789');
  });
  for (const [field, input] of [['fullName', ''], ['fullName', 'ع'], ['fullName', '1234'], ['fullName', '<علی>'], ['fullName', 'ع'.repeat(101)], ['phone', ''], ['phone', '02112345678'], ['phone', 'abc']]) {
    test(`invalid ${field} (${input.slice(0,12)}) never reaches HTTP`, () => {
      const {component, calls} = setup(); component.lead[field] = input; component.submitLead();
      assert.equal(calls.length, 0); assert(component.leadFeedback()); assert.equal(component.leadSent(), false);
    });
  }
  test('double click creates one HTTP request, loading ends after response', () => {
    const {component, calls, subjects} = setup(); component.submitLead(); component.submitLead();
    assert.equal(calls.length, 1); assert.equal(component.submitting(), true);
    fail(subjects[0], 503); assert.equal(component.submitting(), false);
  });
  test('only explicit success clears fields, resets form and records analytics success', () => {
    const {component, subjects, events} = setup(); let resets = 0;
    component.submitLead({resetForm: () => resets++}); assert.equal(component.leadSent(), false);
    subjects[0].next({success: true}); subjects[0].complete();
    assert.equal(component.leadSent(), true); assert.deepEqual(component.lead, {fullName: '', phone: ''});
    assert.equal(resets, 1); assert.equal(events[0][1].result, 'success'); assert.equal(component.submitting(), false);
  });
  test('HTTP 200 with false, missing, null or non-boolean success never clears input', () => {
    for (const result of [{success: false}, {}, null, {success: 'true'}]) {
      const {component, subjects} = setup(); const before = {...component.lead}; component.submitLead();
      subjects[0].next(result); subjects[0].complete(); assert.equal(component.leadSent(), false);
      assert.deepEqual(component.lead, before); assert.equal(component.leadFeedbackType(), 'error');
    }
  });
  for (const status of [0, 400, 409, 429, 503]) {
    test(`HTTP ${status} preserves input and retry UUID`, () => {
      const {component, calls, subjects} = setup(); const before = {...component.lead}; component.submitLead();
      fail(subjects[0], status, status === 409 ? 'شماره قبلاً ثبت شده است.' : undefined);
      assert.equal(component.leadSent(), false); assert.deepEqual(component.lead, before);
      assert.equal(component.submitting(), false); assert(component.leadFeedback());
      component.submitLead(); assert.equal(calls[0].body.requestId, calls[1].body.requestId); fail(subjects[1], 503);
    });
  }
  test('real RxJS 20-second timeout preserves payload and retry UUID', () => {
    const scheduler = new TestScheduler(() => {});
    scheduler.run(({flush}) => {
      const {component, calls, subjects} = setup(); component.submitLead(); flush();
      assert.equal(component.submitting(), false); assert.equal(component.leadSent(), false);
      assert.match(component.leadFeedback(), /به‌موقع/); assert.equal(component.lead.phone, '۰۹۱۲۳۴۵۶۷۸۹');
      component.submitLead(); assert.equal(calls[0].body.requestId, calls[1].body.requestId); fail(subjects[1], 503);
    });
  });
  test('changed payload receives a new UUID; formatting-only changes retain normalized identity', () => {
    const {component, calls, subjects} = setup(); component.submitLead(); fail(subjects[0], 503);
    component.lead.phone = '+989123456789'; component.submitLead(); fail(subjects[1], 503);
    assert.equal(calls[0].body.requestId, calls[1].body.requestId);
    component.lead.phone = '09123456780'; component.submitLead(); fail(subjects[2], 503);
    assert.notEqual(calls[1].body.requestId, calls[2].body.requestId);
  });
  test('existing Home contains only the two intended controls and no generated source JS', async () => {
    const html = await readFile('src/app/pages/home/home.component.html', 'utf8');
    const form = html.match(/<form class="consult-lead__form"[\s\S]*?<\/form>/)[0];
    assert.equal((form.match(/<input\b/g) || []).length, 2); assert(!/<select|<textarea|leadService|leadMessage/.test(form));
    assert.match(form, /dir="rtl"/); assert.match(form, /درخواست مشاوره/);
  });
  for (const [label, file, exported] of [
    ['admin', 'src/app/core/admin/admin-dashboard.service.ts', 'AdminDashboardService'],
    ['consultant', 'src/app/core/consultant/consultant-dashboard.service.ts', 'ConsultantDashboardService'],
  ]) {
    test(`${label} pagination preserves Website origin, identity and phone in existing response mapping`, async () => {
      const target = join(temp, `${label}.mjs`);
      await build({entryPoints:[file], outfile:target, bundle:true, platform:'node', format:'esm', packages:'external', tsconfig:'tsconfig.app.json'});
      const module = await import(pathToFileURL(target));
      const service = Object.create(module[exported].prototype);
      const row = {id:42, userName:'علی رضایی', phoneNumber:'09123456789', sourceType:4};
      const result = service.normalizePaginatedResponse({items:[row], totalCount:1, pageNumber:1, pageSize:10}, {pageNumber:1,pageSize:10});
      assert.deepEqual(result.items,[row]);
    });
  }
  for (const [name, fn] of cases) { await fn(); console.log(`PASS ${name}`); passed++; }
  console.log(`${passed}/${cases.length} Website form tests passed (HTTP test doubles; no SQL claim).`);
} finally { await rm(temp, {recursive: true, force: true}); }
