/**
 * Final Comprehensive Test for 2N+1 Redundancy Feature
 * Manual Testing Script - Run with: node final-comprehensive-test.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TEST_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, 'final-test-screenshots');

// Create screenshots directory
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR);
}

async function runComprehensiveTest() {
  console.log('🚀 Starting Final Comprehensive Test...');
  
  const browser = await puppeteer.launch({
    headless: false, // Show browser for manual verification
    defaultViewport: { width: 1200, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Monitor console logs
  const consoleMessages = [];
  page.on('console', (msg) => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
  });

  // Monitor network errors
  const networkErrors = [];
  page.on('requestfailed', (request) => {
    networkErrors.push({
      url: request.url(),
      failure: request.failure().errorText,
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
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    
    // Wait for page to be fully loaded
    await page.waitForSelector('[data-testid="simple-redundancy-toggle"]', { timeout: 5000 });
    
    // Check initial state
    const initialButton = await page.$eval('[data-testid="simple-redundancy-toggle"]', el => el.textContent);
    console.log('✅ Initial button text:', initialButton);
    
    if (initialButton.includes('Show 2N+1 Redundancy')) {
      testResults.passed++;
      testResults.details.push('✅ Initial state: Default view loaded correctly');
    } else {
      testResults.failed++;
      testResults.errors.push('❌ Initial state: Wrong button text');
    }

    // Screenshot initial state
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '1-initial-state.png'),
      fullPage: true 
    });

    console.log('📋 Test 2: Activate 2N+1 Redundancy');
    await page.click('[data-testid="simple-redundancy-toggle"]');
    
    // Wait for transition
    await page.waitForTimeout(1000);
    
    // Check 2N+1 state
    const redundancyButton = await page.$eval('[data-testid="simple-redundancy-toggle"]', el => el.textContent);
    console.log('✅ 2N+1 button text:', redundancyButton);
    
    if (redundancyButton.includes('Back to Main')) {
      testResults.passed++;
      testResults.details.push('✅ 2N+1 state: Button text updated correctly');
    } else {
      testResults.failed++;
      testResults.errors.push('❌ 2N+1 state: Wrong button text');
    }

    // Check for text overlay
    const textOverlay = await page.$('div:contains("500KV ONSITE GRID")');
    if (textOverlay) {
      testResults.passed++;
      testResults.details.push('✅ 2N+1 state: Text overlay visible');
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
    await page.waitForTimeout(1000);
    
    // Check returned state
    const returnedButton = await page.$eval('[data-testid="simple-redundancy-toggle"]', el => el.textContent);
    console.log('✅ Returned button text:', returnedButton);
    
    if (returnedButton.includes('Show 2N+1 Redundancy')) {
      testResults.passed++;
      testResults.details.push('✅ Return state: Button text reverted correctly');
    } else {
      testResults.failed++;
      testResults.errors.push('❌ Return state: Wrong button text');
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
      await page.waitForTimeout(500);
      
      // Return to main
      await page.click('[data-testid="simple-redundancy-toggle"]');
      await page.waitForTimeout(500);
    }
    
    testResults.passed++;
    testResults.details.push('✅ Stability test: 3 cycles completed successfully');

    console.log('📋 Test 5: Performance Check');
    const performanceMetrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: perf.loadEventEnd - perf.fetchStart,
        domContentLoaded: perf.domContentLoadedEventEnd - perf.fetchStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
      };
    });
    
    console.log('📊 Performance metrics:', performanceMetrics);
    
    if (performanceMetrics.loadTime < 3000) {
      testResults.passed++;
      testResults.details.push('✅ Performance: Load time under 3 seconds');
    } else {
      testResults.failed++;
      testResults.errors.push('❌ Performance: Load time over 3 seconds');
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

    console.log('📋 Test 7: Network Error Check');
    if (networkErrors.length === 0) {
      testResults.passed++;
      testResults.details.push('✅ Network: No failed requests');
    } else {
      testResults.failed++;
      testResults.errors.push(`❌ Network: ${networkErrors.length} failed requests`);
      console.log('Network errors:', networkErrors);
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
    networkErrors: networkErrors,
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