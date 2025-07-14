const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Testing FIXED section separation...');
    await page.goto('http://localhost:3000/heart', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test 2N+1 Redundancy section isolation
    console.log('Testing 2N+1 Redundancy section isolation...');
    await page.click('nav button:has-text("2N+1 REDUNDANCY")');
    await page.waitForTimeout(3000);
    
    // Check for any submarine cable text in this section
    const submarineTextInRedundancy = await page.locator('#redundancy:has-text("SUBMARINE CABLE")').count();
    console.log(`Submarine text found in redundancy section: ${submarineTextInRedundancy}`);
    
    await page.screenshot({ 
      path: 'fixed-redundancy-test.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
    console.log('Fixed redundancy screenshot saved');
    
    // Test Submarine Cable section isolation
    console.log('Testing Submarine Cable section isolation...');
    await page.click('nav button:has-text("SUBMARINE CABLE")');
    await page.waitForTimeout(3000);
    
    // Check for any redundancy text in this section
    const redundancyTextInSubmarine = await page.locator('#submarine:has-text("2N+1 REDUNDANCY")').count();
    console.log(`Redundancy text found in submarine section: ${redundancyTextInSubmarine}`);
    
    await page.screenshot({ 
      path: 'fixed-submarine-test.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
    console.log('Fixed submarine screenshot saved');
    
    // Take full page to see complete separation
    await page.screenshot({ 
      path: 'fixed-full-page-test.png', 
      fullPage: true
    });
    
    if (submarineTextInRedundancy === 0 && redundancyTextInSubmarine === 0) {
      console.log('✅ Sections are now properly separated!');
    } else {
      console.log('❌ Sections still have overlap issues');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
})();