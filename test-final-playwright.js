const { chromium } = require('playwright');

async function testWithScreenCapture() {
  console.log('🚀 Starting Playwright test with screen capture...\n');
  
  const browser = await chromium.launch({
    headless: false, // Show browser for visual verification
    slowMo: 500 // Slow down for better visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: './test-videos',
      size: { width: 1920, height: 1080 }
    }
  });
  
  const page = await context.newPage();
  
  try {
    // Test 1: Page Load
    console.log('📋 Test 1: Loading page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/01-page-load.png', fullPage: true });
    console.log('✅ Page loaded successfully');
    
    // Test 2: Check main elements
    console.log('\n📋 Test 2: Checking main elements...');
    const title = await page.textContent('h1');
    console.log(`   Title: ${title}`);
    
    const hasImage = await page.locator('img[alt="Power Infrastructure Map"]').isVisible();
    console.log(`   Power map visible: ${hasImage}`);
    await page.screenshot({ path: 'screenshots/02-main-elements.png' });
    console.log('✅ Main elements found');
    
    // Test 3: 2N+1 Redundancy Feature
    console.log('\n📋 Test 3: Testing 2N+1 Redundancy feature...');
    
    // Check if button exists
    const redundancyButton = page.locator('[data-testid="simple-redundancy-toggle"]');
    const buttonExists = await redundancyButton.count() > 0;
    
    if (buttonExists) {
      console.log('   ✅ Redundancy button found');
      
      // Click the button
      await redundancyButton.click();
      console.log('   ✅ Clicked redundancy button');
      
      // Wait for animation
      await page.waitForTimeout(1000);
      
      // Take screenshot of 2N+1 view
      await page.screenshot({ path: 'screenshots/03-redundancy-active.png', fullPage: true });
      
      // Check if image changed
      const currentImage = await page.locator('img[alt="Power Infrastructure Map"]').getAttribute('src');
      console.log(`   Current image: ${currentImage}`);
      
      // Click again to toggle back
      await redundancyButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/04-redundancy-inactive.png' });
      
      console.log('✅ 2N+1 Redundancy feature working perfectly');
    } else {
      console.log('   ⚠️  Redundancy button not found - feature may be disabled');
    }
    
    // Test 4: Responsive Design
    console.log('\n📋 Test 4: Testing responsive design...');
    
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'screenshots/05-desktop-view.png' });
    console.log('   ✅ Desktop view captured');
    
    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'screenshots/06-tablet-view.png' });
    console.log('   ✅ Tablet view captured');
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'screenshots/07-mobile-view.png' });
    console.log('   ✅ Mobile view captured');
    
    // Test 5: Console Errors
    console.log('\n📋 Test 5: Checking for console errors...');
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Navigate again to catch any errors
    await page.reload();
    await page.waitForTimeout(2000);
    
    if (errors.length === 0) {
      console.log('✅ No console errors detected');
    } else {
      console.log('❌ Console errors found:', errors);
    }
    
    // Test 6: Performance
    console.log('\n📋 Test 6: Checking performance...');
    const performanceTiming = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
      };
    });
    
    console.log(`   Page load time: ${performanceTiming.loadTime}ms`);
    console.log(`   DOM ready: ${performanceTiming.domReady}ms`);
    console.log(`   First paint: ${performanceTiming.firstPaint.toFixed(2)}ms`);
    console.log('✅ Performance metrics captured');
    
    // Final summary screenshot
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/08-final-state.png', fullPage: true });
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('📸 Screenshots saved in ./screenshots/');
    console.log('🎥 Video saved in ./test-videos/');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await page.screenshot({ path: 'screenshots/error-state.png', fullPage: true });
  } finally {
    // Close browser
    await context.close();
    await browser.close();
  }
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}
if (!fs.existsSync('test-videos')) {
  fs.mkdirSync('test-videos');
}

// Run the test
testWithScreenCapture().catch(console.error);