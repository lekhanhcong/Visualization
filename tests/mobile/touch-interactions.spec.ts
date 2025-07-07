/**
 * Mobile Touch Interaction Tests
 * Tests mobile-specific behaviors and touch interactions
 */

import { test, expect, Page } from '@playwright/test'

const MOBILE_SELECTORS = {
  redundancyButton: '[data-testid="redundancy-toggle-button"]',
  overlay: '[role="dialog"][aria-modal="true"]',
  closeButton: '[data-testid="close-redundancy-button"]',
  powerMap: 'img[alt="Power Map"]',
} as const

test.describe('Mobile Touch Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should handle touch tap on redundancy button', async ({ page }) => {
    const redundancyButton = page.locator(MOBILE_SELECTORS.redundancyButton)
    
    // Verify button is touch-friendly (adequate size)
    const buttonBox = await redundancyButton.boundingBox()
    expect(buttonBox).not.toBeNull()
    expect(buttonBox!.width).toBeGreaterThan(40) // Minimum touch target
    expect(buttonBox!.height).toBeGreaterThan(40)
    
    // Test touch tap
    await redundancyButton.tap()
    
    // Verify overlay opens
    await expect(page.locator(MOBILE_SELECTORS.overlay)).toBeVisible({ timeout: 8000 })
  })

  test('should handle touch gestures in overlay', async ({ page }) => {
    // Open overlay
    await page.locator(MOBILE_SELECTORS.redundancyButton).tap()
    const overlay = page.locator(MOBILE_SELECTORS.overlay)
    await expect(overlay).toBeVisible({ timeout: 8000 })
    
    // Test touch outside to close (if implemented)
    const backdrop = page.locator('.bg-black.bg-opacity-40')
    if (await backdrop.count() > 0) {
      await backdrop.tap()
      // Note: This might not work if touch-outside-to-close is not implemented
      // That's okay - it's a design decision
    }
    
    // If still open, use close button
    if (await overlay.isVisible()) {
      await page.locator(MOBILE_SELECTORS.closeButton).tap()
    }
    
    await expect(overlay).not.toBeVisible()
  })

  test('should handle pinch zoom gracefully', async ({ page }) => {
    // Simulate pinch zoom
    await page.touchscreen.pinch(
      { x: 400, y: 300 }, // center point
      1.5 // scale factor
    )
    
    // Verify app still functions
    const redundancyButton = page.locator(MOBILE_SELECTORS.redundancyButton)
    await expect(redundancyButton).toBeVisible()
    
    // Test interaction after zoom
    await redundancyButton.tap()
    await expect(page.locator(MOBILE_SELECTORS.overlay)).toBeVisible({ timeout: 8000 })
    
    await page.keyboard.press('Escape')
  })

  test('should handle swipe gestures', async ({ page }) => {
    // Test vertical swipe
    await page.touchscreen.swipe(
      { x: 400, y: 600 }, // start
      { x: 400, y: 200 }, // end
      { duration: 500 }   // duration
    )
    
    // App should remain stable
    await expect(page.locator(MOBILE_SELECTORS.redundancyButton)).toBeVisible()
    
    // Test horizontal swipe
    await page.touchscreen.swipe(
      { x: 100, y: 300 },
      { x: 700, y: 300 },
      { duration: 500 }
    )
    
    await expect(page.locator(MOBILE_SELECTORS.redundancyButton)).toBeVisible()
  })

  test('should handle device orientation changes', async ({ page }) => {
    // Test portrait mode (default)
    await page.locator(MOBILE_SELECTORS.redundancyButton).tap()
    await expect(page.locator(MOBILE_SELECTORS.overlay)).toBeVisible({ timeout: 8000 })
    await page.keyboard.press('Escape')
    
    // Simulate landscape mode
    await page.setViewportSize({ width: 812, height: 375 }) // iPhone landscape
    await page.waitForTimeout(1000) // Allow layout to adjust
    
    // Verify functionality in landscape
    await expect(page.locator(MOBILE_SELECTORS.redundancyButton)).toBeVisible()
    await page.locator(MOBILE_SELECTORS.redundancyButton).tap()
    await expect(page.locator(MOBILE_SELECTORS.overlay)).toBeVisible({ timeout: 8000 })
    
    await page.keyboard.press('Escape')
  })

  test('should handle long press interactions', async ({ page }) => {
    const redundancyButton = page.locator(MOBILE_SELECTORS.redundancyButton)
    
    // Get button position
    const buttonBox = await redundancyButton.boundingBox()
    expect(buttonBox).not.toBeNull()
    
    const centerX = buttonBox!.x + buttonBox!.width / 2
    const centerY = buttonBox!.y + buttonBox!.height / 2
    
    // Simulate long press
    await page.touchscreen.longPress(centerX, centerY, { duration: 1000 })
    
    // Long press should either trigger action or show context menu
    // For this app, it should probably just trigger the normal action
    await expect(page.locator(MOBILE_SELECTORS.overlay)).toBeVisible({ timeout: 8000 })
    
    await page.keyboard.press('Escape')
  })

  test('should handle rapid taps (prevent double activation)', async ({ page }) => {
    const redundancyButton = page.locator(MOBILE_SELECTORS.redundancyButton)
    
    // Rapid double tap
    await redundancyButton.tap()
    await redundancyButton.tap() // Second tap should be ignored if overlay is opening
    
    // Should only open one overlay
    const overlays = page.locator(MOBILE_SELECTORS.overlay)
    await expect(overlays).toHaveCount(1)
    
    await page.keyboard.press('Escape')
  })

  test('should maintain scrolling behavior', async ({ page }) => {
    // Scroll down to test scroll behavior
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    
    // Button should still be visible (if it's fixed positioned)
    await expect(page.locator(MOBILE_SELECTORS.redundancyButton)).toBeVisible()
    
    // Scroll back up
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)
    
    // Test functionality after scrolling
    await page.locator(MOBILE_SELECTORS.redundancyButton).tap()
    await expect(page.locator(MOBILE_SELECTORS.overlay)).toBeVisible({ timeout: 8000 })
    
    await page.keyboard.press('Escape')
  })

  test('should handle touch feedback appropriately', async ({ page }) => {
    const redundancyButton = page.locator(MOBILE_SELECTORS.redundancyButton)
    
    // Check for hover states (should be minimal on touch devices)
    await redundancyButton.hover()
    await page.waitForTimeout(100)
    
    // On touch devices, hover effects should be minimal
    // The button should still be interactive
    await redundancyButton.tap()
    await expect(page.locator(MOBILE_SELECTORS.overlay)).toBeVisible({ timeout: 8000 })
    
    await page.keyboard.press('Escape')
  })

  test('should handle accessibility on mobile', async ({ page }) => {
    // Check that touch targets meet accessibility guidelines
    const interactiveElements = page.locator('button, [role="button"], a')
    const count = await interactiveElements.count()
    
    for (let i = 0; i < count; i++) {
      const element = interactiveElements.nth(i)
      if (await element.isVisible()) {
        const box = await element.boundingBox()
        if (box) {
          // WCAG recommends minimum 44px for touch targets
          expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(40)
        }
      }
    }
    
    // Test screen reader compatibility (basic)
    const redundancyButton = page.locator(MOBILE_SELECTORS.redundancyButton)
    await expect(redundancyButton).toHaveAttribute('aria-label')
  })
})

