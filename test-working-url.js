const { chromium } = require('playwright');
const fs = require('fs');

if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

async function testWorkingURL() {
  console.log('🎯 TESTING WORKING URL');
  console.log('======================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  const workingUrl = 'https://visualization-lekhanhcongs-projects.vercel.app/';
  
  // Monitor all requests and responses
  const allRequests = [];
  const allResponses = [];
  
  page.on('request', request => {
    allRequests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType()
    });
    
    if (request.url().includes('images/') || request.url().includes('Power')) {
      console.log(`📤 IMAGE REQUEST: ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    allResponses.push({
      url: response.url(),
      status: response.status(),
      headers: Object.fromEntries(response.headers())
    });
    
    if (response.url().includes('images/') || response.url().includes('Power')) {
      console.log(`📥 IMAGE RESPONSE: ${response.url()} - ${response.status()}`);
    }
  });
  
  try {
    console.log(`🌐 Loading: ${workingUrl}`);
    await page.goto(workingUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'screenshots/working-01-load.png', fullPage: true });
    
    // Detailed page analysis
    const pageAnalysis = await page.evaluate(() => {
      // Check environment variables
      const envCheck = {
        nodeEnv: typeof process !== 'undefined' ? process.env?.NODE_ENV : 'undefined',
        redundancyEnabled: typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_ENABLE_REDUNDANCY : 'undefined'
      };
      
      // Check for redundancy feature elements
      const redundancyCheck = {
        hasToggle: !!document.querySelector('[data-testid="simple-redundancy-toggle"]'),
        hasSimpleRedundancyFeature: !!document.querySelector('div').textContent?.includes('SimpleRedundancyFeature'),
        hasFallbackMessage: !!document.querySelector('div').textContent?.includes('Enable NEXT_PUBLIC_ENABLE_REDUNDANCY')
      };
      
      // Check images
      const images = Array.from(document.querySelectorAll('img'));
      const imageCheck = {
        imageCount: images.length,
        imageSources: images.map(img => ({ src: img.src, alt: img.alt, complete: img.complete }))
      };
      
      // Check page structure
      const structureCheck = {
        title: document.title,
        h1: document.querySelector('h1')?.textContent,
        bodyText: document.body.innerText.substring(0, 500),
        hasFooter: !!document.querySelector('footer'),
        hasHeader: !!document.querySelector('header')
      };
      
      return {
        env: envCheck,
        redundancy: redundancyCheck,
        images: imageCheck,
        structure: structureCheck
      };
    });
    
    console.log('\n📊 DETAILED PAGE ANALYSIS:');
    console.log('Environment:', JSON.stringify(pageAnalysis.env, null, 2));
    console.log('Redundancy Features:', JSON.stringify(pageAnalysis.redundancy, null, 2));
    console.log('Images:', JSON.stringify(pageAnalysis.images, null, 2));
    console.log('Page Structure:', JSON.stringify(pageAnalysis.structure, null, 2));
    
    // Check if we can see the fallback message
    if (pageAnalysis.redundancy.hasFallbackMessage) {
      console.log('\n⚠️  FOUND FALLBACK MESSAGE - Environment variable not set correctly!');
    }
    
    // Test debug page
    console.log('\n🔧 Testing debug page...');
    await page.goto(`${workingUrl}debug-images`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'screenshots/working-02-debug.png', fullPage: true });
    
    const debugPageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        hasContent: document.body.innerText.length > 100,
        bodyPreview: document.body.innerText.substring(0, 300)
      };
    });
    
    console.log('\nDebug page info:', debugPageInfo);
    
    // Now let's see what happens if we manually trigger the redundancy feature
    console.log('\n🔄 Testing main page again...');
    await page.goto(workingUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check the actual page content
    const finalCheck = await page.evaluate(() => {
      const allText = document.body.innerText;
      const hasEnableMessage = allText.includes('Enable NEXT_PUBLIC_ENABLE_REDUNDANCY');
      const hasToggleButton = !!document.querySelector('[data-testid="simple-redundancy-toggle"]');
      
      return {
        hasEnableMessage: hasEnableMessage,
        hasToggleButton: hasToggleButton,
        fullText: allText
      };
    });
    
    console.log('\n📋 FINAL CHECK:');
    console.log(`Has "Enable NEXT_PUBLIC_ENABLE_REDUNDANCY" message: ${finalCheck.hasEnableMessage}`);
    console.log(`Has toggle button: ${finalCheck.hasToggleButton}`);
    
    if (finalCheck.hasEnableMessage) {
      console.log('\n❌ ISSUE IDENTIFIED: Environment variable NEXT_PUBLIC_ENABLE_REDUNDANCY is not being set in production!');
      console.log('📝 This explains why the redundancy feature is not showing.');
      console.log('🔧 Need to fix Vercel environment variable configuration.');
    }
    
    await page.screenshot({ path: 'screenshots/working-03-final.png', fullPage: true });
    
    console.log('\n======================');
    console.log('🎯 DIAGNOSIS COMPLETE');
    console.log('======================\n');
    
    return {
      url: workingUrl,
      working: true,
      environmentIssue: finalCheck.hasEnableMessage,
      needsEnvFix: finalCheck.hasEnableMessage
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'screenshots/working-error.png', fullPage: true });
    return { working: false, error: error.message };
  } finally {
    await browser.close();
  }
}

testWorkingURL().then(result => {
  if (result.working) {
    console.log(`✅ URL is working: ${result.url}`);
    if (result.needsEnvFix) {
      console.log('⚠️  Environment variable needs to be fixed in Vercel dashboard');
    } else {
      console.log('🎉 Everything is working correctly!');
    }
  } else {
    console.log('❌ URL test failed');
  }
}).catch(console.error);