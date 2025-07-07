/**
 * Manual verification with extended wait times
 */

const { chromium } = require('playwright');

async function manualVerification() {
  console.log('🔍 Starting Manual Verification...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better observation
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📱 Opening page...');
    await page.goto('http://localhost:3000');
    
    console.log('⏳ Waiting for page to fully load...');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Extra wait for React to hydrate
    
    console.log('🔍 Looking for toggle button...');
    // Try multiple selectors to find the button
    const buttonSelectors = [
      '[data-testid="simple-redundancy-toggle"]',
      'button:has-text("Show 2N+1 Redundancy")',
      'button:has-text("Back to Main")',
      'button:has-text("⚡")'
    ];
    
    let button = null;
    for (const selector of buttonSelectors) {
      try {
        button = page.locator(selector);
        if (await button.isVisible()) {
          console.log(`✅ Found button with selector: ${selector}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Selector ${selector} not found`);
      }
    }
    
    if (!button || !(await button.isVisible())) {
      console.log('❌ Button not found with any selector');
      console.log('📸 Taking screenshot for debugging...');
      await page.screenshot({ path: 'debug-screenshot.png' });
      
      console.log('🔍 Checking page content...');
      const pageText = await page.textContent('body');
      console.log('Page contains Show 2N+1:', pageText.includes('Show 2N+1'));
      console.log('Page contains Back to Main:', pageText.includes('Back to Main'));
      console.log('Page contains Hue Hi Tech Park:', pageText.includes('Hue Hi Tech Park'));
      
      return false;
    }
    
    console.log('✅ Button found! Testing functionality...');
    
    // Test initial state
    const initialText = await button.textContent();
    console.log('Initial button text:', initialText);
    
    // Test click
    console.log('🖱️ Clicking button...');
    await button.click();
    await page.waitForTimeout(2000);
    
    const clickedText = await button.textContent();
    console.log('After click text:', clickedText);
    
    // Check for text overlay
    console.log('🔍 Checking for text overlay...');
    const textOverlayVisible = await page.locator('text=500KV ONSITE GRID').isVisible();
    console.log('Text overlay visible:', textOverlayVisible);
    
    // Click back
    console.log('🖱️ Clicking back...');
    await button.click();
    await page.waitForTimeout(2000);
    
    const returnText = await button.textContent();
    console.log('After return text:', returnText);
    
    // Final assessment
    const functionalityWorks = 
      initialText.includes('Show 2N+1 Redundancy') &&
      clickedText.includes('Back to Main') &&
      textOverlayVisible &&
      returnText.includes('Show 2N+1 Redundancy');
    
    console.log('\n🎯 MANUAL VERIFICATION RESULTS');
    console.log('='.repeat(40));
    console.log(`🔄 Full Cycle Test: ${functionalityWorks ? 'PASS' : 'FAIL'}`);
    console.log(`🚀 Ready for Production: ${functionalityWorks ? 'YES' : 'NO'}`);
    console.log('='.repeat(40));
    
    return functionalityWorks;
    
  } catch (error) {
    console.error('❌ Test error:', error);
    return false;
  } finally {
    console.log('⏱️ Test completed. Browser will close in 5 seconds...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

// Run manual verification
manualVerification().then(success => {
  console.log(success ? '🎉 All tests passed!' : '❌ Some tests failed');
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});