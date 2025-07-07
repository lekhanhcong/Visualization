/**
 * Simple verification test for the 2N+1 Redundancy Feature
 */

const { chromium } = require('playwright');

async function verifyApplication() {
  console.log('🔍 Starting Application Verification...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  let results = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    details: []
  };
  
  try {
    // Test 1: Page loads successfully
    results.totalTests++;
    console.log('Test 1: Page Load');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    if (title.includes('Hue Hi Tech Park')) {
      results.passedTests++;
      results.details.push('✅ Page loads with correct title');
    } else {
      results.failedTests++;
      results.details.push('❌ Page title incorrect');
    }
    
    // Test 2: Button is present
    results.totalTests++;
    console.log('Test 2: Button Presence');
    const button = await page.locator('[data-testid="simple-redundancy-toggle"]');
    const buttonExists = await button.isVisible();
    
    if (buttonExists) {
      results.passedTests++;
      results.details.push('✅ Toggle button is visible');
    } else {
      results.failedTests++;
      results.details.push('❌ Toggle button not found');
    }
    
    // Test 3: Initial state is correct
    results.totalTests++;
    console.log('Test 3: Initial State');
    const initialText = await button.textContent();
    
    if (initialText.includes('Show 2N+1 Redundancy')) {
      results.passedTests++;
      results.details.push('✅ Initial state: Shows default view');
    } else {
      results.failedTests++;
      results.details.push('❌ Initial state: Wrong button text');
    }
    
    // Test 4: Click functionality
    results.totalTests++;
    console.log('Test 4: Click Functionality');
    await button.click();
    await page.waitForTimeout(1000);
    
    const clickedText = await button.textContent();
    if (clickedText.includes('Back to Main')) {
      results.passedTests++;
      results.details.push('✅ Click works: Changed to 2N+1 view');
    } else {
      results.failedTests++;
      results.details.push('❌ Click failed: Button text unchanged');
    }
    
    // Test 5: Text overlay appears
    results.totalTests++;
    console.log('Test 5: Text Overlay');
    const textOverlay = await page.locator('text=500KV ONSITE GRID').isVisible();
    
    if (textOverlay) {
      results.passedTests++;
      results.details.push('✅ Text overlay appears in 2N+1 view');
    } else {
      results.failedTests++;
      results.details.push('❌ Text overlay not visible');
    }
    
    // Test 6: Return to main
    results.totalTests++;
    console.log('Test 6: Return to Main');
    await button.click();
    await page.waitForTimeout(1000);
    
    const returnText = await button.textContent();
    if (returnText.includes('Show 2N+1 Redundancy')) {
      results.passedTests++;
      results.details.push('✅ Return works: Back to default view');
    } else {
      results.failedTests++;
      results.details.push('❌ Return failed: Button text wrong');
    }
    
  } catch (error) {
    results.failedTests++;
    results.details.push(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  // Final verdict
  const verdict = results.failedTests === 0 ? 'PASS' : 'FAIL';
  const productionReady = results.passedTests >= 5 && results.failedTests === 0;
  
  console.log('\n🎯 VERIFICATION RESULTS');
  console.log('='.repeat(40));
  console.log(`📊 Total Tests: ${results.totalTests}`);
  console.log(`✅ Passed: ${results.passedTests}`);
  console.log(`❌ Failed: ${results.failedTests}`);
  console.log(`🏆 Verdict: ${verdict}`);
  console.log(`🚀 Production Ready: ${productionReady ? 'YES' : 'NO'}`);
  console.log('='.repeat(40));
  
  results.details.forEach(detail => console.log(detail));
  
  return {
    verdict,
    productionReady,
    results
  };
}

// Run verification
verifyApplication().then(result => {
  console.log('\n🎉 Verification Complete!');
  process.exit(result.productionReady ? 0 : 1);
}).catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});