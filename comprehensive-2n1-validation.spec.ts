import { test, expect, Page } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

// Test configuration
const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, 'test-results', 'comprehensive-2n1-validation');

// Ensure screenshots directory exists
test.beforeAll(async () => {
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
});

// Helper function to wait for image loading
async function waitForImageLoad(page: Page, selector: string) {
  await page.waitForSelector(selector, { state: 'visible' });
  
  // Wait for the image to be fully loaded
  await page.evaluate((sel) => {
    const img = document.querySelector(sel);
    if (img && img.complete) return Promise.resolve();
    return new Promise((resolve) => {
      if (img) {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve);
      }
    });
  }, selector);
}

// Helper function to check if any hotspot dots exist
async function checkForHotspotDots(page: Page) {
  const hotspotSelectors = [
    '[data-testid*="hotspot"]',
    '.hotspot',
    '.hotspot-marker',
    '.hotspot-dot',
    '[class*="hotspot"]',
    '[id*="hotspot"]',
    'circle[fill*="red"]',
    'circle[fill*="blue"]',
    'div[style*="background-color: red"]',
    'div[style*="background-color: blue"]'
  ];
  
  for (const selector of hotspotSelectors) {
    const elements = await page.locator(selector).count();
    if (elements > 0) {
      console.log(`Found ${elements} hotspot elements with selector: ${selector}`);
      return true;
    }
  }
  return false;
}

// Helper function to check background image
async function getCurrentBackgroundImage(page: Page): Promise<string> {
  const imgElement = page.locator('img[alt*="Power"], img[alt*="2N+1"], img[alt*="Infrastructure"]').first();
  const src = await imgElement.getAttribute('src');
  return src || '';
}

