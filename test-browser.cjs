const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
        console.log('PAGE ERROR LOG:', msg.text());
    }
  });
  page.on('pageerror', error => console.log('PAGE EXCEPTION:', error.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  const html = await page.content();
  console.log("HTML length:", html.length);
  const isWhiteScreen = html.includes('id="root"></div>') && !html.includes('id="root"><div');
  console.log("Is White Screen?", isWhiteScreen);
  await browser.close();
})();
