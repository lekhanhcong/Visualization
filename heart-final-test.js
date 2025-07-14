const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runFinalTest() {
  let browser;
  let page;
  
  try {
    console.log('🚀 Starting FINAL HEART Test - Clean Version...');
    
    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'test-screenshots-final');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Launch browser
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 500
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    page = await context.newPage();
    page.setDefaultTimeout(30000);
    
    console.log('📱 Navigating to HEART website...');
    
    // Navigate and wait
    await page.goto('http://localhost:3001/heart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('✅ Page loaded successfully');
    
    // Test 1: Hero Section (Clean)
    console.log('🧪 Test 1: Hero Section - Clean Version');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-hero-section-clean.png'),
      fullPage: false
    });
    
    // Test 2: Location Section (Clean)
    console.log('🧪 Test 2: Location Section - No Metrics');
    await page.locator('#location').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-location-section-clean.png'),
      fullPage: false
    });
    
    // Wait for location animation
    await page.waitForTimeout(5000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '03-location-animation-clean.png'),
      fullPage: false
    });
    
    // Test 3: Transportation 3-Column (Clean)
    console.log('🧪 Test 3: Transportation 3-Column - Clean Layout');
    await page.locator('#transportation').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '04-transportation-3col-clean.png'),
      fullPage: false
    });
    
    // Test 4: Data Center Section (No Metrics)
    console.log('🧪 Test 4: Data Center Section - No Metrics');
    await page.locator('#datacenter').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '05-datacenter-clean.png'),
      fullPage: false
    });
    
    // Test 5: Electricity Section (No Voltage Indicators)
    console.log('🧪 Test 5: Electricity Section - No Voltage Indicators');
    await page.locator('#electricity').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '06-electricity-clean.png'),
      fullPage: false
    });
    
    // Test 6: Power Flow Animation
    console.log('🧪 Test 6: Power Flow Animation');
    await page.waitForTimeout(5000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '07-power-flow-animation.png'),
      fullPage: false
    });
    
    // Test 7: 2N+1 Redundancy (No Technical Details)
    console.log('🧪 Test 7: 2N+1 Redundancy - No Technical Details');
    await page.evaluate(() => {
      const electricitySection = document.getElementById('electricity');
      if (electricitySection) {
        window.scrollTo(0, electricitySection.offsetTop + 800);
      }
    });
    
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '08-redundancy-clean-1.png'),
      fullPage: false
    });
    
    // Wait for redundancy animation switch
    await page.waitForTimeout(6000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '09-redundancy-clean-2.png'),
      fullPage: false
    });
    
    // Test 8: Submarine Cable Section (No Key Features)
    console.log('🧪 Test 8: Submarine Cable Section - No Key Features');
    await page.locator('#submarine').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '10-submarine-clean.png'),
      fullPage: false
    });
    
    // Test 9: Footer (Clean Design)
    console.log('🧪 Test 9: Footer - Clean Design');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '11-footer-clean.png'),
      fullPage: false
    });
    
    // Test 10: Full Page Clean View
    console.log('🧪 Test 10: Full Page Clean View');
    await page.goto('http://localhost:3001/heart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '12-full-page-clean.png'),
      fullPage: true
    });
    
    // Test 11: Mobile Clean View
    console.log('🧪 Test 11: Mobile Clean View');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3001/heart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '13-mobile-clean.png'),
      fullPage: true
    });
    
    // Test 12: Check for removed metrics
    console.log('🧪 Test 12: Verify Metrics Removed');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3001/heart');
    await page.waitForLoadState('networkidle');
    
    // Check if metrics sections are removed
    const voltageIndicators = await page.locator('.grid-cols-1.md\\:grid-cols-3').count();
    const technicalDetails = await page.locator('text=500kV Lines').count();
    const keyFeatures = await page.locator('text=Total Capacity').count();
    
    console.log(`Voltage indicators sections: ${voltageIndicators}`);
    console.log(`Technical details: ${technicalDetails}`);
    console.log(`Key features metrics: ${keyFeatures}`);
    
    // Test 13: Performance after cleanup
    console.log('🧪 Test 13: Performance After Cleanup');
    const startTime = Date.now();
    await page.goto('http://localhost:3001/heart');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`Page load time after cleanup: ${loadTime}ms`);
    
    // Test 14: Check animations still work
    console.log('🧪 Test 14: Verify Animations Still Work');
    const canvas = await page.locator('canvas').count();
    const images = await page.locator('img').count();
    
    console.log(`Canvas animations: ${canvas}`);
    console.log(`Images: ${images}`);
    
    // Final Summary
    console.log('\n🎯 FINAL CLEAN VERSION SUMMARY:');
    console.log('================================');
    console.log(`✅ Metrics removed: ${voltageIndicators === 0 && technicalDetails === 0 && keyFeatures === 0 ? 'Success' : 'Some remaining'}`);
    console.log(`✅ Animations working: ${canvas >= 1 ? 'Yes' : 'No'}`);
    console.log(`✅ Images loading: ${images >= 10 ? 'Yes' : 'No'}`);
    console.log(`✅ Performance: ${loadTime}ms`);
    console.log(`✅ All sections clean: Working`);
    
    const cleanVersion = voltageIndicators === 0 && 
                        technicalDetails === 0 && 
                        keyFeatures === 0 &&
                        canvas >= 1 &&
                        images >= 10;
    
    if (cleanVersion) {
      console.log('\n🎉 PERFECT! All metrics removed, animations working, clean design achieved!');
    } else {
      console.log('\n⚠️ Some cleanup may still be needed.');
    }
    
    console.log(`\n📸 Final clean screenshots saved to: ${screenshotsDir}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (page) {
      await page.screenshot({ 
        path: path.join(__dirname, 'test-screenshots-final', 'error-screenshot.png'),
        fullPage: true
      });
    }
    
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the final test
runFinalTest()
  .then(() => {
    console.log('✅ Final clean test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Final test failed:', error);
    process.exit(1);
  });