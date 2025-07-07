/**
 * Cross-Browser Compatibility Tests for 2N+1 Redundancy Visualization
 * Tests core functionality across different browsers and devices
 */

import { test, expect, Page, BrowserContext } from '@playwright/test'

// Test data
const TEST_SELECTORS = {
  redundancyButton: '[data-testid="redundancy-toggle-button"]',
  overlay: '[role="dialog"][aria-modal="true"]',
  closeButton: '[data-testid="close-redundancy-button"]',
  powerMap: 'img[alt="Power Map"]',
  statusBadge: '.bg-green-100',
} as const

// Browser-specific timing adjustments
const getBrowserTimings = (browserName: string) => {
  switch (browserName) {
    case 'firefox':
      return { overlayTimeout: 8000, animationDelay: 1000 }
    case 'webkit':
      return { overlayTimeout: 10000, animationDelay: 1500 }
    default: // chromium
      return { overlayTimeout: 5000, animationDelay: 500 }
  }
}

test.describe('Cross-Browser Redundancy Visualization', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle')
    
    // Verify the power map is loaded
    await expect(page.locator(TEST_SELECTORS.powerMap)).toBeVisible()
  })

  test('should display redundancy toggle button across all browsers', async ({ page, browserName }) => {
    const timings = getBrowserTimings(browserName)
    
    // Check if redundancy button is visible
    const redundancyButton = page.locator(TEST_SELECTORS.redundancyButton)
    await expect(redundancyButton).toBeVisible({ timeout: timings.overlayTimeout })
    
    // Verify button text
    await expect(redundancyButton).toContainText('Show 2N+1 Redundancy')
    
    // Verify button is clickable
    await expect(redundancyButton).toBeEnabled()
  })

  test('should open and close overlay in all browsers', async ({ page, browserName }) => {
    const timings = getBrowserTimings(browserName)
    
    // Click redundancy button
    const redundancyButton = page.locator(TEST_SELECTORS.redundancyButton)
    await redundancyButton.click()
    
    // Wait for overlay to appear (browser-specific timing)
    const overlay = page.locator(TEST_SELECTORS.overlay)
    await expect(overlay).toBeVisible({ timeout: timings.overlayTimeout })
    
    // Wait for animations to complete
    await page.waitForTimeout(timings.animationDelay)
    
    // Verify overlay content
    await expect(overlay).toContainText('2N+1 Redundancy Status')
    
    // Close overlay with close button
    const closeButton = page.locator(TEST_SELECTORS.closeButton)
    await closeButton.click()
    
    // Verify overlay is closed
    await expect(overlay).not.toBeVisible()
  })

  test('should handle ESC key closure across browsers', async ({ page, browserName }) => {
    const timings = getBrowserTimings(browserName)
    
    // Open overlay
    await page.locator(TEST_SELECTORS.redundancyButton).click()
    const overlay = page.locator(TEST_SELECTORS.overlay)
    await expect(overlay).toBeVisible({ timeout: timings.overlayTimeout })
    
    // Press ESC key
    await page.keyboard.press('Escape')
    
    // Verify overlay closes
    await expect(overlay).not.toBeVisible()
  })

  test('should maintain performance across browsers', async ({ page, browserName }) => {
    const timings = getBrowserTimings(browserName)
    
    // Measure button click to overlay visible time
    const startTime = Date.now()
    
    await page.locator(TEST_SELECTORS.redundancyButton).click()
    await expect(page.locator(TEST_SELECTORS.overlay)).toBeVisible({ timeout: timings.overlayTimeout })
    
    const endTime = Date.now()
    const openTime = endTime - startTime
    
    // Browser-specific performance expectations
    const performanceThreshold = browserName === 'webkit' ? 3000 : browserName === 'firefox' ? 2000 : 1500
    expect(openTime).toBeLessThan(performanceThreshold)
  })

  test('should display correct animations across browsers', async ({ page, browserName }) => {
    const timings = getBrowserTimings(browserName)
    
    await page.locator(TEST_SELECTORS.redundancyButton).click()
    const overlay = page.locator(TEST_SELECTORS.overlay)
    await expect(overlay).toBeVisible({ timeout: timings.overlayTimeout })
    
    // Wait for full animation sequence
    await page.waitForTimeout(timings.animationDelay + 2000)
    
    // Check for animated elements
    const animatedElements = [
      'path[stroke="#ef4444"]', // Active lines
      'path[stroke="#fbbf24"]', // Standby lines
      '.bg-red-500', // Substation markers
      '.bg-yellow-500'
    ]
    
    for (const selector of animatedElements) {
      await expect(page.locator(selector).first()).toBeVisible()
    }
  })

  test('should handle viewport sizes correctly', async ({ page, browserName }) => {
    const timings = getBrowserTimings(browserName)
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1366, height: 768 },  // Laptop
      { width: 768, height: 1024 },  // Tablet
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.waitForTimeout(500) // Allow layout to settle
      
      // Verify button is still visible and clickable
      const redundancyButton = page.locator(TEST_SELECTORS.redundancyButton)
      await expect(redundancyButton).toBeVisible()
      
      // Test overlay opening
      await redundancyButton.click()
      const overlay = page.locator(TEST_SELECTORS.overlay)
      await expect(overlay).toBeVisible({ timeout: timings.overlayTimeout })
      
      // Close overlay
      await page.keyboard.press('Escape')
      await expect(overlay).not.toBeVisible()
    }
  })

  test('should maintain accessibility across browsers', async ({ page, browserName }) => {
    const timings = getBrowserTimings(browserName)
    
    // Check ARIA attributes
    const redundancyButton = page.locator(TEST_SELECTORS.redundancyButton)
    await expect(redundancyButton).toHaveAttribute('aria-label')
    
    // Open overlay
    await redundancyButton.click()
    const overlay = page.locator(TEST_SELECTORS.overlay)
    await expect(overlay).toBeVisible({ timeout: timings.overlayTimeout })
    
    // Check overlay ARIA attributes
    await expect(overlay).toHaveAttribute('role', 'dialog')
    await expect(overlay).toHaveAttribute('aria-modal', 'true')
    
    // Test keyboard navigation
    const closeButton = page.locator(TEST_SELECTORS.closeButton)
    await expect(closeButton).toBeFocused()
    
    // Tab navigation should work
    await page.keyboard.press('Tab')
    // Should cycle focus within modal
    
    await closeButton.click()
    await expect(overlay).not.toBeVisible()
  })

  test('should handle browser-specific CSS correctly', async ({ page, browserName }) => {
    const timings = getBrowserTimings(browserName)
    
    await page.locator(TEST_SELECTORS.redundancyButton).click()
    const overlay = page.locator(TEST_SELECTORS.overlay)
    await expect(overlay).toBeVisible({ timeout: timings.overlayTimeout })
    
    // Check backdrop blur support
    const backdrop = overlay.locator('.backdrop-blur-sm')
    await expect(backdrop).toBeVisible()
    
    // Check CSS transforms and transitions
    const markers = page.locator('.rounded-full')
    const markerCount = await markers.count()
    expect(markerCount).toBeGreaterThan(0)
    
    // Verify SVG rendering
    const svgElements = page.locator('svg path')
    const svgCount = await svgElements.count()
    expect(svgCount).toBeGreaterThan(0)
    
    await page.keyboard.press('Escape')
  })

  test('should handle JavaScript errors gracefully', async ({ page, browserName }) => {
    let jsErrors: Error[] = []
    
    // Listen for JavaScript errors
    page.on('pageerror', (error) => {
      jsErrors.push(error)
    })
    
    // Trigger redundancy feature
    await page.locator(TEST_SELECTORS.redundancyButton).click()
    
    const timings = getBrowserTimings(browserName)
    await expect(page.locator(TEST_SELECTORS.overlay)).toBeVisible({ timeout: timings.overlayTimeout })
    
    // Wait for full interaction
    await page.waitForTimeout(2000)
    
    // Close overlay
    await page.keyboard.press('Escape')
    
    // Check for JavaScript errors
    expect(jsErrors).toHaveLength(0)
  })
})

