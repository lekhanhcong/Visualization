const { chromium } = require('playwright');
const fs = require('fs');

if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

async function testImageLoading() {
  console.log('🖼️  COMPREHENSIVE IMAGE LOADING TEST');
  console.log('=====================================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  // Enable network monitoring
  const networkRequests = [];
  const failedRequests = [];
  
  page.on('request', request => {
    if (request.url().includes('images/')) {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        type: 'request'
      });
      console.log(`📤 REQUEST: ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('images/')) {
      const success = response.status() < 400;
      const logData = {
        url: response.url(),
        status: response.status(),
        success: success,
        type: 'response'
      };
      
      if (!success) {
        failedRequests.push(logData);
        console.log(`❌ FAILED: ${response.url()} - Status: ${response.status()}`);
      } else {
        console.log(`✅ SUCCESS: ${response.url()} - Status: ${response.status()}`);
      }
    }
  });
  
  try {
    console.log('🌐 Loading application...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'screenshots/test-01-initial.png', fullPage: true });
    
    // Check initial state
    console.log('\n🔍 Checking initial image state...');
    const initialImageCheck = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.map(img => ({
        src: img.src,
        alt: img.alt,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        currentSrc: img.currentSrc
      }));
    });
    
    console.log('Initial images found:', initialImageCheck.length);
    initialImageCheck.forEach((img, i) => {
      console.log(`  Image ${i + 1}:`);
      console.log(`    src: ${img.src}`);
      console.log(`    alt: ${img.alt}`);
      console.log(`    loaded: ${img.complete && img.naturalWidth > 0}`);
      console.log(`    dimensions: ${img.naturalWidth}x${img.naturalHeight}`);
    });
    
    // Wait for redundancy button
    console.log('\n🎯 Looking for redundancy toggle...');
    const toggleButton = page.locator('[data-testid="simple-redundancy-toggle"]');
    await toggleButton.waitFor({ timeout: 5000 });
    
    const buttonText = await toggleButton.textContent();
    console.log(`Found button: "${buttonText}"`);
    
    // Click to show 2N+1 view
    console.log('\n🔄 Clicking to show 2N+1 redundancy...');
    await toggleButton.click();
    
    // Wait for image transition
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/test-02-2n1-view.png', fullPage: true });
    
    // Check 2N+1 image state
    console.log('\n🔍 Checking 2N+1 image state...');
    const redundancyImageCheck = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.map(img => ({
        src: img.src,
        alt: img.alt,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        currentSrc: img.currentSrc
      }));
    });
    
    console.log('2N+1 images found:', redundancyImageCheck.length);
    redundancyImageCheck.forEach((img, i) => {
      console.log(`  Image ${i + 1}:`);
      console.log(`    src: ${img.src}`);
      console.log(`    alt: ${img.alt}`);
      console.log(`    loaded: ${img.complete && img.naturalWidth > 0}`);
      console.log(`    dimensions: ${img.naturalWidth}x${img.naturalHeight}`);
    });
    
    // Check for text overlay
    console.log('\n📝 Checking for text overlay...');
    const textOverlay = await page.locator('text=500KV ONSITE GRID').isVisible();
    console.log(`Text overlay visible: ${textOverlay}`);
    
    // Test toggle back
    console.log('\n🔄 Toggling back to main view...');
    await toggleButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/test-03-main-view.png', fullPage: true });
    
    // Summary
    console.log('\n📊 NETWORK SUMMARY:');
    console.log(`Total image requests: ${networkRequests.length}`);
    console.log(`Failed requests: ${failedRequests.length}`);
    
    if (failedRequests.length > 0) {
      console.log('\n❌ FAILED REQUESTS:');
      failedRequests.forEach(req => {
        console.log(`  ${req.url} - Status: ${req.status}`);
      });
    }
    
    // Check for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    console.log(`\n🚨 Console errors: ${errors.length}`);
    if (errors.length > 0) {
      errors.forEach(error => console.log(`  ${error}`));
    }
    
    console.log('\n================================');
    if (failedRequests.length === 0 && textOverlay) {
      console.log('🎉 ALL TESTS PASSED! Images loading correctly.');
    } else {
      console.log('⚠️  ISSUES DETECTED - See details above.');
    }
    console.log('================================\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'screenshots/test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testImageLoading().catch(console.error);