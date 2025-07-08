/**
 * E2E Tests for Simple 2N+1 Redundancy Visualization Feature
 * Testing the actual simplified implementation
 */

import { test, expect } from '@playwright/test'

test.describe('Simple 2N+1 Redundancy Visualization E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Verify the page loaded correctly
    await expect(page.locator('h1')).toContainText('Hue Hi Tech Park')
  })

  test.describe('Feature Availability', () => {
    test('should show redundancy toggle button when feature is enabled', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="simple-redundancy-toggle"]')
      await expect(redundancyButton).toBeVisible()
      await expect(redundancyButton).toContainText('Show 2N+1 Redundancy')
    })

    test('should have power map image loaded', async ({ page }) => {
      const powerMapImage = page.locator('img[alt*="Power Infrastructure"]')
      await expect(powerMapImage).toBeVisible()

      // Verify image has loaded
      const isLoaded = await powerMapImage.evaluate((img: HTMLImageElement) => img.complete)
      expect(isLoaded).toBe(true)
    })
  })

  test.describe('Complete User Workflow', () => {
    test('should complete full redundancy visualization workflow', async ({ page }) => {
      // Step 1: Click the redundancy button
      const redundancyButton = page.locator('[data-testid="simple-redundancy-toggle"]')
      await redundancyButton.click()

      // Step 2: Verify button text changes to "Main"
      await expect(redundancyButton).toContainText('Main')

      // Step 3: Verify the image changes (alt text should change)
      const powerMapImage = page.locator('img[alt*="2N+1 Redundancy"]')
      await expect(powerMapImage).toBeVisible()

      // Step 4: Verify text overlay appears
      await expect(page.locator('text=500KV ONSITE GRID')).toBeVisible()

      // Step 5: Click back to main view
      await redundancyButton.click()

      // Step 6: Verify button text changes back
      await expect(redundancyButton).toContainText('Show 2N+1 Redundancy')

      // Step 7: Verify main image is shown again
      const mainImage = page.locator('img[alt*="Main Power Infrastructure"]')
      await expect(mainImage).toBeVisible()
    })

    test('should handle multiple toggle cycles', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="simple-redundancy-toggle"]')

      // Cycle 1: Main -> 2N+1 -> Main
      await redundancyButton.click()
      await expect(redundancyButton).toContainText('Main')

      await redundancyButton.click()
      await expect(redundancyButton).toContainText('Show 2N+1 Redundancy')

      // Cycle 2: Main -> 2N+1 -> Main
      await redundancyButton.click()
      await expect(redundancyButton).toContainText('Main')

      await redundancyButton.click()
      await expect(redundancyButton).toContainText('Show 2N+1 Redundancy')
    })
  })

  test.describe('Visual Elements', () => {
    test('should render all visual elements correctly', async ({ page }) => {
      // Verify header
      await expect(page.locator('h1')).toContainText('Hue Hi Tech Park')

      // Verify version display
      await expect(page.locator('text=v2.05.0')).toBeVisible()

      // Verify footer
      await expect(page.locator('text=© 2024 Hue Hi Tech Park')).toBeVisible()

      // Verify main image container
      const imageContainer = page
        .locator('div')
        .filter({ hasText: /Loading image configuration/ })
        .first()
      await expect(imageContainer).not.toBeVisible() // Should not show loading text

      // Verify the redundancy button styling
      const redundancyButton = page.locator('[data-testid="simple-redundancy-toggle"]')
      await expect(redundancyButton).toHaveClass(/bg-red-600/)
    })

    test('should have proper button styling and animations', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="simple-redundancy-toggle"]')

      // Test hover state (if supported)
      await redundancyButton.hover()

      // Verify initial state
      await expect(redundancyButton).toContainText('Show 2N+1 Redundancy')

      // Test click animation
      await redundancyButton.click()

      // Wait for animation to complete
      await page.waitForTimeout(200)

      // Verify final state
      await expect(redundancyButton).toContainText('Main')
    })
  })

  test.describe('Performance', () => {
    test('should load and animate smoothly', async ({ page }) => {
      // Measure initial page load
      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime

      // Should load within reasonable time (10 seconds for development)
      expect(loadTime).toBeLessThan(10000)

      // Test animation performance
      const redundancyButton = page.locator('[data-testid="simple-redundancy-toggle"]')

      const animationStartTime = Date.now()
      await redundancyButton.click()
      await expect(redundancyButton).toContainText('Main')
      const animationTime = Date.now() - animationStartTime

      // Animation should complete within reasonable time (3 seconds)
      expect(animationTime).toBeLessThan(3000)
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      // Verify elements are still visible and functional
      const redundancyButton = page.locator('[data-testid="simple-redundancy-toggle"]')
      await expect(redundancyButton).toBeVisible()

      // Test functionality on mobile
      await redundancyButton.click()
      await expect(redundancyButton).toContainText('Main')
    })

    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })

      // Verify elements are still visible and functional
      const redundancyButton = page.locator('[data-testid="simple-redundancy-toggle"]')
      await expect(redundancyButton).toBeVisible()

      // Test functionality on tablet
      await redundancyButton.click()
      await expect(redundancyButton).toContainText('Main')
    })
  })

  test.describe('Error Handling', () => {
    test('should handle missing image gracefully', async ({ page }) => {
      // Block image requests to test error handling
      await page.route('**/*.png', route => route.abort())
      await page.route('**/*.jpg', route => route.abort())

      await page.goto('/')

      // Should still show the button and not crash
      const redundancyButton = page.locator('[data-testid="simple-redundancy-toggle"]')
      await expect(redundancyButton).toBeVisible()
    })
  })
})
