const { chromium } = require('playwright');
const fs = require('fs');

if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

async function testFinalImageFix() {
  console.log('🎯 FINAL IMAGE FIX VERIFICATION TEST');
  console.log('====================================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800
  });
  
  const page = await browser.newPage();
  
  // Track image requests
  const imageActivity = [];
  
  page.on('request', request => {
    if (request.url().includes('images/') || request.url().includes('Power')) {
      console.log(`📤 REQUEST: ${request.url()}`);
      imageActivity.push({ type: 'request', url: request.url() });
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('images/') || response.url().includes('Power')) {
      const success = response.status() < 400;
      console.log(`${success ? '✅' : '❌'} RESPONSE: ${response.url()} - ${response.status()}`);
      imageActivity.push({ 
        type: 'response', 
        url: response.url(), 
        status: response.status(),
        success: success
      });
    }
  });
  
  try {
    // Test 1: Local with fixed paths
    console.log('🏠 Testing local with fixed image paths...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'screenshots/final-fix-01-local.png', fullPage: true });
    
    const localCheck = await page.evaluate(() => {
      const hasToggle = !!document.querySelector('[data-testid="simple-redundancy-toggle"]');
      const images = Array.from(document.querySelectorAll('img'));
      
      return {
        hasToggle: hasToggle,
        imageCount: images.length,
        imagesLoaded: images.filter(img => img.complete && img.naturalWidth > 0).length,
        imageSources: images.map(img => img.src)
      };
    });
    
    console.log(`Local toggle available: ${localCheck.hasToggle}`);
    console.log(`Local images loaded: ${localCheck.imagesLoaded}/${localCheck.imageCount}`);
    
    if (localCheck.hasToggle) {
      console.log('\n🎯 Testing local redundancy feature...');
      const toggle = page.locator('[data-testid="simple-redundancy-toggle"]');
      
      // Click to show 2N+1
      await toggle.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screenshots/final-fix-02-local-2n1.png', fullPage: true });
      
      const local2N1Check = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        const hasTextOverlay = !!document.querySelector('div').textContent?.includes('500KV ONSITE GRID');
        
        return {
          imageCount: images.length,
          imagesLoaded: images.filter(img => img.complete && img.naturalWidth > 0).length,
          hasTextOverlay: hasTextOverlay,
          imageSources: images.map(img => img.src)
        };
      });
      
      console.log(`Local 2N+1 images loaded: ${local2N1Check.imagesLoaded}/${local2N1Check.imageCount}`);
      console.log(`Local text overlay: ${local2N1Check.hasTextOverlay}`);
      
      // Toggle back
      await toggle.click();
      await page.waitForTimeout(2000);
    }
    
    // Test 2: Production URL direct access
    console.log('\n🌐 Testing production image URLs directly...');
    
    const testUrls = [
      'https://visualization-lekhanhcongs-projects.vercel.app/images/Power.png',
      'https://visualization-lekhanhcongs-projects.vercel.app/images/Power_2N1.PNG'
    ];
    
    const urlResults = [];
    
    for (const url of testUrls) {
      console.log(`Testing: ${url}`);
      try {
        const response = await page.goto(url);
        const status = response?.status();
        const success = status && status < 400;
        urlResults.push({ url, status, success });
        console.log(`  Status: ${status} ${success ? '✅' : '❌'}`);
      } catch (error) {
        console.log(`  Error: ${error.message} ❌`);
        urlResults.push({ url, error: error.message, success: false });
      }
    }
    
    // Test 3: Production app functionality (if env var is set)
    console.log('\n🌐 Testing production application...');
    const prodUrl = 'https://visualization-lekhanhcongs-projects.vercel.app/';
    
    await page.goto(prodUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'screenshots/final-fix-03-prod.png', fullPage: true });
    
    const prodCheck = await page.evaluate(() => {
      return {
        title: document.title,
        hasToggle: !!document.querySelector('[data-testid="simple-redundancy-toggle"]'),
        hasEnvMessage: document.body.innerText.includes('Enable NEXT_PUBLIC_ENABLE_REDUNDANCY'),
        imageCount: document.querySelectorAll('img').length
      };
    });
    
    console.log(`Production title: ${prodCheck.title}`);
    console.log(`Production toggle: ${prodCheck.hasToggle}`);
    console.log(`Production env message: ${prodCheck.hasEnvMessage}`);
    
    // Summary
    console.log('\n====================================');
    console.log('📊 FINAL TEST RESULTS');
    console.log('====================================');
    
    const localWorking = localCheck.hasToggle && localCheck.imagesLoaded > 0;
    const prodImagesWorking = urlResults.every(r => r.success);
    const prodEnvNeeded = prodCheck.hasEnvMessage;
    
    console.log(`✅ Local development: ${localWorking ? 'Working' : 'Issues detected'}`);
    console.log(`✅ Production images: ${prodImagesWorking ? 'All accessible' : 'Some issues'}`);
    console.log(`⚠️  Production env var: ${prodEnvNeeded ? 'Needs to be set' : 'Configured'}`);
    
    const imageErrors = imageActivity.filter(a => a.type === 'response' && !a.success);
    console.log(`📊 Image errors: ${imageErrors.length}`);
    
    if (imageErrors.length > 0) {
      console.log('\n❌ Image errors found:');
      imageErrors.forEach(error => {
        console.log(`  ${error.url} - Status: ${error.status}`);
      });
    }
    
    console.log('\n🎯 NEXT STEPS:');
    if (localWorking && prodImagesWorking) {
      console.log('✅ Image loading is fixed!');
      if (prodEnvNeeded) {
        console.log('🔧 Set NEXT_PUBLIC_ENABLE_REDUNDANCY=true in Vercel dashboard');
        console.log('📱 Then redeploy to activate the 2N+1 feature');
      } else {
        console.log('🎉 Everything should be working perfectly!');
      }
    } else {
      console.log('⚠️  Additional fixes needed');
    }
    
    console.log(`\n📱 Production URL: ${prodUrl}`);
    
    return {
      localWorking: localWorking,
      prodImagesWorking: prodImagesWorking,
      prodEnvNeeded: prodEnvNeeded,
      imageErrors: imageErrors.length,
      prodUrl: prodUrl
    };
    
  } catch (error) {
    console.error('❌ Final test failed:', error.message);
    await page.screenshot({ path: 'screenshots/final-fix-error.png', fullPage: true });
    return { error: error.message };
  } finally {
    await browser.close();
  }
}

testFinalImageFix().then(result => {
  console.log('\n🎉 FINAL TEST COMPLETE!');
  if (result.localWorking) {
    console.log('✅ Local development working');
  }
  if (result.prodImagesWorking) {
    console.log('✅ Production images accessible');
  }
  if (result.prodEnvNeeded) {
    console.log('⚠️  Environment variable configuration needed');
  } else if (result.localWorking && result.prodImagesWorking) {
    console.log('🎉 ALL ISSUES RESOLVED!');
  }
}).catch(console.error);