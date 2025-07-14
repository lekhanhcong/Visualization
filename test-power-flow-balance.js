const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Testing power flow animation balance...');
    await page.goto('http://localhost:3000/heart', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Navigate to electricity section to see power flow
    console.log('Scrolling to Electricity section...');
    await page.click('nav button:has-text("ELECTRICITY")');
    await page.waitForTimeout(3000);
    
    // Take screenshot of power flow animation
    await page.screenshot({ 
      path: 'power-flow-balance-test.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
    console.log('Power flow balance screenshot saved: power-flow-balance-test.png');
    
    // Take a focused screenshot of just the power flow canvas area
    const powerFlowElement = await page.locator('canvas').first();
    if (powerFlowElement) {
      await powerFlowElement.screenshot({ 
        path: 'power-flow-canvas-only.png'
      });
      console.log('Power flow canvas screenshot saved: power-flow-canvas-only.png');
    }
    
    console.log('✅ Power flow balance test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
})();