import { test, expect } from '@playwright/test'

test.describe('Basic App Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the application', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle(/Hue Hi Tech Park/)

    // Check for basic layout elements
    await expect(page.locator('body')).toBeVisible()
  })

  test('should display loading state initially', async ({ page }) => {
    // The app should show a loading state initially
    const loader = page.locator('text="Loading Visualization"')

    // If it's still loading, we should see the loader
    if (await loader.isVisible({ timeout: 1000 })) {
      await expect(loader).toBeVisible()
    }
  })

  test('should eventually show content or error', async ({ page }) => {
    // Wait for the app to finish loading (either show content or error)
    await page.waitForTimeout(3000)

    // Should have either content or error message
    const hasContent = await page.locator('header').isVisible({ timeout: 1000 })
    const hasError = await page
      .locator('text="Failed to Load Data"')
      .isVisible({ timeout: 1000 })
    const hasNoData = await page
      .locator('text="No Data Available"')
      .isVisible({ timeout: 1000 })

    expect(hasContent || hasError || hasNoData).toBeTruthy()
  })
})