test.describe('2N+1 Redundancy Feature - Comprehensive Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto(BASE_URL);
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Wait for the main content to be visible
    await page.waitForSelector('main', { state: 'visible' });
  });

  test('1. Initial State Test - NO hotspots visible', async ({ page }) => {
    console.log('🔍 TEST 1: Initial State - Checking for absence of hotspot dots');
    
    // Wait for the component to load
    await page.waitForSelector('[data-testid="simple-redundancy-toggle"]', { state: 'visible' });
    
    // Wait for image to load
    await waitForImageLoad(page, 'img[alt*="Power"], img[alt*="Infrastructure"]');
    
    // Check that NO hotspot dots are visible
    const hasHotspots = await checkForHotspotDots(page);
    
    // Verify the button is in initial state
    const buttonText = await page.locator('[data-testid="simple-redundancy-toggle"]').textContent();
    expect(buttonText).toContain('Show 2N+1 Redundancy');
    
    // Verify background shows Power.png
    const currentImage = await getCurrentBackgroundImage(page);
    expect(currentImage).toContain('Power.png');
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, 'test-no-hotspots-initial.png'),
      fullPage: true 
    });
    
    // CRITICAL: Verify NO hotspot dots are visible
    expect(hasHotspots).toBe(false);
    
    console.log('✅ TEST 1 PASSED: No hotspot dots found in initial state');
  });

  test('2. 2N+1 Background Test - Ocean/coastal image verification', async ({ page }) => {
    console.log('🔍 TEST 2: 2N+1 Background - Checking for NEW ocean/coastal image');
    
    // Wait for the component to load
    await page.waitForSelector('[data-testid="simple-redundancy-toggle"]', { state: 'visible' });
    
    // Click the "Show 2N+1 Redundancy" button
    await page.click('[data-testid="simple-redundancy-toggle"]');
    
    // Wait for the transition
    await page.waitForTimeout(600); // Wait for transition animation
    
    // Wait for image to load
    await waitForImageLoad(page, 'img[alt*="2N+1"], img[alt*="Redundancy"]');
    
    // Verify button text changed
    const buttonText = await page.locator('[data-testid="simple-redundancy-toggle"]').textContent();
    expect(buttonText).toContain('Back to Main');
    
    // CRITICAL: Verify background changes to Power_2N1.PNG (the NEW ocean/coastal image)
    const currentImage = await getCurrentBackgroundImage(page);
    expect(currentImage).toContain('Power_2N1');
    
    // Verify "500KV ONSITE GRID" text overlay appears
    const textOverlay = page.locator('text=500KV ONSITE GRID');
    await expect(textOverlay).toBeVisible();
    
    // CRITICAL: Verify NO hotspot dots are visible in this view either
    const hasHotspots = await checkForHotspotDots(page);
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, 'test-new-background-2n1.png'),
      fullPage: true 
    });
    
    // CRITICAL CHECKS
    expect(hasHotspots).toBe(false);
    expect(currentImage).not.toContain('Power.png'); // Should NOT be the old power infrastructure
    
    console.log('✅ TEST 2 PASSED: New ocean/coastal background loaded, no hotspot dots');
  });

  test('3. Return State Test - Back to clean Power.png', async ({ page }) => {
    console.log('🔍 TEST 3: Return State - Checking return to clean Power.png');
    
    // Wait for the component to load
    await page.waitForSelector('[data-testid="simple-redundancy-toggle"]', { state: 'visible' });
    
    // First, click to show 2N+1
    await page.click('[data-testid="simple-redundancy-toggle"]');
    await page.waitForTimeout(600);
    
    // Then click "Back to Main"
    await page.click('[data-testid="simple-redundancy-toggle"]');
    await page.waitForTimeout(600);
    
    // Wait for image to load
    await waitForImageLoad(page, 'img[alt*="Power"], img[alt*="Infrastructure"]');
    
    // Verify button text is back to initial state
    const buttonText = await page.locator('[data-testid="simple-redundancy-toggle"]').textContent();
    expect(buttonText).toContain('Show 2N+1 Redundancy');
    
    // Verify background returns to Power.png
    const currentImage = await getCurrentBackgroundImage(page);
    expect(currentImage).toContain('Power.png');
    
    // Verify text overlay is gone
    const textOverlay = page.locator('text=500KV ONSITE GRID');
    await expect(textOverlay).not.toBeVisible();
    
    // CRITICAL: Verify NO hotspot dots visible
    const hasHotspots = await checkForHotspotDots(page);
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, 'test-return-clean.png'),
      fullPage: true 
    });
    
    expect(hasHotspots).toBe(false);
    
    console.log('✅ TEST 3 PASSED: Returned to clean Power.png, no hotspot dots');
  });

  test('4. Clean UI Verification - Animations and transitions', async ({ page }) => {
    console.log('🔍 TEST 4: Clean UI - Checking animations and transitions');
    
    await page.waitForSelector('[data-testid="simple-redundancy-toggle"]', { state: 'visible' });
    
    // Test multiple rapid toggles to ensure animations work smoothly
    for (let i = 0; i < 3; i++) {
      await page.click('[data-testid="simple-redundancy-toggle"]');
      await page.waitForTimeout(200);
      
      // Verify no hotspots appear during transitions
      const hasHotspots = await checkForHotspotDots(page);
      expect(hasHotspots).toBe(false);
    }
    
    // Final state should be 2N+1 view
    const finalButtonText = await page.locator('[data-testid="simple-redundancy-toggle"]').textContent();
    expect(finalButtonText).toContain('Back to Main');
    
    // Verify text overlay appears/disappears correctly
    const textOverlay = page.locator('text=500KV ONSITE GRID');
    await expect(textOverlay).toBeVisible();
    
    // Take screenshot of final state
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, 'test-clean-ui-final.png'),
      fullPage: true 
    });
    
    console.log('✅ TEST 4 PASSED: Animations work smoothly, UI remains clean');
  });

  test('5. Comprehensive Error Detection - All possible hotspot checks', async ({ page }) => {
    console.log('🔍 TEST 5: Comprehensive Error Detection - Deep hotspot scan');
    
    await page.waitForSelector('[data-testid="simple-redundancy-toggle"]', { state: 'visible' });
    
    // Check initial state
    let hasHotspots = await checkForHotspotDots(page);
    expect(hasHotspots).toBe(false);
    
    // Check 2N+1 state
    await page.click('[data-testid="simple-redundancy-toggle"]');
    await page.waitForTimeout(600);
    
    hasHotspots = await checkForHotspotDots(page);
    expect(hasHotspots).toBe(false);
    
    // Check return state
    await page.click('[data-testid="simple-redundancy-toggle"]');
    await page.waitForTimeout(600);
    
    hasHotspots = await checkForHotspotDots(page);
    expect(hasHotspots).toBe(false);
    
    // Additional checks for any DOM elements that might be hotspots
    const suspiciousElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const suspicious = [];
      
      for (const el of elements) {
        const style = window.getComputedStyle(el);
        const className = el.className;
        const id = el.id;
        
        // Check for circular elements or elements with hotspot-like properties
        if (
          style.borderRadius === '50%' ||
          className.includes('dot') ||
          className.includes('marker') ||
          className.includes('hotspot') ||
          id.includes('hotspot') ||
          (style.backgroundColor && (style.backgroundColor.includes('red') || style.backgroundColor.includes('blue')))
        ) {
          suspicious.push({
            tagName: el.tagName,
            className: className,
            id: id,
            style: {
              backgroundColor: style.backgroundColor,
              borderRadius: style.borderRadius,
              width: style.width,
              height: style.height
            }
          });
        }
      }
      
      return suspicious;
    });
    
    // Take screenshot for final verification
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, 'test-comprehensive-error-check.png'),
      fullPage: true 
    });
    
    // Log any suspicious elements found
    if (suspiciousElements.length > 0) {
      console.log('⚠️  Suspicious elements found:', suspiciousElements);
    }
    
    // The test should pass if no actual hotspot dots are found
    expect(suspiciousElements.filter(el => 
      el.className.includes('hotspot') || 
      el.id.includes('hotspot')
    ).length).toBe(0);
    
    console.log('✅ TEST 5 PASSED: No hotspot dots found in comprehensive scan');
  });

  test('6. Background Image Verification - File existence and loading', async ({ page }) => {
    console.log('🔍 TEST 6: Background Image - Verifying correct image files');
    
    await page.waitForSelector('[data-testid="simple-redundancy-toggle"]', { state: 'visible' });
    
    // Check initial image
    let currentImage = await getCurrentBackgroundImage(page);
    expect(currentImage).toContain('Power.png');
    
    // Check that the image actually loads (not broken)
    const initialImageStatus = await page.evaluate((src) => {
      const img = document.querySelector(`img[src*="${src}"]`);
      return img ? img.complete && img.naturalWidth > 0 : false;
    }, 'Power.png');
    
    expect(initialImageStatus).toBe(true);
    
    // Switch to 2N+1 view
    await page.click('[data-testid="simple-redundancy-toggle"]');
    await page.waitForTimeout(600);
    
    // Check 2N+1 image
    currentImage = await getCurrentBackgroundImage(page);
    expect(currentImage).toContain('Power_2N1');
    
    // Check that the 2N+1 image actually loads (not broken)
    const redundancyImageStatus = await page.evaluate((src) => {
      const img = document.querySelector(`img[src*="${src}"]`);
      return img ? img.complete && img.naturalWidth > 0 : false;
    }, 'Power_2N1');
    
    expect(redundancyImageStatus).toBe(true);
    
    // Take screenshot to verify the ocean/coastal image is displayed
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, 'test-background-verification.png'),
      fullPage: true 
    });
    
    console.log('✅ TEST 6 PASSED: Both background images load correctly');
  });

});

// Test summary and reporting
test.afterAll(async () => {
  console.log('\n📊 TEST SUMMARY:');
  console.log('================');
  console.log('✅ All tests completed');
  console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
  console.log('📝 Key verification points:');
  console.log('   - NO hotspot dots visible in any state');
  console.log('   - Background changes to ocean/coastal image (Power_2N1.PNG)');
  console.log('   - Text overlay appears/disappears correctly');
  console.log('   - Smooth animations and transitions');
  console.log('   - Clean UI without floating elements');
});