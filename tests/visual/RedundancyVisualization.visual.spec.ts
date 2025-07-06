/**
 * Visual Regression Tests for 2N+1 Redundancy Visualization
 * Testing visual consistency and animation frames
 */

import { test, expect } from '@playwright/test';

test.describe('2N+1 Redundancy Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Static Visual Tests', () => {
    test('should match initial page layout', async ({ page }) => {
      // Take screenshot of initial state
      await expect(page).toHaveScreenshot('initial-page-layout.png', {
        fullPage: true,
        threshold: 0.2
      });
    });

    test('should match redundancy button appearance', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await expect(redundancyButton).toHaveScreenshot('redundancy-button.png', {
        threshold: 0.1
      });
    });

    test('should match overlay background', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      await expect(page).toHaveScreenshot('overlay-background.png', {
        fullPage: true,
        threshold: 0.2
      });
    });

    test('should match close button appearance', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      const closeButton = page.locator('[data-testid="close-redundancy-button"]');
      await expect(closeButton).toBeVisible();
      
      await expect(closeButton).toHaveScreenshot('close-button.png', {
        threshold: 0.1
      });
    });
  });

  test.describe('Animation Frame Tests', () => {
    test('should match animation at 1 second mark', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      // Wait for first animation step (transmission lines)
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('animation-1s-lines.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('should match animation at 3 second mark', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      // Wait for substation markers to appear
      await page.waitForTimeout(3000);
      
      await expect(page).toHaveScreenshot('animation-3s-substations.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('should match animation at 5 second mark', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      // Wait for connection lines to appear
      await page.waitForTimeout(5000);
      
      await expect(page).toHaveScreenshot('animation-5s-connections.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('should match final animation state', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      // Wait for complete animation
      await page.waitForTimeout(6000);
      
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
      
      await expect(page).toHaveScreenshot('animation-final-complete.png', {
        fullPage: true,
        threshold: 0.2
      });
    });
  });

  test.describe('SVG Element Visual Tests', () => {
    test('should match transmission lines appearance', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      await page.waitForTimeout(2000);
      
      const svg = page.locator('svg');
      await expect(svg).toHaveScreenshot('transmission-lines.png', {
        threshold: 0.2
      });
    });

    test('should match substation markers appearance', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      await page.waitForTimeout(3500);
      
      const substationMarkers = page.locator('.absolute.z-20');
      await expect(substationMarkers.first()).toHaveScreenshot('substation-marker-1.png', {
        threshold: 0.1
      });
    });

    test('should match glow effects on lines', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      await page.waitForTimeout(2000);
      
      // Focus on red transmission lines with glow
      const redLines = page.locator('svg path[stroke="#ef4444"]').first();
      await expect(redLines).toHaveScreenshot('red-line-glow.png', {
        threshold: 0.2
      });
    });
  });

  test.describe('Info Panel Visual Tests', () => {
    test('should match info panel layout', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      await page.waitForTimeout(6000);
      
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
      
      await expect(infoPanel).toHaveScreenshot('info-panel-layout.png', {
        threshold: 0.1
      });
    });

    test('should match info panel data display', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      await page.waitForTimeout(6000);
      
      const dataSection = page.locator('#redundancy-description');
      await expect(dataSection).toHaveScreenshot('info-panel-data.png', {
        threshold: 0.1
      });
    });

    test('should match title and heading styles', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      await page.waitForTimeout(6000);
      
      const title = page.locator('#redundancy-title');
      await expect(title).toHaveScreenshot('info-panel-title.png', {
        threshold: 0.1
      });
    });
  });

  test.describe('Responsive Visual Tests', () => {
    test('should match mobile layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      await page.waitForTimeout(6000);
      
      await expect(page).toHaveScreenshot('mobile-layout.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('should match tablet layout', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      await page.waitForTimeout(6000);
      
      await expect(page).toHaveScreenshot('tablet-layout.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('should match desktop layout', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      await page.waitForTimeout(6000);
      
      await expect(page).toHaveScreenshot('desktop-layout.png', {
        fullPage: true,
        threshold: 0.3
      });
    });
  });

  test.describe('State Transition Visual Tests', () => {
    test('should match button hover state', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      
      await redundancyButton.hover();
      await page.waitForTimeout(200);
      
      await expect(redundancyButton).toHaveScreenshot('button-hover-state.png', {
        threshold: 0.1
      });
    });

    test('should match button active state', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      
      // Simulate active state
      await page.mouse.move(0, 0);
      await redundancyButton.hover();
      await page.mouse.down();
      await page.waitForTimeout(100);
      
      await expect(redundancyButton).toHaveScreenshot('button-active-state.png', {
        threshold: 0.1
      });
      
      await page.mouse.up();
    });

    test('should match button text change state', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      await page.waitForTimeout(500);
      
      await expect(redundancyButton).toHaveScreenshot('button-close-text.png', {
        threshold: 0.1
      });
    });

    test('should match close button hover state', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      const closeButton = page.locator('[data-testid="close-redundancy-button"]');
      await expect(closeButton).toBeVisible();
      
      await closeButton.hover();
      await page.waitForTimeout(200);
      
      await expect(closeButton).toHaveScreenshot('close-button-hover.png', {
        threshold: 0.1
      });
    });
  });

  test.describe('Error State Visual Tests', () => {
    test('should match graceful degradation when images fail', async ({ page }) => {
      // Block image loading
      await page.route('**/power-map.png', route => route.abort());
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      await page.waitForTimeout(6000);
      
      await expect(page).toHaveScreenshot('error-state-no-image.png', {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('should match consistent styling during network issues', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });
      
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      await page.waitForTimeout(6000);
      
      await expect(page).toHaveScreenshot('slow-network-state.png', {
        fullPage: true,
        threshold: 0.3
      });
    });
  });

  test.describe('Cross-Browser Visual Consistency', () => {
    test('should maintain visual consistency across browsers', async ({ page, browserName }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      await page.waitForTimeout(6000);
      
      await expect(page).toHaveScreenshot(`cross-browser-${browserName}.png`, {
        fullPage: true,
        threshold: 0.4 // Allow more variation across browsers
      });
    });

    test('should match SVG rendering across browsers', async ({ page, browserName }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]');
      await redundancyButton.click();
      
      await page.waitForTimeout(3000);
      
      const svg = page.locator('svg');
      await expect(svg).toHaveScreenshot(`svg-${browserName}.png`, {
        threshold: 0.3
      });
    });
  });
});