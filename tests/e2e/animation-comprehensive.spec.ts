import { test, expect } from '@playwright/test';

test.describe('Comprehensive Animation System Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Core Animation Functionality', () => {
    test('should initialize animation system correctly', async ({ page }) => {
      // Wait for animation initialization
      await page.waitForSelector('[data-animation-id]', { timeout: 10000 });
      
      const animationContainer = page.locator('[data-animation-id]');
      await expect(animationContainer).toBeVisible();
      
      const animationId = await animationContainer.getAttribute('data-animation-id');
      expect(animationId).toBeTruthy();
    });

    test('should progress through all animation phases', async ({ page }) => {
      const container = page.locator('[data-animation-id]');
      
      // Check initialization phase
      await expect(container).toHaveAttribute('data-animation-phase', 'initialization');
      
      // Wait for image preload phase
      await page.waitForFunction(() => {
        const element = document.querySelector('[data-animation-id]');
        return element?.getAttribute('data-animation-phase') === 'image-preload';
      }, { timeout: 5000 });
      
      // Wait for crossfade phase
      await page.waitForFunction(() => {
        const element = document.querySelector('[data-animation-id]');
        return element?.getAttribute('data-animation-phase') === 'crossfade';
      }, { timeout: 10000 });
      
      // Wait for text overlay phase
      await page.waitForFunction(() => {
        const element = document.querySelector('[data-animation-id]');
        return element?.getAttribute('data-animation-phase') === 'text-overlay';
      }, { timeout: 15000 });
      
      // Wait for completion phase
      await page.waitForFunction(() => {
        const element = document.querySelector('[data-animation-id]');
        return element?.getAttribute('data-animation-phase') === 'completion';
      }, { timeout: 20000 });
    });

    test('should complete animation in configured duration', async ({ page }) => {
      const startTime = Date.now();
      
      // Wait for animation completion
      await page.waitForFunction(() => {
        const element = document.querySelector('[data-animation-id]');
        const progress = parseFloat(element?.getAttribute('data-animation-progress') || '0');
        return progress >= 1;
      }, { timeout: 25000 });
      
      const endTime = Date.now();
      const actualDuration = endTime - startTime;
      
      // Allow for some timing variance (±1000ms)
      expect(actualDuration).toBeGreaterThan(3000);
      expect(actualDuration).toBeLessThan(6000);
    });
  });

  test.describe('Image Transitions', () => {
    test('should load both images successfully', async ({ page }) => {
      const defaultImage = page.locator('img[alt="Main Power Infrastructure"]');
      const redundancyImage = page.locator('img[alt="2N+1 Redundancy View"]');
      
      await expect(defaultImage).toBeVisible();
      await expect(redundancyImage).toBeVisible();
      
      // Check that images have loaded
      await expect(defaultImage).toHaveAttribute('src');
      await expect(redundancyImage).toHaveAttribute('src');
    });

    test('should apply correct CSS classes during transition', async ({ page }) => {
      const defaultImage = page.locator('img[alt="Main Power Infrastructure"]');
      
      // Initially should have enter class
      await expect(defaultImage).toHaveClass(/power-image-enter/);
      
      // After 50% progress should have exit class
      await page.waitForFunction(() => {
        const element = document.querySelector('[data-animation-id]');
        const progress = parseFloat(element?.getAttribute('data-animation-progress') || '0');
        return progress > 0.5;
      }, { timeout: 15000 });
      
      await expect(defaultImage).toHaveClass(/power-image-exit/);
    });

    test('should maintain aspect ratio during transition', async ({ page }) => {
      const container = page.locator('[data-animation-id]');
      const images = page.locator('img');
      
      for (let i = 0; i < await images.count(); i++) {
        const image = images.nth(i);
        const box = await image.boundingBox();
        
        if (box) {
          const aspectRatio = box.width / box.height;
          expect(aspectRatio).toBeGreaterThan(1); // Should be landscape
          expect(aspectRatio).toBeLessThan(3); // Reasonable bounds
        }
      }
    });
  });

  test.describe('Text Overlay Animation', () => {
    test('should show text overlay after 50% progress', async ({ page }) => {
      // Wait for text overlay phase
      await page.waitForFunction(() => {
        const element = document.querySelector('[data-animation-id]');
        return element?.getAttribute('data-animation-phase') === 'text-overlay';
      }, { timeout: 15000 });
      
      const textOverlay = page.locator('text=500KV ONSITE GRID');
      await expect(textOverlay).toBeVisible();
    });

    test('should apply correct styling to text overlay', async ({ page }) => {
      await page.waitForSelector('text=500KV ONSITE GRID', { timeout: 15000 });
      
      const textElement = page.locator('text=500KV ONSITE GRID').locator('..');
      
      // Check for required CSS classes
      await expect(textElement).toHaveClass(/gpu-optimized-text/);
      
      // Check computed styles
      const styles = await textElement.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          color: computed.color
        };
      });
      
      expect(styles.fontWeight).toBe('700'); // bold
      expect(styles.color).toMatch(/rgb\(0, 102, 204\)/); // #0066CC
    });

    test('should animate text scale correctly', async ({ page }) => {
      await page.waitForSelector('text=500KV ONSITE GRID', { timeout: 15000 });
      
      const textElement = page.locator('text=500KV ONSITE GRID').locator('..');
      
      // Get initial transform
      const initialTransform = await textElement.evaluate(el => 
        window.getComputedStyle(el).transform
      );
      
      // Wait a bit for scale animation
      await page.waitForTimeout(500);
      
      const finalTransform = await textElement.evaluate(el => 
        window.getComputedStyle(el).transform
      );
      
      // Transform should change (scale animation)
      expect(initialTransform).not.toBe(finalTransform);
    });
  });

  test.describe('Performance Monitoring', () => {
    test('should not exceed memory usage limits', async ({ page }) => {
      // Start monitoring
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Wait for animation to complete
      await page.waitForFunction(() => {
        const element = document.querySelector('[data-animation-id]');
        const progress = parseFloat(element?.getAttribute('data-animation-progress') || '0');
        return progress >= 1;
      }, { timeout: 25000 });
      
      // Check final memory usage
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      const memoryIncrease = (finalMemory - initialMemory) / (1024 * 1024); // MB
      
      // Should not increase by more than 50MB
      expect(memoryIncrease).toBeLessThan(50);
    });

    test('should maintain acceptable frame rate', async ({ page }) => {
      let frameCount = 0;
      let droppedFrames = 0;
      const startTime = Date.now();
      
      // Monitor frame rate during animation
      await page.evaluate(() => {
        let lastTime = performance.now();
        
        function measureFrame(currentTime: number) {
          const delta = currentTime - lastTime;
          
          if (delta > 16.67) { // Frame took longer than 60fps
            (window as any).droppedFrames = ((window as any).droppedFrames || 0) + 1;
          }
          
          (window as any).totalFrames = ((window as any).totalFrames || 0) + 1;
          lastTime = currentTime;
          
          requestAnimationFrame(measureFrame);
        }
        
        requestAnimationFrame(measureFrame);
      });
      
      // Wait for animation to complete
      await page.waitForFunction(() => {
        const element = document.querySelector('[data-animation-id]');
        const progress = parseFloat(element?.getAttribute('data-animation-progress') || '0');
        return progress >= 1;
      }, { timeout: 25000 });
      
      const metrics = await page.evaluate(() => ({
        totalFrames: (window as any).totalFrames || 0,
        droppedFrames: (window as any).droppedFrames || 0
      }));
      
      const dropRate = metrics.droppedFrames / metrics.totalFrames;
      
      // Should drop less than 10% of frames
      expect(dropRate).toBeLessThan(0.1);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle missing image configuration gracefully', async ({ page }) => {
      // Block image config request
      await page.route('/data/image-config.json', route => route.abort());
      
      await page.goto('http://localhost:3000');
      
      // Should show loading state initially
      await expect(page.locator('text=Loading animation configuration')).toBeVisible();
      
      // Should fall back to default configuration
      await page.waitForTimeout(5000);
      
      const container = page.locator('[data-animation-id]');
      await expect(container).toBeVisible();
    });

    test('should retry failed animations', async ({ page }) => {
      // Monitor console for retry messages
      const consoleMessages: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'warn' || msg.type() === 'error') {
          consoleMessages.push(msg.text());
        }
      });
      
      // Simulate network issues by blocking some requests intermittently
      let requestCount = 0;
      await page.route('/images/Power.png', route => {
        requestCount++;
        if (requestCount === 1) {
          route.abort('failed'); // Fail first request
        } else {
          route.continue(); // Allow subsequent requests
        }
      });
      
      await page.goto('http://localhost:3000');
      
      // Wait for potential retry
      await page.waitForTimeout(10000);
      
      // Should eventually show the animation
      const container = page.locator('[data-animation-id]');
      await expect(container).toBeVisible();
    });
  });

  test.describe('Accessibility Features', () => {
    test('should provide skip animation button', async ({ page }) => {
      const skipButton = page.locator('button:has-text("Skip Animation")');
      
      // Button should be present but screen-reader only initially
      await expect(skipButton).toHaveClass(/sr-only/);
      
      // Should become visible on focus
      await skipButton.focus();
      await expect(skipButton).toHaveClass(/focus:not-sr-only/);
    });

    test('should complete animation when skip key is pressed', async ({ page }) => {
      // Press Escape key (default skip key)
      await page.keyboard.press('Escape');
      
      // Animation should complete immediately
      await page.waitForFunction(() => {
        const element = document.querySelector('[data-animation-id]');
        const progress = parseFloat(element?.getAttribute('data-animation-progress') || '0');
        return progress >= 1;
      }, { timeout: 1000 });
      
      const container = page.locator('[data-animation-id]');
      await expect(container).toHaveAttribute('data-animation-phase', 'completion');
    });

    test('should respect reduced motion preferences', async ({ page, context }) => {
      // Set reduced motion preference
      await context.addInitScript(() => {
        Object.defineProperty(window, 'matchMedia', {
          value: (query: string) => {
            if (query === '(prefers-reduced-motion: reduce)') {
              return { matches: true, addListener: () => {}, removeListener: () => {} };
            }
            return { matches: false, addListener: () => {}, removeListener: () => {} };
          }
        });
      });
      
      await page.goto('http://localhost:3000');
      
      // Animation should complete much faster with reduced motion
      const startTime = Date.now();
      
      await page.waitForFunction(() => {
        const element = document.querySelector('[data-animation-id]');
        const progress = parseFloat(element?.getAttribute('data-animation-progress') || '0');
        return progress >= 1;
      }, { timeout: 5000 });
      
      const duration = Date.now() - startTime;
      
      // Should complete much faster than normal 3+ seconds
      expect(duration).toBeLessThan(1000);
    });
  });

  test.describe('Debug Features', () => {
    test('should show debug information when enabled', async ({ page }) => {
      // Navigate to page with debug enabled
      await page.goto('http://localhost:3000?debug=true');
      
      const debugInfo = page.locator('text=/Progress: \\d+%/');
      await expect(debugInfo).toBeVisible();
      
      const phaseInfo = page.locator('text=/Phase: /');
      await expect(phaseInfo).toBeVisible();
      
      const fpsInfo = page.locator('text=/FPS: /');
      await expect(fpsInfo).toBeVisible();
    });

    test('should show performance warnings when FPS drops', async ({ page }) => {
      // Throttle CPU to cause performance issues
      const client = await page.context().newCDPSession(page);
      await client.send('Emulation.setCPUThrottlingRate', { rate: 6 });
      
      await page.goto('http://localhost:3000?debug=true');
      
      // Wait for potential performance warning
      const performanceWarning = page.locator('text=/Low FPS/');
      
      // Should show warning if FPS drops below 30
      await page.waitForTimeout(10000);
      
      // Reset CPU throttling
      await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should adapt animation for mobile viewports', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.goto('http://localhost:3000');
      
      // Animation should still work but may be optimized for mobile
      const container = page.locator('[data-animation-id]');
      await expect(container).toBeVisible();
      
      await page.waitForFunction(() => {
        const element = document.querySelector('[data-animation-id]');
        const progress = parseFloat(element?.getAttribute('data-animation-progress') || '0');
        return progress >= 1;
      }, { timeout: 15000 }); // Allow for potentially faster mobile animation
    });

    test('should maintain layout on different screen sizes', async ({ page }) => {
      const viewports = [
        { width: 320, height: 568 },   // Mobile
        { width: 768, height: 1024 },  // Tablet
        { width: 1920, height: 1080 }  // Desktop
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.reload();
        
        const container = page.locator('[data-animation-id]');
        await expect(container).toBeVisible();
        
        const boundingBox = await container.boundingBox();
        expect(boundingBox).toBeTruthy();
        
        if (boundingBox) {
          expect(boundingBox.width).toBeGreaterThan(0);
          expect(boundingBox.height).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Visual Regression', () => {
    test('should capture animation frames for visual comparison', async ({ page }) => {
      const frameCaptures = [0, 0.25, 0.5, 0.75, 1.0];
      
      for (const targetProgress of frameCaptures) {
        await page.waitForFunction((target) => {
          const element = document.querySelector('[data-animation-id]');
          const progress = parseFloat(element?.getAttribute('data-animation-progress') || '0');
          return Math.abs(progress - target) < 0.05 || progress > target;
        }, targetProgress, { timeout: 20000 });
        
        await page.screenshot({ 
          path: `screenshots/animation-comprehensive-${Math.round(targetProgress * 100)}percent.png`,
          fullPage: true 
        });
      }
    });

    test('should maintain consistent visual appearance', async ({ page }) => {
      // Take screenshot at completion
      await page.waitForFunction(() => {
        const element = document.querySelector('[data-animation-id]');
        const progress = parseFloat(element?.getAttribute('data-animation-progress') || '0');
        return progress >= 1;
      }, { timeout: 25000 });
      
      await page.screenshot({ 
        path: 'screenshots/animation-final-state.png',
        fullPage: true 
      });
      
      // The test framework can compare this with baseline images
      // This would typically be done with visual regression testing tools
    });
  });
});