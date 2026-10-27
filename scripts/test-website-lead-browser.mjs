import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = 'http://127.0.0.1:3338';
const server = spawn(process.execPath, ['dist/demo/server/server.mjs'], {
  env: {...process.env, HOST: '127.0.0.1', PORT: '3338'}, stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
server.stdout.on('data', c => logs += c); server.stderr.on('data', c => logs += c);
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let browser;
try {
  let ready = false;
  for (let i=0; i<60; i++) { try { ready = (await fetch(`${origin}/healthz`)).ok; } catch {} if (ready) break; await pause(200); }
  assert(ready, `SSR failed to start: ${logs}`);
  const html = await (await fetch(origin)).text();
  assert(html.includes('name="leadFullName"') && html.includes('name="leadPhone"'), `Home form missing from SSR HTML: ${logs}`);
  browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
  for (const [label, viewport] of [['desktop', {width:1440, height:1000}], ['mobile', {width:390, height:844}]].filter(([label]) => !process.env.WEBSITE_LEAD_VIEWPORT || label === process.env.WEBSITE_LEAD_VIEWPORT)) {
    const context = await browser.newContext({viewport, serviceWorkers:'block'});
    const page = await context.newPage();
    const exceptions = [], requests = [], unrelatedFailures = [];
    let mode = 'network', pending;
    page.on('pageerror', e => exceptions.push(e.message));
    page.on('response', r => { if(r.status()>=400 && !r.url().endsWith('/consultation-requests')) unrelatedFailures.push({url:r.url(), status:r.status()}); });
    await context.route('**/*', async route => {
      const request = route.request();
      if (request.url().endsWith('/api/consultation-requests')) {
        if(request.method()==='OPTIONS') return route.fulfill({status:204,headers:{'access-control-allow-origin':origin,'access-control-allow-methods':'POST','access-control-allow-headers':'content-type'}});
        assert.equal(request.method(), 'POST'); requests.push(request.postDataJSON());
        assert.deepEqual(Object.keys(requests.at(-1)).sort(), ['fullName','phoneNumber','requestId']);
        if(mode==='network') return route.abort('internetdisconnected');
        if(mode==='hold') { pending=route; return; }
        return route.fulfill({status: typeof mode==='number' ? mode : 200, contentType:'application/json', headers:{'access-control-allow-origin':origin},
          body:JSON.stringify(mode==='unconfirmed' ? {success:false} : {message: mode===409 ? 'شماره قبلاً ثبت شده است.' : 'خطای آزمایشی اطلاعات'})});
      }
      if(request.url().startsWith(origin)) return route.continue();
      return route.abort();
    });
    await page.goto(origin, {waitUntil:'networkidle'});
    const form=page.locator('form.consult-lead__form'); await form.scrollIntoViewIfNeeded();
    const name=form.locator('[name="leadFullName"]'), phone=form.locator('[name="leadPhone"]');
    const button=form.locator('button[type="submit"]');
    assert.equal(await button.innerText(),'درخواست مشاوره');
    const clickSubmit = async () => { await button.evaluate(el => el.scrollIntoView({block:'center'})); try { await button.click({timeout:10000}); } catch(error) { console.error('CLICK DEBUG', await page.evaluate(() => ({scrollY, button: document.querySelector('.consult-lead__submit').getBoundingClientRect().toJSON(), nav:document.querySelector('.mobile-bottom-nav').getBoundingClientRect().toJSON()}))); if(process.env.WEBSITE_LEAD_SCREENSHOT_DIR) await page.screenshot({path:process.env.WEBSITE_LEAD_SCREENSHOT_DIR+'/website-lead-failure.png'}); throw error; } };
    assert.equal(await form.locator('input').count(),2); assert.equal(await form.locator('select,textarea').count(),0);
    assert.equal(await form.evaluate(el=>getComputedStyle(el).direction),'rtl');
    await clickSubmit(); await form.getByText('نام و نام خانوادگی را وارد کنید.',{exact:true}).waitFor(); assert.equal(requests.length,0);
    await name.fill('1234'); await phone.fill('09123456789'); await clickSubmit(); assert.equal(requests.length,0);
    await name.fill('علی رضایی'); await phone.fill('02112345678'); await clickSubmit(); assert.equal(requests.length,0);
    await phone.fill('۰۹۱۲۳۴۵۶۷۸۹'); await clickSubmit();
    await form.getByText('ارتباط با سرور برقرار نشد؛ اینترنت را بررسی و دوباره تلاش کنید.',{exact:true}).waitFor();
    assert.equal(await phone.inputValue(),'۰۹۱۲۳۴۵۶۷۸۹'); const retryKey=requests.at(-1).requestId;
    for (const status of [400,409,429,503]) {
      mode=status; await clickSubmit();
      const text = status===429 ? 'تعداد درخواست‌ها زیاد است؛ چند دقیقه دیگر تلاش کنید.' : status===503
        ? 'ثبت درخواست موقتاً امکان‌پذیر نیست؛ دوباره تلاش کنید.' : status===409 ? 'شماره قبلاً ثبت شده است.' : 'خطای آزمایشی اطلاعات';
      await form.getByText(text,{exact:true}).waitFor();
      assert.equal(requests.at(-1).requestId,retryKey); assert.equal(await name.inputValue(),'علی رضایی');
    }
    if(label==='desktop') {
      mode='hold'; await clickSubmit();
      await form.getByText('پاسخ سرور به‌موقع دریافت نشد؛ برای پیگیری همان درخواست دوباره تلاش کنید.',{exact:true}).waitFor({timeout:25000});
      assert.equal(requests.at(-1).requestId,retryKey); await pending.abort().catch(()=>{}); pending=undefined;
    }
    mode='unconfirmed'; await clickSubmit();
    await form.getByText('ثبت درخواست تأیید نشد؛ دوباره تلاش کنید.',{exact:true}).waitFor();
    assert.equal(await phone.inputValue(),'۰۹۱۲۳۴۵۶۷۸۹');
    await phone.fill('09123456780'); mode='hold'; const before=requests.length;
    await button.evaluate(el=>{el.click();el.click();});
    for(let i=0;!pending && i<50;i++) await pause(20);
    assert(pending); assert.equal(requests.length,before+1); assert.notEqual(requests.at(-1).requestId,retryKey);
    assert.equal(requests.at(-1).phoneNumber,'09123456780'); assert(await button.isDisabled()); assert(await name.isDisabled());
    assert.equal(await form.getByText('درخواست مشاوره شما با موفقیت ثبت شد. همکاران ما با شما تماس خواهند گرفت.',{exact:true}).count(),0);
    assert(await form.evaluate(el=>el.getBoundingClientRect().width<=innerWidth));
    if(process.env.WEBSITE_LEAD_SCREENSHOT_DIR) await form.screenshot({path:`${process.env.WEBSITE_LEAD_SCREENSHOT_DIR}/website-lead-${label}.png`});
    await pending.fulfill({status:200,contentType:'application/json', headers:{'access-control-allow-origin':origin},body:JSON.stringify({success:true})}); pending=undefined;
    await form.getByText('درخواست مشاوره شما با موفقیت ثبت شد. همکاران ما با شما تماس خواهند گرفت.',{exact:true}).waitFor();
    assert.equal(await name.inputValue(),''); assert.equal(await phone.inputValue(),''); assert(await button.isDisabled());
    assert.deepEqual(exceptions,[],`${label} JavaScript exceptions`);
    console.log(`PASS ${label}: SSR hydration, two inputs, validation, HTTP errors/retry keys, double click, loading and explicit success.`);
    console.log(`${label} existing non-API resource failures: ${JSON.stringify(unrelatedFailures)}`);
    await context.close();
  }
  assert(!/ERROR|uncaughtException|UnhandledPromiseRejection/i.test(logs),logs);
  console.log('Browser form checks passed using HTTP fixtures. This does not verify SQL persistence or operational Backend readiness.');
} finally { await browser?.close(); server.kill('SIGTERM'); }
