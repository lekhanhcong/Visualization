const { chromium } = require('playwright');
const fs = require('fs');

if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

async function testProductionImages() {
  console.log('🌐 PRODUCTION IMAGE LOADING TEST');
  console.log('=================================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  // Monitor all network requests
  const imageRequests = [];
  const failedRequests = [];
  
  page.on('request', request => {
    if (request.url().includes('images/') || request.url().includes('Power')) {
      imageRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
      console.log(`📤 REQUEST: ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('images/') || response.url().includes('Power')) {
      const success = response.status() < 400;
      console.log(`${success ? '✅' : '❌'} ${response.url()} - ${response.status()}`);
      
      if (!success) {
        failedRequests.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    }
  });
  
  // Monitor console logs
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    if (msg.type() === 'error') {
      console.log(`🚨 CONSOLE ERROR: ${msg.text()}`);
    }
  });
  
  try {
    console.log('🌐 Loading production site...');
    await page.goto('https://hue-datacenter-visualization.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'screenshots/prod-01-initial.png', fullPage: true });
    
    // Check what images are actually present
    console.log('\n🔍 Analyzing page images...');
    const imageAnalysis = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const nextImages = Array.from(document.querySelectorAll('[data-nimg]'));
      
      return {
        totalImages: images.length,
        nextJSImages: nextImages.length,
        imageDetails: images.map((img, i) => ({
          index: i + 1,
          src: img.src,
          currentSrc: img.currentSrc,
          alt: img.alt,
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          displayWidth: img.width,
          displayHeight: img.height,
          hasError: img.onerror !== null
        })),
        imageSources: Array.from(new Set(images.map(img => img.src)))
      };
    });
    
    console.log(`Found ${imageAnalysis.totalImages} images (${imageAnalysis.nextJSImages} Next.js images)`);
    
    imageAnalysis.imageDetails.forEach(img => {
      console.log(`\n  Image ${img.index}:`);
      console.log(`    Alt: "${img.alt}"`);
      console.log(`    Src: ${img.src}`);
      console.log(`    Loaded: ${img.complete && img.naturalWidth > 0}`);
      console.log(`    Natural size: ${img.naturalWidth}x${img.naturalHeight}`);
      console.log(`    Display size: ${img.displayWidth}x${img.displayHeight}`);
    });
    
    // Check for redundancy feature
    console.log('\n🎯 Testing redundancy feature...');
    
    const hasToggleButton = await page.locator('[data-testid="simple-redundancy-toggle"]').isVisible();
    console.log(`Toggle button visible: ${hasToggleButton}`);
    
    if (hasToggleButton) {
      const toggleButton = page.locator('[data-testid="simple-redundancy-toggle"]');
      const initialButtonText = await toggleButton.textContent();
      console.log(`Initial button text: "${initialButtonText}"`);
      
      // Click to show 2N+1
      console.log('\n🔄 Switching to 2N+1 view...');
      await toggleButton.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'screenshots/prod-02-2n1-attempt.png', fullPage: true });
      
      // Check button state change
      const newButtonText = await toggleButton.textContent();
      console.log(`New button text: "${newButtonText}"`);
      
      // Re-analyze images after switch
      const post2N1Analysis = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return {
          totalImages: images.length,
          imageDetails: images.map((img, i) => ({
            index: i + 1,
            src: img.src,
            alt: img.alt,
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            hasError: img.onerror !== null
          }))
        };
      });
      
      console.log('\n📊 After 2N+1 switch:');
      post2N1Analysis.imageDetails.forEach(img => {
        console.log(`  Image ${img.index}: ${img.src}`);
        console.log(`    Loaded: ${img.complete && img.naturalWidth > 0}`);
      });
      
      // Check for text overlay
      const hasTextOverlay = await page.locator('text=500KV ONSITE GRID').isVisible();
      console.log(`\n📝 Text overlay visible: ${hasTextOverlay}`);
      
      // Wait a bit more and take final screenshot
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/prod-03-2n1-final.png', fullPage: true });
      
    } else {
      console.log('❌ Redundancy toggle not found - feature may be disabled');
      
      // Check for fallback message
      const fallbackMessage = await page.locator('text=Enable NEXT_PUBLIC_ENABLE_REDUNDANCY').isVisible();
      if (fallbackMessage) {
        console.log('📋 Found fallback message - environment variable not set');
      }
    }
    
    console.log('\n📊 FINAL SUMMARY:');
    console.log(`Image requests made: ${imageRequests.length}`);
    console.log(`Failed requests: ${failedRequests.length}`);
    console.log(`Console messages: ${consoleMessages.length}`);
    
    if (failedRequests.length > 0) {
      console.log('\n❌ FAILED IMAGE REQUESTS:');
      failedRequests.forEach(req => {
        console.log(`  ${req.url} - ${req.status} ${req.statusText}`);
      });
    }
    
    if (consoleMessages.filter(msg => msg.startsWith('error')).length > 0) {
      console.log('\n🚨 CONSOLE ERRORS:');
      consoleMessages.filter(msg => msg.startsWith('error')).forEach(msg => {
        console.log(`  ${msg}`);
      });
    }
    
    console.log('\n=================================');
    const success = failedRequests.length === 0 && hasToggleButton;
    console.log(success ? '🎉 PRODUCTION TEST PASSED!' : '⚠️  ISSUES DETECTED');
    console.log('=================================\n');
    
  } catch (error) {
    console.error('❌ Production test failed:', error.message);
    await page.screenshot({ path: 'screenshots/prod-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testProductionImages().catch(console.error);