const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Testing HEART Website Direct Access...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging
  page.on('console', msg => console.log('Browser Console:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('Page Error:', error.message));

  try {
    console.log('📍 Navigating to http://localhost:3000/heart');
    await page.goto('http://localhost:3000/heart', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    console.log('⏳ Waiting for page to fully load...');
    await page.waitForTimeout(10000);
    
    // Check page content
    const pageContent = await page.content();
    console.log('📄 Page content length:', pageContent.length);
    
    // Check for errors
    const hasError = await page.locator('text=error').count();
    if (hasError > 0) {
      console.log('❌ Error found on page');
    }
    
    // Check for navigation
    const hasNav = await page.locator('nav').count();
    console.log('🧭 Navigation found:', hasNav > 0);
    
    // Check for sections
    const sections = ['location', 'transportation', 'datacenter', 'electricity', 'submarine'];
    for (const section of sections) {
      const hasSection = await page.locator(`#${section}`).count();
      console.log(`📋 Section ${section}:`, hasSection > 0 ? '✅' : '❌');
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-screenshots/heart-debug.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot saved to test-screenshots/heart-debug.png');
    
    // Keep browser open for inspection
    console.log('🔍 Browser will stay open for 30 seconds for inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ 
      path: 'test-screenshots/heart-error.png', 
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();