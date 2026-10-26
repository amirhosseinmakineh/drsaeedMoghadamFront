import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = resolve('dist/demo/browser');
const requests = [];
const unknown = new Set();
const leadRows = [
  { id: 31, userName: 'مراجعه سایت', phoneNumber: '09120000001', sourceType: 4, consultationServiceId: 1, consultationServiceTitle: 'خدمت تست', consultationNotes: 'یادداشت مراجعه سایت' },
  { id: 30, userName: 'مراجعه یکتانت', phoneNumber: '09120000002', sourceType: 1 },
  { id: 29, userName: 'مراجعه شیت', phoneNumber: '09120000003', sourceType: 3 },
].map((lead, i) => ({ ...lead, consultantProfileId: 7, leadAssignmentType: 1, leadAssignmentState: 2, createdAt: '2026-10-25T08:00:00Z', assignedAt: `2026-10-26T0${9-i}:00:00Z`, requiresThreeMinuteCall: false, isReportSubmitted: false }));
let reservation = { id: 41, reservationId: 41, leadAssignmentId: 31, consultantProfileId: 7, patientName: 'بیمار رزرو آزمایش', patientPhoneNumber: '09120000001', patientCity: 'تهران', patientRegion: 'مرکز', reservationAt: '2026-10-25T08:00:00Z', appointmentDateTime: '2026-10-25T08:00:00Z', patientCount: 1, dentalServices: [1], attendanceConfirmationStatus: 1, isDueForConsultantConfirmation: true, canEdit: true, attendanceProbabilityPercent: 80, description: 'یادداشت رزرو' };
const paged = (items, url) => ({ items, totalCount: items.length, pageNumber: Number(url.searchParams.get('pageNumber') || 1), pageSize: Number(url.searchParams.get('pageSize') || 10), totalPages: 1 });
function api(request) {
  const url = new URL(request.url()); const path = url.pathname.toLowerCase();
  const method = request.method(); const body = request.postDataJSON?.(); requests.push({ path, method, search: url.search, body });
  if (path.endsWith('/consultant/getdashboardstatus')) return { profileId: 7, isAvailable: true, isOnline: false, canGoOnline: false, onlineStatusBlockReason: 'ابتدا گزارش لیدهای بدون گزارش را ثبت کنید', pendingReportCount: 3, uncalledWithoutReportCount: 3, isNewLeadBlocked: true, shouldShowWorkloadNotification: false, todayReservationsCount: 1, totalReservationsCount: 1, totalReservedPatientsCount: 1, todayCallsCount: 0, dailyLimit: 10, todayPickupCount: 3, remainingDailyCapacity: 7 };
  if (path.endsWith('/consultant/getnewleads')) {
    const search = url.searchParams.get('userName') || url.searchParams.get('searchText') || '';
    const rows = Number(url.searchParams.get('pageNumber') || 1) === 2 ? [{ ...leadRows[0], id: 28, userName: 'لید صفحه دوم' }] : leadRows.filter(lead => !search || lead.userName.includes(search));
    return { ...paged(rows, url), totalCount: 4, pageSize: 3, totalPages: 2 };
  }
  if (path.endsWith('/consultant/getleads')) return paged([], url);
  if (path.endsWith('/consultant/getbroadcastrealtimeleads')) return { canReceive: false, blockReason: null, leads: [] };
  if (path.endsWith('/reservation/getconsultantreservations')) return paged([reservation], url);
  if (path.endsWith('/reservation/dueconfirmations')) return reservation.attendanceConfirmationStatus === 1 ? [reservation] : [];
  if (path.endsWith('/reservation/consultantpatientprofiles')) return paged([], url);
  if (path.endsWith('/reservation/consultantreservations/41') && method === 'PUT') return { __status: 404 };
  if (path.endsWith('/reservation') && method === 'PUT') { assert.equal(body.reservationId, 41); assert.equal(body.consultantProfileId, 7); reservation = { ...reservation, ...body }; return { isSuccess: true, data: reservation, message: 'ویرایش رزرو انجام شد' }; }
  if (path.endsWith('/reservation/confirmattendance')) { assert.equal(body.reservationId, 41); reservation = { ...reservation, attendanceConfirmationStatus: body.patientAttended ? 2 : 3, isDueForConsultantConfirmation: false }; return { isSuccess: true, data: reservation, message: 'تایید حضور ثبت شد' }; }
  if (path.endsWith('/consultant/wallet')) return { balance: 120000, totalApprovedRewards: 120000, approvedPatientCount: 1, pendingPatientCount: 0, items: [] };
  if (path.endsWith('/consultant/follow-ups')) return paged([], url);
  unknown.add(`${method} ${path}`); return { __status: 404 };
}
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = http.createServer(async (req, res) => {
  try {
    const path = resolve(root, '.' + new URL(req.url, 'http://test').pathname);
    assert(path.startsWith(root));
    const extension = extname(path);
    const index = existsSync(resolve(root, 'index.csr.html')) ? 'index.csr.html' : 'index.html';
    const content = await readFile(extension ? path : resolve(root, index));
    res.writeHead(200, { 'Content-Type': mime[extension] || 'text/html' }); res.end(content);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const token = ['e30', Buffer.from(JSON.stringify({ sub: '00000000-0000-0000-0000-000000000007', role: 'Consultant', profileId: 7, consultantProfileId: 7, isCompleteProfile: true, exp: 2000000000 })).toString('base64url'), 'test-only'].join('.');
const session = { token, user: { firstName: 'مشاور', lastName: 'تست مرورگر', role: 'consultant', roleName: 'Consultant', roles: ['consultant'], isCompleteProfile: true, profileId: 7, consultantProfileId: 7, userId: '00000000-0000-0000-0000-000000000007' } };
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE || undefined, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    reservation = { ...reservation, attendanceConfirmationStatus: 1, isDueForConsultantConfirmation: true };
    const context = await browser.newContext({ viewport, timezoneId: 'Asia/Tehran', serviceWorkers: 'block' });
    await context.addInitScript(value => localStorage.setItem('clinic-auth-session', JSON.stringify(value)), session);
    const page = await context.newPage(); const errors = []; page.on('pageerror', error => errors.push(error.message));
    // Every API request is intercepted before navigation. Never contact a live account/backend.
    await context.route('**/*', async route => {
      const request = route.request(); const url = new URL(request.url());
      if (url.pathname.startsWith('/api/')) {
        const data = api(request); await route.fulfill({ status: data.__status || 200, contentType: 'application/json', body: JSON.stringify(data) });
      } else if (url.origin === base) await route.continue();
      else await route.abort();
    });
    await page.clock.install({ time: new Date('2026-10-26T08:30:00Z') });
    await page.goto(`${base}/consultant/leads?section=leads`);
    const nav = page.locator('.dashboard-nav');
    async function section(name) {
      if (viewport.width < 600) await page.getByRole('button', { name: 'باز و بسته کردن منو', exact: true }).click();
      await nav.getByRole('button', { name, exact: true }).click();
      // Selecting the already-active section preserves the reference sidebar
      // state. Close it through the existing mobile close control if needed.
      if (viewport.width < 600) {
        try {
          await page.waitForFunction(() => !document.querySelector('.dashboard-sidebar')?.classList.contains('mobile-sidebar-open'), undefined, { timeout: 1500 });
        } catch {
          await page.locator('.dashboard-sidebar .mobile-sidebar-close-x').click();
          await page.waitForFunction(() => !document.querySelector('.dashboard-sidebar')?.classList.contains('mobile-sidebar-open'));
        }
      }
    }
    await section('لیدها');
    try {
      for (const name of ['مراجعه سایت', 'مراجعه یکتانت', 'مراجعه شیت']) await page.getByRole('heading', { name, exact: true }).waitFor();
      await page.getByText('خدمت: خدمت تست', { exact: true }).waitFor();
      await page.getByText('توضیحات: یادداشت مراجعه سایت', { exact: true }).waitFor();
      for (const origin of ['وب‌سایت', 'یکتانت', 'شیت ادمین']) await page.getByText(`منشأ: ${origin}`, { exact: true }).waitFor();
      const order = await page.locator('.lead-panel h3').allTextContents(); assert.deepEqual(order, leadRows.map(x => x.userName));
      await page.locator('.lead-panel').getByRole('button', { name: 'بعدی', exact: true }).click();
      await page.getByRole('heading', { name: 'لید صفحه دوم', exact: true }).waitFor();
      await page.locator('.lead-panel').getByRole('button', { name: 'قبلی', exact: true }).click();
      await page.getByRole('heading', { name: 'مراجعه سایت', exact: true }).waitFor();
      await section('ویرایش گزارش');
      const search = page.locator('input[name=reportEditSearch]'); await search.fill('آزمایش فیلتر'); await search.blur();
      const filteredRequest = page.waitForRequest(request => request.url().includes('/Consultant/GetLeads') && new URL(request.url()).searchParams.get('searchText') === 'آزمایش فیلتر');
      await page.locator('.report-edit-filters button[type=submit]').click(); await filteredRequest;
      await section('رزروها');
      const reservations = page.locator('app-consultant-reservations-panel');
      await reservations.getByText('بیمار رزرو آزمایش', { exact: true }).first().waitFor();
      if (viewport.width > 600) {
        await reservations.getByRole('button', { name: 'ویرایش رزرو', exact: true }).click();
        const dialog = page.locator('form.edit-dialog-form'); await dialog.locator('textarea[name=editDescription]').fill('ویرایش مرورگر');
        await dialog.locator('textarea[name=editDescription]').blur();
        await dialog.getByRole('button', { name: 'ثبت زمان جدید', exact: true }).click();
        await page.waitForFunction(() => !document.querySelector('form.edit-dialog-form')?.getBoundingClientRect().width);
        assert(requests.some(request => request.method === 'PUT' && request.path.endsWith('/reservation') && request.body?.reservationId === 41));
        await reservations.getByRole('button', { name: 'تایید حضور بیمار', exact: true }).click();
        assert(requests.some(request => request.path.endsWith('/confirmattendance') && request.body?.patientAttended === true));
      }
      await section('کیف پول من'); await page.getByText('موجودی', { exact: false }).first().waitFor();
      await section('پیگیری‌های منشی'); await page.locator('app-secretary-follow-ups-list').waitFor();
      await section('ویرایش گزارش'); await section('بیماران'); await section('پرونده‌ها');
      assert.deepEqual(errors, []);
      console.log(`PASS ${viewport.width}px: three origins, Website service/notes, API order, pagination, report filter, reservations, wallet, follow-ups and existing navigation`);
    } catch (error) {
      await mkdir('/tmp/clinic-repair-qa', { recursive: true });
      await page.screenshot({ path: `/tmp/clinic-repair-qa/failure-${viewport.width}.png`, fullPage: true });
      await writeFile(`/tmp/clinic-repair-qa/failure-${viewport.width}.txt`, await page.locator('body').innerText());
      console.error('Unexpected fixture API routes:', [...unknown]); throw error;
    } finally { await context.close(); }
  }
  assert.equal(unknown.size, 0, `Unexpected API routes: ${[...unknown].join(', ')}`);
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
