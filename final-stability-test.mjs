import { chromium } from 'playwright';

async function finalStabilityTest() {
  console.log('🚀 Starting Final Application Stability Test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  let testsPassed = 0;
  let testsTotal = 0;
  const errors = [];
  
  try {
    // Test 1: Page Load
    testsTotal++;
    console.log('Test 1: Page Load Performance');
    const startTime = Date.now();
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    const loadTime = Date.now() - startTime;
    
    await page.screenshot({ 
      path: 'test-results/final-1-page-load.png',
      fullPage: true 
    });
    
    if (loadTime < 10000) {
      console.log(`✅ Page loaded in ${loadTime}ms (< 10s)`);
      testsPassed++;
    } else {
      console.log(`❌ Page loaded in ${loadTime}ms (> 10s)`);
      errors.push(`Page load too slow: ${loadTime}ms`);
    }
    
    // Test 2: Core Elements
    testsTotal++;
    console.log('\nTest 2: Core Elements Visibility');
    
    const header = await page.locator('h1:has-text("Hue Hi Tech Park")').isVisible();
    const button = await page.locator('[data-testid="simple-redundancy-toggle"]').isVisible();
    const image = await page.locator('img[alt*="Power Infrastructure"]').isVisible();
    const footer = await page.locator('text=© 2024 Hue Hi Tech Park').isVisible();
    
    if (header && button && image && footer) {
      console.log('✅ All core elements visible');
      testsPassed++;
    } else {
      console.log(`❌ Missing elements: header:${header}, button:${button}, image:${image}, footer:${footer}`);
      errors.push('Core elements missing');
    }
    
    // Test 3: 2N+1 Functionality
    testsTotal++;
    console.log('\nTest 3: 2N+1 Redundancy Functionality');
    
    const redundancyButton = page.locator('[data-testid="simple-redundancy-toggle"]');
    
    // Initial state
    const initialText = await redundancyButton.textContent();
    if (initialText?.includes('Show 2N+1 Redundancy')) {
      console.log('✅ Button shows correct initial text');
      
      // Click to activate
      await redundancyButton.click();
      await page.waitForTimeout(500);
      
      const activeText = await redundancyButton.textContent();
      if (activeText?.includes('Main')) {
        console.log('✅ Button shows correct active text');
        
        // Take screenshot of 2N+1 state
        await page.screenshot({ 
          path: 'test-results/final-2-2n1-active.png',
          fullPage: true 
        });
        
        // Click to deactivate
        await redundancyButton.click();
        await page.waitForTimeout(500);
        
        const finalText = await redundancyButton.textContent();
        if (finalText?.includes('Show 2N+1 Redundancy')) {
          console.log('✅ Button returns to initial state');
          testsPassed++;
        } else {
          console.log('❌ Button does not return to initial state');
          errors.push('Button state not restored');
        }
      } else {
        console.log('❌ Button does not show active text');
        errors.push('Button active state incorrect');
      }
    } else {
      console.log('❌ Button does not show initial text');
      errors.push('Button initial state incorrect');
    }
    
    // Test 4: Responsive Design
    testsTotal++;
    console.log('\nTest 4: Responsive Design');
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const mobileButton = await page.locator('[data-testid="simple-redundancy-toggle"]').isVisible();
    
    await page.screenshot({ 
      path: 'test-results/final-3-mobile.png',
      fullPage: true 
    });
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    const tabletButton = await page.locator('[data-testid="simple-redundancy-toggle"]').isVisible();
    
    await page.screenshot({ 
      path: 'test-results/final-4-tablet.png',
      fullPage: true 
    });
    
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    
    const desktopButton = await page.locator('[data-testid="simple-redundancy-toggle"]').isVisible();
    
    await page.screenshot({ 
      path: 'test-results/final-5-desktop.png',
      fullPage: true 
    });
    
    if (mobileButton && tabletButton && desktopButton) {
      console.log('✅ Responsive design works across all devices');
      testsPassed++;
    } else {
      console.log(`❌ Responsive issues: mobile:${mobileButton}, tablet:${tabletButton}, desktop:${desktopButton}`);
      errors.push('Responsive design issues');
    }
    
    // Test 5: Console Errors
    testsTotal++;
    console.log('\nTest 5: JavaScript Error Check');
    
    const consoleErrors = [];
    const jsErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    // Refresh and interact to trigger any potential errors
    await page.reload();
    await page.waitForLoadState('networkidle');
    await redundancyButton.click();
    await page.waitForTimeout(1000);
    await redundancyButton.click();
    await page.waitForTimeout(1000);
    
    if (consoleErrors.length === 0 && jsErrors.length === 0) {
      console.log('✅ No JavaScript errors detected');
      testsPassed++;
    } else {
      console.log(`❌ JavaScript errors found: ${consoleErrors.length + jsErrors.length} total`);
      errors.push(`JavaScript errors: ${consoleErrors.concat(jsErrors).slice(0, 3).join(', ')}`);
    }
    
    // Test 6: Performance Stress Test
    testsTotal++;
    console.log('\nTest 6: Performance Stress Test');
    
    const stressStartTime = Date.now();
    
    // Rapid clicking test
    for (let i = 0; i < 10; i++) {
      await redundancyButton.click();
      await page.waitForTimeout(100);
    }
    
    const stressTime = Date.now() - stressStartTime;
    
    await page.screenshot({ 
      path: 'test-results/final-6-stress-test.png',
      fullPage: true 
    });
    
    if (stressTime < 5000) {
      console.log(`✅ Stress test completed in ${stressTime}ms (< 5s)`);
      testsPassed++;
    } else {
      console.log(`❌ Stress test too slow: ${stressTime}ms`);
      errors.push(`Stress test slow: ${stressTime}ms`);
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    errors.push(`Test suite error: ${error.message}`);
    
    await page.screenshot({ 
      path: 'test-results/final-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
  
  // Final Report
  console.log('\n' + '='.repeat(60));
  console.log('🏁 FINAL STABILITY TEST REPORT');
  console.log('='.repeat(60));
  console.log(`Tests Passed: ${testsPassed}/${testsTotal}`);
  console.log(`Success Rate: ${Math.round((testsPassed / testsTotal) * 100)}%`);
  
  if (errors.length === 0) {
    console.log('\n🎉 ALL TESTS PASSED - APPLICATION IS STABLE!');
    console.log('✅ The program is ready for production use.');
  } else {
    console.log('\n⚠️  Issues Found:');
    errors.forEach((error, i) => {
      console.log(`${i + 1}. ${error}`);
    });
    
    if (testsPassed >= testsTotal * 0.8) {
      console.log('\n✅ Overall: APPLICATION IS MOSTLY STABLE');
      console.log('Minor issues exist but core functionality works.');
    } else {
      console.log('\n❌ Overall: APPLICATION NEEDS FIXES');
      console.log('Critical issues found that affect stability.');
    }
  }
  
  console.log('\n📷 Screenshots saved in test-results/');
  console.log('🏁 Test completed!');
  
  return testsPassed === testsTotal;
}

// Run the test
finalStabilityTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });