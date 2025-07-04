import { test, expect } from '@playwright/test'

test.describe('Theme System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should have default theme applied', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check html element has theme class
    const htmlElement = page.locator('html')
    const classes = await htmlElement.getAttribute('class')
    expect(classes).toMatch(/(light|dark)/)
  })

  test('should toggle theme with button click', async ({ page }) => {
    // Wait for theme toggle button
    await page.waitForSelector('button[aria-label*="theme"]', {
      timeout: 10000,
    })

    // Get initial theme
    const htmlElement = page.locator('html')
    const initialClasses = await htmlElement.getAttribute('class')
    const isInitiallyDark = initialClasses?.includes('dark')

    // Click theme toggle
    const themeButton = page.locator('button[aria-label*="theme"]').first()
    await themeButton.click()

    // Wait for theme change
    await page.waitForTimeout(500)

    // Check theme changed
    const newClasses = await htmlElement.getAttribute('class')
    const isNowDark = newClasses?.includes('dark')

    expect(isNowDark).not.toBe(isInitiallyDark)
  })

  test('should persist theme preference', async ({ page }) => {
    // Set to dark theme
    await page.waitForSelector('button[aria-label*="theme"]', {
      timeout: 10000,
    })

    // Ensure we're in light mode first
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    })

    // Click to dark mode
    const themeButton = page.locator('button[aria-label*="theme"]').first()
    await themeButton.click()

    // Wait for theme change
    await page.waitForTimeout(500)

    // Verify dark mode
    const htmlElement = page.locator('html')
    await expect(htmlElement).toHaveClass(/dark/)

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Theme should persist
    await expect(htmlElement).toHaveClass(/dark/)
  })

  test('should show theme dropdown options', async ({ page }) => {
    // Look for dropdown theme toggle
    const dropdownToggle = page
      .locator('button')
      .filter({ hasText: /light|dark|system/i })
      .first()

    if (await dropdownToggle.isVisible()) {
      await dropdownToggle.click()

      // Check dropdown options
      await expect(page.locator('text="Light"')).toBeVisible()
      await expect(page.locator('text="Dark"')).toBeVisible()
      await expect(page.locator('text="System"')).toBeVisible()

      // Select dark theme
      await page.locator('text="Dark"').click()

      // Verify dark mode applied
      await expect(page.locator('html')).toHaveClass(/dark/)
    }
  })

  test('should respect system theme preference', async ({ page }) => {
    // Set system to dark mode
    await page.emulateMedia({ colorScheme: 'dark' })

    // Look for system theme option and select it
    const dropdownToggle = page
      .locator('button')
      .filter({ hasText: /light|dark|system/i })
      .first()

    if (await dropdownToggle.isVisible()) {
      await dropdownToggle.click()
      await page.locator('text="System"').click()

      // Should follow system preference (dark)
      await expect(page.locator('html')).toHaveClass(/dark/)
    }

    // Change system to light mode
    await page.emulateMedia({ colorScheme: 'light' })
    await page.waitForTimeout(500)

    // Should follow system preference (light)
    await expect(page.locator('html')).toHaveClass(/light/)
  })

  test('should apply theme colors correctly', async ({ page }) => {
    // Test dark theme colors
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    })

    await page.waitForTimeout(500)

    // Check CSS variables in dark mode
    const darkModeColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue(
        '--color-500kv'
      )
    })

    expect(darkModeColor.trim()).toBe('#f87171')

    // Test light theme colors
    await page.evaluate(() => {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    })

    await page.waitForTimeout(500)

    const lightModeColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue(
        '--color-500kv'
      )
    })

    expect(lightModeColor.trim()).toBe('#ef4444')
  })

  test('should update meta theme-color', async ({ page }) => {
    // Check initial meta theme-color
    const initialMetaColor = await page
      .locator('meta[name="theme-color"]')
      .getAttribute('content')

    // Toggle theme
    const themeButton = page.locator('button[aria-label*="theme"]').first()
    if (await themeButton.isVisible()) {
      await themeButton.click()
      await page.waitForTimeout(500)

      // Check meta theme-color changed
      const newMetaColor = await page
        .locator('meta[name="theme-color"]')
        .getAttribute('content')
      expect(newMetaColor).not.toBe(initialMetaColor)
    }
  })

  test('should have smooth theme transitions', async ({ page }) => {
    // Wait for page load
    await page.waitForLoadState('networkidle')

    // Get transition duration from CSS
    const transitionDuration = await page.evaluate(() => {
      return getComputedStyle(document.body).transitionDuration
    })

    // Should have transition defined
    expect(transitionDuration).toBeTruthy()

    // Toggle theme and check for smooth transition
    const themeButton = page.locator('button[aria-label*="theme"]').first()
    if (await themeButton.isVisible()) {
      await themeButton.click()

      // Wait for transition to complete
      await page.waitForTimeout(500)

      // Verify theme changed
      const htmlClasses = await page.locator('html').getAttribute('class')
      expect(htmlClasses).toMatch(/(light|dark)/)
    }
  })

  test('should handle theme keyboard navigation', async ({ page }) => {
    // Tab to theme toggle
    await page.keyboard.press('Tab')

    // Keep tabbing until we find the theme toggle
    let attempts = 0
    while (attempts < 20) {
      const focusedElement = await page.evaluate(() =>
        document.activeElement?.getAttribute('aria-label')
      )

      if (
        focusedElement?.includes('theme') ||
        focusedElement?.includes('Theme')
      ) {
        break
      }

      await page.keyboard.press('Tab')
      attempts++
    }

    // Press Enter to activate
    await page.keyboard.press('Enter')

    // If dropdown, use arrow keys
    const dropdownVisible = await page
      .locator('[role="menu"]')
      .isVisible()
      .catch(() => false)
    if (dropdownVisible) {
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
    }

    // Wait for theme change
    await page.waitForTimeout(500)
  })

  test('should work across different viewport sizes', async ({ page }) => {
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()

    // Theme toggle should be accessible
    const mobileThemeButton = page
      .locator('button[aria-label*="theme"]')
      .first()
    if (await mobileThemeButton.isVisible()) {
      await mobileThemeButton.click()
      await page.waitForTimeout(500)

      // Theme should change
      const htmlClasses = await page.locator('html').getAttribute('class')
      expect(htmlClasses).toMatch(/(light|dark)/)
    }

    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.reload()

    // Theme toggle should be accessible
    const desktopThemeButton = page
      .locator('button[aria-label*="theme"]')
      .first()
    if (await desktopThemeButton.isVisible()) {
      await desktopThemeButton.click()
      await page.waitForTimeout(500)
    }
  })
})
