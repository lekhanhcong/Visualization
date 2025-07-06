/**
 * Accessibility Tests for 2N+1 Redundancy Visualization
 * Testing WCAG 2.1 AA compliance and screen reader support
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('2N+1 Redundancy Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('WCAG 2.1 AA Compliance', () => {
    test('should pass axe accessibility scan on main page', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should pass axe accessibility scan on redundancy overlay', async ({ page }) => {
      // Open redundancy visualization
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      // Wait for overlay to fully load
      await page.waitForSelector('[role="dialog"][aria-modal="true"]');
      await page.waitForTimeout(2000);
      
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have proper color contrast ratios', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      await page.waitForSelector('[role="dialog"][aria-modal="true"]');
      await page.waitForTimeout(4000); // Wait for info panel
      
      // Test color contrast with axe
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      
      const contrastViolations = accessibilityScanResults.violations.filter(
        violation => violation.id === 'color-contrast'
      );
      
      expect(contrastViolations).toHaveLength(0);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support full keyboard navigation', async ({ page }) => {
      // Tab navigation to redundancy button
      await page.keyboard.press('Tab');
      
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
      
      // Test ESC key
      await page.keyboard.press('Escape');
      await expect(overlay).not.toBeVisible();
    });

    test('should trap focus within modal', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Tab through modal elements
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.evaluate(() => document.activeElement);
      const isWithinModal = await page.evaluate((element) => {
        const modal = document.querySelector('[role="dialog"][aria-modal="true"]');
        return modal?.contains(element as Node) || false;
      }, focusedElement);
      
      expect(isWithinModal).toBe(true);
    });

    test('should handle arrow key navigation in info panel', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      // Wait for info panel
      await page.waitForTimeout(4000);
      
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
      
      // Test arrow key navigation doesn't break anything
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
      
      // Panel should still be visible
      await expect(infoPanel).toBeVisible();
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper ARIA labels and roles', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Check main dialog attributes
      await expect(overlay).toHaveAttribute('aria-modal', 'true');
      await expect(overlay).toHaveAttribute('aria-labelledby', 'redundancy-title');
      await expect(overlay).toHaveAttribute('aria-describedby', 'redundancy-description');
      
      // Wait for info panel and check title
      await page.waitForTimeout(4000);
      const title = page.locator('#redundancy-title');
      await expect(title).toBeVisible();
      await expect(title).toContainText('2N+1 Redundancy Status');
    });

    test('should have accessible close button', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const closeButton = page.locator('button[aria-label*="Close"]');
      await expect(closeButton).toBeVisible();
      await expect(closeButton).toHaveAttribute('aria-label', 'Close redundancy visualization');
      
      // Test close button functionality
      await closeButton.click();
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).not.toBeVisible();
    });

    test('should have descriptive text for visual elements', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      // Wait for full animation
      await page.waitForTimeout(6000);
      
      // Check for lightning icon accessibility
      const lightningIcon = page.locator('[role="img"][aria-label="lightning"]');
      await expect(lightningIcon).toBeVisible();
      
      // Check for descriptive text content
      await expect(page.locator('text=Data Center Needs')).toBeVisible();
      await expect(page.locator('text=Active Now')).toBeVisible();
      await expect(page.locator('text=Standby Ready')).toBeVisible();
      await expect(page.locator('text=TOTAL CAPACITY')).toBeVisible();
    });
  });

  test.describe('High Contrast Mode', () => {
    test('should work in high contrast mode', async ({ page }) => {
      // Enable high contrast mode simulation
      await page.emulateMedia({ 
        colorScheme: 'dark',
        forcedColors: 'active'
      });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Wait for animation
      await page.waitForTimeout(2000);
      
      // Check that elements are still visible
      const transmissionLines = page.locator('svg path');
      await expect(transmissionLines.first()).toBeVisible();
    });

    test('should maintain readability with forced colors', async ({ page }) => {
      await page.emulateMedia({ forcedColors: 'active' });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      // Wait for info panel
      await page.waitForTimeout(4000);
      
      // Text should still be readable
      await expect(page.locator('text=300MW')).toBeVisible();
      await expect(page.locator('text=400% TOTAL CAPACITY')).toBeVisible();
    });
  });

  test.describe('Reduced Motion Support', () => {
    test('should respect prefers-reduced-motion', async ({ page }) => {
      // Enable reduced motion
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Elements should still appear but without heavy animation
      await page.waitForTimeout(1000);
      const transmissionLines = page.locator('svg path');
      await expect(transmissionLines.first()).toBeVisible();
      
      // Info panel should appear faster with reduced motion
      await page.waitForTimeout(2000);
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should have proper touch targets on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      
      // Check button size meets minimum touch target (44x44px)
      const buttonBox = await redundancyButton.boundingBox();
      expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
      
      await redundancyButton.tap();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Close button should also meet touch target requirements
      const closeButton = page.locator('button[aria-label*="Close"]');
      const closeButtonBox = await closeButton.boundingBox();
      expect(closeButtonBox?.width).toBeGreaterThanOrEqual(44);
      expect(closeButtonBox?.height).toBeGreaterThanOrEqual(44);
    });

    test('should support mobile screen readers', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.tap();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Check ARIA attributes work on mobile
      await expect(overlay).toHaveAttribute('aria-modal', 'true');
      await expect(overlay).toHaveAttribute('role', 'dialog');
    });
  });

  test.describe('Text Scaling', () => {
    test('should work with 200% text zoom', async ({ page }) => {
      // Simulate 200% text zoom
      await page.addStyleTag({
        content: `
          * {
            font-size: 200% !important;
          }
        `
      });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await expect(redundancyButton).toBeVisible();
      
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Wait for info panel
      await page.waitForTimeout(4000);
      
      // Text should still be readable and not overflow
      await expect(page.locator('text=300MW')).toBeVisible();
      await expect(page.locator('text=2N+1 Redundancy Status')).toBeVisible();
    });
  });

  test.describe('Error States Accessibility', () => {
    test('should announce errors appropriately', async ({ page }) => {
      // Simulate error by navigating to invalid state
      await page.goto('/invalid-route');
      
      // Should handle 404 gracefully without accessibility violations
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      
      // Should not have critical accessibility violations even in error states
      const criticalViolations = accessibilityScanResults.violations.filter(
        violation => violation.impact === 'critical'
      );
      
      expect(criticalViolations).toHaveLength(0);
    });
  });
});