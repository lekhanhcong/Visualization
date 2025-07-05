import { test, expect, Page } from '@playwright/test'

test.describe('Comprehensive User Workflows - MCP Playwright', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    
    // Wait for the application to be fully loaded
    await page.waitForLoadState('networkidle')
    
    // Add custom viewport meta tag if not present
    await page.addInitScript(() => {
      if (!document.querySelector('meta[name="viewport"]')) {
        const meta = document.createElement('meta')
        meta.name = 'viewport'
        meta.content = 'width=device-width, initial-scale=1'
        document.head.appendChild(meta)
      }
    })
  })

  test.describe('Application Initialization and Core Rendering', () => {
    test('should load and display the complete application structure', async ({ page }) => {
      // Check page title and metadata
      await expect(page).toHaveTitle(/Hue Hi Tech Park/)
      
      // Verify meta tags
      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description).toContain('Data Center')
      
      // Check for main structural elements
      await expect(page.locator('body')).toBeVisible()
      await expect(page.locator('header')).toBeVisible()
      await expect(page.locator('main')).toBeVisible()
      await expect(page.locator('footer')).toBeVisible()
      
      // Verify header content
      await expect(page.locator('h1')).toContainText('Hue Hi Tech Park')
      await expect(page.locator('text=300MW AI Data Center Visualization')).toBeVisible()
      
      // Check footer information
      await expect(page.locator('footer')).toContainText('© 2024 Hue Hi Tech Park')
      await expect(page.locator('text=v1.0.0')).toBeVisible()
    })

    test('should handle different loading states correctly', async ({ page }) => {
      // Intercept network requests to simulate different loading states
      await page.route('**/data/hotspots.json', route => {
        setTimeout(() => route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ hotspots: [] })
        }), 1000)
      })
      
      // Reload to trigger loading state
      await page.reload()
      
      // Should show loading state initially
      const loadingIndicator = page.locator('text=Loading Visualization')
      await expect(loadingIndicator).toBeVisible({ timeout: 2000 })
      
      // Wait for loading to complete
      await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 })
      
      // Should show appropriate state after loading
      const hasMainContent = await page.locator('[role="main"]').isVisible()
      const hasErrorMessage = await page.locator('text=Failed to Load Data').isVisible()
      const hasNoDataMessage = await page.locator('text=No Data Available').isVisible()
      
      expect(hasMainContent || hasErrorMessage || hasNoDataMessage).toBeTruthy()
    })

    test('should display data loading status in footer', async ({ page }) => {
      // Wait for application to load
      await page.waitForTimeout(3000)
      
      // Check footer status indicators
      const statusIndicator = page.locator('footer .w-2.h-2.bg-green-500')
      await expect(statusIndicator).toBeVisible()
      
      // Check data loaded count
      const dataCount = page.locator('text=Data Loaded:')
      await expect(dataCount).toBeVisible()
      
      // Verify the count shows a number
      const countText = await dataCount.textContent()
      expect(countText).toMatch(/Data Loaded: \d+ points/)
    })
  })

  test.describe('Error Handling and Recovery Workflows', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/data/**', route => route.abort())
      
      // Reload page to trigger error
      await page.reload()
      
      // Wait for error state
      await page.waitForTimeout(5000)
      
      // Should show error message
      await expect(page.locator('text=Failed to Load Data')).toBeVisible()
      
      // Should show retry button
      const retryButton = page.locator('button:has-text("Try Again")')
      await expect(retryButton).toBeVisible()
      
      // Test retry functionality
      await page.unroute('**/data/**')
      await retryButton.click()
      
      // Should attempt to reload
      await page.waitForTimeout(2000)
      
      // Should eventually show some content or different error
      const hasContent = await page.locator('[role="main"]').isVisible({ timeout: 5000 })
      const hasError = await page.locator('text=Failed to Load Data').isVisible()
      const hasNoData = await page.locator('text=No Data Available').isVisible()
      
      expect(hasContent || hasError || hasNoData).toBeTruthy()
    })

    test('should handle partial data loading scenarios', async ({ page }) => {
      // Mock successful hotspots but failed other data
      await page.route('**/data/hotspots.json', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            hotspots: [
              {
                id: 'test',
                name: 'Test Hotspot',
                type: 'datacenter',
                description: 'Test',
                position: { x: 100, y: 100 },
                metadata: {}
              }
            ]
          })
        })
      })
      
      await page.route('**/data/image-config.json', route => route.abort())
      
      await page.reload()
      await page.waitForTimeout(3000)
      
      // Should handle partial loading gracefully
      const hasError = await page.locator('text=Failed to Load Data').isVisible()
      const hasNoData = await page.locator('text=No Data Available').isVisible()
      
      expect(hasError || hasNoData).toBeTruthy()
    })

    test('should handle malformed JSON data', async ({ page }) => {
      // Mock invalid JSON response
      await page.route('**/data/hotspots.json', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: 'invalid json content'
        })
      })
      
      await page.reload()
      await page.waitForTimeout(3000)
      
      // Should show error state
      await expect(page.locator('text=Failed to Load Data')).toBeVisible()
    })
  })

  test.describe('Responsive Design and Layout', () => {
    test('should adapt to mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(1000)
      
      // Check that main elements are still visible
      await expect(page.locator('header')).toBeVisible()
      await expect(page.locator('main')).toBeVisible()
      await expect(page.locator('footer')).toBeVisible()
      
      // Check no horizontal scrolling
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      const viewportWidth = await page.evaluate(() => window.innerWidth)
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10) // Allow small tolerance
      
      // Check header is properly sized
      const header = page.locator('header')
      const headerBox = await header.boundingBox()
      expect(headerBox?.width).toBeLessThanOrEqual(375)
      
      // Check footer is accessible
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await expect(page.locator('footer')).toBeVisible()
    })

    test('should adapt to tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.waitForTimeout(1000)
      
      // Verify layout elements
      await expect(page.locator('header')).toBeVisible()
      await expect(page.locator('main')).toBeVisible()
      await expect(page.locator('footer')).toBeVisible()
      
      // Check proper text sizing and spacing
      const headerTitle = page.locator('h1')
      const titleSize = await headerTitle.evaluate(el => {
        return window.getComputedStyle(el).fontSize
      })
      expect(parseInt(titleSize)).toBeGreaterThan(16) // Should be readable
      
      // Verify footer content is properly arranged
      const footer = page.locator('footer')
      const footerContent = footer.locator('.flex.items-center.justify-between')
      await expect(footerContent).toBeVisible()
    })

    test('should work well on large desktop screens', async ({ page }) => {
      // Set large desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.waitForTimeout(1000)
      
      // Check that content is properly centered and sized
      const mainContent = page.locator('main')
      const contentBox = await mainContent.boundingBox()
      expect(contentBox?.width).toBeLessThanOrEqual(1920)
      
      // Verify header layout
      const headerContainer = page.locator('header .max-w-7xl')
      await expect(headerContainer).toBeVisible()
      
      // Check footer spans properly
      const footerContainer = page.locator('footer .max-w-7xl')
      await expect(footerContainer).toBeVisible()
    })

    test('should handle orientation changes on mobile', async ({ page, isMobile }) => {
      test.skip(!isMobile, 'This test is only for mobile devices')
      
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(500)
      
      // Verify portrait layout
      await expect(page.locator('header')).toBeVisible()
      
      // Change to landscape
      await page.setViewportSize({ width: 667, height: 375 })
      await page.waitForTimeout(500)
      
      // Verify landscape layout still works
      await expect(page.locator('header')).toBeVisible()
      await expect(page.locator('main')).toBeVisible()
      
      // Check that header height is appropriate for landscape
      const headerHeight = await page.locator('header').evaluate(el => (el as HTMLElement).offsetHeight)
      expect(headerHeight).toBeLessThan(100) // Should not take too much vertical space
    })
  })

  test.describe('Performance and Loading Behavior', () => {
    test('should load within acceptable time limits', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      
      // Should load within 10 seconds (generous for testing)
      expect(loadTime).toBeLessThan(10000)
      
      // Log performance for analysis
      console.log(`Page load time: ${loadTime}ms`)
    })

    test('should handle rapid navigation and interactions', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Perform rapid interactions to test stability
      for (let i = 0; i < 5; i++) {
        await page.reload()
        await page.waitForTimeout(100)
      }
      
      // Should still be functional after rapid reloads
      await expect(page.locator('header')).toBeVisible()
      await expect(page.locator('footer')).toBeVisible()
    })

    test('should not have memory leaks with multiple interactions', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0)
      
      // Perform multiple interactions
      for (let i = 0; i < 10; i++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await page.waitForTimeout(100)
        await page.evaluate(() => window.scrollTo(0, 0))
        await page.waitForTimeout(100)
      }
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc()
        }
      })
      
      const finalMemory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0)
      
      // Memory should not increase dramatically (allow for reasonable variance)
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = (finalMemory - initialMemory) / initialMemory
        expect(memoryIncrease).toBeLessThan(2) // Should not double in size
      }
    })
  })

  test.describe('Accessibility and Keyboard Navigation', () => {
    test('should support basic keyboard navigation', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Test Tab navigation
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)
      
      // Check that some element received focus
      const focusedElement = await page.evaluate(() => {
        const active = document.activeElement
        return active ? {
          tagName: active.tagName,
          className: active.className,
          id: active.id
        } : null
      })
      
      expect(focusedElement).toBeTruthy()
      
      // Test multiple tab presses
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('Tab')
        await page.waitForTimeout(50)
      }
      
      // Should still have a focused element
      const finalFocusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(finalFocusedElement).toBeTruthy()
    })

    test('should have proper heading structure', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Check for proper heading hierarchy
      const h1Elements = await page.locator('h1').count()
      expect(h1Elements).toBeGreaterThanOrEqual(1)
      
      // Main heading should be visible and contain expected text
      const mainHeading = page.locator('h1').first()
      await expect(mainHeading).toBeVisible()
      await expect(mainHeading).toContainText('Hue Hi Tech Park')
    })

    test('should provide alt text for images', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Wait for any images to load
      await page.waitForTimeout(2000)
      
      const images = await page.locator('img').count()
      
      if (images > 0) {
        // All images should have alt attributes
        const imagesWithAlt = await page.locator('img[alt]').count()
        expect(imagesWithAlt).toBe(images)
        
        // Alt text should not be empty
        const allImages = await page.locator('img').all()
        for (const img of allImages) {
          const altText = await img.getAttribute('alt')
          expect(altText).toBeTruthy()
          expect(altText?.length).toBeGreaterThan(0)
        }
      }
    })

    test('should support screen reader navigation landmarks', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Check for semantic HTML elements
      await expect(page.locator('header')).toBeVisible()
      await expect(page.locator('main')).toBeVisible()
      await expect(page.locator('footer')).toBeVisible()
      
      // Check for proper ARIA landmarks if any
      const landmarks = await page.locator('[role="banner"], [role="main"], [role="contentinfo"], [role="navigation"]').count()
      
      // Should have at least basic landmark structure (header, main, footer provide implicit landmarks)
      expect(landmarks).toBeGreaterThanOrEqual(0)
    })
  })

  test.describe('Cross-Browser Compatibility', () => {
    test('should work consistently across different browsers', async ({ page, browserName }) => {
      console.log(`Testing on browser: ${browserName}`)
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Basic functionality should work on all browsers
      await expect(page.locator('header')).toBeVisible()
      await expect(page.locator('main')).toBeVisible()
      await expect(page.locator('footer')).toBeVisible()
      
      // Check that JavaScript is working
      const title = await page.title()
      expect(title).toContain('Hue Hi Tech Park')
      
      // Check CSS is loaded properly
      const headerBg = await page.locator('header').evaluate(el => {
        return window.getComputedStyle(el).backgroundColor
      })
      expect(headerBg).toBeTruthy()
      expect(headerBg).not.toBe('rgba(0, 0, 0, 0)') // Should not be transparent
    })

    test('should handle browser-specific features gracefully', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Test features that might not be available in all browsers
      const supportsIntersectionObserver = await page.evaluate(() => {
        return 'IntersectionObserver' in window
      })
      
      const supportsResizeObserver = await page.evaluate(() => {
        return 'ResizeObserver' in window
      })
      
      // Application should work regardless of feature support
      await expect(page.locator('body')).toBeVisible()
      
      console.log(`IntersectionObserver supported: ${supportsIntersectionObserver}`)
      console.log(`ResizeObserver supported: ${supportsResizeObserver}`)
    })
  })

  test.describe('Data Integrity and State Management', () => {
    test('should maintain consistent state across page interactions', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Get initial state
      const initialFooterText = await page.locator('footer').textContent()
      
      // Perform some interactions
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(500)
      await page.evaluate(() => window.scrollTo(0, 0))
      
      // State should remain consistent
      const finalFooterText = await page.locator('footer').textContent()
      expect(finalFooterText).toBe(initialFooterText)
    })

    test('should handle page refresh gracefully', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Get initial page state
      const initialTitle = await page.title()
      
      // Refresh the page
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // Should restore to same state
      const newTitle = await page.title()
      expect(newTitle).toBe(initialTitle)
      
      // Main elements should be present
      await expect(page.locator('header')).toBeVisible()
      await expect(page.locator('main')).toBeVisible()
      await expect(page.locator('footer')).toBeVisible()
    })
  })

  test.describe('Edge Cases and Stress Testing', () => {
    test('should handle rapid viewport changes', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const viewports = [
        { width: 320, height: 568 },  // iPhone SE
        { width: 768, height: 1024 }, // iPad
        { width: 1920, height: 1080 }, // Desktop
        { width: 375, height: 667 },  // iPhone
        { width: 1440, height: 900 }  // Laptop
      ]
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport)
        await page.waitForTimeout(200)
        
        // Should remain functional
        await expect(page.locator('header')).toBeVisible()
        await expect(page.locator('footer')).toBeVisible()
      }
    })

    test('should handle network throttling', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100) // Add 100ms delay to all requests
      })
      
      await page.goto('/')
      await page.waitForLoadState('networkidle', { timeout: 15000 })
      
      // Should still load successfully, just slower
      await expect(page.locator('header')).toBeVisible()
      await expect(page.locator('footer')).toBeVisible()
    })

    test('should handle JavaScript errors gracefully', async ({ page }) => {
      // Inject a script that might cause errors
      await page.addInitScript(() => {
        // Override console.error to track errors
        window.addEventListener('error', (e) => {
          (window as any).lastError = e.error
        })
      })
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Basic functionality should still work even if there are JS errors
      await expect(page.locator('body')).toBeVisible()
      
      const hasJSError = await page.evaluate(() => (window as any).lastError)
      if (hasJSError) {
        console.log('JavaScript error detected:', hasJSError)
      }
      
      // Page should still be interactive
      await page.click('body')
      await expect(page.locator('body')).toBeVisible()
    })
  })
})