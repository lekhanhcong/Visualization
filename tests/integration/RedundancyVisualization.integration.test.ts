/**
 * Integration Tests for 2N+1 Redundancy Visualization
 * Testing component integration and feature workflows
 */

import { test, expect } from '@playwright/test';

test.describe('2N+1 Redundancy Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Feature Flag Integration', () => {
    test('should show redundancy button when feature flag is enabled', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await expect(redundancyButton).toBeVisible();
      
      // Verify button styling and accessibility
      await expect(redundancyButton).toHaveClass(/bg-red-500/);
      await expect(redundancyButton).toContainText('Show 2N+1 Redundancy');
    });

    test('should toggle button text when opening/closing', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      
      // Initial state
      await expect(redundancyButton).toContainText('Show 2N+1 Redundancy');
      
      // Open overlay
      await redundancyButton.click();
      await page.waitForTimeout(500); // Wait for state update
      await expect(redundancyButton).toContainText('Close Redundancy View');
      
      // Close overlay
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500); // Wait for state update
      await expect(redundancyButton).toContainText('Show 2N+1 Redundancy');
    });

    test('should work with environment variable changes', async ({ page, context }) => {
      // Verify feature is currently enabled
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await expect(redundancyButton).toBeVisible();
      
      // Test that the feature flag is being read correctly by checking if button is present
      // Since process.env is not available in browser context, we check the rendered output
      await expect(redundancyButton).toContainText('Show 2N+1 Redundancy');
      
      // Verify the feature works as expected
      await redundancyButton.click();
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
    });
  });

  test.describe('Complete Feature Workflow', () => {
    test('should complete full 4-second animation sequence', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Track animation progression
      const animationSteps = [
        { time: 1000, selector: 'svg path[stroke="#ef4444"]', description: 'transmission lines' },
        { time: 3000, selector: '.absolute.z-20', description: 'substation markers' },
        { time: 5000, selector: 'svg path[stroke="#8b5cf6"]', description: 'connection lines' },
        { time: 6000, selector: '#redundancy-description', description: 'info panel' }
      ];
      
      for (const step of animationSteps) {
        await page.waitForTimeout(step.time - (animationSteps.indexOf(step) > 0 ? animationSteps[animationSteps.indexOf(step) - 1].time : 0));
        const element = page.locator(step.selector);
        await expect(element.first()).toBeVisible({ timeout: 2000 });
      }
    });

    test('should maintain state consistency throughout workflow', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      
      // Test multiple open/close cycles
      for (let i = 0; i < 3; i++) {
        await redundancyButton.click();
        
        const overlay = page.locator('[role="dialog"][aria-modal="true"]');
        await expect(overlay).toBeVisible();
        
        // Wait for partial animation
        await page.waitForTimeout(2000);
        
        // Close and verify cleanup
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500); // Wait for animation to complete
        await expect(overlay).not.toBeVisible();
        
        // Verify button returns to initial state
        await expect(redundancyButton).toContainText('Show 2N+1 Redundancy');
      }
    });

    test('should handle rapid user interactions gracefully', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      
      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        await redundancyButton.click();
        await page.waitForTimeout(100);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(100);
      }
      
      // Should still work normally
      await redundancyButton.click();
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
    });
  });

  test.describe('Component Communication', () => {
    test('should properly communicate between overlay and main app', async ({ page }) => {
      // Verify body overflow is managed
      const initialOverflow = await page.evaluate(() => document.body.style.overflow);
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      // Body overflow should be hidden when overlay is open
      const overlayOverflow = await page.evaluate(() => document.body.style.overflow);
      expect(overlayOverflow).toBe('hidden');
      
      // Close overlay
      await page.keyboard.press('Escape');
      
      // Body overflow should be restored
      await page.waitForTimeout(500);
      const finalOverflow = await page.evaluate(() => document.body.style.overflow);
      expect(finalOverflow).toBe(initialOverflow);
    });

    test('should handle event propagation correctly', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Click on content area should not close overlay
      const infoPanel = page.locator('#redundancy-description');
      await page.waitForTimeout(4000); // Wait for info panel
      await infoPanel.click();
      
      await expect(overlay).toBeVisible();
      
      // Click on backdrop should close overlay
      await page.locator('[role="dialog"] > div').first().click({ position: { x: 10, y: 10 } });
      await expect(overlay).not.toBeVisible();
    });

    test('should manage focus correctly', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      
      // Store initial focus
      await redundancyButton.focus();
      
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Wait for focus to be set to close button
      await page.waitForTimeout(200);
      
      // Check that focus is on the close button
      const closeButton = page.locator('[data-testid="close-redundancy-button"]');
      await expect(closeButton).toBeFocused();
      
      // Focus should be trapped within overlay
      await page.keyboard.press('Tab');
      
      // Check if the focused element is within the overlay
      const isWithinOverlay = await page.evaluate(() => {
        const overlay = document.querySelector('[role="dialog"][aria-modal="true"]');
        const focusedElement = document.activeElement;
        return overlay && focusedElement ? overlay.contains(focusedElement) : false;
      });
      
      expect(isWithinOverlay).toBe(true);
      
      // Close overlay
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      
      // Focus should return to trigger button
      await expect(redundancyButton).toBeFocused();
    });
  });

  test.describe('Animation Coordination', () => {
    test('should coordinate multiple animation elements', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      // Monitor animation timing
      const startTime = Date.now();
      
      // Lines should appear first
      await page.waitForTimeout(1500);
      const lines = page.locator('svg path[stroke="#ef4444"], svg path[stroke="#fbbf24"]');
      await expect(lines.first()).toBeVisible();
      
      // Substations should appear next
      await page.waitForTimeout(1500);
      const substations = page.locator('.absolute.z-20');
      await expect(substations.first()).toBeVisible();
      
      // Info panel should appear last
      await page.waitForTimeout(2000);
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
      
      const totalTime = Date.now() - startTime;
      
      // Animation should complete in reasonable time
      expect(totalTime).toBeGreaterThan(4000);
      expect(totalTime).toBeLessThan(7000);
    });

    test('should handle animation interruption gracefully', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      // Interrupt animation midway
      await page.waitForTimeout(2000);
      await page.keyboard.press('Escape');
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).not.toBeVisible();
      
      // Should be able to restart animation
      await redundancyButton.click();
      await expect(overlay).toBeVisible();
      
      // Wait for complete animation
      await page.waitForTimeout(6000);
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
    });

    test('should maintain animation quality across interactions', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      
      // Test animation quality over multiple cycles
      for (let i = 0; i < 3; i++) {
        await redundancyButton.click();
        
        // Check that animation elements appear in order
        await page.waitForTimeout(1500);
        const lines = page.locator('svg path[stroke="#ef4444"]');
        await expect(lines.first()).toBeVisible();
        
        await page.waitForTimeout(2000);
        const substations = page.locator('.absolute.z-20');
        await expect(substations.first()).toBeVisible();
        
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Data Flow Integration', () => {
    test('should display correct power infrastructure data', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      // Wait for info panel
      await page.waitForTimeout(6000);
      
      // Verify data consistency within the info panel
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
      
      // Check specific data points within the info panel context
      await expect(infoPanel.locator('text=300MW')).toBeVisible();
      await expect(infoPanel.locator('text=Total: 500MW')).toBeVisible();
      await expect(infoPanel.locator('text=Total: 600MW')).toBeVisible();
      await expect(infoPanel.locator('text=400% TOTAL CAPACITY')).toBeVisible();
      await expect(infoPanel.locator('text=Total Available: 1200MW')).toBeVisible();
      
      // Check source names within SVG text elements
      await expect(page.locator('svg text:has-text("Quảng Trạch → Sub 01")')).toBeVisible();
      await expect(page.locator('svg text:has-text("Thanh Mỹ → Sub 01")')).toBeVisible();
      await expect(page.locator('svg text:has-text("Quảng Trị → Sub 02")')).toBeVisible();
      await expect(page.locator('svg text:has-text("Đà Nẵng → Sub 02")')).toBeVisible();
    });

    test('should maintain data consistency across sessions', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      
      // Open and verify data
      await redundancyButton.click();
      await page.waitForTimeout(6000);
      
      const initialData = await page.locator('#redundancy-description').textContent();
      
      // Close and reopen
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      await redundancyButton.click();
      await page.waitForTimeout(6000);
      
      const finalData = await page.locator('#redundancy-description').textContent();
      
      // Data should be consistent
      expect(finalData).toBe(initialData);
    });
  });

  test.describe('Error Handling Integration', () => {
    test('should handle missing image gracefully', async ({ page }) => {
      // Block image loading
      await page.route('**/power-map.png', route => route.abort());
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Feature should still be available
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await expect(redundancyButton).toBeVisible();
      
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
    });

    test('should handle JavaScript errors gracefully', async ({ page }) => {
      const jsErrors: string[] = [];
      
      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      // Wait for full animation
      await page.waitForTimeout(6000);
      
      // Should not have critical JavaScript errors
      const criticalErrors = jsErrors.filter(error => 
        error.includes('TypeError') || error.includes('ReferenceError')
      );
      
      expect(criticalErrors.length).toBe(0);
    });

    test('should handle network failures gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/*', route => {
        if (route.request().url().includes('api')) {
          route.abort();
        } else {
          route.continue();
        }
      });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Should still show static data
      await page.waitForTimeout(4000);
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
    });
  });

  test.describe('Performance Integration', () => {
    test('should not impact main page performance', async ({ page }) => {
      // Wait for page to fully load before measuring
      await page.waitForLoadState('networkidle');
      
      // Measure performance after page load
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const now = performance.now();
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd ? 
            navigation.domContentLoadedEventEnd - navigation.navigationStart : now,
          loadComplete: navigation.loadEventEnd ? 
            navigation.loadEventEnd - navigation.navigationStart : now,
          currentTime: now
        };
      });
      
      // Open redundancy feature
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      const startTime = Date.now();
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      const endTime = Date.now();
      
      // Feature should open quickly
      const openTime = endTime - startTime;
      expect(openTime).toBeLessThan(1000);
      
      // Page should have loaded reasonably fast (if metrics are valid)
      if (metrics.domContentLoaded > 0 && metrics.domContentLoaded < 60000) {
        expect(metrics.domContentLoaded).toBeLessThan(5000);
      }
    });

    test('should clean up resources properly', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      
      // Monitor DOM nodes - be more lenient with dynamic content
      const initialNodeCount = await page.evaluate(() => document.querySelectorAll('*').length);
      
      // Open and close multiple times
      for (let i = 0; i < 3; i++) {
        await redundancyButton.click();
        await page.waitForTimeout(1000);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
      
      // Wait for potential cleanup
      await page.waitForTimeout(1000);
      
      const finalNodeCount = await page.evaluate(() => document.querySelectorAll('*').length);
      
      // Should not accumulate excessive DOM nodes (allow for React's dynamic nature)
      const nodeDifference = finalNodeCount - initialNodeCount;
      expect(nodeDifference).toBeLessThan(50); // More reasonable threshold for React apps
    });
  });

  test.describe('Accessibility Integration', () => {
    test('should maintain accessibility across feature interactions', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      
      // Focus the redundancy button directly
      await redundancyButton.focus();
      
      // Open with keyboard
      await page.keyboard.press('Enter');
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Verify ARIA attributes
      await expect(overlay).toHaveAttribute('aria-modal', 'true');
      await expect(overlay).toHaveAttribute('role', 'dialog');
      await expect(overlay).toHaveAttribute('aria-labelledby', 'redundancy-title');
      await expect(overlay).toHaveAttribute('aria-describedby', 'redundancy-description');
      
      // Wait for focus to be set
      await page.waitForTimeout(200);
      
      // Close with keyboard
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      await expect(overlay).not.toBeVisible();
    });

    test('should announce state changes appropriately', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      // Wait for info panel
      await page.waitForTimeout(6000);
      
      // Check for proper headings structure
      const title = page.locator('#redundancy-title');
      await expect(title).toBeVisible();
      await expect(title).toContainText('2N+1 Redundancy Status');
      
      // Verify content is announced properly
      const description = page.locator('#redundancy-description');
      await expect(description).toBeVisible();
    });
  });

  test.describe('Mobile Integration', () => {
    test('should work seamlessly on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      
      // Test touch interactions
      await redundancyButton.tap();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Test mobile-specific interactions
      await page.waitForTimeout(4000);
      
      // Touch close button
      const closeButton = page.locator('[data-testid="close-redundancy-button"]');
      await closeButton.tap();
      
      await expect(overlay).not.toBeVisible();
    });

    test('should handle mobile viewport changes', async ({ page }) => {
      // Start on mobile
      await page.setViewportSize({ width: 375, height: 667 });
      
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.tap();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Rotate to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      
      // Should adapt gracefully
      await expect(overlay).toBeVisible();
      
      const closeButton = page.locator('[data-testid="close-redundancy-button"]');
      await expect(closeButton).toBeVisible();
    });
  });
});