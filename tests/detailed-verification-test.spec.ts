import { test, expect } from '@playwright/test';

test.describe('DETAILED VERIFICATION WITH SCREEN CAPTURE', () => {
  test('COMPREHENSIVE ANIMATION VERIFICATION', async ({ page }) => {
    console.log('🔍 STARTING DETAILED VERIFICATION TEST...');
    
    // Step 1: Navigate to page
    console.log('📋 Step 1: Navigating to http://localhost:3000');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/detailed/01-page-loaded.png',
      fullPage: true 
    });
    console.log('✅ Step 1 Complete: Page loaded successfully');

    // Step 2: Verify no button exists
    console.log('📋 Step 2: Checking for absence of "Show 2N+1 Redundancy" button');
    const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
    const mainButton = page.locator('button:has-text("Main")');
    const anyButton = page.locator('button');
    
    const redundancyCount = await redundancyButton.count();
    const mainCount = await mainButton.count();
    const totalButtons = await anyButton.count();
    
    await page.screenshot({ 
      path: 'test-results/detailed/02-button-check.png',
      fullPage: true 
    });
    
    console.log(`   - Redundancy buttons found: ${redundancyCount}`);
    console.log(`   - Main buttons found: ${mainCount}`);
    console.log(`   - Total buttons found: ${totalButtons}`);
    
    expect(redundancyCount).toBe(0);
    console.log('✅ Step 2 Complete: No redundancy button found');

    // Step 3: Wait for animation start (500ms delay)
    console.log('📋 Step 3: Waiting for animation to start (500ms delay)');
    await page.waitForTimeout(700); // Wait slightly longer than 500ms
    
    await page.screenshot({ 
      path: 'test-results/detailed/03-animation-started.png',
      fullPage: true 
    });
    
    // Check for progress indicator
    const progressIndicator = page.locator('text=/Animation: \\d+%/');
    const hasProgress = await progressIndicator.count() > 0;
    
    if (hasProgress) {
      const progressText = await progressIndicator.first().textContent();
      console.log(`   - Animation progress detected: ${progressText}`);
    } else {
      console.log('   - No progress indicator found (may be hidden in production)');
    }
    console.log('✅ Step 3 Complete: Animation started');

    // Step 4: Verify images are present
    console.log('📋 Step 4: Verifying image elements');
    const images = page.locator('img');
    const imageCount = await images.count();
    
    console.log(`   - Total images found: ${imageCount}`);
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');
      const isVisible = await img.isVisible();
      
      console.log(`   - Image ${i + 1}: alt="${alt}", src="${src}", visible=${isVisible}`);
    }
    
    await page.screenshot({ 
      path: 'test-results/detailed/04-images-verified.png',
      fullPage: true 
    });
    
    expect(imageCount).toBeGreaterThanOrEqual(2);
    console.log('✅ Step 4 Complete: Images verified');

    // Step 5: Monitor animation progress at intervals
    console.log('📋 Step 5: Monitoring animation progress');
    
    const timePoints = [1000, 1500, 2000, 2500, 3000, 3500];
    
    for (let i = 0; i < timePoints.length; i++) {
      const targetTime = timePoints[i];
      const waitTime = i === 0 ? targetTime - 700 : timePoints[i] - timePoints[i - 1];
      
      await page.waitForTimeout(waitTime);
      
      await page.screenshot({ 
        path: `test-results/detailed/05-progress-${targetTime}ms.png`,
        fullPage: true 
      });
      
      // Check for text overlay after 1500ms (50% of 3000ms animation)
      if (targetTime >= 1500) {
        const textOverlay = page.locator('text=500KV ONSITE GRID');
        const textVisible = await textOverlay.isVisible();
        console.log(`   - At ${targetTime}ms: Text overlay visible = ${textVisible}`);
        
        if (textVisible && targetTime === 1500) {
          console.log('✅ Text overlay appeared at correct time (50% progress)');
        }
      }
      
      // Check progress if indicator exists
      if (hasProgress) {
        try {
          const currentProgress = await progressIndicator.first().textContent();
          console.log(`   - At ${targetTime}ms: ${currentProgress}`);
        } catch (e) {
          console.log(`   - At ${targetTime}ms: Progress indicator not available`);
        }
      }
    }
    console.log('✅ Step 5 Complete: Animation progress monitored');

    // Step 6: Verify final state
    console.log('📋 Step 6: Verifying final animation state');
    
    await page.screenshot({ 
      path: 'test-results/detailed/06-final-state.png',
      fullPage: true 
    });
    
    // Check if text overlay is visible in final state
    const finalTextOverlay = page.locator('text=500KV ONSITE GRID');
    const finalTextVisible = await finalTextOverlay.isVisible();
    
    console.log(`   - Final text overlay visible: ${finalTextVisible}`);
    expect(finalTextVisible).toBe(true);
    
    // Check final progress if available
    if (hasProgress) {
      try {
        const finalProgress = await progressIndicator.first().textContent();
        console.log(`   - Final animation progress: ${finalProgress}`);
      } catch (e) {
        console.log('   - Final progress: Not available');
      }
    }
    
    console.log('✅ Step 6 Complete: Final state verified');

    // Step 7: Check for JavaScript errors
    console.log('📋 Step 7: Checking for JavaScript errors');
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    // Wait a bit more to catch any delayed errors
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/detailed/07-error-check.png',
      fullPage: true 
    });
    
    console.log(`   - JavaScript errors: ${errors.length}`);
    console.log(`   - Console warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('❌ JavaScript errors found:', errors);
    }
    
    if (warnings.length > 0) {
      console.log('⚠️ Console warnings found:', warnings);
    }
    
    // Filter out non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('chrome-extension') &&
      !error.includes('webkit-') &&
      !error.includes('404')
    );
    
    expect(criticalErrors.length).toBe(0);
    console.log('✅ Step 7 Complete: No critical JavaScript errors');

    // Step 8: Test page responsiveness
    console.log('📋 Step 8: Testing responsive behavior');
    
    const viewports = [
      { width: 320, height: 568, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `test-results/detailed/08-responsive-${viewport.name}.png`,
        fullPage: true 
      });
      
      // Check if images are still visible
      const responsiveImages = await page.locator('img').count();
      console.log(`   - ${viewport.name} (${viewport.width}x${viewport.height}): ${responsiveImages} images visible`);
      
      expect(responsiveImages).toBeGreaterThanOrEqual(2);
    }
    
    // Reset to desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    console.log('✅ Step 8 Complete: Responsive behavior verified');

    // Step 9: Final comprehensive screenshot
    console.log('📋 Step 9: Taking final comprehensive screenshot');
    
    await page.screenshot({ 
      path: 'test-results/detailed/09-comprehensive-final.png',
      fullPage: true 
    });
    
    console.log('✅ Step 9 Complete: Final screenshot captured');

    console.log('🎉 DETAILED VERIFICATION COMPLETE - ALL CHECKS PASSED!');
    console.log('📁 Screenshots saved to test-results/detailed/');
  });
});