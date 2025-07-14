/**
 * Manual 2N+1 Feature Test Script
 * Tests the 2N+1 redundancy feature by simulating user interactions
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  url: 'http://localhost:3000',
  timeout: 30000,
  screenshots: {
    dir: './test-screenshots',
    enabled: true
  }
};

// Create screenshots directory if it doesn't exist
if (TEST_CONFIG.screenshots.enabled) {
  const screenshotsDir = path.resolve(__dirname, TEST_CONFIG.screenshots.dir);
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
}

async function runTest() {
  let browser;
  let page;
  
  try {
    console.log('🚀 Starting 2N+1 Feature Test...');
    
    // Launch browser
    browser = await chromium.launch({ 
      headless: false,  // Set to true for headless mode
      slowMo: 1000      // Slow down for better observation
    });
    
    page = await browser.newPage();
    
    // Set viewport size
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('📋 Test Steps:');
    console.log('1. Navigate to the application');
    console.log('2. Click "Show 2N+1 Redundancy" button');
    console.log('3. Check background image and text overlay');
    console.log('4. Click "Back to Main" to return');
    console.log('5. Verify the background returns to original');
    console.log('');
    
    // Step 1: Navigate to application
    console.log('Step 1: Navigating to application...');
    await page.goto(TEST_CONFIG.url, { waitUntil: 'networkidle' });
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Take initial screenshot
    if (TEST_CONFIG.screenshots.enabled) {
      await page.screenshot({ 
        path: path.join(TEST_CONFIG.screenshots.dir, '1-initial-state.png'),
        fullPage: true 
      });
      console.log('✅ Initial state screenshot saved');
    }
    
    // Check if page loaded correctly
    const title = await page.title();
    console.log(`✅ Page loaded: ${title}`);
    
    // Step 2: Look for the 2N+1 button
    console.log('Step 2: Looking for 2N+1 Redundancy button...');
    
    const buttonSelector = '[data-testid="simple-redundancy-toggle"]';
    await page.waitForSelector(buttonSelector, { timeout: 10000 });
    
    const buttonText = await page.textContent(buttonSelector);
    console.log(`✅ Found button: "${buttonText}"`);
    
    // Check initial background image
    const initialImageSrc = await page.evaluate(() => {
      const img = document.querySelector('img[alt*="Power Infrastructure"], img[alt*="Main Power Infrastructure"]');
      return img ? img.src : null;
    });
    
    console.log(`✅ Initial background image: ${initialImageSrc}`);
    
    // Step 3: Click the button to show 2N+1 view
    console.log('Step 3: Clicking "Show 2N+1 Redundancy" button...');
    
    await page.click(buttonSelector);
    
    // Wait for transition
    await page.waitForTimeout(1000);
    
    // Check button text changed
    const newButtonText = await page.textContent(buttonSelector);
    console.log(`✅ Button text changed to: "${newButtonText}"`);
    
    // Check if background image changed
    const newImageSrc = await page.evaluate(() => {
      const img = document.querySelector('img[alt*="2N+1"], img[alt*="2N+1 Redundancy View"]');
      return img ? img.src : null;
    });
    
    console.log(`✅ New background image: ${newImageSrc}`);
    
    // Check if "500KV ONSITE GRID" text appears
    const textOverlayVisible = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => {
        return el.textContent && el.textContent.includes('500KV ONSITE GRID');
      });
      return elements.length > 0;
    });
    
    console.log(`✅ "500KV ONSITE GRID" text visible: ${textOverlayVisible ? 'YES' : 'NO'}`);
    
    // Get text overlay details
    const textOverlayDetails = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => {
        return el.textContent && el.textContent.includes('500KV ONSITE GRID');
      });
      
      if (elements.length > 0) {
        const element = elements[0];
        const styles = window.getComputedStyle(element);
        return {
          text: element.textContent,
          color: styles.color,
          fontSize: styles.fontSize,
          position: {
            left: element.offsetLeft,
            top: element.offsetTop
          }
        };
      }
      return null;
    });
    
    if (textOverlayDetails) {
      console.log('✅ Text overlay details:', JSON.stringify(textOverlayDetails, null, 2));
    }
    
    // Take 2N+1 view screenshot
    if (TEST_CONFIG.screenshots.enabled) {
      await page.screenshot({ 
        path: path.join(TEST_CONFIG.screenshots.dir, '2-2n1-state.png'),
        fullPage: true 
      });
      console.log('✅ 2N+1 view screenshot saved');
    }
    
    // Step 4: Describe the background image
    console.log('Step 4: Analyzing background image...');
    
    // Check image dimensions and properties
    const imageInfo = await page.evaluate(() => {
      const img = document.querySelector('img[alt*="2N+1"]');
      if (img) {
        return {
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          displayWidth: img.clientWidth,
          displayHeight: img.clientHeight,
          src: img.src
        };
      }
      return null;
    });
    
    if (imageInfo) {
      console.log('✅ Image info:', JSON.stringify(imageInfo, null, 2));
    }
    
    // Step 5: Click "Back to Main" to return
    console.log('Step 5: Clicking "Back to Main" button...');
    
    await page.click(buttonSelector);
    
    // Wait for transition
    await page.waitForTimeout(1000);
    
    // Check button text changed back
    const finalButtonText = await page.textContent(buttonSelector);
    console.log(`✅ Button text changed back to: "${finalButtonText}"`);
    
    // Check if background image returned to original
    const finalImageSrc = await page.evaluate(() => {
      const img = document.querySelector('img[alt*="Main Power Infrastructure"], img[alt*="Power Infrastructure"]');
      return img ? img.src : null;
    });
    
    console.log(`✅ Final background image: ${finalImageSrc}`);
    
    // Check if text overlay is hidden
    const textOverlayHidden = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => {
        return el.textContent && el.textContent.includes('500KV ONSITE GRID');
      });
      return elements.length === 0;
    });
    
    console.log(`✅ "500KV ONSITE GRID" text hidden: ${textOverlayHidden ? 'YES' : 'NO'}`);
    
    // Take final screenshot
    if (TEST_CONFIG.screenshots.enabled) {
      await page.screenshot({ 
        path: path.join(TEST_CONFIG.screenshots.dir, '3-returned-state.png'),
        fullPage: true 
      });
      console.log('✅ Final state screenshot saved');
    }
    
    // Step 6: Verify image comparison
    console.log('Step 6: Verifying image comparison...');
    
    const imageComparison = {
      initial: initialImageSrc,
      changed: newImageSrc,
      final: finalImageSrc,
      changedCorrectly: initialImageSrc !== newImageSrc,
      returnedCorrectly: initialImageSrc === finalImageSrc
    };
    
    console.log('✅ Image comparison:', JSON.stringify(imageComparison, null, 2));
    
    // Test Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('================');
    console.log(`✅ Page loaded successfully: ${title}`);
    console.log(`✅ Button found and functional: "${buttonText}" -> "${newButtonText}" -> "${finalButtonText}"`);
    console.log(`✅ Background image changes: ${imageComparison.changedCorrectly ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Background image returns: ${imageComparison.returnedCorrectly ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Text overlay appears: ${textOverlayVisible ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Text overlay hides: ${textOverlayHidden ? 'PASS' : 'FAIL'}`);
    
    // Background image description
    console.log('\n🖼️ BACKGROUND IMAGE ANALYSIS:');
    console.log('=============================');
    
    if (initialImageSrc && initialImageSrc.includes('Power.png')) {
      console.log('✅ Default view shows: Power.png (Main power infrastructure diagram)');
    }
    
    if (newImageSrc && newImageSrc.includes('Power_2N1.PNG')) {
      console.log('✅ 2N+1 view shows: Power_2N1.PNG (2N+1 redundancy diagram)');
    }
    
    console.log('\n✅ Test completed successfully!');
    
    // Keep browser open for 5 seconds to observe
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Take error screenshot
    if (page && TEST_CONFIG.screenshots.enabled) {
      await page.screenshot({ 
        path: path.join(TEST_CONFIG.screenshots.dir, 'error-state.png'),
        fullPage: true 
      });
      console.log('❌ Error screenshot saved');
    }
    
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
runTest().catch(console.error);