test.describe('Browser-Specific Feature Tests', () => {
  test('Chrome: Hardware acceleration features', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome-specific test')
    
    await page.goto('/')
    await page.locator(TEST_SELECTORS.redundancyButton).click()
    await expect(page.locator(TEST_SELECTORS.overlay)).toBeVisible()
    
    // Check for smooth animations (Chrome should handle this well)
    const animatedPath = page.locator('path[stroke="#ef4444"]').first()
    await expect(animatedPath).toBeVisible()
    
    // Verify WebGL/Canvas performance if applicable
    // Chrome-specific performance optimizations
  })

  test('Firefox: CSS Grid and Flexbox compatibility', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox-specific test')
    
    await page.goto('/')
    
    // Test Firefox-specific layout handling
    const header = page.locator('header')
    await expect(header).toBeVisible()
    
    // Firefox flexbox behavior
    const headerContent = page.locator('header .flex')
    await expect(headerContent).toBeVisible()
  })

  test('Safari: WebKit-specific behaviors', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Safari-specific test')
    
    await page.goto('/')
    
    // Test Safari-specific CSS and JavaScript behaviors
    await page.locator(TEST_SELECTORS.redundancyButton).click()
    
    // Safari may need longer for complex animations
    await expect(page.locator(TEST_SELECTORS.overlay)).toBeVisible({ timeout: 10000 })
    
    // Test WebKit scroll behavior
    await page.evaluate(() => window.scrollTo(0, 100))
    await page.waitForTimeout(500)
  })
})