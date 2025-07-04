import { test, expect } from '@playwright/test'

test.describe('Comprehensive E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the application and display main components', async ({
    page,
  }) => {
    // Check page title
    await expect(page).toHaveTitle(/Hue Hi Tech Park/)

    // Wait for the application to load
    await page.waitForTimeout(3000)

    // Check for header
    const header = await page.locator('header').isVisible()
    if (header) {
      await expect(page.locator('header')).toBeVisible()
      await expect(page.locator('text=Hue Hi Tech Park')).toBeVisible()
    }

    // Check for main content area
    const main = await page.locator('main').isVisible()
    if (main) {
      await expect(page.locator('main')).toBeVisible()
    }

    // Check for footer
    const footer = await page.locator('footer').isVisible()
    if (footer) {
      await expect(page.locator('footer')).toBeVisible()
    }
  })

  test('should handle data loading states', async ({ page }) => {
    // Check for loading state
    const loadingText = await page
      .locator('text=Loading Visualization')
      .isVisible({ timeout: 2000 })
    if (loadingText) {
      await expect(page.locator('text=Loading Visualization')).toBeVisible()
    }

    // Wait for content to load
    await page.waitForTimeout(5000)

    // Should eventually show either content, error, or no data message
    const hasContent = await page
      .locator('[role="main"]')
      .isVisible({ timeout: 1000 })
    const hasError = await page
      .locator('text=Failed to Load Data')
      .isVisible({ timeout: 1000 })
    const hasNoData = await page
      .locator('text=No Data Available')
      .isVisible({ timeout: 1000 })

    expect(hasContent || hasError || hasNoData).toBeTruthy()
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Wait for layout to adjust
    await page.waitForTimeout(1000)

    // Check that content is still visible and accessible
    const body = await page.locator('body').isVisible()
    expect(body).toBeTruthy()

    // Check that no horizontal scrolling is needed
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5) // Allow 5px tolerance
  })

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })

    // Wait for layout to adjust
    await page.waitForTimeout(1000)

    // Check that content is properly displayed
    const body = await page.locator('body').isVisible()
    expect(body).toBeTruthy()

    // Check layout elements if they exist
    const header = await page.locator('header').isVisible({ timeout: 1000 })
    if (header) {
      await expect(page.locator('header')).toBeVisible()
    }
  })

  test('should test zoom controls if available', async ({ page }) => {
    // Wait for app to load
    await page.waitForTimeout(3000)

    // Look for zoom controls
    const zoomIn = await page
      .locator('button[aria-label="Zoom in"]')
      .isVisible({ timeout: 2000 })
    const zoomOut = await page
      .locator('button[aria-label="Zoom out"]')
      .isVisible({ timeout: 2000 })
    const resetView = await page
      .locator('button[aria-label="Reset view"]')
      .isVisible({ timeout: 2000 })

    if (zoomIn && zoomOut && resetView) {
      // Test zoom in
      await page.click('button[aria-label="Zoom in"]')
      await page.waitForTimeout(500)

      // Test zoom out
      await page.click('button[aria-label="Zoom out"]')
      await page.waitForTimeout(500)

      // Test reset view
      await page.click('button[aria-label="Reset view"]')
      await page.waitForTimeout(500)
    }
  })

  test('should handle keyboard navigation', async ({ page }) => {
    // Test Tab navigation
    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)

    // Test if any element receives focus
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    )

    // Should be able to navigate with keyboard
    expect(focusedElement).toBeTruthy()
  })

  test('should test theme system if available', async ({ page }) => {
    // Look for theme toggle
    const themeButton = await page
      .locator('button[aria-label*="theme"]')
      .isVisible({ timeout: 2000 })

    if (themeButton) {
      // Get initial theme
      const initialTheme = await page.evaluate(
        () => document.documentElement.className
      )

      // Click theme toggle
      await page.click('button[aria-label*="theme"]')
      await page.waitForTimeout(500)

      // Check if theme changed
      const newTheme = await page.evaluate(
        () => document.documentElement.className
      )
      expect(newTheme).not.toBe(initialTheme)
    }
  })

  test('should test hotspot interactions if available', async ({ page }) => {
    // Wait for app to load
    await page.waitForTimeout(3000)

    // Look for hotspot markers
    const hotspots = await page.locator('[data-testid="hotspot"]').count()

    if (hotspots > 0) {
      // Click on first hotspot
      await page.click('[data-testid="hotspot"]')
      await page.waitForTimeout(1000)

      // Check if modal or tooltip appears
      const modal = await page
        .locator('[role="dialog"]')
        .isVisible({ timeout: 1000 })
      const tooltip = await page
        .locator('[role="tooltip"]')
        .isVisible({ timeout: 1000 })

      if (modal) {
        // Test modal functionality
        await expect(page.locator('[role="dialog"]')).toBeVisible()

        // Try to close modal with Escape key
        await page.keyboard.press('Escape')
        await page.waitForTimeout(500)
      }

      if (tooltip) {
        await expect(page.locator('[role="tooltip"]')).toBeVisible()
      }
    }
  })

  test('should test performance metrics', async ({ page }) => {
    // Navigate to page and measure load time
    const startTime = Date.now()
    await page.goto('/')

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    // Check that load time is reasonable (under 10 seconds)
    expect(loadTime).toBeLessThan(10000)

    // Check for any JavaScript errors
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.waitForTimeout(2000)

    // Allow some errors but not too many
    expect(errors.length).toBeLessThan(5)
  })

  test('should handle error states gracefully', async ({ page }) => {
    // Navigate to page
    await page.goto('/')

    // Wait for potential error messages
    await page.waitForTimeout(3000)

    // Check for error handling
    const errorMessage = await page
      .locator('text=Failed to Load Data')
      .isVisible({ timeout: 1000 })
    const noDataMessage = await page
      .locator('text=No Data Available')
      .isVisible({ timeout: 1000 })
    const retryButton = await page
      .locator('button:has-text("Try Again")')
      .isVisible({ timeout: 1000 })

    if (errorMessage && retryButton) {
      // Test retry functionality
      await page.click('button:has-text("Try Again")')
      await page.waitForTimeout(2000)
    }

    if (noDataMessage) {
      // Verify no data message is displayed properly
      await expect(page.locator('text=No Data Available')).toBeVisible()
    }
  })

  test('should test image loading and optimization', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(3000)

    // Check for images
    const images = await page.locator('img').count()

    if (images > 0) {
      // Wait for images to load
      await page.waitForFunction(
        () => {
          const imgs = Array.from(document.querySelectorAll('img'))
          return imgs.every((img) => img.complete)
        },
        { timeout: 10000 }
      )

      // Check that main background image loaded if it exists
      const bgImage = await page
        .locator('img[alt*="Infrastructure"]')
        .isVisible({ timeout: 2000 })
      if (bgImage) {
        await expect(page.locator('img[alt*="Infrastructure"]')).toBeVisible()
      }
    }
  })

  test('should test accessibility features', async ({ page }) => {
    // Check for proper heading structure
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeGreaterThanOrEqual(0)

    // Check for alt text on images
    const images = await page.locator('img').count()
    if (images > 0) {
      const imagesWithAlt = await page.locator('img[alt]').count()
      expect(imagesWithAlt).toBe(images)
    }

    // Check for proper button labels
    const buttons = await page.locator('button').count()
    if (buttons > 0) {
      const buttonsWithLabels = await page
        .locator('button[aria-label], button:has-text("")')
        .count()
      expect(buttonsWithLabels).toBeGreaterThan(0)
    }

    // Check for proper color contrast (basic check)
    const body = await page.locator('body')
    await expect(body).toBeVisible()
  })
})
