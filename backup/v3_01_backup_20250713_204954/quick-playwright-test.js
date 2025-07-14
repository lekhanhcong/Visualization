const { chromium } = require('playwright');
const fs = require('fs');

// Create directories
if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

async function quickTest() {
  console.log('🚀 Quick Playwright Test Starting...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    timeout: 10000 
  });
  
  const page = await browser.newPage();
  
  try {
    // Test 1: Basic Load
    console.log('Test 1: Loading page...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    await page.screenshot({ path: 'screenshots/test1-load.png' });
    console.log('✅ Page loaded\n');
    
    // Test 2: Check Title
    console.log('Test 2: Checking title...');
    const title = await page.locator('h1').textContent();
    console.log(`Title found: "${title}"`);
    console.log('✅ Title exists\n');
    
    // Test 3: Check 2N+1 Button
    console.log('Test 3: Looking for 2N+1 button...');
    const button = page.locator('[data-testid="simple-redundancy-toggle"]');
    const buttonCount = await button.count();
    
    if (buttonCount > 0) {
      console.log('✅ 2N+1 button found!');
      
      // Click it
      await button.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/test3-clicked.png' });
      console.log('✅ Button clicked successfully\n');
    } else {
      console.log('❌ 2N+1 button not found\n');
    }
    
    // Test 4: Check for errors
    console.log('Test 4: Checking for errors...');
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    if (errors.length === 0) {
      console.log('✅ No console errors\n');
    } else {
      console.log('❌ Errors found:', errors, '\n');
    }
    
    // Final screenshot
    await page.screenshot({ path: 'screenshots/test-final.png', fullPage: true });
    
    console.log('🎉 Test completed!');
    console.log('📸 Screenshots saved in ./screenshots/');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    try {
      await page.screenshot({ path: 'screenshots/error.png' });
    } catch (e) {}
  } finally {
    await browser.close();
  }
}

quickTest();