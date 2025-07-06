/**
 * Web Vitals Performance Tests for 2N+1 Redundancy Visualization
 * Real-time monitoring of Core Web Vitals during user interactions
 */

import { test, expect } from '@playwright/test'

interface WebVital {
  name: string
  value: number
  delta: number
  id: string
}

test.describe('Web Vitals Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Inject web-vitals library and collection script
    await page.addInitScript(() => {
      (window as any).webVitalsData = []
      
      // Mock web-vitals functions if not available
      ;(window as any).collectWebVitals = (metric: WebVital) => {
        (window as any).webVitalsData.push(metric)
      }
    })
  })

  test('should measure CLS during redundancy visualization interaction', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    // Start measuring layout shifts
    await page.evaluate(() => {
      let cumulativeLayoutShift = 0
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ((entry as any).hadRecentInput) continue
          cumulativeLayoutShift += (entry as any).value
        }
      })
      
      observer.observe({ type: 'layout-shift', buffered: true })
      
      ;(window as any).getCLS = () => cumulativeLayoutShift
    })
    
    // Wait for initial page load
    await page.waitForLoadState('networkidle')
    
    // Interact with redundancy feature
    const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
    await redundancyButton.click()
    
    // Wait for animation to complete
    await page.waitForTimeout(3000)
    
    // Check final CLS value
    const cls = await page.evaluate(() => (window as any).getCLS())
    
    // CLS should be below 0.1 (good)
    expect(cls).toBeLessThan(0.1)
  })

  test('should measure LCP during page load with redundancy feature', async ({ page }) => {
    let lcpValue = 0
    
    // Set up LCP measurement
    await page.evaluate(() => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        ;(window as any).lcpValue = lastEntry.startTime
      })
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true })
    })
    
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    
    // Get LCP value
    lcpValue = await page.evaluate(() => (window as any).lcpValue || 0)
    
    // LCP should be below 2.5 seconds (good)
    expect(lcpValue).toBeLessThan(2500)
  })

  test('should measure FID during redundancy interaction', async ({ page }) => {
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    
    // Set up FID measurement
    await page.evaluate(() => {
      let firstInputDelay = 0
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ((entry as any).processingStart && (entry as any).startTime) {
            firstInputDelay = (entry as any).processingStart - (entry as any).startTime
            ;(window as any).fidValue = firstInputDelay
            break
          }
        }
      })
      
      observer.observe({ type: 'first-input', buffered: true })
    })
    
    // First user interaction
    const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
    await redundancyButton.click()
    
    // Wait a bit for measurement
    await page.waitForTimeout(500)
    
    // Get FID value
    const fid = await page.evaluate(() => (window as any).fidValue || 0)
    
    // FID should be below 100ms (good)
    expect(fid).toBeLessThan(100)
  })

  test('should maintain good performance during complex animations', async ({ page }) => {
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    
    // Measure frame rate during animation
    await page.evaluate(() => {
      let frameCount = 0
      let startTime = performance.now()
      
      function measureFrameRate() {
        frameCount++
        const currentTime = performance.now()
        
        if (currentTime - startTime >= 1000) {
          ;(window as any).fps = frameCount
          frameCount = 0
          startTime = currentTime
        }
        
        requestAnimationFrame(measureFrameRate)
      }
      
      measureFrameRate()
    })
    
    // Trigger redundancy animation
    const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
    await redundancyButton.click()
    
    // Wait for animation to stabilize
    await page.waitForTimeout(2000)
    
    // Get FPS
    const fps = await page.evaluate(() => (window as any).fps || 0)
    
    // Should maintain at least 30 FPS during animations
    expect(fps).toBeGreaterThan(30)
  })

  test('should measure Time to Interactive (TTI)', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('http://localhost:3001')
    
    // Wait for page to be fully interactive
    await page.waitForLoadState('networkidle')
    
    // Try to interact with the redundancy button
    const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
    await expect(redundancyButton).toBeVisible()
    await redundancyButton.click()
    
    const tti = Date.now() - startTime
    
    // TTI should be below 5 seconds
    expect(tti).toBeLessThan(5000)
  })

  test('should measure Total Blocking Time (TBT)', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    // Measure long tasks
    await page.evaluate(() => {
      let totalBlockingTime = 0
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            totalBlockingTime += entry.duration - 50
          }
        }
        ;(window as any).tbtValue = totalBlockingTime
      })
      
      observer.observe({ type: 'longtask', buffered: true })
    })
    
    // Trigger redundancy feature
    const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
    await redundancyButton.click()
    
    // Wait for tasks to complete
    await page.waitForTimeout(3000)
    
    const tbt = await page.evaluate(() => (window as any).tbtValue || 0)
    
    // TBT should be below 200ms (good)
    expect(tbt).toBeLessThan(200)
  })

  test('should measure resource loading performance', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('http://localhost:3001')
    
    // Measure resource timing
    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource')
      const metrics = {
        totalResources: resources.length,
        totalLoadTime: 0,
        maxLoadTime: 0,
        jsResources: 0,
        cssResources: 0,
        imageResources: 0
      }
      
      resources.forEach((resource: any) => {
        const loadTime = resource.responseEnd - resource.startTime
        metrics.totalLoadTime += loadTime
        metrics.maxLoadTime = Math.max(metrics.maxLoadTime, loadTime)
        
        if (resource.name.endsWith('.js')) metrics.jsResources++
        if (resource.name.endsWith('.css')) metrics.cssResources++
        if (resource.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) metrics.imageResources++
      })
      
      return metrics
    })
    
    // Average resource load time should be reasonable
    const avgLoadTime = resourceMetrics.totalLoadTime / resourceMetrics.totalResources
    expect(avgLoadTime).toBeLessThan(1000) // Average < 1 second
    
    // No single resource should take too long
    expect(resourceMetrics.maxLoadTime).toBeLessThan(3000) // Max < 3 seconds
  })

  test('should handle performance under stress', async ({ page }) => {
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    
    // Simulate stress by rapidly toggling the redundancy feature
    const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
    
    const startTime = Date.now()
    
    // Rapid interactions
    for (let i = 0; i < 10; i++) {
      await redundancyButton.click()
      await page.waitForTimeout(100)
      
      // Close if modal is open
      const overlay = page.locator('[role="dialog"][aria-modal="true"]')
      if (await overlay.isVisible()) {
        await page.keyboard.press('Escape')
        await page.waitForTimeout(100)
      }
    }
    
    const stressTestTime = Date.now() - startTime
    
    // Should handle stress test in reasonable time
    expect(stressTestTime).toBeLessThan(5000)
    
    // Page should still be responsive
    await expect(redundancyButton).toBeVisible()
    await redundancyButton.click()
    const overlay = page.locator('[role="dialog"][aria-modal="true"]')
    await expect(overlay).toBeVisible()
  })

  test('should measure memory usage during redundancy visualization', async ({ page }) => {
    await page.goto('http://localhost:3001')
    await page.waitForLoadState('networkidle')
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : null
    })
    
    if (initialMemory) {
      // Trigger redundancy feature multiple times
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
      
      for (let i = 0; i < 5; i++) {
        await redundancyButton.click()
        await page.waitForTimeout(1000)
        await page.keyboard.press('Escape')
        await page.waitForTimeout(500)
      }
      
      // Get final memory usage
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        } : null
      })
      
      if (finalMemory) {
        // Memory increase should be reasonable (less than 50MB)
        const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // 50MB
        
        // Should not exceed memory limits
        expect(finalMemory.usedJSHeapSize).toBeLessThan(finalMemory.jsHeapSizeLimit * 0.8)
      }
    }
  })
})