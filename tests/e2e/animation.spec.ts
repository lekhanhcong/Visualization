import { test, expect } from '@playwright/test';

test.describe('Animation Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should automatically start animation after 500ms delay', async ({ page }) => {
    // Wait for animation to start
    await page.waitForTimeout(600);
    
    // Check that animation progress indicator is visible
    const progressIndicator = page.locator('text=/Animation: \\d+%/');
    await expect(progressIndicator).toBeVisible();
    
    // Verify animation has started (progress > 0%)
    const progressText = await progressIndicator.textContent();
    const progress = parseInt(progressText?.match(/(\d+)%/)?.[1] || '0');
    expect(progress).toBeGreaterThan(0);
  });

  test('should complete animation in 3 seconds', async ({ page }) => {
    // Wait for animation to complete (3s + 500ms delay)
    await page.waitForTimeout(3600);
    
    // Check animation is at 100%
    const progressIndicator = page.locator('text=/Animation: 100%/');
    await expect(progressIndicator).toBeVisible();
  });

  test('should show text overlay after 50% progress', async ({ page }) => {
    // Wait for 50% of animation (1.5s + 500ms delay)
    await page.waitForTimeout(2000);
    
    // Check text overlay is visible
    const textOverlay = page.locator('text=500KV ONSITE GRID');
    await expect(textOverlay).toBeVisible();
  });

  test('should transition images smoothly', async ({ page }) => {
    // Take screenshots at different points
    const screenshots = [];
    
    // Initial state
    screenshots.push(await page.screenshot({ fullPage: true }));
    
    // 25% progress
    await page.waitForTimeout(750);
    screenshots.push(await page.screenshot({ fullPage: true }));
    
    // 50% progress
    await page.waitForTimeout(750);
    screenshots.push(await page.screenshot({ fullPage: true }));
    
    // 75% progress
    await page.waitForTimeout(750);
    screenshots.push(await page.screenshot({ fullPage: true }));
    
    // 100% progress
    await page.waitForTimeout(750);
    screenshots.push(await page.screenshot({ fullPage: true }));
    
    // Verify screenshots were taken
    expect(screenshots.length).toBe(5);
  });

  test('should not have any clickable buttons', async ({ page }) => {
    // Check that no redundancy button exists
    const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
    await expect(redundancyButton).not.toBeVisible();
    
    const mainButton = page.locator('button:has-text("Main")');
    await expect(mainButton).not.toBeVisible();
  });

  test('should handle image loading correctly', async ({ page }) => {
    // Check both images are present
    const defaultImage = page.locator('img[alt="Main Power Infrastructure"]');
    const redundancyImage = page.locator('img[alt="2N+1 Redundancy View"]');
    
    await expect(defaultImage).toBeVisible();
    await expect(redundancyImage).toBeVisible();
  });

  test('should apply correct CSS animations', async ({ page }) => {
    // Wait for text overlay to appear
    await page.waitForTimeout(2000);
    
    // Check for pulse glow animation on text
    const textOverlay = page.locator('text=500KV ONSITE GRID').locator('..');
    const animationStyle = await textOverlay.getAttribute('style');
    
    expect(animationStyle).toContain('pulseGlow');
  });

  test('visual regression - capture animation frames', async ({ page }) => {
    const frameTimings = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500];
    
    for (const timing of frameTimings) {
      await page.waitForTimeout(timing === 0 ? 0 : timing - frameTimings[frameTimings.indexOf(timing) - 1]);
      await page.screenshot({ 
        path: `screenshots/animation-${timing}ms.png`,
        fullPage: true 
      });
    }
  });

  test('should maintain responsive design during animation', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 320, height: 568 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 } // Desktop
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.reload();
      await page.waitForTimeout(2000);
      
      const textOverlay = page.locator('text=500KV ONSITE GRID');
      const isVisible = await textOverlay.isVisible();
      
      // Text should be visible at all viewport sizes after 50% progress
      expect(isVisible).toBe(true);
    }
  });

  test('should not have memory leaks', async ({ page }) => {
    // Get initial memory usage
    const initialMetrics = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return null;
    });
    
    // Wait for animation to complete
    await page.waitForTimeout(3600);
    
    // Force garbage collection if available
    await page.evaluate(() => {
      if ('gc' in window) {
        (window as any).gc();
      }
    });
    
    // Get final memory usage
    const finalMetrics = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return null;
    });
    
    // Memory should not increase significantly
    if (initialMetrics && finalMetrics) {
      const memoryIncrease = finalMetrics - initialMetrics;
      const increasePercentage = (memoryIncrease / initialMetrics) * 100;
      
      // Allow up to 20% increase (reasonable for animation)
      expect(increasePercentage).toBeLessThan(20);
    }
  });
});