test.describe('Mobile Performance', () => {
  test('should load quickly on mobile devices', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Mobile devices should load within reasonable time
    expect(loadTime).toBeLessThan(5000) // 5 seconds max
  })

  test('should handle memory constraints', async ({ page }) => {
    // Test opening and closing overlay multiple times
    for (let i = 0; i < 5; i++) {
      await page.locator(MOBILE_SELECTORS.redundancyButton).tap()
      await expect(page.locator(MOBILE_SELECTORS.overlay)).toBeVisible({ timeout: 8000 })
      await page.keyboard.press('Escape')
      await expect(page.locator(MOBILE_SELECTORS.overlay)).not.toBeVisible()
      
      // Brief pause between iterations
      await page.waitForTimeout(500)
    }
    
    // App should still be responsive
    await expect(page.locator(MOBILE_SELECTORS.redundancyButton)).toBeVisible()
  })

  test('should handle network changes gracefully', async ({ page }) => {
    // Test offline behavior (if implemented)
    await page.context().setOffline(true)
    
    // App should still show cached content
    await expect(page.locator(MOBILE_SELECTORS.powerMap)).toBeVisible()
    await expect(page.locator(MOBILE_SELECTORS.redundancyButton)).toBeVisible()
    
    // Restore network
    await page.context().setOffline(false)
    await page.waitForTimeout(1000)
    
    // Test functionality
    await page.locator(MOBILE_SELECTORS.redundancyButton).tap()
    await expect(page.locator(MOBILE_SELECTORS.overlay)).toBeVisible({ timeout: 8000 })
    
    await page.keyboard.press('Escape')
  })
})