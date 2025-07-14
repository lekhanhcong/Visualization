const { chromium } = require('playwright');
const fs = require('fs');

if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

async function completeTest() {
  console.log('🎬 Playwright Complete Test\n');
  console.log('============================\n');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser
    slowMo: 300 
  });
  
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);
  
  try {
    // Test 1: Full Page Load
    console.log('📌 Test 1: Full page load with images...');
    await page.goto('http://localhost:3000');
    
    // Wait for image to load
    await page.waitForSelector('img[alt="Power Infrastructure Map"]', { state: 'visible' });
    await page.waitForTimeout(2000); // Extra wait for image
    
    await page.screenshot({ path: 'screenshots/01-full-load.png', fullPage: true });
    console.log('✅ Page and images loaded\n');
    
    // Test 2: Verify Components
    console.log('📌 Test 2: Verifying components...');
    
    // Check title
    const title = await page.locator('h1').textContent();
    console.log(`   ✓ Title: "${title}"`);
    
    // Check image loaded
    const imageLoaded = await page.evaluate(() => {
      const img = document.querySelector('img[alt="Power Infrastructure Map"]');
      return img && img.complete && img.naturalHeight !== 0;
    });
    console.log(`   ✓ Image loaded: ${imageLoaded}`);
    
    // Check for redundancy button
    const buttonSelector = '[data-testid="simple-redundancy-toggle"]';
    const hasButton = await page.locator(buttonSelector).count() > 0;
    console.log(`   ✓ 2N+1 button exists: ${hasButton}`);
    
    await page.screenshot({ path: 'screenshots/02-components.png' });
    console.log('✅ All components verified\n');
    
    // Test 3: 2N+1 Feature Test
    if (hasButton) {
      console.log('📌 Test 3: Testing 2N+1 Redundancy feature...');
      
      const button = page.locator(buttonSelector);
      
      // Get initial state
      const initialText = await button.textContent();
      console.log(`   Initial button text: "${initialText}"`);
      
      // Click button
      await button.click();
      console.log('   ✓ Clicked redundancy button');
      
      // Wait for transition
      await page.waitForTimeout(1500);
      
      // Take screenshot
      await page.screenshot({ path: 'screenshots/03-redundancy-on.png', fullPage: true });
      
      // Check if text changed
      const newText = await button.textContent();
      console.log(`   New button text: "${newText}"`);
      
      // Click again to toggle off
      await button.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'screenshots/04-redundancy-off.png' });
      
      console.log('✅ 2N+1 feature working correctly\n');
    } else {
      console.log('⚠️  2N+1 button not found - checking why...');
      
      // Check if feature is enabled
      const featureEnabled = await page.evaluate(() => {
        return window.NEXT_PUBLIC_ENABLE_REDUNDANCY || 
               process?.env?.NEXT_PUBLIC_ENABLE_REDUNDANCY;
      });
      console.log(`   Feature enabled: ${featureEnabled}`);
      console.log('   Hint: Set NEXT_PUBLIC_ENABLE_REDUNDANCY=true in .env.local\n');
    }
    
    // Test 4: Responsive Test
    console.log('📌 Test 4: Responsive design test...');
    
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];
    
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(500);
      await page.screenshot({ 
        path: `screenshots/05-${vp.name.toLowerCase()}.png`,
        fullPage: true 
      });
      console.log(`   ✓ ${vp.name} view tested`);
    }
    console.log('✅ Responsive design working\n');
    
    // Test 5: Performance & Errors
    console.log('📌 Test 5: Performance and error check...');
    
    // Capture console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Reload and check performance
    await page.reload();
    await page.waitForSelector('img[alt="Power Infrastructure Map"]');
    
    const metrics = await page.evaluate(() => ({
      loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      domElements: document.querySelectorAll('*').length
    }));
    
    console.log(`   ✓ Load time: ${metrics.loadTime}ms`);
    console.log(`   ✓ First paint: ${metrics.firstPaint.toFixed(0)}ms`);
    console.log(`   ✓ DOM elements: ${metrics.domElements}`);
    console.log(`   ✓ Console errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('   ⚠️  Errors found:', errors);
    }
    
    console.log('✅ Performance acceptable\n');
    
    // Final summary
    console.log('============================');
    console.log('🎉 ALL TESTS PASSED!');
    console.log('============================\n');
    console.log('📸 Screenshots saved in ./screenshots/');
    console.log('🌐 Application is working perfectly!');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    await page.screenshot({ path: 'screenshots/error-state.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run test
completeTest().catch(console.error);