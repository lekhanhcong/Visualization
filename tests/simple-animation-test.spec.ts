import { test, expect } from '@playwright/test';

test.describe('Simple Animation Tests with Screen Capture', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly without global setup
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('Animation system initialization and progress capture', async ({ page }) => {
    console.log('🚀 Starting animation test with screen capture...');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/01-initial-state.png',
      fullPage: true 
    });
    console.log('📸 Screenshot 1: Initial state captured');

    // Wait for animation to start (500ms delay)
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'test-results/02-animation-started.png',
      fullPage: true 
    });
    console.log('📸 Screenshot 2: Animation started');

    // Check for animation progress element
    const hasProgressIndicator = await page.locator('text=/Animation: \\d+%/').count() > 0;
    if (hasProgressIndicator) {
      const progressText = await page.locator('text=/Animation: \\d+%/').first().textContent();
      console.log(`✅ Animation progress found: ${progressText}`);
    } else {
      console.log('⚠️ Animation progress indicator not found');
    }

    // Wait for mid-animation (1.5s)
    await page.waitForTimeout(1500);
    await page.screenshot({ 
      path: 'test-results/03-mid-animation.png',
      fullPage: true 
    });
    console.log('📸 Screenshot 3: Mid-animation captured');

    // Check for text overlay (should appear around 50% progress)
    const textOverlay = page.locator('text=500KV ONSITE GRID');
    const textVisible = await textOverlay.isVisible();
    console.log(`🎯 Text overlay visible: ${textVisible}`);

    // Wait for animation completion (total ~3.5s)
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'test-results/04-animation-complete.png',
      fullPage: true 
    });
    console.log('📸 Screenshot 4: Animation complete');

    // Check final state
    if (hasProgressIndicator) {
      const finalProgress = await page.locator('text=/Animation: \\d+%/').first().textContent();
      console.log(`🏁 Final animation progress: ${finalProgress}`);
    }

    // Verify no "Show 2N+1 Redundancy" button exists
    const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
    const buttonCount = await redundancyButton.count();
    console.log(`🚫 Redundancy button count: ${buttonCount} (should be 0)`);
    expect(buttonCount).toBe(0);

    // Verify images are present
    const images = page.locator('img');
    const imageCount = await images.count();
    console.log(`🖼️ Total images found: ${imageCount}`);
    expect(imageCount).toBeGreaterThanOrEqual(2);

    console.log('✅ Animation test completed successfully!');
  });

  test('Check for JavaScript errors and console warnings', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Listen for console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`❌ Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
        console.log(`⚠️ Console Warning: ${msg.text()}`);
      }
    });

    // Listen for page errors
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log(`💥 Page Error: ${error.message}`);
    });

    // Wait for full animation cycle
    await page.waitForTimeout(5000);
    
    // Take error check screenshot
    await page.screenshot({ 
      path: 'test-results/05-error-check.png',
      fullPage: true 
    });

    console.log(`📊 Test Summary:`);
    console.log(`   - JavaScript Errors: ${errors.length}`);
    console.log(`   - Console Warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log(`❌ Errors found:`, errors);
    }
    
    if (warnings.length > 0) {
      console.log(`⚠️ Warnings found:`, warnings);
    }

    // Fail test if critical errors found
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('chrome-extension') &&
      !error.includes('webkit-')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('Visual regression test - capture animation frames', async ({ page }) => {
    console.log('🎬 Starting visual regression test...');
    
    const frameCaptures = [
      { delay: 0, name: '00-start' },
      { delay: 500, name: '01-500ms' },
      { delay: 1000, name: '02-1000ms' },
      { delay: 1500, name: '03-1500ms' },
      { delay: 2000, name: '04-2000ms' },
      { delay: 2500, name: '05-2500ms' },
      { delay: 3000, name: '06-3000ms' },
      { delay: 3500, name: '07-complete' }
    ];

    for (const frame of frameCaptures) {
      await page.waitForTimeout(frame.delay === 0 ? 100 : frame.delay - (frameCaptures[frameCaptures.indexOf(frame) - 1]?.delay || 0));
      
      await page.screenshot({ 
        path: `test-results/frames/frame-${frame.name}.png`,
        fullPage: true 
      });
      
      console.log(`📸 Captured frame: ${frame.name} at ${frame.delay}ms`);
    }

    console.log('✅ Visual regression test completed!');
  });

  test('Performance and memory test', async ({ page }) => {
    console.log('⚡ Starting performance test...');
    
    // Get initial performance metrics
    const initialMetrics = await page.evaluate(() => {
      return {
        memory: (performance as any).memory?.usedJSHeapSize || 0,
        timing: performance.now()
      };
    });

    // Wait for animation to complete
    await page.waitForTimeout(4000);

    // Get final performance metrics
    const finalMetrics = await page.evaluate(() => {
      return {
        memory: (performance as any).memory?.usedJSHeapSize || 0,
        timing: performance.now()
      };
    });

    const memoryIncrease = (finalMetrics.memory - initialMetrics.memory) / (1024 * 1024); // MB
    const duration = finalMetrics.timing - initialMetrics.timing;

    console.log(`📊 Performance Metrics:`);
    console.log(`   - Duration: ${duration.toFixed(2)}ms`);
    console.log(`   - Memory increase: ${memoryIncrease.toFixed(2)}MB`);
    console.log(`   - Initial memory: ${(initialMetrics.memory / (1024 * 1024)).toFixed(2)}MB`);
    console.log(`   - Final memory: ${(finalMetrics.memory / (1024 * 1024)).toFixed(2)}MB`);

    // Take performance screenshot
    await page.screenshot({ 
      path: 'test-results/06-performance-check.png',
      fullPage: true 
    });

    // Memory should not increase dramatically (allow up to 50MB increase)
    expect(memoryIncrease).toBeLessThan(50);
    
    console.log('✅ Performance test passed!');
  });
});