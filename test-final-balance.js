const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Testing FINAL power flow balance...');
    await page.goto('http://localhost:3000/heart', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Navigate to electricity section
    console.log('Navigating to Electricity section...');
    await page.click('nav button:has-text("ELECTRICITY")');
    await page.waitForTimeout(3000);
    
    // Take focused screenshot of power flow canvas
    const powerFlowElement = await page.locator('canvas').first();
    if (powerFlowElement) {
      await powerFlowElement.screenshot({ 
        path: 'final-balanced-power-flow.png'
      });
      console.log('Final balanced power flow screenshot saved');
    }
    
    // Take full section screenshot
    await page.screenshot({ 
      path: 'final-electricity-section.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
    console.log('Final electricity section screenshot saved');
    
    console.log('✅ Final power flow balance test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
})();