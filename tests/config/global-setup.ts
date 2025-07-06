import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for Playwright tests
 * Prepares test environment and performs initial validations
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');
  
  // Launch browser for initial setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Verify application is running
    console.log('📡 Verifying application availability...');
    await page.goto(config.webServer?.url || 'http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    // Check if redundancy feature is enabled
    console.log('⚡ Checking redundancy feature flag...');
    const redundancyButton = await page.locator('button:has-text("Show 2N+1 Redundancy")').first();
    if (await redundancyButton.count() === 0) {
      console.warn('⚠️  Warning: Redundancy feature button not found. Feature flag may be disabled.');
    } else {
      console.log('✅ Redundancy feature is enabled and accessible');
    }
    
    // Verify power map image loads (skip if not found)
    console.log('🗺️  Verifying power map image...');
    const powerMapImage = page.locator('img[alt*="Power Infrastructure Map"]');
    try {
      await powerMapImage.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✅ Power map image loaded successfully');
    } catch (error) {
      console.log('⚠️  Power map image not found or not loaded (skipping)');
    }
    
    // Check for any JavaScript errors
    const jsErrors: string[] = [];
    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });
    
    // Wait a bit to catch any errors
    await page.waitForTimeout(2000);
    
    if (jsErrors.length > 0) {
      console.warn('⚠️  JavaScript errors detected:', jsErrors);
    } else {
      console.log('✅ No JavaScript errors detected');
    }
    
    // Test redundancy feature basic functionality
    if (await redundancyButton.count() > 0) {
      console.log('🧪 Testing basic redundancy functionality...');
      await redundancyButton.click();
      
      // Wait for overlay to appear
      await page.waitForSelector('[role="dialog"][aria-modal="true"]', { timeout: 5000 });
      console.log('✅ Redundancy overlay opens successfully');
      
      // Close with ESC key
      await page.keyboard.press('Escape');
      await page.waitForSelector('[role="dialog"][aria-modal="true"]', { 
        state: 'detached', 
        timeout: 3000 
      });
      console.log('✅ ESC key functionality works');
    }
    
    console.log('🎉 Global setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;