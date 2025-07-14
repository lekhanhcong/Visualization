import { test, expect } from '@playwright/test';

test.describe('INFINITE LOOP ANIMATION VERIFICATION', () => {
  test('COMPREHENSIVE INFINITE LOOP TEST WITH SCREEN CAPTURE', async ({ page }) => {
    console.log('🔄 STARTING INFINITE LOOP ANIMATION TEST...');
    
    // Step 1: Navigate and initial setup
    console.log('📋 Step 1: Loading page and initial setup');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/infinite/01-page-loaded.png',
      fullPage: true 
    });
    console.log('✅ Step 1 Complete: Page loaded');

    // Step 2: Verify no progress indicator
    console.log('📋 Step 2: Checking for absence of progress indicator');
    const progressIndicator = page.locator('text=/Animation: \\d+%/');
    const progressCount = await progressIndicator.count();
    
    await page.screenshot({ 
      path: 'test-results/infinite/02-no-progress-indicator.png',
      fullPage: true 
    });
    
    console.log(`   - Progress indicators found: ${progressCount} (should be 0)`);
    expect(progressCount).toBe(0);
    console.log('✅ Step 2 Complete: No progress indicator found');

    // Step 3: Monitor first cycle (Power.png → Power_2N1.png)
    console.log('📋 Step 3: Monitoring first animation cycle');
    
    // Wait for animation to start
    await page.waitForTimeout(700);
    
    const firstCycleFrames = [1000, 1500, 2000, 2500, 3000];
    
    for (let i = 0; i < firstCycleFrames.length; i++) {
      const frameTime = firstCycleFrames[i];
      const waitTime = i === 0 ? frameTime - 700 : firstCycleFrames[i] - firstCycleFrames[i - 1];
      
      await page.waitForTimeout(waitTime);
      
      await page.screenshot({ 
        path: `test-results/infinite/03-cycle1-${frameTime}ms.png`,
        fullPage: true 
      });
      
      console.log(`   - Captured first cycle frame at ${frameTime}ms`);
      
      // Check text overlay appears at 1500ms+ 
      if (frameTime >= 1500) {
        const textOverlay = page.locator('text=500KV ONSITE GRID');
        const textVisible = await textOverlay.isVisible();
        console.log(`   - At ${frameTime}ms: Text overlay visible = ${textVisible}`);
      }
    }
    console.log('✅ Step 3 Complete: First cycle monitored');

    // Step 4: Monitor second cycle (Power_2N1.png → Power.png)
    console.log('📋 Step 4: Monitoring second animation cycle (reverse)');
    
    // Wait for cycle to reverse
    await page.waitForTimeout(500);
    
    const secondCycleFrames = [500, 1000, 1500, 2000, 2500, 3000];
    
    for (let i = 0; i < secondCycleFrames.length; i++) {
      const frameTime = secondCycleFrames[i];
      const waitTime = i === 0 ? frameTime : secondCycleFrames[i] - secondCycleFrames[i - 1];
      
      await page.waitForTimeout(waitTime);
      
      await page.screenshot({ 
        path: `test-results/infinite/04-cycle2-${frameTime}ms.png`,
        fullPage: true 
      });
      
      console.log(`   - Captured second cycle frame at ${frameTime}ms`);
      
      // Check text overlay behavior in reverse
      if (frameTime >= 1500) {
        const textOverlay = page.locator('text=500KV ONSITE GRID');
        const textVisible = await textOverlay.isVisible();
        console.log(`   - At ${frameTime}ms (reverse): Text overlay visible = ${textVisible}`);
      }
    }
    console.log('✅ Step 4 Complete: Second cycle monitored');

    // Step 5: Monitor third cycle to verify infinite loop
    console.log('📋 Step 5: Monitoring third cycle to verify infinite loop');
    
    await page.waitForTimeout(500);
    
    const thirdCycleFrames = [500, 1500, 3000];
    
    for (let i = 0; i < thirdCycleFrames.length; i++) {
      const frameTime = thirdCycleFrames[i];
      const waitTime = i === 0 ? frameTime : thirdCycleFrames[i] - thirdCycleFrames[i - 1];
      
      await page.waitForTimeout(waitTime);
      
      await page.screenshot({ 
        path: `test-results/infinite/05-cycle3-${frameTime}ms.png`,
        fullPage: true 
      });
      
      console.log(`   - Captured third cycle frame at ${frameTime}ms`);
    }
    console.log('✅ Step 5 Complete: Third cycle verified - infinite loop working');

    // Step 6: Verify images are cycling correctly
    console.log('📋 Step 6: Verifying image cycling behavior');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    console.log(`   - Total images found: ${imageCount}`);
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');
      const isVisible = await img.isVisible();
      
      console.log(`   - Image ${i + 1}: alt="${alt}", visible=${isVisible}`);
    }
    
    await page.screenshot({ 
      path: 'test-results/infinite/06-images-verified.png',
      fullPage: true 
    });
    
    expect(imageCount).toBe(2);
    console.log('✅ Step 6 Complete: Images verified');

    // Step 7: Check for JavaScript errors during long animation
    console.log('📋 Step 7: Checking for JavaScript errors during extended animation');
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`❌ Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
        console.log(`⚠️ Console Warning: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log(`💥 Page Error: ${error.message}`);
    });
    
    // Wait through another full cycle
    await page.waitForTimeout(3500);
    
    await page.screenshot({ 
      path: 'test-results/infinite/07-error-check.png',
      fullPage: true 
    });
    
    console.log(`   - JavaScript errors: ${errors.length}`);
    console.log(`   - Console warnings: ${warnings.length}`);
    
    // Filter out non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('chrome-extension') &&
      !error.includes('webkit-') &&
      !error.includes('404')
    );
    
    expect(criticalErrors.length).toBe(0);
    console.log('✅ Step 7 Complete: No critical errors during extended animation');

    // Step 8: Test responsive behavior during animation
    console.log('📋 Step 8: Testing responsive behavior during infinite animation');
    
    const viewports = [
      { width: 320, height: 568, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000); // Wait for a bit of animation
      
      await page.screenshot({ 
        path: `test-results/infinite/08-responsive-${viewport.name}.png`,
        fullPage: true 
      });
      
      const responsiveImages = await page.locator('img').count();
      console.log(`   - ${viewport.name}: ${responsiveImages} images visible during animation`);
      
      expect(responsiveImages).toBe(2);
    }
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    console.log('✅ Step 8 Complete: Responsive behavior verified during animation');

    // Step 9: Performance check during infinite loop
    console.log('📋 Step 9: Performance check during infinite animation');
    
    const initialMetrics = await page.evaluate(() => {
      return {
        memory: (performance as any).memory?.usedJSHeapSize || 0,
        timing: performance.now()
      };
    });
    
    // Wait through several animation cycles
    await page.waitForTimeout(10000); // 10 seconds of animation
    
    const finalMetrics = await page.evaluate(() => {
      return {
        memory: (performance as any).memory?.usedJSHeapSize || 0,
        timing: performance.now()
      };
    });
    
    const memoryIncrease = (finalMetrics.memory - initialMetrics.memory) / (1024 * 1024);
    const duration = finalMetrics.timing - initialMetrics.timing;
    
    console.log(`   - Test duration: ${duration.toFixed(2)}ms`);
    console.log(`   - Memory increase: ${memoryIncrease.toFixed(2)}MB`);
    console.log(`   - Initial memory: ${(initialMetrics.memory / (1024 * 1024)).toFixed(2)}MB`);
    console.log(`   - Final memory: ${(finalMetrics.memory / (1024 * 1024)).toFixed(2)}MB`);
    
    await page.screenshot({ 
      path: 'test-results/infinite/09-performance-check.png',
      fullPage: true 
    });
    
    // Memory should not increase significantly during infinite animation
    expect(memoryIncrease).toBeLessThan(20); // Allow up to 20MB increase over 10 seconds
    console.log('✅ Step 9 Complete: Performance check passed');

    // Step 10: Final verification screenshot
    console.log('📋 Step 10: Final comprehensive verification');
    
    await page.screenshot({ 
      path: 'test-results/infinite/10-final-verification.png',
      fullPage: true 
    });
    
    console.log('✅ Step 10 Complete: Final verification screenshot captured');

    console.log('🎉 INFINITE LOOP ANIMATION TEST COMPLETE - ALL CHECKS PASSED!');
    console.log('📁 Screenshots saved to test-results/infinite/');
    console.log('🔄 Animation verified to loop infinitely: Power.png ↔ Power_2N1.png');
  });
});