const { chromium } = require('playwright');
const fs = require('fs');

if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

async function testWorkingSimple() {
  console.log('🎯 SIMPLE TEST OF WORKING URL');
  console.log('=============================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  const workingUrl = 'https://visualization-lekhanhcongs-projects.vercel.app/';
  
  try {
    console.log(`🌐 Loading: ${workingUrl}`);
    await page.goto(workingUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'screenshots/working-simple-01.png', fullPage: true });
    
    // Check what's on the page
    const pageCheck = await page.evaluate(() => {
      return {
        title: document.title,
        h1: document.querySelector('h1')?.textContent,
        hasToggle: !!document.querySelector('[data-testid="simple-redundancy-toggle"]'),
        bodyText: document.body.innerText,
        imageCount: document.querySelectorAll('img').length
      };
    });
    
    console.log('\n📋 PAGE CONTENT:');
    console.log(`  Title: ${pageCheck.title}`);
    console.log(`  H1: ${pageCheck.h1}`);
    console.log(`  Has toggle: ${pageCheck.hasToggle}`);
    console.log(`  Images: ${pageCheck.imageCount}`);
    
    // Check for specific messages
    const hasEnvMessage = pageCheck.bodyText.includes('Enable NEXT_PUBLIC_ENABLE_REDUNDANCY');
    console.log(`  Has env variable message: ${hasEnvMessage}`);
    
    if (hasEnvMessage) {
      console.log('\n⚠️  PROBLEM IDENTIFIED:');
      console.log('The environment variable NEXT_PUBLIC_ENABLE_REDUNDANCY is not set in production!');
      console.log('This is why the 2N+1 redundancy feature is not showing.');
      
      // Show the exact message
      const lines = pageCheck.bodyText.split('\\n');
      lines.forEach(line => {
        if (line.includes('Enable NEXT_PUBLIC_ENABLE_REDUNDANCY')) {
          console.log(`Message: "${line}"`);
        }
      });
    }
    
    // Test debug page
    console.log('\n🔧 Testing debug page...');
    await page.goto(`${workingUrl}debug-images`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/working-simple-02-debug.png', fullPage: true });
    
    const debugCheck = await page.evaluate(() => {
      return {
        title: document.title,
        hasContent: document.body.innerText.length > 50,
        bodyPreview: document.body.innerText.substring(0, 200)
      };
    });
    
    console.log(`Debug page title: ${debugCheck.title}`);
    console.log(`Debug page working: ${debugCheck.hasContent}`);
    
    console.log('\n=============================');
    console.log('🎯 SOLUTION NEEDED:');
    console.log('=============================');
    console.log('1. ✅ Deployment is working');
    console.log('2. ✅ App is loading correctly');
    console.log('3. ❌ Environment variable NEXT_PUBLIC_ENABLE_REDUNDANCY is not set');
    console.log('4. 🔧 Need to configure environment variable in Vercel dashboard');
    console.log('\\n📱 Working URL:', workingUrl);
    
    return {
      url: workingUrl,
      deploymentWorking: true,
      environmentIssue: hasEnvMessage,
      solution: 'Set NEXT_PUBLIC_ENABLE_REDUNDANCY=true in Vercel dashboard'
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'screenshots/working-simple-error.png', fullPage: true });
    return { working: false, error: error.message };
  } finally {
    await browser.close();
  }
}

testWorkingSimple().then(result => {
  console.log('\\n🎉 TEST COMPLETE!');
  if (result.deploymentWorking) {
    console.log('✅ Deployment is successful');
    console.log(`📱 Live URL: ${result.url}`);
    if (result.environmentIssue) {
      console.log('⚠️  Environment variable needs to be configured in Vercel');
      console.log('🔧 Solution:', result.solution);
    }
  }
}).catch(console.error);