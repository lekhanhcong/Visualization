/**
 * E2E Tests for 2N+1 Redundancy Visualization Feature
 * Testing complete user workflows and interactions
 */

import { test, expect, Page } from '@playwright/test';

test.describe('2N+1 Redundancy Visualization E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify the page loaded correctly
    await expect(page.locator('h1')).toContainText('Hue Hi Tech Park');
  });

  test.describe('Feature Availability', () => {
    test('should show redundancy button when feature is enabled', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await expect(redundancyButton).toBeVisible();
      await expect(redundancyButton).toContainText('Show 2N+1 Redundancy');
    });

    test('should have power map image loaded', async ({ page }) => {
      const powerMapImage = page.locator('img[alt*="Power Infrastructure Map"]');
      await expect(powerMapImage).toBeVisible();
      
      // Verify image has loaded
      const isLoaded = await powerMapImage.evaluate((img: HTMLImageElement) => img.complete);
      expect(isLoaded).toBe(true);
    });
  });

  test.describe('Complete User Workflow', () => {
    test('should complete full redundancy visualization workflow', async ({ page }) => {
      // Step 1: Click the redundancy button
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      // Step 2: Verify overlay appears
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Step 3: Verify close button is present
      const closeButton = page.locator('button[aria-label*="Close"]');
      await expect(closeButton).toBeVisible();
      
      // Step 4: Wait for and verify animation sequence
      await test.step('Verify 4-second animation sequence', async () => {
        // Lines should appear first (around 1 second)
        await page.waitForTimeout(1500);
        const transmissionLines = page.locator('svg path[stroke="#ef4444"], svg path[stroke="#fbbf24"]');
        await expect(transmissionLines.first()).toBeVisible();
        
        // Substations should appear (around 3 seconds)
        await page.waitForTimeout(2000);
        const substations = page.locator('.absolute.z-20');
        await expect(substations.first()).toBeVisible();
        
        // Connection line should appear (around 5 seconds)
        await page.waitForTimeout(2000);
        const connectionLine = page.locator('svg path[stroke="#8b5cf6"]');
        await expect(connectionLine).toBeVisible();
        
        // Info panel should appear (around 6 seconds)
        await page.waitForTimeout(1000);
        const infoPanel = page.locator('#redundancy-description');
        await expect(infoPanel).toBeVisible();
      });
      
      // Step 5: Verify data accuracy
      await test.step('Verify power infrastructure data', async () => {
        // Data Center Needs - use more specific selector
        const infoPanel = page.locator('#redundancy-description');
        await expect(infoPanel.locator('text=300MW')).toBeVisible();
        
        // Active sources
        await expect(page.locator('text=Quảng Trạch → Sub 01')).toBeVisible();
        await expect(page.locator('text=Thanh Mỹ → Sub 01')).toBeVisible();
        await expect(infoPanel.locator('text=Total: 500MW')).toBeVisible();
        
        // Standby sources
        await expect(page.locator('text=Quảng Trị → Sub 02')).toBeVisible();
        await expect(page.locator('text=Đà Nẵng → Sub 02')).toBeVisible();
        await expect(infoPanel.locator('text=Total: 600MW')).toBeVisible();
        
        // Total capacity
        await expect(page.locator('text=400% TOTAL CAPACITY')).toBeVisible();
        await expect(page.locator('text=Total Available: 1200MW')).toBeVisible();
      });
      
      // Step 6: Test ESC key functionality
      await page.keyboard.press('Escape');
      await expect(overlay).not.toBeVisible();
      
      // Step 7: Verify button text changes back
      await expect(redundancyButton).toContainText('Show 2N+1 Redundancy');
    });

    test('should handle multiple open/close cycles', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      
      // Cycle 1
      await redundancyButton.click();
      await expect(overlay).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(overlay).not.toBeVisible();
      
      // Cycle 2
      await redundancyButton.click();
      await expect(overlay).toBeVisible();
      const closeButton = page.locator('button[aria-label*="Close"]');
      await closeButton.click();
      await expect(overlay).not.toBeVisible();
      
      // Cycle 3 - backdrop click
      await redundancyButton.click();
      await expect(overlay).toBeVisible();
      await page.locator('[role="dialog"] > div').first().click({ position: { x: 10, y: 10 } });
      await expect(overlay).not.toBeVisible();
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support full keyboard navigation', async ({ page }) => {
      // Tab to redundancy button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // May need more tabs depending on page structure
      let attempts = 0;
      while (attempts < 10) {
        const focusedElement = await page.evaluate(() => document.activeElement?.textContent);
        if (focusedElement?.includes('Show 2N+1 Redundancy')) {
          break;
        }
        await page.keyboard.press('Tab');
        attempts++;
      }
      
      // Open with Enter
      await page.keyboard.press('Enter');
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Close with ESC
      await page.keyboard.press('Escape');
      await expect(overlay).not.toBeVisible();
    });

    test('should trap focus within modal', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Tab should stay within modal
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement);
      
      // Focus should be within the modal
      const isWithinModal = await page.evaluate((element) => {
        const modal = document.querySelector('[role="dialog"][aria-modal="true"]');
        return modal?.contains(element as Node) || false;
      }, focusedElement);
      
      expect(isWithinModal).toBe(true);
    });
  });

  test.describe('Visual Elements', () => {
    test('should render all visual elements correctly', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      // Wait for full animation
      await page.waitForTimeout(6000);
      
      // SVG elements
      const svg = page.locator('svg');
      await expect(svg).toBeVisible();
      
      // Transmission lines
      const redLines = page.locator('svg path[stroke="#ef4444"]');
      await expect(redLines).toHaveCount(2);
      
      const yellowLines = page.locator('svg path[stroke="#fbbf24"]');
      await expect(yellowLines).toHaveCount(2);
      
      const purpleLine = page.locator('svg path[stroke="#8b5cf6"]');
      await expect(purpleLine).toBeVisible();
      
      // Substation markers
      const substations = page.locator('.absolute.z-20');
      await expect(substations).toHaveCount(2);
      
      // Labels and text
      await expect(page.locator('text=SUBSTATION 01 - ACTIVE')).toBeVisible();
      await expect(page.locator('text=SUBSTATION 02 - 600MW STANDBY')).toBeVisible();
      await expect(page.locator('text=220kV Backup')).toBeVisible();
    });

    test('should have proper glow effects on transmission lines', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      await page.waitForTimeout(2000);
      
      // Check for SVG filters
      const glowFilters = page.locator('svg defs filter');
      await expect(glowFilters).toHaveCount(2);
      
      // Check filter IDs
      await expect(page.locator('filter#glow-red')).toBeVisible();
      await expect(page.locator('filter#glow-yellow')).toBeVisible();
      
      // Verify lines use filters
      const redLinesWithFilter = page.locator('svg path[filter="url(#glow-red)"]');
      await expect(redLinesWithFilter).toHaveCount(2);
      
      const yellowLinesWithFilter = page.locator('svg path[filter="url(#glow-yellow)"]');
      await expect(yellowLinesWithFilter).toHaveCount(2);
    });
  });

  test.describe('Performance', () => {
    test('should load and animate smoothly', async ({ page }) => {
      // Measure performance
      const startTime = Date.now();
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time (2 seconds)
      expect(loadTime).toBeLessThan(2000);
      
      // Animation should complete within expected timeframe
      await page.waitForTimeout(6000);
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
    });

    test('should handle rapid interactions without errors', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      
      // Rapid open/close cycles
      for (let i = 0; i < 5; i++) {
        await redundancyButton.click();
        await page.waitForTimeout(100);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(100);
      }
      
      // Should still work normally after rapid interactions
      await redundancyButton.click();
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle page refresh gracefully', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Feature should still be available
      await expect(redundancyButton).toBeVisible();
      
      // Should work normally after refresh
      await redundancyButton.click();
      await expect(overlay).toBeVisible();
    });

    test('should handle network interruptions', async ({ page }) => {
      // Test with slow network
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Should still work with slow network
      await page.waitForTimeout(2000);
      const transmissionLines = page.locator('svg path[stroke="#ef4444"]');
      await expect(transmissionLines.first()).toBeVisible();
    });
  });

  test.describe('Browser Compatibility', () => {
    test('should work with different viewport sizes', async ({ page }) => {
      // Test desktop size
      await page.setViewportSize({ width: 1920, height: 1080 });
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await expect(redundancyButton).toBeVisible();
      
      // Test tablet size
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(redundancyButton).toBeVisible();
      
      // Test mobile size
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(redundancyButton).toBeVisible();
      
      // Test functionality on mobile
      await redundancyButton.click();
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
    });

    test('should handle touch interactions on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      
      // Touch interaction
      await redundancyButton.tap();
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Touch close button
      const closeButton = page.locator('button[aria-label*="Close"]');
      await closeButton.tap();
      await expect(overlay).not.toBeVisible();
    });
  });
});