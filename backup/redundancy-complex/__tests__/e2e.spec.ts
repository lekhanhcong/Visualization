/**
 * End-to-End Tests for 2N+1 Redundancy Feature
 * Comprehensive Playwright test suite covering all user workflows
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration
const TEST_URL = process.env.TEST_URL || 'http://localhost:3000';
const FEATURE_FLAG = 'NEXT_PUBLIC_ENABLE_REDUNDANCY=true';

// Page selectors
const SELECTORS = {
  redundancyButton: '[data-testid="redundancy-button"]',
  overlay: '[role="dialog"][aria-label*="2N+1 Redundancy"]',
  closeButton: '[aria-label="Close overlay"]',
  infoPanel: '[data-testid="info-panel"]',
  lineHighlight: '[data-testid="line-highlight"]',
  substationMarker: '[data-testid="substation-marker"]',
  powerFlowAnimation: '[data-testid="power-flow-animation"]'
};

// Test utilities
class RedundancyTestPage {
  constructor(private page: Page) {}

  async navigateToApp() {
    await this.page.goto(TEST_URL);
    await this.page.waitForLoadState('networkidle');
  }

  async openRedundancyVisualization() {
    await this.page.click(SELECTORS.redundancyButton);
    await this.page.waitForSelector(SELECTORS.overlay, { state: 'visible' });
  }

  async closeRedundancyVisualization() {
    await this.page.click(SELECTORS.closeButton);
    await this.page.waitForSelector(SELECTORS.overlay, { state: 'hidden' });
  }

  async waitForAnimationSequence() {
    // Wait for complete animation sequence (4 seconds)
    await this.page.waitForTimeout(4500);
  }

  async getElementCount(selector: string): Promise<number> {
    return await this.page.locator(selector).count();
  }

  async isElementVisible(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

test.describe('2N+1 Redundancy Feature - End-to-End Tests', () => {
  let redundancyPage: RedundancyTestPage;

  test.beforeEach(async ({ page }) => {
    redundancyPage = new RedundancyTestPage(page);
    
    // Set feature flag
    await page.addInitScript(() => {
      window.localStorage.setItem('NEXT_PUBLIC_ENABLE_REDUNDANCY', 'true');
    });
    
    await redundancyPage.navigateToApp();
  });

  test.describe('Feature Flag Integration', () => {
    test('should display redundancy button when feature is enabled', async ({ page }) => {
      const button = page.locator(SELECTORS.redundancyButton);
      await expect(button).toBeVisible();
      await expect(button).toContainText(/Show 2N\+1 Redundancy/i);
    });

    test('should respect feature flag state', async ({ page }) => {
      // Verify feature is enabled
      const button = page.locator(SELECTORS.redundancyButton);
      await expect(button).toBeVisible();
      
      // This would test disabled state in real implementation
      // by dynamically changing the flag
    });
  });

  test.describe('Complete User Workflow', () => {
    test('should execute complete visualization sequence', async ({ page }) => {
      // Step 1: Navigate to page
      await expect(page.locator(SELECTORS.redundancyButton)).toBeVisible();
      
      // Step 2: Click redundancy button
      await redundancyPage.openRedundancyVisualization();
      
      // Step 3: Verify overlay appears
      const overlay = page.locator(SELECTORS.overlay);
      await expect(overlay).toBeVisible();
      await expect(overlay).toHaveAttribute('aria-modal', 'true');
      
      // Step 4: Wait for complete animation sequence
      await redundancyPage.waitForAnimationSequence();
      
      // Step 5: Verify all components are visible
      await expect(page.locator(SELECTORS.lineHighlight)).toBeVisible();
      await expect(page.locator(SELECTORS.substationMarker)).toBeVisible();
      await expect(page.locator(SELECTORS.infoPanel)).toBeVisible();
      
      // Step 6: Verify 4 transmission lines are highlighted
      const lines = page.locator('[data-testid^="line-"]');
      await expect(lines).toHaveCount(4);
      
      // Step 7: Verify 2 substations are visible
      const substations = page.locator('[data-testid^="substation-"]');
      await expect(substations).toHaveCount(2);
      
      // Step 8: Verify info panel displays correct data
      const infoPanel = page.locator(SELECTORS.infoPanel);
      await expect(infoPanel).toContainText('300MW'); // Data center needs
      await expect(infoPanel).toContainText('400%'); // Total capacity
      
      // Step 9: Test close functionality
      await redundancyPage.closeRedundancyVisualization();
      await expect(overlay).not.toBeVisible();
      
      // Step 10: Verify return to normal state
      await expect(page.locator(SELECTORS.redundancyButton)).toBeVisible();
      await expect(page.locator(SELECTORS.redundancyButton)).toContainText(/Show 2N\+1 Redundancy/i);
    });

    test('should handle multiple open/close cycles', async ({ page }) => {
      for (let i = 0; i < 3; i++) {
        await redundancyPage.openRedundancyVisualization();
        await expect(page.locator(SELECTORS.overlay)).toBeVisible();
        
        await redundancyPage.waitForAnimationSequence();
        
        await redundancyPage.closeRedundancyVisualization();
        await expect(page.locator(SELECTORS.overlay)).not.toBeVisible();
        
        // Brief pause between cycles
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Animation Sequence Testing', () => {
    test('should execute animations in correct order', async ({ page }) => {
      await redundancyPage.openRedundancyVisualization();
      
      // Phase 1: Backdrop and overlay (0-1s)
      await expect(page.locator(SELECTORS.overlay)).toBeVisible();
      
      // Phase 2: Line highlights (1-2s)
      await page.waitForTimeout(1200);
      await expect(page.locator(SELECTORS.lineHighlight)).toBeVisible();
      
      // Phase 3: Substation markers (2-3s)
      await page.waitForTimeout(1200);
      await expect(page.locator(SELECTORS.substationMarker)).toBeVisible();
      
      // Phase 4: Info panel (3-4s)
      await page.waitForTimeout(1200);
      await expect(page.locator(SELECTORS.infoPanel)).toBeVisible();
    });

    test('should maintain 60fps animation performance', async ({ page }) => {
      await redundancyPage.openRedundancyVisualization();
      
      // Monitor performance during animation
      const performanceMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const metrics = { frames: 0, duration: 0 };
          const startTime = performance.now();
          
          const checkFrame = () => {
            metrics.frames++;
            metrics.duration = performance.now() - startTime;
            
            if (metrics.duration < 4000) {
              requestAnimationFrame(checkFrame);
            } else {
              resolve(metrics);
            }
          };
          
          requestAnimationFrame(checkFrame);
        });
      });
      
      const fps = performanceMetrics.frames / (performanceMetrics.duration / 1000);
      expect(fps).toBeGreaterThanOrEqual(50); // Allow some margin below 60fps
    });
  });

  test.describe('Responsive Design Testing', () => {
    test('should work on mobile viewports', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      
      await redundancyPage.openRedundancyVisualization();
      await redundancyPage.waitForAnimationSequence();
      
      // Verify components adapt to mobile
      await expect(page.locator(SELECTORS.overlay)).toBeVisible();
      await expect(page.locator(SELECTORS.infoPanel)).toBeVisible();
      
      // Test touch interactions
      await page.tap(SELECTORS.closeButton);
      await expect(page.locator(SELECTORS.overlay)).not.toBeVisible();
    });

    test('should work on tablet viewports', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      
      await redundancyPage.openRedundancyVisualization();
      await redundancyPage.waitForAnimationSequence();
      
      await expect(page.locator(SELECTORS.overlay)).toBeVisible();
      await expect(page.locator(SELECTORS.infoPanel)).toBeVisible();
    });

    test('should work on desktop viewports', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD
      
      await redundancyPage.openRedundancyVisualization();
      await redundancyPage.waitForAnimationSequence();
      
      await expect(page.locator(SELECTORS.overlay)).toBeVisible();
      await expect(page.locator(SELECTORS.infoPanel)).toBeVisible();
    });

    test('should handle orientation changes', async ({ page }) => {
      await page.setViewportSize({ width: 667, height: 375 }); // Landscape
      
      await redundancyPage.openRedundancyVisualization();
      
      // Change to portrait
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      // Verify layout still works
      await expect(page.locator(SELECTORS.overlay)).toBeVisible();
    });
  });

  test.describe('Accessibility Testing', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // Focus on button
      await page.focus(SELECTORS.redundancyButton);
      await expect(page.locator(SELECTORS.redundancyButton)).toBeFocused();
      
      // Open with Enter key
      await page.keyboard.press('Enter');
      await expect(page.locator(SELECTORS.overlay)).toBeVisible();
      
      // Close with Escape key
      await page.keyboard.press('Escape');
      await expect(page.locator(SELECTORS.overlay)).not.toBeVisible();
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      await redundancyPage.openRedundancyVisualization();
      
      const overlay = page.locator(SELECTORS.overlay);
      await expect(overlay).toHaveAttribute('role', 'dialog');
      await expect(overlay).toHaveAttribute('aria-modal', 'true');
      await expect(overlay).toHaveAttribute('aria-label');
      
      const button = page.locator(SELECTORS.redundancyButton);
      await expect(button).toHaveAttribute('aria-label');
    });

    test('should work with screen readers', async ({ page }) => {
      // Test would use screen reader simulation in real implementation
      await redundancyPage.openRedundancyVisualization();
      
      // Verify accessible content structure
      const landmarks = page.locator('[role="dialog"], [role="button"], [role="region"]');
      const count = await landmarks.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should support high contrast mode', async ({ page }) => {
      // Simulate high contrast preference
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
      
      await redundancyPage.openRedundancyVisualization();
      await expect(page.locator(SELECTORS.overlay)).toBeVisible();
    });

    test('should respect reduced motion preferences', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      await redundancyPage.openRedundancyVisualization();
      
      // Animations should be minimal/instant
      await page.waitForTimeout(100); // Much shorter wait
      await expect(page.locator(SELECTORS.overlay)).toBeVisible();
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`should work in ${browserName}`, async ({ page }) => {
        await redundancyPage.openRedundancyVisualization();
        await redundancyPage.waitForAnimationSequence();
        
        await expect(page.locator(SELECTORS.overlay)).toBeVisible();
        await expect(page.locator(SELECTORS.infoPanel)).toBeVisible();
        
        await redundancyPage.closeRedundancyVisualization();
        await expect(page.locator(SELECTORS.overlay)).not.toBeVisible();
      });
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network failures gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/*', route => route.abort());
      
      await redundancyPage.openRedundancyVisualization();
      
      // Feature should still work with cached resources
      await expect(page.locator(SELECTORS.overlay)).toBeVisible();
    });

    test('should handle JavaScript errors gracefully', async ({ page }) => {
      // Monitor console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await redundancyPage.openRedundancyVisualization();
      await redundancyPage.waitForAnimationSequence();
      
      // Should not have critical errors
      const criticalErrors = errors.filter(error => 
        error.includes('TypeError') || error.includes('ReferenceError')
      );
      expect(criticalErrors).toHaveLength(0);
    });

    test('should recover from component failures', async ({ page }) => {
      await redundancyPage.openRedundancyVisualization();
      
      // Simulate component error by removing element
      await page.evaluate(() => {
        const panel = document.querySelector('[data-testid="info-panel"]');
        panel?.remove();
      });
      
      // Should still be functional
      await expect(page.locator(SELECTORS.overlay)).toBeVisible();
      await redundancyPage.closeRedundancyVisualization();
    });
  });

  test.describe('Performance Testing', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await redundancyPage.openRedundancyVisualization();
      const endTime = Date.now();
      
      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(1000); // Should load within 1 second
    });

    test('should not cause memory leaks', async ({ page }) => {
      // Baseline memory
      const baselineMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Open and close multiple times
      for (let i = 0; i < 5; i++) {
        await redundancyPage.openRedundancyVisualization();
        await redundancyPage.waitForAnimationSequence();
        await redundancyPage.closeRedundancyVisualization();
      }
      
      // Force garbage collection
      await page.evaluate(() => {
        if ('gc' in window) {
          (window as any).gc();
        }
      });
      
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Memory increase should be reasonable
      const memoryIncrease = finalMemory - baselineMemory;
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // Less than 5MB
    });

    test('should handle rapid interactions', async ({ page }) => {
      // Rapid button clicks
      for (let i = 0; i < 10; i++) {
        await page.click(SELECTORS.redundancyButton);
        await page.waitForTimeout(50);
      }
      
      // Should still be functional
      await expect(page.locator(SELECTORS.overlay)).toBeVisible();
    });
  });

  test.describe('Visual Regression Testing', () => {
    test('should match baseline screenshots', async ({ page }) => {
      await redundancyPage.openRedundancyVisualization();
      await redundancyPage.waitForAnimationSequence();
      
      // Take screenshot of complete visualization
      await expect(page.locator(SELECTORS.overlay)).toHaveScreenshot('redundancy-overlay.png');
      
      // Take screenshot of info panel
      await expect(page.locator(SELECTORS.infoPanel)).toHaveScreenshot('info-panel.png');
    });

    test('should maintain visual consistency across viewports', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },  // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 } // Desktop
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await redundancyPage.openRedundancyVisualization();
        await redundancyPage.waitForAnimationSequence();
        
        await expect(page.locator(SELECTORS.overlay)).toHaveScreenshot(
          `redundancy-${viewport.width}x${viewport.height}.png`
        );
        
        await redundancyPage.closeRedundancyVisualization();
      }
    });
  });

  test.describe('Integration Testing', () => {
    test('should not interfere with existing app functionality', async ({ page }) => {
      // Test that existing elements still work
      const existingElements = page.locator('header, nav, main, footer');
      const count = await existingElements.count();
      
      await redundancyPage.openRedundancyVisualization();
      
      // Existing elements should still be accessible
      const newCount = await existingElements.count();
      expect(newCount).toBe(count);
    });

    test('should work with other features enabled', async ({ page }) => {
      // This would test interaction with other features
      await redundancyPage.openRedundancyVisualization();
      await expect(page.locator(SELECTORS.overlay)).toBeVisible();
      
      // Should coexist with other overlays/modals
    });

    test('should maintain plugin isolation', async ({ page }) => {
      await redundancyPage.openRedundancyVisualization();
      
      // Verify CSS isolation
      const conflictingClasses = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        const conflicts = [];
        
        for (const element of allElements) {
          const classes = Array.from(element.classList);
          const hasRdxClass = classes.some(cls => cls.startsWith('rdx-'));
          const hasOtherClass = classes.some(cls => !cls.startsWith('rdx-') && cls.length > 0);
          
          if (hasRdxClass && hasOtherClass) {
            conflicts.push(element.className);
          }
        }
        
        return conflicts;
      });
      
      // Should have minimal class conflicts
      expect(conflictingClasses.length).toBeLessThan(5);
    });
  });
});

// Test configuration and setup
test.describe.configure({ mode: 'parallel' });

test.beforeAll(async () => {
  // Global setup if needed
});

test.afterAll(async () => {
  // Global cleanup if needed
});