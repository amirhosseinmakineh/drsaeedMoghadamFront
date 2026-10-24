import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const api = process.env.CLINIC_TEST_API_URL;
assert(api && /^http:\/\/(localhost|127\.0\.0\.1):\d+\/?$/.test(api), 'Provide an isolated loopback CLINIC_TEST_API_URL');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../dist/demo/browser');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/api/')) {
    const upstream = http.request(new URL(req.url, api), { method: req.method, headers: { ...req.headers, host: new URL(api).host } }, response => {
      res.writeHead(response.statusCode, response.headers); response.pipe(res);
    });
    upstream.on('error', () => { res.writeHead(502); res.end(); }); req.pipe(upstream); return;
  }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://local').pathname);
    const path = resolve(root, '.' + pathname);
    assert(path.startsWith(root));
    const extension = extname(path);
    const data = await readFile(extension ? path : join(root, 'index.html'));
    res.writeHead(200, { 'Content-Type': mime[extension] || 'text/html' }); res.end(data);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.CLINIC_CHROMIUM_EXECUTABLE || undefined, args: ['--no-sandbox'] });
try {
  for (const [kind, viewport, phone] of [['mobile', { width: 390, height: 844 }, '۰۹۱۲۳۴۵۶۷۸۴'], ['desktop', { width: 1440, height: 1000 }, '+989123456785']]) {
    const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
    const page = await context.newPage(); const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    const form = page.locator('app-consultation-request form');
    await form.getByLabel('خدمت تست یکپارچه', { exact: true }).waitFor();
    await form.locator('#consultation-name').fill('  علی   احمدی  ');
    await form.locator('#consultation-phone').fill('bad');
    await form.getByText('شماره موبایل ایران را کامل وارد کنید.').waitFor();
    await form.locator('#consultation-phone').fill(phone);
    await form.getByLabel('خدمت تست یکپارچه', { exact: true }).check();
    await form.locator('textarea').fill('درخواست واقعی مرورگر');
    const submit = form.getByRole('button', { name: 'ثبت درخواست مشاوره رایگان', exact: true });
    await page.waitForFunction(() => !document.querySelector('app-consultation-request button[type=submit]').disabled);
    let attempts = 0; const keys = [];
    await page.route('**/api/consultation-requests', async route => {
      attempts++; keys.push(route.request().headers()['idempotency-key']);
      if (attempts === 1) { await route.abort('internetdisconnected'); return; }
      await new Promise(resolve => setTimeout(resolve, 300)); await route.continue();
    });
    await submit.click();
    await form.getByRole('status').filter({ hasText: 'اطلاعات شما حفظ شده' }).waitFor();
    assert.equal(await form.locator('#consultation-phone').inputValue(), phone);
    assert.equal(await form.locator('textarea').inputValue(), 'درخواست واقعی مرورگر');
    assert.equal(await form.getByLabel('خدمت تست یکپارچه', { exact: true }).isChecked(), true);
    await submit.evaluate(button => { button.click(); button.click(); });
    await form.getByRole('button', { name: 'در حال ثبت درخواست…', exact: true }).waitFor();
    await form.getByRole('status').filter({ hasText: 'درخواست مشاوره شما با موفقیت ثبت شد.' }).waitFor();
    assert.equal(attempts, 2, 'second click must not send a second request');
    assert.equal(keys[0], keys[1], 'network retry must retain idempotency key');
    assert(await submit.isDisabled());
    const widths = await form.evaluate(element => ({ width: element.scrollWidth, visible: element.clientWidth }));
    assert(widths.width <= widths.visible + 1, 'form must fit mobile width');
    if (process.env.CLINIC_SCREENSHOT_DIR) await form.screenshot({ path: `${process.env.CLINIC_SCREENSHOT_DIR}/${kind}.png` });
    assert.deepEqual(errors, [], 'Angular must not throw browser errors');
    console.log(`PASS ${kind}: database-backed services, live validation, network recovery, preserved input, loading, double-click protection, real saved response and layout`);
    await context.close();
  }
  if (process.env.CLINIC_TEST_CONSULTANT_SESSION) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
    await context.addInitScript(session => localStorage.setItem('clinic-auth-session', session), process.env.CLINIC_TEST_CONSULTANT_SESSION);
    const page = await context.newPage();
    await page.goto(`${url}/consultant/leads?section=leads`);
    await page.locator('.dashboard-nav').getByRole('button', { name: 'لیدها', exact: true }).click();
    try {
      await page.getByText('منشأ: وب‌سایت · خدمات: خدمت تست یکپارچه', { exact: true }).first().waitFor({ timeout: 10000 });
    } catch (error) {
      console.error('Consultant page:', page.url(), await page.locator('body').innerText());
      if (process.env.CLINIC_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.CLINIC_SCREENSHOT_DIR}/consultant-failure.png`, fullPage: true });
      throw error;
    }
    await page.getByText('توضیحات مراجعه‌کننده', { exact: true }).first().waitFor();
    if (process.env.CLINIC_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.CLINIC_SCREENSHOT_DIR}/consultant.png`, fullPage: true });
    console.log('PASS consultant panel: authenticated real API displays assigned Website lead, service and visitor notes');
    await context.close();
  }
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
