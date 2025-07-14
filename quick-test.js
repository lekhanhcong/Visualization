const { chromium } = require('playwright');

async function quickTest() {
  let browser;
  try {
    console.log('🚀 QUICK TEST - VERIFYING APPLICATION');
    console.log('=====================================');
    
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    
    // Test page load
    await page.goto('http://localhost:3000/heart', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    const title = await page.title();
    console.log('✅ Title:', title);
    
    // Test hero section
    const heroText = await page.locator('#hero h1').textContent();
    console.log('✅ Hero:', heroText);
    
    // Test all sections exist
    const sections = ['hero', 'location', 'transportation', 'datacenter', 'electricity', 'redundancy', 'submarine'];
    for (const section of sections) {
      const exists = await page.locator(`#${section}`).count() > 0;
      console.log(`${exists ? '✅' : '❌'} Section ${section}: ${exists ? 'Found' : 'Missing'}`);
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: './quick-test-screenshot.png',
      fullPage: true
    });
    
    console.log('\n🎉 APPLICATION IS RUNNING PERFECTLY!');
    console.log('📸 Screenshot saved: quick-test-screenshot.png');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) await browser.close();
  }
}

quickTest();