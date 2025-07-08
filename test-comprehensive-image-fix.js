const { chromium } = require('playwright');
const fs = require('fs');

if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

async function comprehensiveImageTest() {
  console.log('🖼️  COMPREHENSIVE IMAGE LOADING FIX TEST');
  console.log('=========================================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  // Track ALL image requests with detailed info
  const imageRequests = [];
  const imageResponses = [];
  const imageErrors = [];
  
  page.on('request', request => {
    if (request.url().includes('images/') || request.url().includes('Power') || request.url().includes('_next/image')) {
      const imageRequest = {
        url: request.url(),
        method: request.method(),
        timestamp: Date.now(),
        type: 'request'
      };
      imageRequests.push(imageRequest);
      console.log(`📤 IMAGE REQUEST: ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('images/') || response.url().includes('Power') || response.url().includes('_next/image')) {
      const success = response.status() < 400;
      const imageResponse = {
        url: response.url(),
        status: response.status(),
        success: success,
        timestamp: Date.now(),
        type: 'response'
      };
      imageResponses.push(imageResponse);
      
      if (success) {
        console.log(`✅ IMAGE SUCCESS: ${response.url()} - ${response.status()}`);
      } else {
        console.log(`❌ IMAGE FAILED: ${response.url()} - ${response.status()}`);
        imageErrors.push(imageResponse);
      }
    }
  });
  
  // Monitor console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`🚨 CONSOLE ERROR: ${msg.text()}`);
    }
  });
  
  try {
    // Test 1: Local development server
    console.log('🏠 TESTING LOCAL DEVELOPMENT...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'screenshots/comprehensive-01-local.png', fullPage: true });
    
    // Check local image loading
    const localImageCheck = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return {
        totalImages: images.length,
        loadedImages: images.filter(img => img.complete && img.naturalWidth > 0).length,
        imageDetails: images.map(img => ({
          src: img.src,
          alt: img.alt,
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        }))
      };
    });
    
    console.log(`Local images: ${localImageCheck.loadedImages}/${localImageCheck.totalImages} loaded`);
    
    // Test redundancy toggle locally
    const hasToggle = await page.locator('[data-testid="simple-redundancy-toggle"]').isVisible();
    if (hasToggle) {
      console.log('🎯 Testing local redundancy toggle...');
      const toggle = page.locator('[data-testid="simple-redundancy-toggle"]');
      
      // Click to 2N+1
      await toggle.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screenshots/comprehensive-02-local-2n1.png', fullPage: true });
      
      // Check 2N+1 image loading
      const local2N1Check = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return {
          totalImages: images.length,
          loadedImages: images.filter(img => img.complete && img.naturalWidth > 0).length,
          imageDetails: images.map(img => ({
            src: img.src,
            alt: img.alt,
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight
          }))
        };
      });
      
      console.log(`Local 2N+1 images: ${local2N1Check.loadedImages}/${local2N1Check.totalImages} loaded`);
      
      // Check for text overlay
      const hasTextOverlay = await page.locator('text=500KV ONSITE GRID').isVisible();
      console.log(`Local text overlay: ${hasTextOverlay}`);
      
      // Click back to main
      await toggle.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️  No toggle found locally - environment issue');
    }
    
    // Clear requests/responses for production test
    imageRequests.length = 0;
    imageResponses.length = 0;
    imageErrors.length = 0;
    
    // Test 2: Production deployment
    console.log('\n🌐 TESTING PRODUCTION DEPLOYMENT...');
    const prodUrl = 'https://visualization-lekhanhcongs-projects.vercel.app/';
    
    await page.goto(prodUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'screenshots/comprehensive-03-prod.png', fullPage: true });
    
    // Check production page structure
    const prodPageCheck = await page.evaluate(() => {
      return {
        title: document.title,
        h1: document.querySelector('h1')?.textContent,
        hasToggle: !!document.querySelector('[data-testid="simple-redundancy-toggle"]'),
        hasEnvMessage: document.body.innerText.includes('Enable NEXT_PUBLIC_ENABLE_REDUNDANCY'),
        bodyText: document.body.innerText,
        imageCount: document.querySelectorAll('img').length
      };
    });
    
    console.log(`Production title: ${prodPageCheck.title}`);
    console.log(`Production toggle: ${prodPageCheck.hasToggle}`);
    console.log(`Production env message: ${prodPageCheck.hasEnvMessage}`);
    console.log(`Production images: ${prodPageCheck.imageCount}`);
    
    if (prodPageCheck.hasEnvMessage) {
      console.log('\n⚠️  PRODUCTION ISSUE: Environment variable not set');
      console.log('Need to set NEXT_PUBLIC_ENABLE_REDUNDANCY=true in Vercel dashboard');
    }
    
    // Test 3: Direct image access
    console.log('\n🔗 TESTING DIRECT IMAGE ACCESS...');
    
    const imageUrlsToTest = [
      `${prodUrl}images/Power.png`,
      `${prodUrl}images/Power_2N1.png`,
      `${prodUrl}images/Power_2N1.PNG`, // Test uppercase
      `${prodUrl}data/image-config.json`
    ];
    
    for (const imageUrl of imageUrlsToTest) {
      console.log(`Testing: ${imageUrl}`);
      try {
        const response = await page.goto(imageUrl);
        const status = response?.status();
        console.log(`  Status: ${status} ${status < 400 ? '✅' : '❌'}`);
      } catch (error) {
        console.log(`  Error: ${error.message} ❌`);
      }
    }
    
    // Test 4: Debug page
    console.log('\n🔧 TESTING DEBUG PAGE...');
    await page.goto(`${prodUrl}debug-images`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'screenshots/comprehensive-04-debug.png', fullPage: true });
    
    // Final summary
    console.log('\n=========================================');
    console.log('📊 COMPREHENSIVE TEST SUMMARY');
    console.log('=========================================');
    console.log(`Total image requests: ${imageRequests.length}`);
    console.log(`Total image responses: ${imageResponses.length}`);
    console.log(`Failed image requests: ${imageErrors.length}`);
    console.log(`Console errors: ${consoleErrors.length}`);
    
    if (imageErrors.length > 0) {
      console.log('\n❌ FAILED IMAGE REQUESTS:');
      imageErrors.forEach(error => {
        console.log(`  ${error.url} - Status: ${error.status}`);
      });
    }
    
    if (consoleErrors.length > 0) {
      console.log('\n🚨 CONSOLE ERRORS:');
      consoleErrors.forEach(error => {
        console.log(`  ${error}`);
      });
    }
    
    // Diagnosis and recommendations
    console.log('\n🔧 DIAGNOSIS & RECOMMENDATIONS:');
    
    if (hasToggle && localImageCheck.loadedImages > 0) {
      console.log('✅ Local development: Working correctly');
    } else {
      console.log('❌ Local development: Issues detected');
    }
    
    if (prodPageCheck.hasEnvMessage) {
      console.log('⚠️  Production: Environment variable needs to be set');
      console.log('   → Go to Vercel dashboard → Settings → Environment Variables');
      console.log('   → Add: NEXT_PUBLIC_ENABLE_REDUNDANCY = true');
    }
    
    if (imageErrors.length > 0) {
      console.log('❌ Image loading: Issues detected');
      console.log('   → Check file case sensitivity');
      console.log('   → Verify Next.js Image component usage');
    } else {
      console.log('✅ Image loading: No errors detected');
    }
    
    console.log('\n📱 Production URL:', prodUrl);
    console.log('🎯 Next steps: Fix environment variable in Vercel dashboard');
    
    return {
      localWorking: hasToggle && localImageCheck.loadedImages > 0,
      productionDeployed: prodPageCheck.title.includes('Hue Hi Tech Park'),
      environmentIssue: prodPageCheck.hasEnvMessage,
      imageErrors: imageErrors.length,
      prodUrl: prodUrl
    };
    
  } catch (error) {
    console.error('❌ Comprehensive test failed:', error.message);
    await page.screenshot({ path: 'screenshots/comprehensive-error.png', fullPage: true });
    return { error: error.message };
  } finally {
    await browser.close();
  }
}

comprehensiveImageTest().then(result => {
  console.log('\n🎉 TEST COMPLETE!');
  if (result.localWorking) {
    console.log('✅ Local development is working');
  }
  if (result.productionDeployed) {
    console.log('✅ Production deployment successful');
    console.log(`📱 URL: ${result.prodUrl}`);
  }
  if (result.environmentIssue) {
    console.log('⚠️  Environment variable needs to be configured');
  }
  if (result.imageErrors === 0) {
    console.log('✅ No image loading errors detected');
  }
}).catch(console.error);