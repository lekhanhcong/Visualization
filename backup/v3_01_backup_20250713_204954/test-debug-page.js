const { chromium } = require('playwright');
const fs = require('fs');

if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

async function testDebugPage() {
  console.log('🔧 TESTING DEBUG PAGE');
  console.log('====================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  // Monitor all network requests
  const imageRequests = [];
  const failedRequests = [];
  
  page.on('request', request => {
    if (request.url().includes('images/') || request.url().includes('Power') || request.url().includes('_next/image')) {
      imageRequests.push({
        url: request.url(),
        method: request.method()
      });
      console.log(`📤 REQUEST: ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('images/') || response.url().includes('Power') || response.url().includes('_next/image')) {
      const success = response.status() < 400;
      console.log(`${success ? '✅' : '❌'} ${response.url()} - ${response.status()}`);
      
      if (!success) {
        failedRequests.push({
          url: response.url(),
          status: response.status()
        });
      }
    }
  });
  
  // Monitor console logs
  page.on('console', msg => {
    console.log(`🖥️  ${msg.type()}: ${msg.text()}`);
  });
  
  try {
    console.log('🌐 Loading debug page...');
    await page.goto('https://hue-datacenter-visualization.vercel.app/debug-images', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/debug-01-loaded.png', fullPage: true });
    
    // Check environment variables
    console.log('\n🔍 Environment Variables:');
    const envVars = await page.evaluate(() => {
      const redundancy = document.querySelector('div:contains("NEXT_PUBLIC_ENABLE_REDUNDANCY")')?.textContent;
      const nodeEnv = document.querySelector('div:contains("NODE_ENV")')?.textContent;
      return { redundancy, nodeEnv };
    });
    console.log('Environment info found on page:', envVars);
    
    // Wait for all image tests to complete
    console.log('\n⏳ Waiting for image tests to complete...');
    await page.waitForTimeout(8000);
    
    await page.screenshot({ path: 'screenshots/debug-02-complete.png', fullPage: true });
    
    // Check for specific text content that indicates image loading status
    const imageStatuses = await page.evaluate(() => {
      const statusElements = document.querySelectorAll('p.text-sm');
      const statuses = [];
      statusElements.forEach(el => {
        const text = el.textContent;
        if (text && (text.includes('✅') || text.includes('❌') || text.includes('Testing'))) {
          statuses.push(text);
        }
      });
      return statuses;
    });
    
    console.log('\n📊 Image Loading Statuses:');
    imageStatuses.forEach(status => {
      console.log(`  ${status}`);
    });
    
    // Try to access main page
    console.log('\n🏠 Testing main page...');
    await page.goto('https://hue-datacenter-visualization.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/debug-03-main.png', fullPage: true });
    
    // Check if redundancy feature is now visible
    const hasToggle = await page.locator('[data-testid="simple-redundancy-toggle"]').isVisible();
    console.log(`Redundancy toggle visible on main page: ${hasToggle}`);
    
    if (hasToggle) {
      console.log('🎯 Testing redundancy toggle...');
      const toggle = page.locator('[data-testid="simple-redundancy-toggle"]');
      await toggle.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screenshots/debug-04-2n1.png', fullPage: true });
      
      const hasTextOverlay = await page.locator('text=500KV ONSITE GRID').isVisible();
      console.log(`Text overlay visible: ${hasTextOverlay}`);
    }
    
    console.log('\n📊 SUMMARY:');
    console.log(`Total image requests: ${imageRequests.length}`);
    console.log(`Failed requests: ${failedRequests.length}`);
    
    if (failedRequests.length > 0) {
      console.log('\n❌ FAILED REQUESTS:');
      failedRequests.forEach(req => {
        console.log(`  ${req.url} - Status ${req.status}`);
      });
    }
    
    console.log('\n====================');
    console.log(failedRequests.length === 0 && hasToggle ? '🎉 ALL TESTS PASSED!' : '⚠️  ISSUES DETECTED');
    console.log('====================\n');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
    await page.screenshot({ path: 'screenshots/debug-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testDebugPage().catch(console.error);