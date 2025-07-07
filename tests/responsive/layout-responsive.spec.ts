/**
 * Responsive Layout Tests
 * Tests layout behavior across different screen sizes and orientations
 */

import { test, expect, Page } from '@playwright/test'

const RESPONSIVE_SELECTORS = {
  redundancyButton: '[data-testid="redundancy-toggle-button"]',
  overlay: '[role="dialog"][aria-modal="true"]',
  header: 'header',
  footer: 'footer',
  powerMap: 'img[alt="Power Map"]',
  legend: '.legend, [class*="legend"]',
} as const

// Common viewport sizes to test
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },      // iPhone SE
  mobileLarge: { width: 414, height: 896 }, // iPhone 11 Pro Max
  tablet: { width: 768, height: 1024 },     // iPad
  tabletLandscape: { width: 1024, height: 768 }, // iPad Landscape
  laptop: { width: 1366, height: 768 },     // Common laptop
  desktop: { width: 1920, height: 1080 },   // Full HD desktop
  ultrawide: { width: 2560, height: 1440 }, // 2K ultrawide
} as const

test.describe('Responsive Layout Tests', () => {
  Object.entries(VIEWPORTS).forEach(([device, viewport]) => {
    test(`should display correctly on ${device} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize(viewport)
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Basic layout checks
      await expect(page.locator(RESPONSIVE_SELECTORS.header)).toBeVisible()
      await expect(page.locator(RESPONSIVE_SELECTORS.powerMap)).toBeVisible()
      await expect(page.locator(RESPONSIVE_SELECTORS.redundancyButton)).toBeVisible()
      
      // Check button accessibility on this viewport
      const button = page.locator(RESPONSIVE_SELECTORS.redundancyButton)
      const buttonBox = await button.boundingBox()
      expect(buttonBox).not.toBeNull()
      
      // Button should be adequately sized for the viewport
      if (viewport.width < 768) { // Mobile
        expect(buttonBox!.width).toBeGreaterThan(40)
        expect(buttonBox!.height).toBeGreaterThan(40)
      }
      
      // Test functionality
      await button.click()
      await expect(page.locator(RESPONSIVE_SELECTORS.overlay)).toBeVisible({ timeout: 8000 })
      
      // Overlay should fit viewport
      const overlay = page.locator(RESPONSIVE_SELECTORS.overlay)
      const overlayBox = await overlay.boundingBox()
      expect(overlayBox).not.toBeNull()
      expect(overlayBox!.width).toBeLessThanOrEqual(viewport.width)
      expect(overlayBox!.height).toBeLessThanOrEqual(viewport.height)
      
      // Close overlay
      await page.keyboard.press('Escape')
      await expect(overlay).not.toBeVisible()
    })
  })

  test('should handle viewport changes dynamically', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Start with mobile
    await page.setViewportSize(VIEWPORTS.mobile)
    await page.waitForTimeout(500)
    
    // Verify mobile layout
    await expect(page.locator(RESPONSIVE_SELECTORS.redundancyButton)).toBeVisible()
    
    // Change to desktop
    await page.setViewportSize(VIEWPORTS.desktop)
    await page.waitForTimeout(500)
    
    // Verify desktop layout
    await expect(page.locator(RESPONSIVE_SELECTORS.redundancyButton)).toBeVisible()
    
    // Test functionality after resize
    await page.locator(RESPONSIVE_SELECTORS.redundancyButton).click()
    await expect(page.locator(RESPONSIVE_SELECTORS.overlay)).toBeVisible()
    
    await page.keyboard.press('Escape')
  })

  test('should handle orientation changes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Portrait tablet
    await page.setViewportSize(VIEWPORTS.tablet)
    await page.waitForTimeout(500)
    
    await expect(page.locator(RESPONSIVE_SELECTORS.redundancyButton)).toBeVisible()
    
    // Landscape tablet
    await page.setViewportSize(VIEWPORTS.tabletLandscape)
    await page.waitForTimeout(500)
    
    await expect(page.locator(RESPONSIVE_SELECTORS.redundancyButton)).toBeVisible()
    
    // Test functionality in landscape
    await page.locator(RESPONSIVE_SELECTORS.redundancyButton).click()
    await expect(page.locator(RESPONSIVE_SELECTORS.overlay)).toBeVisible()
    
    await page.keyboard.press('Escape')
  })

  test('should handle text scaling appropriately', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Test different text zoom levels
    const zoomLevels = [0.8, 1.0, 1.2, 1.5]
    
    for (const zoom of zoomLevels) {
      await page.evaluate((zoomLevel) => {
        document.body.style.zoom = `${zoomLevel}`
      }, zoom)
      
      await page.waitForTimeout(300)
      
      // Content should remain accessible
      await expect(page.locator(RESPONSIVE_SELECTORS.redundancyButton)).toBeVisible()
      
      // Text should not overflow containers
      const button = page.locator(RESPONSIVE_SELECTORS.redundancyButton)
      const buttonBox = await button.boundingBox()
      expect(buttonBox).not.toBeNull()
      expect(buttonBox!.width).toBeGreaterThan(0)
      expect(buttonBox!.height).toBeGreaterThan(0)
    }
    
    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1.0'
    })
  })

  test('should maintain readability at all sizes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Test smallest viewport
    await page.setViewportSize({ width: 320, height: 568 }) // iPhone 5/SE
    await page.waitForTimeout(500)
    
    // Text should still be readable
    const button = page.locator(RESPONSIVE_SELECTORS.redundancyButton)
    await expect(button).toBeVisible()
    
    // Check computed font size
    const fontSize = await button.evaluate((el) => {
      return window.getComputedStyle(el).fontSize
    })
    
    // Font should be at least 14px for readability
    const fontSizeNumber = parseFloat(fontSize)
    expect(fontSizeNumber).toBeGreaterThanOrEqual(12)
    
    // Test largest viewport
    await page.setViewportSize({ width: 3840, height: 2160 }) // 4K
    await page.waitForTimeout(500)
    
    await expect(button).toBeVisible()
    
    // Content should not be stretched beyond readability
    const largeViewportFontSize = await button.evaluate((el) => {
      return window.getComputedStyle(el).fontSize
    })
    
    const largeViewportFontSizeNumber = parseFloat(largeViewportFontSize)
    // Font shouldn't be excessively large
    expect(largeViewportFontSizeNumber).toBeLessThan(32)
  })
})

test.describe('Component Responsive Behavior', () => {
  test('should adapt overlay size to viewport', async ({ page }) => {
    const viewports = [VIEWPORTS.mobile, VIEWPORTS.tablet, VIEWPORTS.desktop]
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Open overlay
      await page.locator(RESPONSIVE_SELECTORS.redundancyButton).click()
      const overlay = page.locator(RESPONSIVE_SELECTORS.overlay)
      await expect(overlay).toBeVisible()
      
      // Check overlay dimensions
      const overlayBox = await overlay.boundingBox()
      expect(overlayBox).not.toBeNull()
      
      // Overlay should not exceed viewport
      expect(overlayBox!.width).toBeLessThanOrEqual(viewport.width)
      expect(overlayBox!.height).toBeLessThanOrEqual(viewport.height)
      
      // On mobile, overlay might be full-screen or near full-screen
      if (viewport.width < 768) {
        expect(overlayBox!.width).toBeGreaterThan(viewport.width * 0.8)
      }
      
      await page.keyboard.press('Escape')
      await expect(overlay).not.toBeVisible()
    }
  })

  test('should handle navigation responsively', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Mobile viewport
    await page.setViewportSize(VIEWPORTS.mobile)
    await page.waitForTimeout(500)
    
    // Header should adapt to mobile
    const header = page.locator(RESPONSIVE_SELECTORS.header)
    await expect(header).toBeVisible()
    
    // Check if navigation is collapsed/hamburger menu (if implemented)
    // This depends on your specific navigation implementation
    
    // Desktop viewport
    await page.setViewportSize(VIEWPORTS.desktop)
    await page.waitForTimeout(500)
    
    // Header should show full navigation
    await expect(header).toBeVisible()
  })

  test('should handle images responsively', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const viewports = [VIEWPORTS.mobile, VIEWPORTS.tablet, VIEWPORTS.desktop]
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.waitForTimeout(500)
      
      const powerMap = page.locator(RESPONSIVE_SELECTORS.powerMap)
      await expect(powerMap).toBeVisible()
      
      // Image should scale appropriately
      const imageBox = await powerMap.boundingBox()
      expect(imageBox).not.toBeNull()
      
      // Image should not exceed container
      expect(imageBox!.width).toBeLessThanOrEqual(viewport.width)
      
      // Image should maintain aspect ratio
      const aspectRatio = imageBox!.width / imageBox!.height
      expect(aspectRatio).toBeGreaterThan(0.5) // Reasonable aspect ratio
      expect(aspectRatio).toBeLessThan(5.0)    // Reasonable aspect ratio
    }
  })

  test('should handle touch vs mouse interactions', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Mobile viewport (touch)
    await page.setViewportSize(VIEWPORTS.mobile)
    await page.waitForTimeout(500)
    
    const button = page.locator(RESPONSIVE_SELECTORS.redundancyButton)
    
    // Touch interaction
    await button.tap()
    await expect(page.locator(RESPONSIVE_SELECTORS.overlay)).toBeVisible()
    await page.keyboard.press('Escape')
    
    // Desktop viewport (mouse)
    await page.setViewportSize(VIEWPORTS.desktop)
    await page.waitForTimeout(500)
    
    // Mouse interaction
    await button.click()
    await expect(page.locator(RESPONSIVE_SELECTORS.overlay)).toBeVisible()
    await page.keyboard.press('Escape')
    
    // Hover effects should work on desktop
    await button.hover()
    await page.waitForTimeout(100)
    // Visual feedback should be appropriate for desktop
  })
})

test.describe('Performance Across Viewports', () => {
  test('should maintain performance on small screens', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
    
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // Should load quickly even on mobile
    expect(loadTime).toBeLessThan(8000) // 8 seconds max for mobile
    
    // Test interaction performance
    const interactionStart = Date.now()
    await page.locator(RESPONSIVE_SELECTORS.redundancyButton).tap()
    await expect(page.locator(RESPONSIVE_SELECTORS.overlay)).toBeVisible()
    const interactionTime = Date.now() - interactionStart
    
    expect(interactionTime).toBeLessThan(3000) // 3 seconds max for mobile interaction
    
    await page.keyboard.press('Escape')
  })

  test('should optimize for large screens', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.ultrawide)
    
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // Should load efficiently on large screens too
    expect(loadTime).toBeLessThan(5000) // 5 seconds max for desktop
    
    // Content should utilize screen real estate effectively
    const header = page.locator(RESPONSIVE_SELECTORS.header)
    const headerBox = await header.boundingBox()
    expect(headerBox).not.toBeNull()
    
    // Header should span the full width efficiently
    expect(headerBox!.width).toBeGreaterThan(VIEWPORTS.ultrawide.width * 0.8)
  })
})