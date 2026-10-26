import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseUrl = process.argv[2];
assert(baseUrl, 'Provide the isolated test host URL. Never run against production.');
const browser = await chromium.launch({headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE || undefined, args: ['--no-sandbox']});
try {
  for (const [index, viewport] of [{width: 1440, height: 1000}, {width: 390, height: 844}].entries()) {
    const context = await browser.newContext({viewport, serviceWorkers: "block"});
    // Keep tests local and prevent third-party analytics or font requests.
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith('/api/')) {
        // Lead reads/writes always reach the real isolated ASP.NET/SQL host.
        const path = url.pathname.toLowerCase();
        const supportingViews = {
          '/api/consultant/getdashboardstatus': {isAvailable: true, isOnline: false, canGoOnline: false, pendingReportCount: 1},
          '/api/consultant/getbroadcastrealtimeleads': {canReceive: false, leads: []},
          '/api/reservation/dueconfirmations': [],
          '/api/reservation/getconsultantreservations': {items: [], totalCount: 0, totalPages: 0},
        };
        if (Object.hasOwn(supportingViews, path)) {
          await route.fulfill({json: supportingViews[path]}); return;
        }
        const response = await route.fetch({url: baseUrl + url.pathname + url.search});
        await route.fulfill({response});
      } else if (url.origin === baseUrl) await route.continue();
      else await route.abort();
    });
    const page = await context.newPage();
    await page.goto(baseUrl);
    const form = page.locator('form.lead-form');
    await form.scrollIntoViewIfNeeded();
    await page.locator('[name="leadFullName"]').fill('امیر حسین');
    await page.locator('[name="leadPhone"]').fill(index === 0 ? '+989123456789' : '۰۹۱۲۳۴۵۶۷۸۰');
    await page.locator('[name="leadService"] option').nth(1).waitFor({state: 'attached'});
    await page.locator('[name="leadService"]').selectOption({index: 1});
    await page.locator('[name="leadMessage"]').fill('درخواست تست مرورگر');
    const button = form.getByRole('button', {name: 'ثبت درخواست مشاوره رایگان'});
    assert(await button.isEnabled());
    if (index === 0) {
      const failOnce = route => route.abort("internetdisconnected");
      await context.route("**/api/consultation-requests", failOnce);
      await button.click();
      await form.getByText('ارتباط با سرور برقرار نشد؛ اینترنت را بررسی و دوباره تلاش کنید.').waitFor({timeout: 5000}).catch(async error => { console.error(await form.innerText()); throw error; });
      assert.equal(await page.locator('[name="leadFullName"]').inputValue(), 'امیر حسین');
      assert.equal(await page.locator('[name="leadMessage"]').inputValue(), 'درخواست تست مرورگر');
      await context.unroute("**/api/consultation-requests", failOnce);
    }
    let submissions = 0;
    page.on("request", r => { if (r.method() === "POST" && r.url().endsWith("/api/consultation-requests")) submissions++; });
    const committed = page.waitForResponse(r => r.url().endsWith('/api/consultation-requests') && r.request().method() === 'POST');
    await button.evaluate(el => { el.click(); el.click(); });
    assert.equal((await committed).status(), 200);
    await form.getByText('درخواست مشاوره شما با موفقیت ثبت شد. همکاران ما برای هماهنگی با شما تماس خواهند گرفت.').waitFor();
    assert(await button.isDisabled());
    assert.equal(submissions, 1);
    assert(await form.evaluate(el => el.getBoundingClientRect().width <= window.innerWidth));
    const phone = index === 0 ? '09123456789' : '09123456780';
    const pickup = await context.request.post(`${baseUrl}/test/pickup/${phone}`);
    assert.equal(pickup.status(), 200, await pickup.text());
    const assigned = await pickup.json();
    await context.setExtraHTTPHeaders({'X-Consultation-Test-User': assigned.userId});
    const token = ['e30', Buffer.from(JSON.stringify({sub: assigned.userId, role: 'Consultant', profileId: assigned.profileId, exp: 2000000000})).toString('base64url'), 'test-only'].join('.');
    const session = {token, user: {firstName: 'مشاور', lastName: 'تست', role: 'consultant', roleName: 'Consultant', roles: ['consultant'], isCompleteProfile: true, profileId: assigned.profileId, consultantProfileId: assigned.profileId, userId: assigned.userId}};
    await context.addInitScript(value => localStorage.setItem('clinic-auth-session', JSON.stringify(value)), session);
    const leadResponse = page.waitForResponse(r => new URL(r.url()).pathname.toLowerCase() === '/api/consultant/getnewleads');
    await page.goto(`${baseUrl}/consultant/leads?section=leads`);
    const actualResponse = await leadResponse;
    assert.equal(actualResponse.status(), 200);
    const actual = await actualResponse.json();
    const lead = actual.items.find(x => x.id === assigned.leadId);
    assert.equal(lead.sourceType, 4);
    assert.equal(lead.phoneNumber, phone);
    assert.equal(lead.consultationNotes, 'درخواست تست مرورگر');
    await page.getByRole('heading', {name: 'امیر حسین', exact: true}).waitFor();
    await page.getByText(`خدمت: ${lead.consultationServiceTitle}`, {exact: true}).waitFor();
    await page.getByText('منشأ: وب‌سایت', {exact: true}).waitFor();
    await page.getByText('توضیحات: درخواست تست مرورگر', {exact: true}).waitFor();
    // The real controller must apply authenticated ownership, source filters and pagination.
    const filtered = await context.request.get(`${baseUrl}/api/Consultant/GetNewLeads?profileId=999999&sourceType=4&pageSize=1&pageNumber=1`);
    assert.equal(filtered.status(), 200);
    assert.equal((await filtered.json()).items[0].id, assigned.leadId);
    const otherSource = await context.request.get(`${baseUrl}/api/Consultant/GetNewLeads?sourceType=1`);
    assert.deepEqual((await otherSource.json()).items, []);
    console.log(`${viewport.width}px: form -> SQL -> existing allocation/pickup -> authorized controller -> dashboard passed`);
    await context.close();
  }
} finally { await browser.close(); }
console.log('Desktop and mobile: real consultation persistence, shared pickup and consultant lead UI passed.');
