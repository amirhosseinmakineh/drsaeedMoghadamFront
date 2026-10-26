import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseUrl = process.argv[2];
assert(baseUrl, 'Provide the isolated test host URL. Never run against production.');
const browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
try {
  for (const [index, viewport] of [{width: 1440, height: 1000}, {width: 390, height: 844}].entries()) {
    const context = await browser.newContext({viewport, serviceWorkers: "block"});
    // Keep tests local and prevent third-party analytics or font requests.
    await context.route('**/*', route => route.request().url().startsWith(baseUrl) ? route.continue() : route.abort());
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
    await context.close();
  }
} finally { await browser.close(); }
console.log('Desktop and mobile: actual form -> HTTP API -> SQL Server passed.');
