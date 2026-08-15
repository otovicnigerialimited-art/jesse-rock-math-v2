const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('pageerror', error => console.log('PAGE EXCEPTION:', error.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  const initBtn = await page.$$('button');
  for(let b of initBtn) {
    if ((await page.evaluate(el => el.textContent, b)).includes('Initialize')) {
      await b.click(); break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  
  const guestBtn = await page.$$('button');
  for(let b of guestBtn) {
    if ((await page.evaluate(el => el.textContent, b)).includes('Guest')) {
      await b.click(); break;
    }
  }
  await new Promise(r => setTimeout(r, 2000));
  
  // Find review section and fill it
  console.log("Typing review...");
  await page.type('#userName', 'Test User');
  await page.type('#reviewText', 'This is a test');
  
  const submitBtn = await page.$$('button');
  for(let b of submitBtn) {
    if ((await page.evaluate(el => el.textContent, b)).includes('Submit Review')) {
      await b.click(); break;
    }
  }
  
  await new Promise(r => setTimeout(r, 2000));
  console.log("Done. Checking for white screen...");
  const html = await page.content();
  const isWhiteScreen = html.includes('id="root"></div>') && !html.includes('id="root"><div');
  console.log("Is White Screen?", isWhiteScreen);
  await browser.close();
})();
