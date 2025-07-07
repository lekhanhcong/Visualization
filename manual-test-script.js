// Manual test script for 2N+1 Redundancy Feature
const { chromium } = require('playwright');

(async () => {
  console.log('🧪 Starting manual test of 2N+1 Redundancy Feature...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Track console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  try {
    // Step 1: Navigate to the application
    console.log('📍 Step 1: Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded successfully\n');
    
    // Step 2: Check for page errors
    console.log('📍 Step 2: Checking for page load errors...');
    if (consoleErrors.length > 0) {
      console.log('❌ Console errors found:', consoleErrors);
    } else {
      console.log('✅ No console errors on page load\n');
    }
    
    // Step 3: Look for redundancy button
    console.log('📍 Step 3: Looking for "Show 2N+1 Redundancy" button...');
    const redundancyButton = await page.locator('button:has-text("Show 2N+1 Redundancy")');
    const buttonExists = await redundancyButton.count() > 0;
    
    if (!buttonExists) {
      console.log('❌ Redundancy button not found. Checking if feature flag is enabled...');
      // Check page source for any redundancy-related elements
      const pageContent = await page.content();
      if (pageContent.includes('redundancy')) {
        console.log('ℹ️  Found redundancy-related content in page');
      } else {
        console.log('⚠️  No redundancy-related content found. Feature may be disabled.');
      }
      await browser.close();
      return;
    }
    
    console.log('✅ Redundancy button found\n');
    
    // Step 4: Click the button
    console.log('📍 Step 4: Clicking the redundancy button...');
    await redundancyButton.click();
    await page.waitForTimeout(1000); // Wait for animation
    console.log('✅ Button clicked successfully\n');
    
    // Step 5: Verify visual elements
    console.log('📍 Step 5: Verifying visual elements...');
    
    // Check for info panel
    const infoPanel = await page.locator('[data-testid="redundancy-info-panel"], .redundancy-info-panel, div:has-text("2N+1 Redundancy Status")');
    const infoPanelVisible = await infoPanel.isVisible().catch(() => false);
    console.log(infoPanelVisible ? '✅ Info panel visible' : '❌ Info panel not found');
    
    // Check for substations
    const substations = await page.locator('[data-testid*="substation"], .substation-marker, text=/ACTIVE|STANDBY/');
    const substationCount = await substations.count();
    console.log(`ℹ️  Found ${substationCount} substation markers`);
    
    // Check for power lines
    const powerLines = await page.locator('svg line, svg path, .power-line');
    const powerLineCount = await powerLines.count();
    console.log(`ℹ️  Found ${powerLineCount} power line elements`);
    
    // Check for animations/glow effects
    const glowElements = await page.locator('[class*="glow"], [class*="pulse"], [style*="box-shadow"]');
    const glowCount = await glowElements.count();
    console.log(`ℹ️  Found ${glowCount} elements with glow/animation effects\n`);
    
    // Step 6: Test close functionality
    console.log('📍 Step 6: Testing close functionality...');
    
    // Test ESC key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Check if modal is closed
    const modalStillVisible = await page.locator('[role="dialog"], .modal, .redundancy-modal').isVisible().catch(() => false);
    if (!modalStillVisible) {
      console.log('✅ ESC key successfully closed the modal');
    } else {
      console.log('⚠️  ESC key did not close the modal, trying close button...');
      
      // Try close button
      const closeButton = await page.locator('button[aria-label*="close" i], button:has-text("×"), button:has-text("Close")');
      if (await closeButton.count() > 0) {
        await closeButton.first().click();
        console.log('✅ Close button clicked');
      }
    }
    
    // Step 7: Final console error check
    console.log('\n📍 Step 7: Final console error check...');
    if (consoleErrors.length > 0) {
      console.log(`❌ Total console errors: ${consoleErrors.length}`);
      consoleErrors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`));
    } else {
      console.log('✅ No JavaScript errors detected throughout the test');
    }
    
    // Step 8: Performance check
    console.log('\n📍 Step 8: Performance metrics...');
    const metrics = await page.evaluate(() => {
      const perf = window.performance;
      const navTiming = perf.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart,
        loadComplete: navTiming.loadEventEnd - navTiming.loadEventStart,
        totalTime: navTiming.loadEventEnd - navTiming.fetchStart
      };
    });
    console.log(`ℹ️  DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`ℹ️  Page Load Complete: ${metrics.loadComplete}ms`);
    console.log(`ℹ️  Total Load Time: ${metrics.totalTime}ms`);
    
    console.log('\n✅ Manual test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  } finally {
    await page.waitForTimeout(2000); // Keep browser open for visual verification
    await browser.close();
  }
})();