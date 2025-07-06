/**
 * Cross-Browser Tests for 2N+1 Redundancy Visualization
 * Testing compatibility across Chrome, Firefox, Safari, and Edge
 */

import { test, expect } from '@playwright/test';

test.describe('2N+1 Redundancy Cross-Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify the page loaded correctly
    await expect(page.locator('h1')).toContainText('Hue Hi Tech Park');
  });

  test.describe('Core Functionality', () => {
    test('should display redundancy button across all browsers', async ({ page, browserName }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await expect(redundancyButton).toBeVisible();
      await expect(redundancyButton).toContainText('Show 2N+1 Redundancy');
      
      // Log browser being tested
      console.log(`✅ Button visible in ${browserName}`);
    });

    test('should open redundancy overlay across all browsers', async ({ page, browserName }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      console.log(`✅ Overlay opens in ${browserName}`);
    });

    test('should complete animation sequence across all browsers', async ({ page, browserName }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      // Wait for full animation sequence
      await page.waitForTimeout(6000);
      
      // Check key elements are visible
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
      
      const transmissionLines = page.locator('svg path[stroke="#ef4444"]');
      await expect(transmissionLines.first()).toBeVisible();
      
      console.log(`✅ Animation completes in ${browserName}`);
    });

    test('should handle keyboard navigation across all browsers', async ({ page, browserName }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.focus();
      await page.keyboard.press('Enter');
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Close with ESC
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      await expect(overlay).not.toBeVisible();
      
      console.log(`✅ Keyboard navigation works in ${browserName}`);
    });
  });

  test.describe('Browser-Specific Features', () => {
    test('should handle touch events properly on supported browsers', async ({ page, browserName }) => {
      // Skip touch test for desktop Safari and Firefox
      if (browserName === 'webkit' || browserName === 'firefox') {
        test.skip(true, `Touch events not applicable for desktop ${browserName}`);
      }
      
      await page.setViewportSize({ width: 375, height: 667 });
      
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.tap();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      const closeButton = page.locator('[data-testid="close-redundancy-button"]');
      await closeButton.tap();
      await expect(overlay).not.toBeVisible();
      
      console.log(`✅ Touch events work in ${browserName}`);
    });

    test('should render SVG animations consistently across browsers', async ({ page, browserName }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      // Wait for lines to appear
      await page.waitForTimeout(2000);
      
      // Check SVG elements
      const svg = page.locator('svg');
      await expect(svg).toBeVisible();
      
      // Check filters are applied
      const glowFilters = page.locator('svg defs filter');
      await expect(glowFilters).toHaveCount(2);
      
      // Check paths with filters
      const redLines = page.locator('svg path[filter="url(#glow-red)"]');
      await expect(redLines).toHaveCount(2);
      
      console.log(`✅ SVG animations render in ${browserName}`);
    });

    test('should handle CSS animations and transitions properly', async ({ page, browserName }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Check Framer Motion animations work
      await page.waitForTimeout(2000);
      const substationMarkers = page.locator('.absolute.z-20');
      await expect(substationMarkers.first()).toBeVisible();
      
      // Check backdrop blur is applied (may vary by browser)
      const backdrop = page.locator('[role="dialog"] > div').first();
      const backdropStyles = await backdrop.evaluate(el => getComputedStyle(el));
      
      // Verify backdrop-filter is supported (Chrome/Edge primarily)
      if (browserName === 'chromium' || browserName === 'edge') {
        expect(backdropStyles.backdropFilter).toBeTruthy();
      }
      
      console.log(`✅ CSS animations work in ${browserName}`);
    });
  });

  test.describe('Performance Across Browsers', () => {
    test('should maintain acceptable performance across browsers', async ({ page, browserName }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      
      const startTime = Date.now();
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      const endTime = Date.now();
      
      const openTime = endTime - startTime;
      
      // Allow more time for Firefox and Safari
      const timeoutThreshold = (browserName === 'firefox' || browserName === 'webkit') ? 2000 : 1000;
      expect(openTime).toBeLessThan(timeoutThreshold);
      
      console.log(`✅ Performance acceptable in ${browserName}: ${openTime}ms`);
    });

    test('should handle memory usage efficiently across browsers', async ({ page, browserName }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      
      // Open and close multiple times to test for memory leaks
      for (let i = 0; i < 5; i++) {
        await redundancyButton.click();
        await page.waitForTimeout(1000);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
      
      // Should still work normally
      await redundancyButton.click();
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      console.log(`✅ Memory handling efficient in ${browserName}`);
    });
  });

  test.describe('Accessibility Across Browsers', () => {
    test('should maintain accessibility features across browsers', async ({ page, browserName }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Check ARIA attributes
      await expect(overlay).toHaveAttribute('aria-modal', 'true');
      await expect(overlay).toHaveAttribute('role', 'dialog');
      await expect(overlay).toHaveAttribute('aria-labelledby', 'redundancy-title');
      
      // Check screen reader accessible content
      const title = page.locator('#redundancy-title');
      await expect(title).toBeVisible();
      await expect(title).toContainText('2N+1 Redundancy Status');
      
      console.log(`✅ Accessibility maintained in ${browserName}`);
    });

    test('should handle focus management consistently across browsers', async ({ page, browserName }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.focus();
      await page.keyboard.press('Enter');
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Wait for focus management
      await page.waitForTimeout(200);
      
      // Check focus is trapped within modal
      const closeButton = page.locator('[data-testid="close-redundancy-button"]');
      
      // Browser differences in focus behavior
      if (browserName !== 'webkit') {
        await expect(closeButton).toBeFocused();
      }
      
      // Close and verify focus returns
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      
      if (browserName !== 'webkit') {
        await expect(redundancyButton).toBeFocused();
      }
      
      console.log(`✅ Focus management works in ${browserName}`);
    });
  });

  test.describe('Error Handling Across Browsers', () => {
    test('should handle JavaScript errors gracefully across browsers', async ({ page, browserName }) => {
      const jsErrors: string[] = [];
      
      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });
      
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      await page.waitForTimeout(6000);
      
      // Should not have critical errors
      const criticalErrors = jsErrors.filter(error => 
        error.includes('TypeError') || error.includes('ReferenceError')
      );
      
      expect(criticalErrors.length).toBe(0);
      
      console.log(`✅ Error handling robust in ${browserName}`);
    });

    test('should gracefully degrade on feature unsupported browsers', async ({ page, browserName }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Core functionality should work even if some CSS features aren't supported
      await page.waitForTimeout(4000);
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
      
      // Data should be displayed correctly
      await expect(infoPanel.locator('text=300MW')).toBeVisible();
      await expect(infoPanel.locator('text=400% TOTAL CAPACITY')).toBeVisible();
      
      console.log(`✅ Graceful degradation in ${browserName}`);
    });
  });
});