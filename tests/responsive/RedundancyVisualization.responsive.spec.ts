/**
 * Responsive Design Tests for 2N+1 Redundancy Visualization
 * Testing across different devices and screen sizes
 */

import { test, expect } from '@playwright/test';

test.describe('2N+1 Redundancy Responsive Design Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Mobile Devices (320px - 768px)', () => {
    test('iPhone SE (375x667) - Portrait', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check if redundancy button is visible and properly sized
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await expect(redundancyButton).toBeVisible();
      
      // Verify touch target size (minimum 44x44px)
      const buttonBox = await redundancyButton.boundingBox();
      expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
      
      // Open redundancy visualization
      await redundancyButton.tap();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Wait for info panel
      await page.waitForTimeout(4000);
      
      // Check if content fits within viewport
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
      
      const infoPanelBox = await infoPanel.boundingBox();
      expect(infoPanelBox?.x).toBeGreaterThanOrEqual(0);
      expect(infoPanelBox?.y).toBeGreaterThanOrEqual(0);
      expect(infoPanelBox?.x! + infoPanelBox?.width!).toBeLessThanOrEqual(375);
    });

    test('iPhone SE (375x667) - Landscape', async ({ page }) => {
      await page.setViewportSize({ width: 667, height: 375 });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await expect(redundancyButton).toBeVisible();
      
      await redundancyButton.tap();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Check horizontal scrolling is not needed
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      expect(hasHorizontalScroll).toBe(false);
    });

    test('Small Mobile (320x568)', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await expect(redundancyButton).toBeVisible();
      
      // Button text might be truncated but should still be readable
      const buttonText = await redundancyButton.textContent();
      expect(buttonText).toContain('Redundancy');
      
      await redundancyButton.tap();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Close button should be accessible
      const closeButton = page.locator('button[aria-label*="Close"]');
      await expect(closeButton).toBeVisible();
      
      const closeButtonBox = await closeButton.boundingBox();
      expect(closeButtonBox?.width).toBeGreaterThanOrEqual(44);
      expect(closeButtonBox?.height).toBeGreaterThanOrEqual(44);
    });

    test('Large Mobile (414x896) - iPhone 11 Pro Max', async ({ page }) => {
      await page.setViewportSize({ width: 414, height: 896 });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.tap();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Wait for animation
      await page.waitForTimeout(6000);
      
      // Check if SVG elements are properly visible
      const transmissionLines = page.locator('svg path[stroke="#ef4444"]');
      await expect(transmissionLines.first()).toBeVisible();
      
      // Info panel should be properly positioned
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
      
      // Text should be readable
      await expect(page.locator('text=300MW')).toBeVisible();
      await expect(page.locator('text=400% TOTAL CAPACITY')).toBeVisible();
    });
  });

  test.describe('Tablet Devices (768px - 1024px)', () => {
    test('iPad Portrait (768x1024)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Wait for full animation
      await page.waitForTimeout(6000);
      
      // Check if layout utilizes tablet space efficiently
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
      
      const infoPanelBox = await infoPanel.boundingBox();
      // Info panel should not be too small on tablet
      expect(infoPanelBox?.width).toBeGreaterThan(300);
      
      // SVG should scale appropriately
      const svg = page.locator('svg');
      const svgBox = await svg.boundingBox();
      expect(svgBox?.width).toBeGreaterThan(400);
      expect(svgBox?.height).toBeGreaterThan(400);
    });

    test('iPad Landscape (1024x768)', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Wait for animation
      await page.waitForTimeout(4000);
      
      // In landscape, info panel should not overlap with main content
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
      
      const infoPanelBox = await infoPanel.boundingBox();
      // Info panel should fit comfortably in landscape
      expect(infoPanelBox?.x! + infoPanelBox?.width!).toBeLessThanOrEqual(1024);
      expect(infoPanelBox?.y).toBeGreaterThanOrEqual(0);
    });

    test('iPad Pro (1024x1366)', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 1366 });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Check if content scales well on larger tablet
      await page.waitForTimeout(6000);
      
      // All elements should be visible without scrolling
      const transmissionLines = page.locator('svg path');
      await expect(transmissionLines.first()).toBeVisible();
      
      const substationMarkers = page.locator('.absolute.z-20');
      await expect(substationMarkers.first()).toBeVisible();
      
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
    });
  });

  test.describe('Desktop Devices (1024px+)', () => {
    test('Standard Desktop (1280x720)', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Wait for complete animation
      await page.waitForTimeout(6000);
      
      // Check optimal desktop layout
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
      
      // Info panel should be positioned optimally on desktop
      const infoPanelBox = await infoPanel.boundingBox();
      expect(infoPanelBox?.x).toBeGreaterThan(600); // Should be on the right side
      expect(infoPanelBox?.width).toBeGreaterThan(300); // Should have adequate width
      
      // SVG should utilize available space
      const svg = page.locator('svg');
      const svgBox = await svg.boundingBox();
      expect(svgBox?.width).toBeGreaterThan(800);
    });

    test('Full HD (1920x1080)', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      await page.waitForTimeout(6000);
      
      // Check if content doesn't look too small on large screen
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
      
      // Elements should scale appropriately
      const closeButton = page.locator('button[aria-label*="Close"]');
      const closeButtonBox = await closeButton.boundingBox();
      expect(closeButtonBox?.width).toBeGreaterThanOrEqual(40);
      expect(closeButtonBox?.height).toBeGreaterThanOrEqual(40);
      
      // Text should remain readable
      await expect(page.locator('text=2N+1 Redundancy Status')).toBeVisible();
    });

    test('4K Display (3840x2160)', async ({ page }) => {
      await page.setViewportSize({ width: 3840, height: 2160 });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      await page.waitForTimeout(4000);
      
      // Check if content scales properly on 4K
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
      
      // Text should not be too small
      const title = page.locator('#redundancy-title');
      const titleBox = await title.boundingBox();
      expect(titleBox?.height).toBeGreaterThan(20); // Text should be readable
      
      // SVG should scale without pixelation
      const transmissionLines = page.locator('svg path');
      await expect(transmissionLines.first()).toBeVisible();
    });
  });

  test.describe('Orientation Changes', () => {
    test('should handle orientation change gracefully', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 667 });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.tap();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Change to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      
      // Overlay should still be visible and functional
      await expect(overlay).toBeVisible();
      
      // Wait for any layout adjustments
      await page.waitForTimeout(1000);
      
      // Close button should still be accessible
      const closeButton = page.locator('button[aria-label*="Close"]');
      await expect(closeButton).toBeVisible();
      
      await closeButton.tap();
      await expect(overlay).not.toBeVisible();
    });

    test('should maintain animation quality during orientation change', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.tap();
      
      // Change orientation during animation
      await page.waitForTimeout(2000);
      await page.setViewportSize({ width: 667, height: 375 });
      
      // Animation should continue smoothly
      await page.waitForTimeout(3000);
      
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
      
      // All elements should still be visible
      const transmissionLines = page.locator('svg path');
      await expect(transmissionLines.first()).toBeVisible();
    });
  });

  test.describe('Zoom Levels', () => {
    test('should work at 50% zoom', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Set zoom level to 50%
      await page.evaluate(() => {
        document.body.style.zoom = '0.5';
      });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      await page.waitForTimeout(4000);
      
      // Elements should still be functional at 50% zoom
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
      
      const closeButton = page.locator('button[aria-label*="Close"]');
      await closeButton.click();
      await expect(overlay).not.toBeVisible();
    });

    test('should work at 200% zoom', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Set zoom level to 200%
      await page.evaluate(() => {
        document.body.style.zoom = '2';
      });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // At 200% zoom, some scrolling might be expected
      await page.waitForTimeout(4000);
      
      // Core functionality should still work
      const closeButton = page.locator('button[aria-label*="Close"]');
      await expect(closeButton).toBeVisible();
    });
  });

  test.describe('Dynamic Viewport Changes', () => {
    test('should adapt to window resizing', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Gradually resize window
      const sizes = [
        { width: 1024, height: 768 },
        { width: 768, height: 1024 },
        { width: 375, height: 667 },
        { width: 1920, height: 1080 }
      ];
      
      for (const size of sizes) {
        await page.setViewportSize(size);
        await page.waitForTimeout(500);
        
        // Overlay should remain visible and functional
        await expect(overlay).toBeVisible();
        
        const closeButton = page.locator('button[aria-label*="Close"]');
        await expect(closeButton).toBeVisible();
      }
    });

    test('should handle extreme aspect ratios', async ({ page }) => {
      // Very wide screen
      await page.setViewportSize({ width: 2560, height: 600 });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      await page.waitForTimeout(4000);
      
      // Content should adapt to ultra-wide layout
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
      
      // Very tall screen
      await page.setViewportSize({ width: 600, height: 2560 });
      await page.waitForTimeout(500);
      
      // Should still be functional
      await expect(overlay).toBeVisible();
      const closeButton = page.locator('button[aria-label*="Close"]');
      await expect(closeButton).toBeVisible();
    });
  });

  test.describe('Text Scaling', () => {
    test('should work with browser text scaling', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      
      // Simulate browser text scaling (150%)
      await page.addStyleTag({
        content: `
          html {
            font-size: 150% !important;
          }
        `
      });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      await page.waitForTimeout(4000);
      
      // Text should scale but remain readable
      const title = page.locator('#redundancy-title');
      await expect(title).toBeVisible();
      await expect(title).toContainText('2N+1 Redundancy Status');
      
      // Layout should accommodate larger text
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
    });
  });

  test.describe('Touch Targets', () => {
    test('should have proper touch targets on all screen sizes', async ({ page }) => {
      const viewports = [
        { width: 320, height: 568 },  // Small mobile
        { width: 375, height: 667 },  // iPhone
        { width: 768, height: 1024 }, // iPad
        { width: 1280, height: 720 }  // Desktop
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        
        const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
        
        // Check button touch target
        const buttonBox = await redundancyButton.boundingBox();
        expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
        expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
        
        // Open and check close button
        await redundancyButton.click();
        
        const closeButton = page.locator('button[aria-label*="Close"]');
        const closeButtonBox = await closeButton.boundingBox();
        expect(closeButtonBox?.width).toBeGreaterThanOrEqual(44);
        expect(closeButtonBox?.height).toBeGreaterThanOrEqual(44);
        
        await closeButton.click();
        
        const overlay = page.locator('[role="dialog"][aria-modal="true"]');
        await expect(overlay).not.toBeVisible();
      }
    });
  });
});