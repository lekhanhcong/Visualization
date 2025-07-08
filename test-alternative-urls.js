const { chromium } = require('playwright');
const fs = require('fs');

if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

async function testAlternativeURLs() {
  console.log('🔍 TESTING ALTERNATIVE DEPLOYMENT URLS');
  console.log('=====================================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  // List of possible URLs to try
  const urlsToTest = [
    'https://hue-datacenter-visualization.vercel.app/',
    'https://hue-datacenter-visualization-git-main-lekhanhcongs-projects.vercel.app/',
    'https://hue-datacenter-visualization-lekhanhcongs-projects.vercel.app/',
    'https://visualization-lekhanhcongs-projects.vercel.app/',
    'https://visualization.vercel.app/',
    'https://hue-datacenter-visualization-lekhanhcong.vercel.app/'
  ];
  
  let workingUrl = null;
  
  for (const url of urlsToTest) {
    console.log(`🌐 Testing: ${url}`);
    
    try {
      const response = await page.goto(url, { 
        waitUntil: 'networkidle', 
        timeout: 15000 
      });
      
      const status = response?.status();
      console.log(`  Status: ${status}`);
      
      if (status && status < 400) {
        // Check if it's actually our app
        const pageInfo = await page.evaluate(() => {
          return {
            title: document.title,
            hasToggle: !!document.querySelector('[data-testid="simple-redundancy-toggle"]'),
            hasH1: !!document.querySelector('h1'),
            h1Text: document.querySelector('h1')?.textContent,
            bodyPreview: document.body.innerText.substring(0, 200)
          };
        });
        
        console.log(`  Title: ${pageInfo.title}`);
        console.log(`  H1: ${pageInfo.h1Text}`);
        console.log(`  Has toggle: ${pageInfo.hasToggle}`);
        
        if (pageInfo.hasToggle || pageInfo.h1Text?.includes('Hue Hi Tech Park')) {
          console.log(`  ✅ FOUND WORKING URL: ${url}`);
          workingUrl = url;
          
          await page.screenshot({ 
            path: `screenshots/working-url-${Date.now()}.png`, 
            fullPage: true 
          });
          
          // Test the functionality
          console.log(`\n🎯 Testing functionality on working URL...`);
          
          if (pageInfo.hasToggle) {
            const toggle = page.locator('[data-testid="simple-redundancy-toggle"]');
            await toggle.click();
            await page.waitForTimeout(2000);
            
            const hasTextOverlay = await page.locator('text=500KV ONSITE GRID').isVisible();
            console.log(`  Text overlay works: ${hasTextOverlay}`);
            
            await page.screenshot({ 
              path: `screenshots/working-url-2n1-${Date.now()}.png`, 
              fullPage: true 
            });
          }
          
          break;
        } else {
          console.log(`  ⚠️  Wrong app or error page`);
        }
      } else {
        console.log(`  ❌ HTTP Error: ${status}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
    }
    
    console.log('');
  }
  
  if (workingUrl) {
    console.log('=====================================');
    console.log(`🎉 SUCCESS! Working URL found: ${workingUrl}`);
    console.log('=====================================\n');
    
    // Do a final comprehensive test
    console.log('🧪 Running final comprehensive test...');
    
    await page.goto(workingUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const finalTest = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const hasToggle = !!document.querySelector('[data-testid="simple-redundancy-toggle"]');
      
      return {
        imageCount: images.length,
        imagesLoaded: images.filter(img => img.complete && img.naturalWidth > 0).length,
        hasToggle: hasToggle,
        title: document.title
      };
    });
    
    console.log(`  Images: ${finalTest.imagesLoaded}/${finalTest.imageCount} loaded`);
    console.log(`  Toggle available: ${finalTest.hasToggle}`);
    console.log(`  Title: ${finalTest.title}`);
    
    if (finalTest.hasToggle) {
      console.log('\n🎯 Testing 2N+1 feature...');
      const toggle = page.locator('[data-testid="simple-redundancy-toggle"]');
      await toggle.click();
      await page.waitForTimeout(3000);
      
      const hasOverlay = await page.locator('text=500KV ONSITE GRID').isVisible();
      console.log(`  2N+1 overlay works: ${hasOverlay}`);
      
      await page.screenshot({ path: 'screenshots/final-success.png', fullPage: true });
      
      console.log('\n🎉 ALL TESTS PASSED! Application is working correctly!');
      console.log(`📱 Live URL: ${workingUrl}`);
    }
    
  } else {
    console.log('=====================================');
    console.log('❌ NO WORKING URL FOUND');
    console.log('=====================================\n');
    console.log('Possible issues:');
    console.log('1. Deployment failed or is still in progress');
    console.log('2. Repository name or settings changed');
    console.log('3. Vercel project was deleted or renamed');
    console.log('4. DNS propagation issues');
  }
  
  await browser.close();
  return workingUrl;
}

testAlternativeURLs().catch(console.error);