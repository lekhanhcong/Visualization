/**
 * Final Comprehensive Test for 2N+1 Redundancy Feature
 * Using Playwright for testing
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TEST_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, 'final-test-screenshots');

// Create screenshots directory
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR);
}

async function runComprehensiveTest() {
  console.log('🚀 Starting Final Comprehensive Test with Playwright...');
  
  const browser = await chromium.launch({
    headless: false, // Show browser for manual verification
    slowMo: 500 // Slow down for better visibility
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 800 });
  
  // Monitor console logs
  const consoleMessages = [];
  page.on('console', (msg) => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
  });

  let testResults = {
    passed: 0,
    failed: 0,
    errors: [],
    details: []
  };

  try {
    console.log('📋 Test 1: Initial Page Load');
    await page.goto(TEST_URL, { waitUntil: 'networkidle' });
    
    // Wait for page to be fully loaded
    await page.waitForSelector('[data-testid="simple-redundancy-toggle"]', { timeout: 10000 });
    
    // Check initial state
    const initialButton = await page.textContent('[data-testid="simple-redundancy-toggle"]');
    console.log('✅ Initial button text:', initialButton);
    
    if (initialButton.includes('Show 2N+1 Redundancy')) {
      testResults.passed++;
      testResults.details.push('✅ Initial state: Default view loaded correctly');
    } else {
      testResults.failed++;
      testResults.errors.push('❌ Initial state: Wrong button text: ' + initialButton);
    }

    // Screenshot initial state
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '1-initial-state.png'),
      fullPage: true 
    });

    console.log('📋 Test 2: Activate 2N+1 Redundancy');
    await page.click('[data-testid="simple-redundancy-toggle"]');
    
    // Wait for transition
    await page.waitForTimeout(1500);
    
    // Check 2N+1 state
    const redundancyButton = await page.textContent('[data-testid="simple-redundancy-toggle"]');
    console.log('✅ 2N+1 button text:', redundancyButton);
    
    if (redundancyButton.includes('Back to Main')) {
      testResults.passed++;
      testResults.details.push('✅ 2N+1 state: Button text updated correctly');
    } else {
      testResults.failed++;
      testResults.errors.push('❌ 2N+1 state: Wrong button text: ' + redundancyButton);
    }

    // Check for text overlay by looking for the text content
    const textOverlayExists = await page.locator('text=500KV ONSITE GRID').isVisible();
    if (textOverlayExists) {
      testResults.passed++;
      testResults.details.push('✅ 2N+1 state: Text overlay "500KV ONSITE GRID" visible');
    } else {
      testResults.failed++;
      testResults.errors.push('❌ 2N+1 state: Text overlay not found');
    }

    // Screenshot 2N+1 state
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '2-2n1-state.png'),
      fullPage: true 
    });

    console.log('📋 Test 3: Return to Main View');
    await page.click('[data-testid="simple-redundancy-toggle"]');
    
    // Wait for transition
    await page.waitForTimeout(1500);
    
    // Check returned state
    const returnedButton = await page.textContent('[data-testid="simple-redundancy-toggle"]');
    console.log('✅ Returned button text:', returnedButton);
    
    if (returnedButton.includes('Show 2N+1 Redundancy')) {
      testResults.passed++;
      testResults.details.push('✅ Return state: Button text reverted correctly');
    } else {
      testResults.failed++;
      testResults.errors.push('❌ Return state: Wrong button text: ' + returnedButton);
    }

    // Screenshot returned state
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '3-returned-state.png'),
      fullPage: true 
    });

    console.log('📋 Test 4: Stability Test (3 cycles)');
    for (let i = 0; i < 3; i++) {
      console.log(`  Cycle ${i + 1}/3`);
      
      // Activate 2N+1
      await page.click('[data-testid="simple-redundancy-toggle"]');
      await page.waitForTimeout(800);
      
      // Check state changed
      const cycleButton = await page.textContent('[data-testid="simple-redundancy-toggle"]');
      if (!cycleButton.includes('Back to Main')) {
        testResults.failed++;
        testResults.errors.push(`❌ Cycle ${i + 1}: Failed to activate 2N+1`);
        break;
      }
      
      // Return to main
      await page.click('[data-testid="simple-redundancy-toggle"]');
      await page.waitForTimeout(800);
      
      // Check state returned
      const returnedCycleButton = await page.textContent('[data-testid="simple-redundancy-toggle"]');
      if (!returnedCycleButton.includes('Show 2N+1 Redundancy')) {
        testResults.failed++;
        testResults.errors.push(`❌ Cycle ${i + 1}: Failed to return to main`);
        break;
      }
    }
    
    testResults.passed++;
    testResults.details.push('✅ Stability test: 3 cycles completed successfully');

    console.log('📋 Test 5: Visual Elements Check');
    // Check for key visual elements
    const headerExists = await page.locator('text=Hue Hi Tech Park').isVisible();
    const versionExists = await page.locator('text=v2.04.0').isVisible();
    const statusBadgeExists = await page.locator('text=Simple 2N+1 Feature Active').isVisible();
    
    if (headerExists && versionExists && statusBadgeExists) {
      testResults.passed++;
      testResults.details.push('✅ Visual elements: All key elements present');
    } else {
      testResults.failed++;
      testResults.errors.push('❌ Visual elements: Missing key elements');
    }

    console.log('📋 Test 6: Console Error Check');
    const errorMessages = consoleMessages.filter(msg => msg.type === 'error');
    
    if (errorMessages.length === 0) {
      testResults.passed++;
      testResults.details.push('✅ Console: No JavaScript errors');
    } else {
      testResults.failed++;
      testResults.errors.push(`❌ Console: ${errorMessages.length} errors found`);
      console.log('Console errors:', errorMessages);
    }

    console.log('📋 Test 7: Image Loading Check');
    // Check if images are loading properly
    const images = await page.locator('img').all();
    let imageLoadErrors = 0;
    
    for (const img of images) {
      const naturalWidth = await img.evaluate((img) => img.naturalWidth);
      if (naturalWidth === 0) {
        imageLoadErrors++;
      }
    }
    
    if (imageLoadErrors === 0) {
      testResults.passed++;
      testResults.details.push('✅ Images: All images loaded successfully');
    } else {
      testResults.failed++;
      testResults.errors.push(`❌ Images: ${imageLoadErrors} images failed to load`);
    }

  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`❌ Test execution error: ${error.message}`);
    console.error('Test execution error:', error);
  } finally {
    await browser.close();
  }

  // Generate final report
  const finalReport = {
    timestamp: new Date().toISOString(),
    testResults: testResults,
    consoleMessages: consoleMessages,
    verdict: testResults.failed === 0 ? 'PASS' : 'FAIL',
    readyForProduction: testResults.failed === 0 && testResults.passed >= 7
  };

  // Save report
  fs.writeFileSync(
    path.join(__dirname, 'final-test-report.json'),
    JSON.stringify(finalReport, null, 2)
  );

  // Console summary
  console.log('\n🎯 FINAL TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`📊 Tests Passed: ${testResults.passed}`);
  console.log(`❌ Tests Failed: ${testResults.failed}`);
  console.log(`🏆 Overall Status: ${finalReport.verdict}`);
  console.log(`🚀 Ready for Production: ${finalReport.readyForProduction ? 'YES' : 'NO'}`);
  console.log('='.repeat(50));

  if (testResults.details.length > 0) {
    console.log('\n📋 Test Details:');
    testResults.details.forEach(detail => console.log(`  ${detail}`));
  }

  if (testResults.errors.length > 0) {
    console.log('\n❌ Errors Found:');
    testResults.errors.forEach(error => console.log(`  ${error}`));
  }

  console.log(`\n📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
  console.log(`📄 Full report saved to: final-test-report.json`);

  return finalReport;
}

// Run the test
runComprehensiveTest().catch(console.error);