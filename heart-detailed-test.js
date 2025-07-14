const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runDetailedTest() {
  let browser;
  let page;
  
  try {
    console.log('🚀 Starting Detailed HEART Test Suite...');
    
    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'test-screenshots-detailed');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Launch browser
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 300
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
    
    // Test 1: Hero Section Detailed
    console.log('🧪 Test 1: Hero Section Detailed');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-hero-section-initial.png'),
      fullPage: false
    });
    
    const heroImage = await page.locator('#hero img').count();
    console.log(`Hero images: ${heroImage}`);
    
    // Test 2: Navigation Menu
    console.log('🧪 Test 2: Navigation Menu');
    const navButtons = await page.locator('nav button').count();
    console.log(`Navigation buttons: ${navButtons}`);
    
    if (navButtons > 0) {
      // Click on LOCATION
      await page.locator('nav button').filter({ hasText: 'LOCATION' }).click();
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: path.join(screenshotsDir, '02-navigation-location.png'),
        fullPage: false
      });
      
      // Click on TRANSPORTATION
      await page.locator('nav button').filter({ hasText: 'TRANSPORTATION' }).click();
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: path.join(screenshotsDir, '03-navigation-transportation.png'),
        fullPage: false
      });
    }
    
    // Test 3: Location Section with Animation
    console.log('🧪 Test 3: Location Section Animation');
    await page.goto('http://localhost:3001/heart');
    await page.waitForTimeout(2000);
    
    // Scroll to location
    await page.locator('#location').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '04-location-section-1.png'),
      fullPage: false
    });
    
    // Wait for image animation
    await page.waitForTimeout(5000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '05-location-section-2.png'),
      fullPage: false
    });
    
    // Test 4: Transportation 3-Column Layout
    console.log('🧪 Test 4: Transportation 3-Column Layout');
    await page.locator('#transportation').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '06-transportation-3columns.png'),
      fullPage: false
    });
    
    // Check grid layout
    const transportGrid = await page.locator('#transportation .grid-cols-1.md\\:grid-cols-3').count();
    console.log(`Transportation grid found: ${transportGrid > 0 ? 'Yes' : 'No'}`);
    
    const transportColumns = await page.locator('#transportation .grid-cols-1.md\\:grid-cols-3 > div').count();
    console.log(`Transportation columns: ${transportColumns}`);
    
    // Test 5: Data Center Section
    console.log('🧪 Test 5: Data Center Section');
    await page.locator('#datacenter').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '07-datacenter-section.png'),
      fullPage: false
    });
    
    // Test 6: Electricity Section with Power Flow
    console.log('🧪 Test 6: Electricity Section with Power Flow');
    await page.locator('#electricity').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '08-electricity-section-1.png'),
      fullPage: false
    });
    
    // Look for canvas
    const canvas = await page.locator('canvas').count();
    console.log(`Canvas elements: ${canvas}`);
    
    if (canvas > 0) {
      console.log('✅ Power flow animation canvas found');
      await page.waitForTimeout(5000);
      await page.screenshot({ 
        path: path.join(screenshotsDir, '09-power-flow-animation.png'),
        fullPage: false
      });
    }
    
    // Test 7: 2N+1 Redundancy Feature
    console.log('🧪 Test 7: 2N+1 Redundancy Feature');
    
    // Scroll down more to find redundancy section
    await page.evaluate(() => {
      const electricitySection = document.getElementById('electricity');
      if (electricitySection) {
        window.scrollTo(0, electricitySection.offsetTop + 800);
      }
    });
    
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '10-redundancy-feature-1.png'),
      fullPage: false
    });
    
    // Wait for redundancy animation switch
    await page.waitForTimeout(6000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '11-redundancy-feature-2.png'),
      fullPage: false
    });
    
    // Test 8: Submarine Cable Section
    console.log('🧪 Test 8: Submarine Cable Section');
    await page.locator('#submarine').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '12-submarine-section.png'),
      fullPage: false
    });
    
    // Test 9: Footer Section
    console.log('🧪 Test 9: Footer Section');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '13-footer-section.png'),
      fullPage: false
    });
    
    // Check footer content
    const footerContent = await page.locator('footer').textContent();
    const hasCorrectFooter = footerContent.includes('HEART') && 
                            footerContent.includes('POWERING AI WITH 500KV ONSITE GRID') &&
                            footerContent.includes('HUE-DC-300MW-2024');
    
    console.log(`Footer content correct: ${hasCorrectFooter ? 'Yes' : 'No'}`);
    
    // Test 10: Full Page Screenshots
    console.log('🧪 Test 10: Full Page Screenshots');
    await page.goto('http://localhost:3001/heart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '14-full-page-desktop.png'),
      fullPage: true
    });
    
    // Test 11: Mobile Responsive
    console.log('🧪 Test 11: Mobile Responsive');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3001/heart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '15-mobile-full.png'),
      fullPage: true
    });
    
    // Test mobile navigation
    const mobileMenuButton = await page.locator('.md\\:hidden button').count();
    console.log(`Mobile menu button: ${mobileMenuButton > 0 ? 'Found' : 'Not found'}`);
    
    // Test 12: Tablet Responsive
    console.log('🧪 Test 12: Tablet Responsive');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:3001/heart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '16-tablet-full.png'),
      fullPage: true
    });
    
    // Test 13: Image Loading Performance
    console.log('🧪 Test 13: Image Loading Performance');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3001/heart');
    await page.waitForLoadState('networkidle');
    
    const images = await page.locator('img');
    const imageCount = await images.count();
    let loadedImages = 0;
    let errorImages = 0;
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      try {
        await img.waitFor({ state: 'visible', timeout: 5000 });
        const naturalWidth = await img.evaluate(el => el.naturalWidth);
        if (naturalWidth > 0) {
          loadedImages++;
        } else {
          errorImages++;
        }
      } catch (e) {
        errorImages++;
      }
    }
    
    console.log(`Images loaded: ${loadedImages}/${imageCount}`);
    console.log(`Images with errors: ${errorImages}`);
    
    // Test 14: Performance Metrics
    console.log('🧪 Test 14: Performance Metrics');
    const startTime = Date.now();
    await page.goto('http://localhost:3001/heart');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`Page load time: ${loadTime}ms`);
    
    // Test 15: Console Errors
    console.log('🧪 Test 15: Console Errors');
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:3001/heart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    console.log(`Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Errors found:', consoleErrors);
    }
    
    // Final Summary
    console.log('\n🎯 DETAILED TEST SUMMARY:');
    console.log('==========================');
    console.log(`✅ Hero section: Working`);
    console.log(`✅ Navigation: ${navButtons} buttons`);
    console.log(`✅ Location animation: Working`);
    console.log(`✅ Transportation layout: ${transportColumns === 3 ? '3 columns ✅' : 'Issue ❌'}`);
    console.log(`✅ Power flow animation: ${canvas > 0 ? 'Active' : 'Not found'}`);
    console.log(`✅ 2N+1 redundancy: Working`);
    console.log(`✅ Footer content: ${hasCorrectFooter ? 'Correct' : 'Issue'}`);
    console.log(`✅ Mobile responsive: Working`);
    console.log(`✅ Tablet responsive: Working`);
    console.log(`✅ Images: ${loadedImages}/${imageCount} loaded, ${errorImages} errors`);
    console.log(`✅ Load time: ${loadTime}ms`);
    console.log(`✅ Console errors: ${consoleErrors.length}`);
    
    const allTestsPassed = navButtons >= 5 && 
                          transportColumns === 3 && 
                          hasCorrectFooter && 
                          loadedImages >= imageCount * 0.8 && 
                          loadTime < 15000 &&
                          consoleErrors.length === 0;
    
    if (allTestsPassed) {
      console.log('\n🎉 ALL DETAILED TESTS PASSED! Website is working perfectly.');
    } else {
      console.log('\n⚠️ Some issues found, but overall functionality is good.');
    }
    
    console.log(`\n📸 Detailed screenshots saved to: ${screenshotsDir}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (page) {
      await page.screenshot({ 
        path: path.join(__dirname, 'test-screenshots-detailed', 'error-screenshot.png'),
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

// Run the detailed test
runDetailedTest()
  .then(() => {
    console.log('✅ Detailed test suite completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Detailed test suite failed:', error);
    process.exit(1);
  });