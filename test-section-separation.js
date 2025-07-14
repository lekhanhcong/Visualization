const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to website...');
    await page.goto('http://localhost:3000/heart', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('Testing section separation...');
    
    // Navigate to 2N+1 Redundancy section
    console.log('Scrolling to 2N+1 Redundancy section...');
    await page.click('nav button:has-text("2N+1 REDUNDANCY")');
    await page.waitForTimeout(2000);
    
    // Take screenshot of 2N+1 section
    await page.screenshot({ 
      path: 'redundancy-section-test.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
    console.log('Screenshot saved: redundancy-section-test.png');
    
    // Navigate to Submarine Cable section
    console.log('Scrolling to Submarine Cable section...');
    await page.click('nav button:has-text("SUBMARINE CABLE")');
    await page.waitForTimeout(2000);
    
    // Take screenshot of Submarine Cable section
    await page.screenshot({ 
      path: 'submarine-section-test.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
    console.log('Screenshot saved: submarine-section-test.png');
    
    // Take full page screenshot to see overall layout
    await page.screenshot({ 
      path: 'full-page-separation-test.png', 
      fullPage: true
    });
    console.log('Full page screenshot saved: full-page-separation-test.png');
    
    console.log('✅ Section separation test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
})();