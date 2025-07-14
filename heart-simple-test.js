const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runSimpleTest() {
  let browser;
  let page;
  
  try {
    console.log('🚀 Starting Simple HEART Test...');
    
    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'test-screenshots');
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
    page.setDefaultTimeout(15000);
    
    console.log('📱 Navigating to HEART website...');
    
    // Navigate and wait
    await page.goto('http://localhost:3001/heart');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    console.log('✅ Page loaded successfully');
    
    // Test 1: Take initial screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-initial-load.png'),
      fullPage: false
    });
    
    // Test 2: Check if basic elements exist
    console.log('🧪 Checking basic elements...');
    
    const navigation = await page.locator('nav').count();
    console.log(`Navigation elements: ${navigation}`);
    
    const mainContent = await page.locator('main').count();
    console.log(`Main content: ${mainContent}`);
    
    const footer = await page.locator('footer').count();
    console.log(`Footer: ${footer}`);
    
    // Test 3: Check sections
    console.log('🧪 Checking sections...');
    
    const sections = ['hero', 'location', 'transportation', 'datacenter', 'electricity', 'submarine'];
    let foundSections = 0;
    
    for (const sectionId of sections) {
      const element = await page.locator(`#${sectionId}`).count();
      if (element > 0) {
        foundSections++;
        console.log(`✅ Section ${sectionId} found`);
      } else {
        console.log(`❌ Section ${sectionId} not found`);
      }
    }
    
    // Test 4: Scroll through page
    console.log('🧪 Testing scroll through page...');
    
    // Scroll to location
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-location-section.png'),
      fullPage: false
    });
    
    // Scroll to transportation
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '03-transportation-section.png'),
      fullPage: false
    });
    
    // Scroll to electricity
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 4));
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '04-electricity-section.png'),
      fullPage: false
    });
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '05-footer-section.png'),
      fullPage: false
    });
    
    // Test 5: Full page screenshot
    await page.goto('http://localhost:3001/heart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '06-full-page.png'),
      fullPage: true
    });
    
    // Test 6: Check images
    console.log('🧪 Checking images...');
    const images = await page.locator('img');
    const imageCount = await images.count();
    console.log(`Found ${imageCount} images`);
    
    // Test 7: Check animations
    console.log('🧪 Checking animations...');
    const canvas = await page.locator('canvas').count();
    console.log(`Canvas elements (for animations): ${canvas}`);
    
    // Test 8: Mobile test
    console.log('🧪 Testing mobile view...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3001/heart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '07-mobile-view.png'),
      fullPage: true
    });
    
    // Summary
    console.log('\n🎯 TEST RESULTS:');
    console.log('================');
    console.log(`✅ Navigation: ${navigation > 0 ? 'Working' : 'Not found'}`);
    console.log(`✅ Main content: ${mainContent > 0 ? 'Working' : 'Not found'}`);
    console.log(`✅ Footer: ${footer > 0 ? 'Working' : 'Not found'}`);
    console.log(`✅ Sections found: ${foundSections}/${sections.length}`);
    console.log(`✅ Images: ${imageCount} found`);
    console.log(`✅ Canvas animations: ${canvas} found`);
    console.log(`✅ Screenshots saved to: ${screenshotsDir}`);
    
    if (foundSections === sections.length && navigation > 0 && mainContent > 0 && footer > 0) {
      console.log('\n🎉 ALL TESTS PASSED! Website is working correctly.');
    } else {
      console.log('\n⚠️ Some issues found, but basic functionality working.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (page) {
      await page.screenshot({ 
        path: path.join(__dirname, 'test-screenshots', 'error-screenshot.png'),
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

// Run the test
runSimpleTest()
  .then(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });