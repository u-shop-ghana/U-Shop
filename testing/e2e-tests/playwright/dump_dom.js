const { chromium } = require('@playwright/test');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(5000);
    const html = await page.content();
    fs.writeFileSync('login_dom.html', html);
    console.log('Login DOM saved to login_dom.html');
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
