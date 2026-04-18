const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000/login');
    // Wait for Next.js to render something
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'C:/Users/nuhur/.gemini/antigravity/brain/ed5256a7-0fd0-4ba8-9b23-e53d285988f0/artifacts/login_page_debug.png' });
    console.log('Login screenshot saved');
    
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'C:/Users/nuhur/.gemini/antigravity/brain/ed5256a7-0fd0-4ba8-9b23-e53d285988f0/artifacts/home_page_debug.png' });
    console.log('Homepage screenshot saved');
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
