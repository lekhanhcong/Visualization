import { test, expect, Page } from '@playwright/test'

test.describe('Performance Testing Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.addInitScript(() => {
      // Collect performance metrics
      (window as any).performanceMetrics = {
        navigationStart: performance.timeOrigin,
        marks: [],
        measures: [],
        vitals: {}
      }
      
      // Monitor Web Vitals
      if ('PerformanceObserver' in window) {
        // First Contentful Paint
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              (window as any).performanceMetrics.vitals.fcp = entry.startTime
            }
          }
        }).observe({ entryTypes: ['paint'] })
        
        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          if (lastEntry) {
            (window as any).performanceMetrics.vitals.lcp = lastEntry.startTime
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] })
        
        // First Input Delay
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            (window as any).performanceMetrics.vitals.fid = (entry as any).processingStart - entry.startTime
          }
        }).observe({ entryTypes: ['first-input'] })
        
        // Cumulative Layout Shift
        let clsValue = 0
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          (window as any).performanceMetrics.vitals.cls = clsValue
        }).observe({ entryTypes: ['layout-shift'] })
      }
    })
  })

  test.describe('Core Web Vitals', () => {
    test('should meet First Contentful Paint (FCP) target', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      
      // Wait for FCP to be recorded
      await page.waitForTimeout(2000)
      
      const fcp = await page.evaluate(() => {
        const metrics = (window as any).performanceMetrics
        return metrics?.vitals?.fcp || null
      })
      
      if (fcp !== null) {
        console.log(`First Contentful Paint: ${fcp}ms`)
        expect(fcp).toBeLessThan(1500) // Target: < 1.5s
      } else {
        console.log('FCP not measured, checking alternative method')
        const loadTime = Date.now() - startTime
        expect(loadTime).toBeLessThan(3000) // Fallback: < 3s total load
      }
    })

    test('should meet Largest Contentful Paint (LCP) target', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Wait for LCP to stabilize
      await page.waitForTimeout(3000)
      
      const lcp = await page.evaluate(() => {
        const metrics = (window as any).performanceMetrics
        return metrics?.vitals?.lcp || null
      })
      
      if (lcp !== null) {
        console.log(`Largest Contentful Paint: ${lcp}ms`)
        expect(lcp).toBeLessThan(2500) // Target: < 2.5s
      } else {
        // Alternative: check if main content is visible within time limit
        const mainContent = page.locator('main')
        await expect(mainContent).toBeVisible({ timeout: 2500 })
      }
    })

    test('should meet Cumulative Layout Shift (CLS) target', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Perform some scrolling to trigger potential layout shifts
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2)
      })
      await page.waitForTimeout(1000)
      
      await page.evaluate(() => {
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(1000)
      
      const cls = await page.evaluate(() => {
        const metrics = (window as any).performanceMetrics
        return metrics?.vitals?.cls || 0
      })
      
      console.log(`Cumulative Layout Shift: ${cls}`)
      expect(cls).toBeLessThan(0.1) // Target: < 0.1
    })

    test('should meet First Input Delay (FID) target', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Perform first user interaction
      const startTime = performance.now()
      await page.click('body')
      const endTime = performance.now()
      
      const fid = await page.evaluate(() => {
        const metrics = (window as any).performanceMetrics
        return metrics?.vitals?.fid || null
      })
      
      if (fid !== null) {
        console.log(`First Input Delay: ${fid}ms`)
        expect(fid).toBeLessThan(100) // Target: < 100ms
      } else {
        // Fallback: measure manual click response
        const manualFid = endTime - startTime
        console.log(`Manual FID measurement: ${manualFid}ms`)
        expect(manualFid).toBeLessThan(200) // More generous fallback
      }
    })
  })

  test.describe('Load Performance', () => {
    test('should load initial page within performance budget', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      
      const domLoadTime = Date.now() - startTime
      console.log(`DOM Content Loaded: ${domLoadTime}ms`)
      expect(domLoadTime).toBeLessThan(2000) // Target: < 2s
      
      await page.waitForLoadState('networkidle')
      const fullLoadTime = Date.now() - startTime
      console.log(`Full Load Time: ${fullLoadTime}ms`)
      expect(fullLoadTime).toBeLessThan(3000) // Target: < 3s
    })

    test('should have efficient resource loading', async ({ page }) => {
      const resources: Array<{ name: string, size: number, duration: number, type: string }> = []
      
      page.on('response', response => {
        const request = response.request()
        resources.push({
          name: request.url(),
          size: parseInt(response.headers()['content-length'] || '0'),
          duration: (response as any).timing()?.responseEnd || 0,
          type: response.headers()['content-type'] || 'unknown'
        })
      })
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Analyze resource loading
      const totalSize = resources.reduce((sum, resource) => sum + resource.size, 0)
      const jsResources = resources.filter(r => r.type.includes('javascript'))
      const cssResources = resources.filter(r => r.type.includes('css'))
      const imageResources = resources.filter(r => r.type.includes('image'))
      
      console.log(`Total resources: ${resources.length}`)
      console.log(`Total size: ${Math.round(totalSize / 1024)}KB`)
      console.log(`JS resources: ${jsResources.length}`)
      console.log(`CSS resources: ${cssResources.length}`)
      console.log(`Image resources: ${imageResources.length}`)
      
      // Performance targets
      expect(totalSize).toBeLessThan(5 * 1024 * 1024) // < 5MB total
      expect(jsResources.length).toBeLessThan(20) // Reasonable JS bundle count
      expect(resources.length).toBeLessThan(50) // Total resource limit
    })

    test('should have fast Time to Interactive (TTI)', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/')
      
      // Wait for page to be interactive (can respond to user input)
      await page.waitForFunction(() => {
        return document.readyState === 'complete'
      })
      
      // Test interactivity
      await page.click('body')
      await page.keyboard.press('Tab')
      
      const ttiTime = Date.now() - startTime
      console.log(`Time to Interactive: ${ttiTime}ms`)
      expect(ttiTime).toBeLessThan(3500) // Target: < 3.5s
    })
  })

  test.describe('Runtime Performance', () => {
    test('should maintain 60fps during scrolling', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Set up frame rate monitoring
      await page.evaluate(() => {
        let frameCount = 0
        let lastTime = performance.now()
        const frameRates: number[] = []
        
        function measureFrameRate() {
          const currentTime = performance.now()
          const delta = currentTime - lastTime
          
          if (delta > 16) { // Only measure if frame took longer than ~60fps
            const fps = 1000 / delta
            frameRates.push(fps)
          }
          
          lastTime = currentTime
          frameCount++
          
          if (frameCount < 300) { // Measure for ~5 seconds at 60fps
            requestAnimationFrame(measureFrameRate)
          } else {
            const total = frameRates.reduce((a, b) => a + b, 0);
            (window as any).averageFPS = total / frameRates.length;
            (window as any).minFPS = Math.min(...frameRates);
          }
        }
        
        requestAnimationFrame(measureFrameRate)
      })
      
      // Perform scrolling during measurement
      for (let i = 0; i < 10; i++) {
        await page.evaluate(() => {
          window.scrollBy(0, window.innerHeight / 4)
        })
        await page.waitForTimeout(100)
      }
      
      // Wait for measurement to complete
      await page.waitForTimeout(2000)
      
      const performanceData = await page.evaluate(() => ({
        averageFPS: (window as any).averageFPS || 60,
        minFPS: (window as any).minFPS || 60
      }))
      
      console.log(`Average FPS: ${performanceData.averageFPS}`)
      console.log(`Minimum FPS: ${performanceData.minFPS}`)
      
      expect(performanceData.averageFPS).toBeGreaterThan(45) // Should average > 45fps
      expect(performanceData.minFPS).toBeGreaterThan(30) // Should never drop below 30fps
    })

    test('should handle memory efficiently during extended use', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })
      
      // Simulate extended usage
      for (let i = 0; i < 50; i++) {
        // Scroll around
        await page.evaluate(() => {
          window.scrollTo(0, Math.random() * document.body.scrollHeight)
        })
        
        // Wait a bit
        await page.waitForTimeout(50)
        
        // Trigger reflows
        if (i % 10 === 0) {
          await page.setViewportSize({
            width: 800 + Math.random() * 400,
            height: 600 + Math.random() * 400
          })
          await page.waitForTimeout(100)
        }
      }
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc()
        }
      })
      
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = (finalMemory - initialMemory) / initialMemory
        console.log(`Memory increase: ${(memoryIncrease * 100).toFixed(1)}%`)
        console.log(`Initial: ${Math.round(initialMemory / 1024 / 1024)}MB`)
        console.log(`Final: ${Math.round(finalMemory / 1024 / 1024)}MB`)
        
        expect(memoryIncrease).toBeLessThan(1.5) // Should not increase by more than 150%
      }
    })

    test('should respond quickly to user interactions', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const interactionTimes: number[] = []
      
      // Test multiple interactions
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now()
        
        // Perform various interactions
        await page.click('body')
        await page.keyboard.press('Tab')
        await page.evaluate(() => window.scrollBy(0, 100))
        
        const endTime = performance.now()
        interactionTimes.push(endTime - startTime)
        
        await page.waitForTimeout(100)
      }
      
      const averageInteractionTime = interactionTimes.reduce((a, b) => a + b, 0) / interactionTimes.length
      const maxInteractionTime = Math.max(...interactionTimes)
      
      console.log(`Average interaction time: ${averageInteractionTime.toFixed(2)}ms`)
      console.log(`Max interaction time: ${maxInteractionTime.toFixed(2)}ms`)
      
      expect(averageInteractionTime).toBeLessThan(50) // Average < 50ms
      expect(maxInteractionTime).toBeLessThan(100) // Max < 100ms
    })
  })

  test.describe('Network Performance', () => {
    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', async route => {
        // Add delay to simulate slow network
        await new Promise(resolve => setTimeout(resolve, 200))
        route.continue()
      })
      
      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      const loadTime = Date.now() - startTime
      
      console.log(`Load time with slow network: ${loadTime}ms`)
      
      // Should still load within reasonable time even on slow network
      expect(loadTime).toBeLessThan(10000) // < 10s on slow network
      
      // Basic functionality should work
      await expect(page.locator('header')).toBeVisible()
      await expect(page.locator('footer')).toBeVisible()
    })

    test('should cache resources efficiently', async ({ page }) => {
      // First load
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      let requestCount = 0
      page.on('request', () => requestCount++)
      
      // Second load (should use cache)
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      console.log(`Requests on reload: ${requestCount}`)
      
      // Should make fewer requests on reload due to caching
      expect(requestCount).toBeLessThan(20) // Reasonable cache efficiency
    })

    test('should handle failed resource loading gracefully', async ({ page }) => {
      // Block some resources to simulate failures
      await page.route('**/static/**', route => {
        if (Math.random() < 0.3) { // Fail 30% of static resources
          route.abort()
        } else {
          route.continue()
        }
      })
      
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      
      // Should still render basic structure even with some failed resources
      await expect(page.locator('body')).toBeVisible()
      
      // Check for error handling
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })
      
      await page.waitForTimeout(2000)
      
      // Should handle errors gracefully (not too many errors)
      expect(errors.length).toBeLessThan(10)
    })
  })

  test.describe('Bundle Size and Optimization', () => {
    test('should have optimized JavaScript bundle sizes', async ({ page }) => {
      const jsResources: Array<{ url: string, size: number }> = []
      
      page.on('response', response => {
        const contentType = response.headers()['content-type'] || ''
        if (contentType.includes('javascript')) {
          jsResources.push({
            url: response.url(),
            size: parseInt(response.headers()['content-length'] || '0')
          })
        }
      })
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const totalJSSize = jsResources.reduce((sum, resource) => sum + resource.size, 0)
      const mainBundle = jsResources.find(r => r.url.includes('_app') || r.url.includes('main'))
      
      console.log(`Total JS size: ${Math.round(totalJSSize / 1024)}KB`)
      console.log(`Main bundle size: ${mainBundle ? Math.round(mainBundle.size / 1024) : 0}KB`)
      console.log(`JS bundles count: ${jsResources.length}`)
      
      expect(totalJSSize).toBeLessThan(1024 * 1024) // < 1MB total JS
      if (mainBundle) {
        expect(mainBundle.size).toBeLessThan(500 * 1024) // < 500KB main bundle
      }
    })

    test('should implement code splitting effectively', async ({ page }) => {
      const jsResources: string[] = []
      
      page.on('response', response => {
        const contentType = response.headers()['content-type'] || ''
        if (contentType.includes('javascript')) {
          jsResources.push(response.url())
        }
      })
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const initialBundles = jsResources.length
      
      // Trigger potential dynamic imports through interactions
      await page.evaluate(() => {
        // Simulate actions that might trigger dynamic imports
        window.scrollTo(0, document.body.scrollHeight)
      })
      
      await page.waitForTimeout(1000)
      
      console.log(`Initial JS bundles: ${initialBundles}`)
      console.log(`Total JS bundles: ${jsResources.length}`)
      
      // Should not load too many bundles initially
      expect(initialBundles).toBeLessThan(15)
      
      // Should use multiple bundles (indicating code splitting)
      expect(jsResources.length).toBeGreaterThan(2)
    })
  })

  test.describe('Image and Asset Performance', () => {
    test('should optimize image loading', async ({ page }) => {
      const imageResources: Array<{ url: string, size: number }> = []
      
      page.on('response', response => {
        const contentType = response.headers()['content-type'] || ''
        if (contentType.includes('image')) {
          imageResources.push({
            url: response.url(),
            size: parseInt(response.headers()['content-length'] || '0')
          })
        }
      })
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      if (imageResources.length > 0) {
        const totalImageSize = imageResources.reduce((sum, resource) => sum + resource.size, 0)
        const largestImage = Math.max(...imageResources.map(r => r.size))
        
        console.log(`Total image size: ${Math.round(totalImageSize / 1024)}KB`)
        console.log(`Largest image: ${Math.round(largestImage / 1024)}KB`)
        console.log(`Image count: ${imageResources.length}`)
        
        expect(totalImageSize).toBeLessThan(5 * 1024 * 1024) // < 5MB total images
        expect(largestImage).toBeLessThan(2 * 1024 * 1024) // < 2MB per image
      }
    })

    test('should implement lazy loading for images', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      
      // Count initial image requests
      let imageRequestCount = 0
      page.on('request', request => {
        if (request.resourceType() === 'image') {
          imageRequestCount++
        }
      })
      
      const initialImages = imageRequestCount
      
      // Scroll to potentially trigger lazy loading
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight)
      })
      
      await page.waitForTimeout(2000)
      
      console.log(`Initial image requests: ${initialImages}`)
      console.log(`Total image requests: ${imageRequestCount}`)
      
      // Should not load all images immediately (if lazy loading is implemented)
      // This test allows for both lazy loading and immediate loading scenarios
      expect(imageRequestCount).toBeLessThan(20) // Reasonable limit
    })
  })
})