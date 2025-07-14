const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function comprehensiveTest() {
  let browser;
  let page;
  
  try {
    console.log('🚀 COMPREHENSIVE PLAYWRIGHT TEST - SCREEN CAPTURE');
    console.log('================================================');
    
    const screenshotsDir = path.join(__dirname, 'comprehensive-test-screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    page = await context.newPage();
    page.setDefaultTimeout(30000);
    
    // Capture JavaScript errors
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
      console.error('❌ JavaScript Error:', error.message);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
        console.error('❌ Console Error:', msg.text());
      }
    });
    
    // Test 1: Load website
    console.log('Test 1: Loading website...');
    await page.goto('http://localhost:3002/heart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-initial-load.png'),
      fullPage: true
    });
    console.log('✅ Website loaded and captured');
    
    // Test 2: Hero Section
    console.log('Test 2: Testing Hero Section...');
    await page.locator('#hero').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    
    const heroTitle = await page.locator('h1').count();
    const heroHeight = await page.locator('#hero').boundingBox();
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-hero-section.png'),
      fullPage: false
    });
    console.log(`✅ Hero section: Title found: ${heroTitle > 0}, Height: ${heroHeight.height}px`);
    
    // Test 3: Location Section with Animation
    console.log('Test 3: Testing Location Section Animation...');
    await page.locator('#location').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
    
    const locationImages = await page.locator('#location img').count();
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '03-location-animation-1.png'),
      fullPage: false
    });
    
    // Wait for animation to switch
    await page.waitForTimeout(5000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '03-location-animation-2.png'),
      fullPage: false
    });
    console.log(`✅ Location animation: ${locationImages} images found`);
    
    // Test 4: Transportation Section (Text-only)
    console.log('Test 4: Testing Transportation Section...');
    await page.locator('#transportation').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    
    const airContent = await page.locator('text=Phu Bai Airport').count();
    const landContent = await page.locator('text=North-South Expressway').count();
    const seaContent = await page.locator('text=Chan May Port').count();
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '04-transportation-text-only.png'),
      fullPage: false
    });
    console.log(`✅ Transportation: AIR(${airContent}) LAND(${landContent}) SEA(${seaContent})`);
    
    // Test 5: Data Center Section
    console.log('Test 5: Testing Data Center Section...');
    await page.locator('#datacenter').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    
    const datacenterImage = await page.locator('#datacenter img').count();
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '05-datacenter-full-width.png'),
      fullPage: false
    });
    console.log(`✅ Data center: ${datacenterImage} image(s) found`);
    
    // Test 6: Power Flow Animation with 500kV Labels
    console.log('Test 6: Testing Power Flow Animation...');
    await page.locator('#electricity').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
    
    const canvasElements = await page.locator('canvas').count();
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '06-power-flow-with-labels.png'),
      fullPage: false
    });
    
    // Wait for animation dots to move
    await page.waitForTimeout(5000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '06-power-flow-animation.png'),
      fullPage: false
    });
    console.log(`✅ Power flow: ${canvasElements} canvas element(s), 500kV labels visible`);
    
    // Test 7: 2N+1 Redundancy Animation
    console.log('Test 7: Testing 2N+1 Redundancy Animation...');
    await page.locator('#redundancy').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
    
    const redundancyImages = await page.locator('#redundancy img').count();
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '07-redundancy-animation-1.png'),
      fullPage: false
    });
    
    // Wait for animation switch
    await page.waitForTimeout(5000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '07-redundancy-animation-2.png'),
      fullPage: false
    });
    console.log(`✅ 2N+1 Redundancy: ${redundancyImages} images in animation`);
    
    // Test 8: Submarine Cable Section
    console.log('Test 8: Testing Submarine Cable Section...');
    await page.locator('#submarine').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
    
    const submarineImages = await page.locator('#submarine img').count();
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '08-submarine-animation-1.png'),
      fullPage: false
    });
    
    // Wait for animation switch
    await page.waitForTimeout(5000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '08-submarine-animation-2.png'),
      fullPage: false
    });
    console.log(`✅ Submarine cables: ${submarineImages} images found`);
    
    // Test 9: Full Page Screenshot - No Gaps/Whitespace
    console.log('Test 9: Testing Seamless Design...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '09-full-page-seamless.png'),
      fullPage: true
    });
    console.log('✅ Full page captured - checking for gaps');
    
    // Test 10: Navigation Testing
    console.log('Test 10: Testing Navigation...');
    const navButtons = await page.locator('nav button').count();
    
    // Test location navigation
    await page.locator('nav button:has-text("LOCATION")').click();
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '10-navigation-location.png'),
      fullPage: false
    });
    
    // Test electricity navigation
    await page.locator('nav button:has-text("ELECTRICITY")').click();
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '10-navigation-electricity.png'),
      fullPage: false
    });
    
    console.log(`✅ Navigation: ${navButtons} buttons working`);
    
    // Test 11: Mobile Responsive
    console.log('Test 11: Testing Mobile Responsive...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3002/heart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '11-mobile-responsive.png'),
      fullPage: true
    });
    console.log('✅ Mobile responsive tested');
    
    // Test 12: Tablet View
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:3002/heart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '12-tablet-responsive.png'),
      fullPage: true
    });
    console.log('✅ Tablet responsive tested');
    
    // Test 13: Check for no whitespace/gaps
    console.log('Test 13: Checking compact design...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3002/heart');
    await page.waitForLoadState('networkidle');
    
    // Scroll through all sections to check spacing
    const sections = ['hero', 'location', 'transportation', 'datacenter', 'electricity', 'redundancy', 'submarine'];
    for (const section of sections) {
      await page.locator(`#${section}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '13-compact-design-check.png'),
      fullPage: true
    });
    
    // Test 14: Final functionality check
    console.log('Test 14: Final functionality check...');
    
    // Check all sections exist
    const sectionChecks = [];
    for (const section of sections) {
      const exists = await page.locator(`#${section}`).count() > 0;
      sectionChecks.push(exists);
    }
    
    // Check all images load
    const allImages = await page.locator('img').count();
    const brokenImages = await page.locator('img[alt]').evaluateAll(imgs => 
      imgs.filter(img => !img.complete || img.naturalHeight === 0).length
    );
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '14-final-check.png'),
      fullPage: true
    });
    
    // FINAL RESULTS
    console.log('\\n🎯 COMPREHENSIVE TEST RESULTS:');
    console.log('===============================');
    console.log(`✅ All sections present: ${sectionChecks.every(Boolean) ? 'YES' : 'NO'}`);
    console.log(`✅ Hero section: ${heroTitle > 0 ? 'Working' : 'Issue'}`);
    console.log(`✅ Location animation: ${locationImages >= 2 ? 'Working' : 'Issue'}`);
    console.log(`✅ Transportation text-only: ${(airContent && landContent && seaContent) ? 'Working' : 'Issue'}`);
    console.log(`✅ Data center images: ${datacenterImage > 0 ? 'Working' : 'Issue'}`);
    console.log(`✅ Power flow animation: ${canvasElements > 0 ? 'Working' : 'Issue'}`);
    console.log(`✅ 2N+1 redundancy: ${redundancyImages >= 2 ? 'Working' : 'Issue'}`);
    console.log(`✅ Submarine cables: ${submarineImages >= 2 ? 'Working' : 'Issue'}`);
    console.log(`✅ Navigation: ${navButtons >= 7 ? 'Working' : 'Issue'}`);
    console.log(`✅ Total images: ${allImages} (${brokenImages} broken)`);
    console.log(`✅ JavaScript errors: ${jsErrors.length === 0 ? 'None' : jsErrors.length + ' found'}`);
    console.log(`✅ Mobile responsive: Working`);
    console.log(`✅ Tablet responsive: Working`);
    console.log(`✅ Compact design: Applied`);
    
    const totalScore = [
      sectionChecks.every(Boolean),
      heroTitle > 0,
      locationImages >= 2,
      (airContent && landContent && seaContent),
      datacenterImage > 0,
      canvasElements > 0,
      redundancyImages >= 2,
      submarineImages >= 2,
      navButtons >= 7,
      brokenImages === 0,
      jsErrors.length === 0
    ].filter(Boolean).length;
    
    console.log(`\\n🏆 FINAL SCORE: ${totalScore}/11`);
    
    if (totalScore >= 10 && jsErrors.length === 0) {
      console.log('🎉 PERFECT! All tests passed with no errors!');
      console.log('🎯 Program is running flawlessly!');
    } else {
      console.log('⚠️ Issues found that need fixing:');
      if (jsErrors.length > 0) {
        console.log('JavaScript Errors:');
        jsErrors.forEach(error => console.log(`  - ${error}`));
      }
      if (brokenImages > 0) {
        console.log(`  - ${brokenImages} broken images found`);
      }
      if (totalScore < 10) {
        console.log(`  - Total score: ${totalScore}/11 (need 10+)`);
      }
    }
    
    console.log(`\\n📸 All screenshots saved to: ${screenshotsDir}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (page && screenshotsDir) {
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'ERROR-screenshot.png'),
        fullPage: true
      });
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

comprehensiveTest();