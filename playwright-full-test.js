const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function fullPlaywrightTest() {
  let browser;
  let page;
  const errors = [];
  const warnings = [];
  
  try {
    console.log('🚀 STARTING FULL PLAYWRIGHT TEST WITH SCREEN CAPTURE');
    console.log('==================================================');
    console.log('Testing URL: http://localhost:3000/heart');
    console.log('Date: ' + new Date().toISOString());
    console.log('==================================================\n');
    
    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'playwright-test-screenshots-' + Date.now());
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Launch browser
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 500,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    page = await context.newPage();
    page.setDefaultTimeout(30000);
    
    // Capture all console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({
          type: 'Console Error',
          message: msg.text(),
          time: new Date().toISOString()
        });
        console.error('❌ Console Error:', msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push({
          type: 'Console Warning',
          message: msg.text(),
          time: new Date().toISOString()
        });
      }
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      errors.push({
        type: 'Page Error',
        message: error.message,
        stack: error.stack,
        time: new Date().toISOString()
      });
      console.error('❌ Page Error:', error.message);
    });
    
    // Capture failed requests
    page.on('requestfailed', request => {
      errors.push({
        type: 'Request Failed',
        url: request.url(),
        failure: request.failure(),
        time: new Date().toISOString()
      });
      console.error('❌ Request Failed:', request.url());
    });
    
    // Test Suite
    const testResults = [];
    
    // TEST 1: Initial Load Test
    console.log('\n📋 TEST 1: Initial Page Load');
    console.log('----------------------------');
    try {
      await page.goto('http://localhost:3000/heart', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      await page.waitForTimeout(3000);
      
      const title = await page.title();
      console.log('✅ Page loaded successfully');
      console.log('   Title:', title);
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, '01-initial-load-full.png'),
        fullPage: true
      });
      
      testResults.push({ test: 'Initial Load', status: 'PASSED' });
    } catch (error) {
      console.error('❌ Initial load failed:', error.message);
      testResults.push({ test: 'Initial Load', status: 'FAILED', error: error.message });
    }
    
    // TEST 2: Hero Section Verification
    console.log('\n📋 TEST 2: Hero Section (Text Only)');
    console.log('------------------------------------');
    try {
      const heroSection = await page.locator('#hero');
      await heroSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);
      
      const heroTitle = await page.locator('#hero h1').textContent();
      const heroSubtitle = await page.locator('#hero h2').textContent();
      
      console.log('✅ Hero Title:', heroTitle);
      console.log('✅ Hero Subtitle:', heroSubtitle);
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, '02-hero-section.png'),
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      testResults.push({ test: 'Hero Section', status: 'PASSED' });
    } catch (error) {
      console.error('❌ Hero section test failed:', error.message);
      testResults.push({ test: 'Hero Section', status: 'FAILED', error: error.message });
    }
    
    // TEST 3: Location Section (Single Image)
    console.log('\n📋 TEST 3: Location Section (Single Image)');
    console.log('------------------------------------------');
    try {
      await page.locator('#location').scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);
      
      const locationImage = await page.locator('#location img').count();
      console.log(`✅ Location images found: ${locationImage}`);
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, '03-location-section.png'),
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      testResults.push({ test: 'Location Section', status: locationImage === 1 ? 'PASSED' : 'FAILED' });
    } catch (error) {
      console.error('❌ Location section test failed:', error.message);
      testResults.push({ test: 'Location Section', status: 'FAILED', error: error.message });
    }
    
    // TEST 4: Transportation Section (Text Only, Black Text)
    console.log('\n📋 TEST 4: Transportation Section (Text Only)');
    console.log('---------------------------------------------');
    try {
      await page.locator('#transportation').scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);
      
      const airText = await page.locator('text=Phu Bai Airport').isVisible();
      const landText = await page.locator('text=North-South Expressway').isVisible();
      const seaText = await page.locator('text=Chan May Port').isVisible();
      
      console.log('✅ AIR content visible:', airText);
      console.log('✅ LAND content visible:', landText);
      console.log('✅ SEA content visible:', seaText);
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, '04-transportation-text.png'),
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      testResults.push({ test: 'Transportation Section', status: (airText && landText && seaText) ? 'PASSED' : 'FAILED' });
    } catch (error) {
      console.error('❌ Transportation section test failed:', error.message);
      testResults.push({ test: 'Transportation Section', status: 'FAILED', error: error.message });
    }
    
    // TEST 5: Data Center Section
    console.log('\n📋 TEST 5: Data Center Section');
    console.log('-------------------------------');
    try {
      await page.locator('#datacenter').scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);
      
      const datacenterImage = await page.locator('#datacenter img').count();
      console.log(`✅ Data center images found: ${datacenterImage}`);
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, '05-datacenter-section.png'),
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      testResults.push({ test: 'Data Center Section', status: datacenterImage > 0 ? 'PASSED' : 'FAILED' });
    } catch (error) {
      console.error('❌ Data center section test failed:', error.message);
      testResults.push({ test: 'Data Center Section', status: 'FAILED', error: error.message });
    }
    
    // TEST 6: Power Flow Animation
    console.log('\n📋 TEST 6: Power Flow Animation (Full Width)');
    console.log('--------------------------------------------');
    try {
      await page.locator('#electricity').scrollIntoViewIfNeeded();
      await page.waitForTimeout(3000);
      
      const canvasElement = await page.locator('canvas').count();
      console.log(`✅ Canvas elements found: ${canvasElement}`);
      
      // Take multiple screenshots to capture animation
      for (let i = 0; i < 3; i++) {
        await page.screenshot({ 
          path: path.join(screenshotsDir, `06-power-flow-${i + 1}.png`),
          clip: { x: 0, y: 0, width: 1920, height: 1080 }
        });
        await page.waitForTimeout(2000);
      }
      
      testResults.push({ test: 'Power Flow Animation', status: canvasElement > 0 ? 'PASSED' : 'FAILED' });
    } catch (error) {
      console.error('❌ Power flow animation test failed:', error.message);
      testResults.push({ test: 'Power Flow Animation', status: 'FAILED', error: error.message });
    }
    
    // TEST 7: 2N+1 Redundancy Section
    console.log('\n📋 TEST 7: 2N+1 Redundancy (Fast Animation)');
    console.log('-------------------------------------------');
    try {
      await page.locator('#redundancy').scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);
      
      const redundancyImages = await page.locator('#redundancy img').count();
      console.log(`✅ Redundancy images found: ${redundancyImages}`);
      
      // Capture animation transitions
      await page.screenshot({ 
        path: path.join(screenshotsDir, '07-redundancy-1.png'),
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      await page.waitForTimeout(2500); // Wait for animation
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, '07-redundancy-2.png'),
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      testResults.push({ test: '2N+1 Redundancy', status: redundancyImages >= 2 ? 'PASSED' : 'FAILED' });
    } catch (error) {
      console.error('❌ Redundancy section test failed:', error.message);
      testResults.push({ test: '2N+1 Redundancy', status: 'FAILED', error: error.message });
    }
    
    // TEST 8: Submarine Cable Section
    console.log('\n📋 TEST 8: Submarine Cable (Single Image)');
    console.log('-----------------------------------------');
    try {
      await page.locator('#submarine').scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);
      
      const submarineImage = await page.locator('#submarine img').count();
      console.log(`✅ Submarine images found: ${submarineImage}`);
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, '08-submarine-section.png'),
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      testResults.push({ test: 'Submarine Cable', status: submarineImage === 1 ? 'PASSED' : 'FAILED' });
    } catch (error) {
      console.error('❌ Submarine section test failed:', error.message);
      testResults.push({ test: 'Submarine Cable', status: 'FAILED', error: error.message });
    }
    
    // TEST 9: Navigation Test
    console.log('\n📋 TEST 9: Navigation Testing');
    console.log('------------------------------');
    try {
      const navButtons = await page.locator('nav button').count();
      console.log(`✅ Navigation buttons found: ${navButtons}`);
      
      // Test navigation click
      await page.locator('nav button:has-text("LOCATION")').first().click();
      await page.waitForTimeout(1500);
      
      await page.locator('nav button:has-text("DATACENTER")').first().click();
      await page.waitForTimeout(1500);
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, '09-navigation-test.png'),
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      
      testResults.push({ test: 'Navigation', status: navButtons >= 7 ? 'PASSED' : 'FAILED' });
    } catch (error) {
      console.error('❌ Navigation test failed:', error.message);
      testResults.push({ test: 'Navigation', status: 'FAILED', error: error.message });
    }
    
    // TEST 10: Full Page Seamless Design
    console.log('\n📋 TEST 10: Full Page Seamless Design');
    console.log('--------------------------------------');
    try {
      await page.goto('http://localhost:3000/heart');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, '10-full-page-seamless.png'),
        fullPage: true
      });
      
      console.log('✅ Full page screenshot captured');
      testResults.push({ test: 'Full Page Design', status: 'PASSED' });
    } catch (error) {
      console.error('❌ Full page test failed:', error.message);
      testResults.push({ test: 'Full Page Design', status: 'FAILED', error: error.message });
    }
    
    // TEST 11: Mobile Responsive
    console.log('\n📋 TEST 11: Mobile Responsive Test');
    console.log('-----------------------------------');
    try {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:3000/heart');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, '11-mobile-view.png'),
        fullPage: true
      });
      
      console.log('✅ Mobile view tested');
      testResults.push({ test: 'Mobile Responsive', status: 'PASSED' });
    } catch (error) {
      console.error('❌ Mobile test failed:', error.message);
      testResults.push({ test: 'Mobile Responsive', status: 'FAILED', error: error.message });
    }
    
    // TEST 12: Performance Check
    console.log('\n📋 TEST 12: Performance Metrics');
    console.log('--------------------------------');
    try {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('http://localhost:3000/heart');
      
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        };
      });
      
      console.log('✅ Performance Metrics:');
      console.log(`   DOM Content Loaded: ${metrics.domContentLoaded}ms`);
      console.log(`   Load Complete: ${metrics.loadComplete}ms`);
      console.log(`   First Paint: ${metrics.firstPaint}ms`);
      console.log(`   First Contentful Paint: ${metrics.firstContentfulPaint}ms`);
      
      testResults.push({ test: 'Performance', status: 'PASSED', metrics });
    } catch (error) {
      console.error('❌ Performance test failed:', error.message);
      testResults.push({ test: 'Performance', status: 'FAILED', error: error.message });
    }
    
    // FINAL REPORT
    console.log('\n\n');
    console.log('==================================================');
    console.log('📊 FINAL TEST REPORT');
    console.log('==================================================');
    console.log(`Total Tests: ${testResults.length}`);
    console.log(`Passed: ${testResults.filter(t => t.status === 'PASSED').length}`);
    console.log(`Failed: ${testResults.filter(t => t.status === 'FAILED').length}`);
    console.log(`JavaScript Errors: ${errors.length}`);
    console.log(`Warnings: ${warnings.length}`);
    
    console.log('\n📋 Test Summary:');
    testResults.forEach((result, index) => {
      const icon = result.status === 'PASSED' ? '✅' : '❌';
      console.log(`${icon} ${index + 1}. ${result.test}: ${result.status}`);
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
    });
    
    if (errors.length > 0) {
      console.log('\n❌ JavaScript Errors Found:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.type}: ${error.message}`);
        if (error.stack) {
          console.log(`   Stack: ${error.stack.substring(0, 200)}...`);
        }
      });
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.message}`);
      });
    }
    
    // Save test report
    const report = {
      testDate: new Date().toISOString(),
      url: 'http://localhost:3000/heart',
      testResults,
      errors,
      warnings,
      screenshots: screenshotsDir,
      summary: {
        totalTests: testResults.length,
        passed: testResults.filter(t => t.status === 'PASSED').length,
        failed: testResults.filter(t => t.status === 'FAILED').length,
        errorCount: errors.length,
        warningCount: warnings.length
      }
    };
    
    fs.writeFileSync(
      path.join(screenshotsDir, 'test-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    const allPassed = testResults.every(t => t.status === 'PASSED') && errors.length === 0;
    
    console.log('\n==================================================');
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED! APPLICATION IS ERROR-FREE!');
      console.log('🚀 The application is running perfectly!');
    } else {
      console.log('⚠️  Some tests failed or errors were found.');
      console.log('Please check the screenshots and fix the issues.');
    }
    console.log('==================================================');
    console.log(`📸 Screenshots saved to: ${screenshotsDir}`);
    console.log(`📄 Report saved to: ${path.join(screenshotsDir, 'test-report.json')}`);
    
  } catch (error) {
    console.error('\n❌ CRITICAL TEST ERROR:', error.message);
    console.error(error.stack);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
fullPlaywrightTest().catch(console.error);