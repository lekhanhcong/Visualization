const { chromium } = require('playwright');
const fs = require('fs');

if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

async function finalProductionTest() {
  console.log('🌐 FINAL PRODUCTION TEST');
  console.log('========================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  // Track all network activity
  const networkActivity = [];
  const imageActivity = [];
  
  page.on('request', request => {
    if (request.url().includes('images/') || request.url().includes('Power') || request.url().includes('_next/image')) {
      imageActivity.push({
        type: 'request',
        url: request.url(),
        timestamp: Date.now()
      });
      console.log(`📤 IMG REQUEST: ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('images/') || response.url().includes('Power') || response.url().includes('_next/image')) {
      const success = response.status() < 400;
      imageActivity.push({
        type: 'response',
        url: response.url(),
        status: response.status(),
        success: success,
        timestamp: Date.now()
      });
      console.log(`${success ? '✅' : '❌'} IMG RESPONSE: ${response.url()} - ${response.status()}`);
    }
  });
  
  // Monitor console for errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`🚨 CONSOLE ERROR: ${msg.text()}`);
    }
  });
  
  try {
    console.log('🌐 Loading production application...');
    await page.goto('https://hue-datacenter-visualization.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/prod-final-01-load.png', fullPage: true });
    
    // Check basic page structure
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        h1: document.querySelector('h1')?.textContent,
        hasImages: document.querySelectorAll('img').length,
        hasToggle: !!document.querySelector('[data-testid="simple-redundancy-toggle"]'),
        bodyText: document.body.innerText.substring(0, 300)
      };
    });
    
    console.log('\n📋 Page Structure:');
    console.log(`  Title: ${pageInfo.title}`);
    console.log(`  H1: ${pageInfo.h1}`);
    console.log(`  Images: ${pageInfo.hasImages}`);
    console.log(`  Toggle button: ${pageInfo.hasToggle}`);
    console.log(`  Body preview: ${pageInfo.bodyText.replace(/\\n/g, ' ')}`);
    
    if (!pageInfo.hasToggle) {
      console.log('\n❌ Redundancy toggle not found - checking for error messages...');
      const errorMessages = await page.evaluate(() => {
        const errorElements = Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent.includes('404') || 
          el.textContent.includes('NOT_FOUND') || 
          el.textContent.includes('Enable NEXT_PUBLIC_ENABLE_REDUNDANCY')
        );
        return errorElements.map(el => el.textContent);
      });
      
      if (errorMessages.length > 0) {
        console.log('Error messages found:');
        errorMessages.forEach(msg => console.log(`  ${msg}`));
      }
      
      console.log('========================');
      console.log('❌ DEPLOYMENT ISSUE DETECTED');
      console.log('========================\n');
      return false;
    }
    
    // Test redundancy functionality
    console.log('\n🎯 Testing redundancy functionality...');
    const toggleButton = page.locator('[data-testid="simple-redundancy-toggle"]');
    
    const initialText = await toggleButton.textContent();
    console.log(`Initial button: "${initialText}"`);
    
    // Click to 2N+1
    await toggleButton.click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'screenshots/prod-final-02-2n1.png', fullPage: true });
    
    const newText = await toggleButton.textContent();
    console.log(`After click: "${newText}"`);
    
    // Check for text overlay
    const hasTextOverlay = await page.locator('text=500KV ONSITE GRID').isVisible();
    console.log(`Text overlay visible: ${hasTextOverlay}`);
    
    // Analyze current images
    const imageState = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.map(img => ({
        src: img.src,
        alt: img.alt,
        loaded: img.complete && img.naturalWidth > 0,
        dimensions: `${img.naturalWidth}x${img.naturalHeight}`
      }));
    });
    
    console.log('\n🖼️  Current Image State:');
    imageState.forEach((img, i) => {
      console.log(`  Image ${i + 1}:`);
      console.log(`    Src: ${img.src}`);
      console.log(`    Alt: ${img.alt}`);
      console.log(`    Loaded: ${img.loaded}`);
      console.log(`    Size: ${img.dimensions}`);
    });
    
    // Toggle back to main
    await toggleButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/prod-final-03-main.png', fullPage: true });
    
    // Final validation
    const finalButtonText = await toggleButton.textContent();
    console.log(`Final button text: "${finalButtonText}"`);
    
    console.log('\n📊 FINAL RESULTS:');
    console.log(`Image requests: ${imageActivity.filter(a => a.type === 'request').length}`);
    console.log(`Image responses: ${imageActivity.filter(a => a.type === 'response').length}`);
    console.log(`Failed image responses: ${imageActivity.filter(a => a.type === 'response' && !a.success).length}`);
    console.log(`Console errors: ${consoleErrors.length}`);
    
    const success = (
      pageInfo.hasToggle && 
      hasTextOverlay && 
      imageActivity.filter(a => a.type === 'response' && !a.success).length === 0 &&
      consoleErrors.length === 0
    );
    
    console.log('\n========================');
    console.log(success ? '🎉 PRODUCTION TEST PASSED!' : '⚠️  PRODUCTION ISSUES DETECTED');
    console.log('========================\n');
    
    if (success) {
      console.log('✅ The application is working correctly on Vercel!');
      console.log('📱 URL: https://hue-datacenter-visualization.vercel.app/');
      console.log('🖼️  All images loading properly');
      console.log('🎯 2N+1 redundancy feature functional');
      console.log('📝 Text overlays displaying correctly');
    }
    
    return success;
    
  } catch (error) {
    console.error('❌ Production test failed:', error.message);
    await page.screenshot({ path: 'screenshots/prod-final-error.png', fullPage: true });
    return false;
  } finally {
    await browser.close();
  }
}

finalProductionTest().catch(console.error);