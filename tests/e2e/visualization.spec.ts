import { test, expect } from '@playwright/test'

test.describe('Visualization Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load main page with visualization', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Hue Hi Tech Park/)

    // Check header elements
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('h1')).toContainText('Hue Hi Tech Park')

    // Check main visualization container
    await expect(
      page.locator('[role="region"][aria-label="Interactive map overlay"]')
    ).toBeVisible()

    // Wait for data to load
    await page.waitForSelector('img[alt*="Infrastructure Map"]', {
      timeout: 10000,
    })
  })

  test('should display hotspots on the map', async ({ page }) => {
    // Wait for hotspots to appear
    await page.waitForSelector('[role="button"][aria-label*="View details"]', {
      timeout: 10000,
    })

    // Count hotspots
    const hotspots = page.locator('[role="button"][aria-label*="View details"]')
    const count = await hotspots.count()
    expect(count).toBeGreaterThan(0)

    // Check hotspot visibility
    await expect(hotspots.first()).toBeVisible()
  })

  test('should open modal when clicking hotspot', async ({ page }) => {
    // Wait for hotspots to load
    await page.waitForSelector('[role="button"][aria-label*="View details"]', {
      timeout: 10000,
    })

    // Click first hotspot
    const firstHotspot = page
      .locator('[role="button"][aria-label*="View details"]')
      .first()
    await firstHotspot.click()

    // Check modal appears
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Check modal content
    await expect(page.locator('[role="dialog"] h2')).toBeVisible()

    // Check close button
    const closeButton = page.locator(
      '[role="dialog"] button[aria-label="Close modal"]'
    )
    await expect(closeButton).toBeVisible()

    // Close modal
    await closeButton.click()
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('should support zoom functionality', async ({ page }) => {
    // Wait for interactive overlay
    await page.waitForSelector(
      '[role="region"][aria-label="Interactive map overlay"]',
      { timeout: 10000 }
    )

    const overlay = page.locator(
      '[role="region"][aria-label="Interactive map overlay"]'
    )

    // Test zoom in button
    const zoomInButton = page.locator('button[aria-label="Zoom in"]')
    await expect(zoomInButton).toBeVisible()
    await zoomInButton.click()

    // Check zoom level indicator
    const zoomIndicator = page.locator('text=/\\d+%/')
    await expect(zoomIndicator).toBeVisible()

    // Test zoom out button
    const zoomOutButton = page.locator('button[aria-label="Zoom out"]')
    await expect(zoomOutButton).toBeVisible()
    await zoomOutButton.click()

    // Test reset button
    const resetButton = page.locator('button[aria-label="Reset view"]')
    await expect(resetButton).toBeVisible()
    await resetButton.click()
  })

  test('should support mouse wheel zoom', async ({ page }) => {
    // Wait for interactive overlay
    await page.waitForSelector(
      '[role="region"][aria-label="Interactive map overlay"]',
      { timeout: 10000 }
    )

    const overlay = page.locator(
      '[role="region"][aria-label="Interactive map overlay"]'
    )

    // Get bounding box for center calculation
    const box = await overlay.boundingBox()
    if (box) {
      const centerX = box.x + box.width / 2
      const centerY = box.y + box.height / 2

      // Zoom in with wheel
      await page.mouse.move(centerX, centerY)
      await page.mouse.wheel(0, -100) // Negative for zoom in

      // Wait a bit for animation
      await page.waitForTimeout(500)

      // Zoom out with wheel
      await page.mouse.wheel(0, 100) // Positive for zoom out
    }
  })

  test('should support pan functionality', async ({ page }) => {
    // Wait for interactive overlay
    await page.waitForSelector(
      '[role="region"][aria-label="Interactive map overlay"]',
      { timeout: 10000 }
    )

    const overlay = page.locator(
      '[role="region"][aria-label="Interactive map overlay"]'
    )

    // Get bounding box
    const box = await overlay.boundingBox()
    if (box) {
      const startX = box.x + box.width / 2
      const startY = box.y + box.height / 2
      const endX = startX + 50
      const endY = startY + 50

      // Pan by dragging
      await page.mouse.move(startX, startY)
      await page.mouse.down()
      await page.mouse.move(endX, endY)
      await page.mouse.up()

      // Wait for animation
      await page.waitForTimeout(500)
    }
  })

  test('should show legend panel', async ({ page }) => {
    // Wait for legend to appear
    await page.waitForSelector('text="Infrastructure Legend"', {
      timeout: 10000,
    })

    // Check legend visibility
    await expect(page.locator('text="Infrastructure Legend"')).toBeVisible()

    // Check legend items
    await expect(page.locator('text="Data Center"')).toBeVisible()
    await expect(page.locator('text="500kV Substation"')).toBeVisible()
    await expect(page.locator('text="220kV Lines"')).toBeVisible()
    await expect(page.locator('text="110kV Lines"')).toBeVisible()
    await expect(page.locator('text="Power Plant"')).toBeVisible()
  })

  test('should toggle legend collapse/expand', async ({ page }) => {
    // Wait for legend
    await page.waitForSelector('text="Infrastructure Legend"', {
      timeout: 10000,
    })

    // Find legend toggle button
    const legendHeader = page
      .locator('text="Infrastructure Legend"')
      .locator('..')
    await legendHeader.click()

    // Wait for animation
    await page.waitForTimeout(500)

    // Toggle again
    await legendHeader.click()
    await page.waitForTimeout(500)
  })

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()

    // Check layout adapts
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()

    // Check layout adapts
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.reload()

    // Check layout adapts
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
  })

  test('should handle keyboard navigation', async ({ page }) => {
    // Wait for page load
    await page.waitForSelector('[role="button"][aria-label*="View details"]', {
      timeout: 10000,
    })

    // Tab to first hotspot
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Press Enter to activate
    await page.keyboard.press('Enter')

    // Check modal opens
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Press Escape to close
    await page.keyboard.press('Escape')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('should load and display infrastructure data', async ({ page }) => {
    // Check data loading
    const response = await page.request.get('/data/hotspots.json')
    expect(response.ok()).toBeTruthy()

    const hotspotsData = await response.json()
    expect(hotspotsData).toHaveProperty('hotspots')
    expect(hotspotsData.hotspots).toBeInstanceOf(Array)
    expect(hotspotsData.hotspots.length).toBeGreaterThan(0)

    // Check image config
    const imageConfigResponse = await page.request.get(
      '/data/image-config.json'
    )
    expect(imageConfigResponse.ok()).toBeTruthy()

    const imageConfig = await imageConfigResponse.json()
    expect(imageConfig).toHaveProperty('originalWidth')
    expect(imageConfig).toHaveProperty('originalHeight')
    expect(imageConfig).toHaveProperty('aspectRatio')

    // Check infrastructure details
    const detailsResponse = await page.request.get(
      '/data/infrastructure-details.json'
    )
    expect(detailsResponse.ok()).toBeTruthy()

    const details = await detailsResponse.json()
    expect(details).toHaveProperty('infrastructure')
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Intercept and fail API request
    await page.route('/data/hotspots.json', (route) => {
      route.abort('failed')
    })

    await page.goto('/')

    // Should show error state
    await expect(page.locator('text="Failed to Load Data"')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible()
  })

  test('should show loading state', async ({ page }) => {
    // Delay API response
    await page.route('/data/hotspots.json', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const response = await page.request.fetch(route.request())
      route.fulfill({ response })
    })

    await page.goto('/')

    // Should show loading state
    await expect(page.locator('text="Loading Visualization"')).toBeVisible()
    await expect(
      page
        .locator('[data-testid="loading-spinner"]')
        .or(page.locator('.animate-spin'))
    ).toBeVisible()
  })
})
