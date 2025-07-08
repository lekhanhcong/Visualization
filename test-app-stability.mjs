import { chromium } from 'playwright';

async function testAppStability() {
  console.log('🚀 Starting application stability test...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    console.log('📱 Navigating to application...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/1-initial-load.png',
      fullPage: true 
    });
    console.log('✅ Initial page load successful');
    
    // Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Check for JavaScript errors
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    // Test basic interactions
    console.log('🔄 Testing basic interactions...');
    
    // Wait for content to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Check if redundancy feature is available
    const redundancyButton = await page.locator('[data-testid="simple-redundancy-toggle"]').first();
    
    if (await redundancyButton.isVisible()) {
      console.log('🎯 Found redundancy feature, testing...');
      
      // Click redundancy button
      await redundancyButton.click();
      await page.waitForTimeout(2000);
      
      // Take screenshot after redundancy activation
      await page.screenshot({ 
        path: 'test-results/2-redundancy-active.png',
        fullPage: true 
      });
      
      // Click again to deactivate
      await redundancyButton.click();
      await page.waitForTimeout(2000);
      
      // Take screenshot after deactivation
      await page.screenshot({ 
        path: 'test-results/3-redundancy-inactive.png',
        fullPage: true 
      });
      
      console.log('✅ Redundancy feature test completed');
    } else {
      console.log('⚠️ Redundancy feature not found, checking other elements...');
    }
    
    // Test modal interactions if available
    const modalTriggers = await page.locator('button, [role="button"], .hotspot').all();
    
    if (modalTriggers.length > 0) {
      console.log(`🎯 Found ${modalTriggers.length} interactive elements, testing first one...`);
      
      try {
        await modalTriggers[0].click();
        await page.waitForTimeout(1000);
        
        // Take screenshot with modal open
        await page.screenshot({ 
          path: 'test-results/4-modal-open.png',
          fullPage: true 
        });
        
        // Try to close modal
        const closeButton = await page.locator('[data-testid="close"], .close, button:has-text("Close"), [aria-label="Close"]').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(1000);
        } else {
          // Try escape key
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
        }
        
        // Take screenshot after modal close
        await page.screenshot({ 
          path: 'test-results/5-modal-closed.png',
          fullPage: true 
        });
        
        console.log('✅ Modal interaction test completed');
      } catch (error) {
        console.log('⚠️ Modal interaction failed:', error.message);
      }
    }
    
    // Test responsive design
    console.log('📱 Testing responsive design...');
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'test-results/6-tablet-view.png',
      fullPage: true 
    });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'test-results/7-mobile-view.png',
      fullPage: true 
    });
    
    console.log('✅ Responsive design test completed');
    
    // Report results
    console.log('\n📊 Test Results:');
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`JavaScript Errors: ${jsErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('\n🔴 Console Errors:');
      consoleErrors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    }
    
    if (jsErrors.length > 0) {
      console.log('\n🔴 JavaScript Errors:');
      jsErrors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    }
    
    if (consoleErrors.length === 0 && jsErrors.length === 0) {
      console.log('✅ No errors detected - Application appears stable!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take error screenshot
    await page.screenshot({ 
      path: 'test-results/error-state.png',
      fullPage: true 
    });
    
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testAppStability().catch(console.error);