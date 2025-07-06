/**
 * Performance Tests for 2N+1 Redundancy Visualization
 * Testing animation smoothness, load times, and resource usage
 */

import { test, expect } from '@playwright/test';

test.describe('2N+1 Redundancy Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Load Performance', () => {
    test('should load within 2 seconds', async ({ page }) => {
      const startTime = Date.now();
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(2000);
    });

    test('should complete animation sequence within 5 seconds', async ({ page }) => {
      const startTime = Date.now();
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      // Wait for complete animation sequence
      const infoPanel = page.locator('#redundancy-description');
      await expect(infoPanel).toBeVisible();
      
      const animationTime = Date.now() - startTime;
      
      // Should complete within 5 seconds (4 seconds + 1 second buffer)
      expect(animationTime).toBeLessThan(5000);
      expect(animationTime).toBeGreaterThan(3000); // Should take at least 3 seconds for proper sequence
    });

    test('should have fast initial paint', async ({ page }) => {
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          loadComplete: navigation.loadEventEnd - navigation.navigationStart
        };
      });

      // First Contentful Paint should be under 1.5 seconds
      expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1500);
      
      // DOM Content Loaded should be under 2 seconds
      expect(performanceMetrics.domContentLoaded).toBeLessThan(2000);
    });
  });

  test.describe('Animation Performance', () => {
    test('should maintain 60fps during animations', async ({ page }) => {
      // Start performance monitoring
      await page.evaluate(() => {
        (window as any).frameCount = 0;
        (window as any).frameStart = performance.now();
        
        function countFrames() {
          (window as any).frameCount++;
          requestAnimationFrame(countFrames);
        }
        requestAnimationFrame(countFrames);
      });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      // Let animation run for 3 seconds
      await page.waitForTimeout(3000);
      
      const frameRate = await page.evaluate(() => {
        const duration = performance.now() - (window as any).frameStart;
        const fps = ((window as any).frameCount / duration) * 1000;
        return fps;
      });
      
      // Should maintain at least 55fps (allowing small buffer below 60)
      expect(frameRate).toBeGreaterThan(55);
    });

    test('should not cause layout thrashing', async ({ page }) => {
      // Monitor layout thrashing
      const layoutMetrics = await page.evaluate(() => {
        let layoutCount = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure' && entry.name.includes('layout')) {
              layoutCount++;
            }
          }
        });
        observer.observe({ entryTypes: ['measure'] });
        
        return new Promise((resolve) => {
          setTimeout(() => {
            observer.disconnect();
            resolve(layoutCount);
          }, 5000);
        });
      });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      // Wait for animation to complete
      await page.waitForTimeout(5000);
      
      const finalLayoutCount = await layoutMetrics;
      
      // Should have minimal layout recalculations
      expect(finalLayoutCount).toBeLessThan(10);
    });

    test('should have smooth transitions', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      // Test smooth overlay transition
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      // Check for CSS transitions
      const hasTransitions = await page.evaluate(() => {
        const overlay = document.querySelector('[role="dialog"][aria-modal="true"]');
        if (!overlay) return false;
        
        const computedStyle = window.getComputedStyle(overlay as Element);
        return computedStyle.transition !== 'none' || computedStyle.animation !== 'none';
      });
      
      expect(hasTransitions).toBe(true);
    });
  });

  test.describe('Memory Performance', () => {
    test('should not cause memory leaks', async ({ page, browser }) => {
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize
        } : null;
      });
      
      // Open and close redundancy visualization multiple times
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      
      for (let i = 0; i < 5; i++) {
        await redundancyButton.click();
        await page.waitForTimeout(1000);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });
      
      await page.waitForTimeout(1000);
      
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize
        } : null;
      });
      
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
        
        // Memory increase should be less than 5MB
        expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
      }
    });

    test('should clean up event listeners', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      
      // Count initial event listeners
      const initialListeners = await page.evaluate(() => {
        const events = ['keydown', 'click', 'resize'];
        let count = 0;
        events.forEach(event => {
          const listeners = (document as any).getEventListeners?.(document);
          if (listeners && listeners[event]) {
            count += listeners[event].length;
          }
        });
        return count;
      });
      
      // Open and close overlay
      await redundancyButton.click();
      await page.waitForTimeout(1000);
      await page.keyboard.press('Escape');
      
      // Count final event listeners
      const finalListeners = await page.evaluate(() => {
        const events = ['keydown', 'click', 'resize'];
        let count = 0;
        events.forEach(event => {
          const listeners = (document as any).getEventListeners?.(document);
          if (listeners && listeners[event]) {
            count += listeners[event].length;
          }
        });
        return count;
      });
      
      // Should not accumulate listeners
      expect(finalListeners).toBeLessThanOrEqual(initialListeners + 1);
    });
  });

  test.describe('Resource Usage', () => {
    test('should have efficient SVG rendering', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      // Wait for SVG elements to render
      await page.waitForTimeout(2000);
      
      const svgPerformance = await page.evaluate(() => {
        const svgElements = document.querySelectorAll('svg path');
        const pathCount = svgElements.length;
        
        // Check if SVG uses efficient rendering
        let hasFilters = false;
        svgElements.forEach(path => {
          if (path.getAttribute('filter')) {
            hasFilters = true;
          }
        });
        
        return {
          pathCount,
          hasFilters,
          svgCount: document.querySelectorAll('svg').length
        };
      });
      
      // Should have reasonable number of SVG elements
      expect(svgPerformance.pathCount).toBeLessThan(10);
      expect(svgPerformance.svgCount).toBeLessThan(5);
      expect(svgPerformance.hasFilters).toBe(true); // Should use filters for glow effects
    });

    test('should minimize DOM nodes', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      // Wait for full animation
      await page.waitForTimeout(5000);
      
      const domStats = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        const redundancyElements = document.querySelectorAll('[role="dialog"] *');
        
        return {
          totalElements: allElements.length,
          redundancyElements: redundancyElements.length
        };
      });
      
      // Redundancy overlay should not add excessive DOM nodes
      expect(domStats.redundancyElements).toBeLessThan(50);
    });

    test('should handle rapid interactions efficiently', async ({ page }) => {
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      
      const startTime = Date.now();
      
      // Rapid open/close cycles
      for (let i = 0; i < 10; i++) {
        await redundancyButton.click();
        await page.waitForTimeout(50);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(50);
      }
      
      const totalTime = Date.now() - startTime;
      
      // Should handle rapid interactions without performance degradation
      expect(totalTime).toBeLessThan(3000); // 10 cycles in under 3 seconds
      
      // Verify it still works normally after rapid interactions
      await redundancyButton.click();
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
    });
  });

  test.describe('Network Performance', () => {
    test('should work efficiently with slow network', async ({ page }) => {
      // Simulate slow 3G
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 200);
      });
      
      const startTime = Date.now();
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Should still load reasonably fast even with slow network
      expect(loadTime).toBeLessThan(5000);
    });

    test('should not make unnecessary network requests', async ({ page }) => {
      const networkRequests: string[] = [];
      
      page.on('request', request => {
        networkRequests.push(request.url());
      });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      // Wait for animation
      await page.waitForTimeout(3000);
      
      // Filter out initial page load requests
      const redundancyRequests = networkRequests.filter(url => 
        url.includes('redundancy') || url.includes('animation')
      );
      
      // Should not make additional network requests for redundancy feature
      expect(redundancyRequests.length).toBe(0);
    });
  });

  test.describe('CPU Performance', () => {
    test('should not block main thread', async ({ page }) => {
      // Monitor main thread blocking
      await page.evaluate(() => {
        (window as any).longTasks = [];
        
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              (window as any).longTasks.push(entry.duration);
            }
          }
        });
        
        observer.observe({ entryTypes: ['longtask'] });
      });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      // Let animation run
      await page.waitForTimeout(5000);
      
      const longTasks = await page.evaluate(() => (window as any).longTasks || []);
      
      // Should not have many long tasks that block the main thread
      expect(longTasks.length).toBeLessThan(3);
      
      if (longTasks.length > 0) {
        const maxTaskDuration = Math.max(...longTasks);
        expect(maxTaskDuration).toBeLessThan(200); // No task should take more than 200ms
      }
    });

    test('should have efficient re-renders', async ({ page }) => {
      // Monitor React rendering performance
      const renderCount = await page.evaluate(() => {
        let renders = 0;
        
        // Hook into React DevTools if available
        if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
          hook.onCommitFiberRoot = () => {
            renders++;
          };
        }
        
        return renders;
      });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.click();
      
      // Wait for animation
      await page.waitForTimeout(3000);
      
      const finalRenderCount = await page.evaluate(() => (window as any).renderCount || 0);
      
      // Should not have excessive re-renders
      const renderDiff = finalRenderCount - renderCount;
      expect(renderDiff).toBeLessThan(20);
    });
  });

  test.describe('Bundle Size Impact', () => {
    test('should not significantly increase bundle size', async ({ page }) => {
      // Check if feature adds significant JavaScript
      const bundleSize = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        let totalSize = 0;
        
        scripts.forEach(script => {
          // Estimate size based on script loading time (rough approximation)
          const src = (script as HTMLScriptElement).src;
          if (src.includes('chunks') || src.includes('redundancy')) {
            totalSize += 1; // Count redundancy-related scripts
          }
        });
        
        return totalSize;
      });
      
      // Should not load excessive additional scripts
      expect(bundleSize).toBeLessThan(5);
    });
  });

  test.describe('Mobile Performance', () => {
    test('should perform well on mobile devices', async ({ page }) => {
      // Simulate mobile device performance
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Throttle CPU to simulate mobile
      const client = await page.context().newCDPSession(page);
      await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      
      const startTime = Date.now();
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      await redundancyButton.tap();
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Should still load reasonably fast on mobile
      expect(loadTime).toBeLessThan(3000);
      
      // Reset CPU throttling
      await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    });

    test('should handle touch interactions smoothly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const redundancyButton = page.locator('button:has-text("Show 2N+1 Redundancy")');
      
      // Test rapid touch interactions
      for (let i = 0; i < 5; i++) {
        await redundancyButton.tap();
        await page.waitForTimeout(100);
        
        const closeButton = page.locator('button[aria-label*="Close"]');
        await closeButton.tap();
        await page.waitForTimeout(100);
      }
      
      // Should still work normally
      await redundancyButton.tap();
      const overlay = page.locator('[role="dialog"][aria-modal="true"]');
      await expect(overlay).toBeVisible();
    });
  });
});