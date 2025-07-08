const { chromium } = require('playwright');
const fs = require('fs');

if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

async function comprehensiveLocalTest() {
  console.log('🏠 COMPREHENSIVE LOCAL TEST');
  console.log('==========================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const page = await browser.newPage();
  
  // Monitor image loading
  const imageRequests = [];
  const imageResponses = [];
  
  page.on('request', request => {
    if (request.url().includes('images/') || request.url().includes('Power') || request.url().includes('_next/image')) {
      imageRequests.push({
        url: request.url(),
        timestamp: Date.now()
      });
      console.log(`📤 IMG REQUEST: ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('images/') || response.url().includes('Power') || response.url().includes('_next/image')) {
      const success = response.status() < 400;
      imageResponses.push({
        url: response.url(),
        status: response.status(),
        success: success
      });
      console.log(`${success ? '✅' : '❌'} IMG RESPONSE: ${response.url()} - ${response.status()}`);
    }
  });
  
  try {
    console.log('🌐 Loading local application...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'screenshots/local-01-initial.png', fullPage: true });
    
    // Test the redundancy feature thoroughly
    console.log('\n🎯 Testing redundancy feature...');
    
    const toggleButton = page.locator('[data-testid="simple-redundancy-toggle"]');
    await toggleButton.waitFor({ timeout: 5000 });
    
    const initialButtonText = await toggleButton.textContent();
    console.log(`Initial button: "${initialButtonText}"`);
    
    // Test multiple toggles to ensure stability
    for (let i = 1; i <= 3; i++) {
      console.log(`\n🔄 Toggle cycle ${i}:`);
      
      // Click to show 2N+1
      await toggleButton.click();
      await page.waitForTimeout(2000);
      
      const buttonText2N1 = await toggleButton.textContent();
      console.log(`  After click: "${buttonText2N1}"`);
      
      // Check for text overlay
      const hasTextOverlay = await page.locator('text=500KV ONSITE GRID').isVisible();
      console.log(`  Text overlay visible: ${hasTextOverlay}`);
      
      // Take screenshot
      await page.screenshot({ path: `screenshots/local-${String(i*2).padStart(2, '0')}-2n1.png`, fullPage: true });
      
      // Click back to main
      await toggleButton.click();
      await page.waitForTimeout(2000);
      
      const buttonTextMain = await toggleButton.textContent();
      console.log(`  Back to main: "${buttonTextMain}"`);
      
      await page.screenshot({ path: `screenshots/local-${String(i*2+1).padStart(2, '0')}-main.png`, fullPage: true });
    }
    
    // Test image dimensions and loading
    console.log('\n🔍 Analyzing final image state...');
    const imageAnalysis = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.map((img, i) => ({
        index: i + 1,
        src: img.src,
        alt: img.alt,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        hasError: img.onerror !== null
      }));
    });
    
    imageAnalysis.forEach(img => {
      console.log(`  Image ${img.index}:`);
      console.log(`    Src: ${img.src}`);
      console.log(`    Alt: ${img.alt}`);
      console.log(`    Loaded: ${img.complete && img.naturalWidth > 0}`);
      console.log(`    Size: ${img.naturalWidth}x${img.naturalHeight}`);
    });
    
    // Final test - ensure we're back to 2N+1 state for production comparison
    console.log('\n🎯 Final state - switching to 2N+1 for comparison...');
    await toggleButton.click();
    await page.waitForTimeout(2000);
    
    const finalTextOverlay = await page.locator('text=500KV ONSITE GRID').isVisible();
    console.log(`Final text overlay visible: ${finalTextOverlay}`);
    
    await page.screenshot({ path: 'screenshots/local-final-2n1.png', fullPage: true });
    
    console.log('\n📊 RESULTS SUMMARY:');
    console.log(`Image requests: ${imageRequests.length}`);
    console.log(`Image responses: ${imageResponses.length}`);
    console.log(`Failed image responses: ${imageResponses.filter(r => !r.success).length}`);
    
    const success = imageResponses.filter(r => !r.success).length === 0 && finalTextOverlay;
    
    console.log('\n==========================');
    console.log(success ? '🎉 LOCAL TEST PASSED!' : '⚠️  LOCAL ISSUES DETECTED');
    console.log('==========================\n');
    
    return success;
    
  } catch (error) {
    console.error('❌ Local test failed:', error.message);
    await page.screenshot({ path: 'screenshots/local-error.png', fullPage: true });
    return false;
  } finally {
    await browser.close();
  }
}

comprehensiveLocalTest().then(success => {
  if (success) {
    console.log('✅ Ready for production deployment!');
  } else {
    console.log('❌ Fix local issues before deploying to production.');
  }
}).catch(console.error);