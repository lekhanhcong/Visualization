const { chromium } = require('playwright');
const fs = require('fs');

if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

async function simpleDebugTest() {
  console.log('🔧 SIMPLE DEBUG TEST');
  console.log('===================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  // Monitor specific requests
  page.on('request', request => {
    if (request.url().includes('images/') || request.url().includes('Power')) {
      console.log(`📤 REQUEST: ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('images/') || response.url().includes('Power')) {
      console.log(`📥 RESPONSE: ${response.url()} - Status: ${response.status()}`);
    }
  });
  
  try {
    // Test main page
    console.log('🌐 Testing main page...');
    await page.goto('https://hue-datacenter-visualization.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/simple-01-main.png', fullPage: true });
    
    // Get page content to understand what's happening
    const pageAnalysis = await page.evaluate(() => {
      return {
        title: document.title,
        h1Text: document.querySelector('h1')?.textContent,
        hasImages: document.querySelectorAll('img').length,
        hasRedundancyToggle: !!document.querySelector('[data-testid="simple-redundancy-toggle"]'),
        bodyText: document.body.innerText.substring(0, 500),
        envStatus: typeof window !== 'undefined' ? 'client' : 'server'
      };
    });
    
    console.log('\n📋 Page Analysis:');
    console.log(`  Title: ${pageAnalysis.title}`);
    console.log(`  H1: ${pageAnalysis.h1Text}`);
    console.log(`  Images found: ${pageAnalysis.hasImages}`);
    console.log(`  Redundancy toggle: ${pageAnalysis.hasRedundancyToggle}`);
    console.log(`  Body text preview: ${pageAnalysis.bodyText.replace(/\\n/g, ' ')}`);
    
    // Test debug page
    console.log('\n🔧 Testing debug page...');
    await page.goto('https://hue-datacenter-visualization.vercel.app/debug-images', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/simple-02-debug.png', fullPage: true });
    
    // Test direct image URLs
    console.log('\n🖼️  Testing direct image access...');
    
    const imageTests = [
      'https://hue-datacenter-visualization.vercel.app/images/Power.png',
      'https://hue-datacenter-visualization.vercel.app/images/Power_2N1.png'
    ];
    
    for (const imageUrl of imageTests) {
      console.log(`Testing: ${imageUrl}`);
      const response = await page.goto(imageUrl);
      console.log(`  Status: ${response?.status()} ${response?.statusText()}`);
      console.log(`  Headers: ${JSON.stringify(Object.fromEntries(response?.headers() || []))}`);
    }
    
    console.log('\n===================');
    console.log('🎉 DEBUG TEST COMPLETE');
    console.log('===================\n');
    
  } catch (error) {
    console.error('❌ Simple debug test failed:', error.message);
    await page.screenshot({ path: 'screenshots/simple-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

simpleDebugTest().catch(console.error);