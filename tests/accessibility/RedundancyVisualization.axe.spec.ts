/**
 * Axe-core Accessibility Tests for 2N+1 Redundancy Visualization
 * Testing WCAG 2.1 AA compliance using axe-core
 */

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('2N+1 Redundancy Accessibility Tests (Axe-core)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Basic Page Accessibility', () => {
    test('should not have any accessibility violations on main page', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
      
      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should pass color contrast requirements', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      
      const colorContrastViolations = accessibilityScanResults.violations.filter(
        violation => violation.id === 'color-contrast'
      )
      
      expect(colorContrastViolations).toEqual([])
    })

    test('should have proper heading structure', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['best-practice'])
        .analyze()
      
      const headingViolations = accessibilityScanResults.violations.filter(
        violation => violation.id === 'heading-order'
      )
      
      expect(headingViolations).toEqual([])
    })
  })

  test.describe('Redundancy Button Accessibility', () => {
    test('should have accessible button attributes', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
      await expect(redundancyButton).toBeVisible()
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[data-testid="redundancy-toggle-button"]')
        .analyze()
      
      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have proper ARIA labels', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
      
      await expect(redundancyButton).toHaveAttribute('aria-label')
      
      const ariaLabel = await redundancyButton.getAttribute('aria-label')
      expect(ariaLabel).toContain('redundancy')
    })

    test('should be keyboard accessible', async ({ page }) => {
      await page.keyboard.press('Tab')
      
      // Navigate to redundancy button
      let attempts = 0
      while (attempts < 10) {
        const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'))
        if (focusedElement === 'redundancy-toggle-button') {
          break
        }
        await page.keyboard.press('Tab')
        attempts++
      }
      
      // Should be able to activate with Enter or Space
      await page.keyboard.press('Enter')
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]')
      await expect(overlay).toBeVisible()
    })
  })

  test.describe('Redundancy Overlay Accessibility', () => {
    test('should pass accessibility scan when overlay is open', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
      await redundancyButton.click()
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]')
      await expect(overlay).toBeVisible()
      
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
      
      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have proper modal ARIA attributes', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
      await redundancyButton.click()
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]')
      await expect(overlay).toBeVisible()
      
      // Check required ARIA attributes
      await expect(overlay).toHaveAttribute('role', 'dialog')
      await expect(overlay).toHaveAttribute('aria-modal', 'true')
      await expect(overlay).toHaveAttribute('aria-labelledby', 'redundancy-title')
      await expect(overlay).toHaveAttribute('aria-describedby', 'redundancy-description')
    })

    test('should trap focus within modal', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
      await redundancyButton.click()
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]')
      await expect(overlay).toBeVisible()
      
      // Wait for focus to be set
      await page.waitForTimeout(200)
      
      // Tab through focusable elements
      await page.keyboard.press('Tab')
      
      const focusedElement = await page.evaluate(() => {
        const overlay = document.querySelector('[role="dialog"][aria-modal="true"]')
        const activeElement = document.activeElement
        return overlay?.contains(activeElement)
      })
      
      expect(focusedElement).toBe(true)
    })

    test('should restore focus when modal closes', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
      await redundancyButton.focus()
      await redundancyButton.click()
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]')
      await expect(overlay).toBeVisible()
      
      // Close modal
      await page.keyboard.press('Escape')
      await expect(overlay).not.toBeVisible()
      
      // Focus should return to button
      await expect(redundancyButton).toBeFocused()
    })
  })

  test.describe('Info Panel Accessibility', () => {
    test('should have accessible info panel structure', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
      await redundancyButton.click()
      
      // Wait for info panel to appear
      await page.waitForTimeout(6000)
      
      const infoPanel = page.locator('#redundancy-description')
      await expect(infoPanel).toBeVisible()
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('#redundancy-description')
        .analyze()
      
      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have proper heading hierarchy', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
      await redundancyButton.click()
      
      await page.waitForTimeout(6000)
      
      const title = page.locator('#redundancy-title')
      await expect(title).toBeVisible()
      
      // Check that the title has proper heading semantics
      const titleTagName = await title.evaluate(el => el.tagName.toLowerCase())
      expect(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']).toContain(titleTagName)
    })

    test('should provide meaningful text alternatives', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
      await redundancyButton.click()
      
      await page.waitForTimeout(6000)
      
      // Check for alt text on any images or icons
      const images = page.locator('img')
      const imageCount = await images.count()
      
      for (let i = 0; i < imageCount; i++) {
        const image = images.nth(i)
        const altText = await image.getAttribute('alt')
        expect(altText).toBeTruthy()
      }
    })
  })

  test.describe('Animation and Motion Accessibility', () => {
    test('should respect reduced motion preferences', async ({ page }) => {
      // Simulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' })
      
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
      await redundancyButton.click()
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]')
      await expect(overlay).toBeVisible()
      
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
      
      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should not cause seizures with flashing content', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
      await redundancyButton.click()
      
      // Wait for full animation
      await page.waitForTimeout(6000)
      
      // Check for any elements that might flash rapidly
      const flashingElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('*')
        const flashingElements = []
        
        for (const element of elements) {
          const computedStyle = getComputedStyle(element)
          if (computedStyle.animationDuration && 
              parseFloat(computedStyle.animationDuration) < 0.33) {
            flashingElements.push(element.tagName)
          }
        }
        
        return flashingElements
      })
      
      // No elements should flash faster than 3 times per second
      expect(flashingElements).toEqual([])
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('should support all keyboard interactions', async ({ page }) => {
      // Test Tab navigation
      await page.keyboard.press('Tab')
      
      // Should eventually reach redundancy button
      let attempts = 0
      let foundButton = false
      
      while (attempts < 15 && !foundButton) {
        const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'))
        if (focusedElement === 'redundancy-toggle-button') {
          foundButton = true
          break
        }
        await page.keyboard.press('Tab')
        attempts++
      }
      
      expect(foundButton).toBe(true)
      
      // Should open with Enter
      await page.keyboard.press('Enter')
      const overlay = page.locator('[role="dialog"][aria-modal="true"]')
      await expect(overlay).toBeVisible()
      
      // Should close with Escape
      await page.keyboard.press('Escape')
      await expect(overlay).not.toBeVisible()
    })

    test('should have visible focus indicators', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
      await redundancyButton.focus()
      
      // Check that focus indicator is visible
      const focusedStyles = await redundancyButton.evaluate(el => {
        const styles = getComputedStyle(el)
        return {
          outline: styles.outline,
          outlineColor: styles.outlineColor,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow
        }
      })
      
      // Should have some visible focus indicator
      const hasFocusIndicator = 
        focusedStyles.outline !== 'none' ||
        focusedStyles.outlineWidth !== '0px' ||
        focusedStyles.boxShadow !== 'none'
      
      expect(hasFocusIndicator).toBe(true)
    })
  })

  test.describe('Screen Reader Compatibility', () => {
    test('should announce state changes appropriately', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
      await redundancyButton.click()
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]')
      await expect(overlay).toBeVisible()
      
      // Wait for info panel
      await page.waitForTimeout(6000)
      
      // Check for live regions that announce changes
      const liveRegions = page.locator('[aria-live]')
      const liveRegionCount = await liveRegions.count()
      
      // Should have some mechanism for announcing dynamic content
      if (liveRegionCount > 0) {
        for (let i = 0; i < liveRegionCount; i++) {
          const region = liveRegions.nth(i)
          const ariaLive = await region.getAttribute('aria-live')
          expect(['polite', 'assertive']).toContain(ariaLive)
        }
      }
    })

    test('should provide meaningful accessible names', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
      await redundancyButton.click()
      
      await page.waitForTimeout(6000)
      
      // Check all interactive elements have accessible names
      const interactiveElements = page.locator('button, [role="button"], input, select, textarea, a[href]')
      const count = await interactiveElements.count()
      
      for (let i = 0; i < count; i++) {
        const element = interactiveElements.nth(i)
        const accessibleName = await element.evaluate(el => {
          // Get accessible name using various methods
          return el.getAttribute('aria-label') ||
                 el.getAttribute('aria-labelledby') ||
                 el.textContent?.trim() ||
                 el.getAttribute('title') ||
                 el.getAttribute('alt')
        })
        
        expect(accessibleName).toBeTruthy()
      }
    })
  })

  test.describe('Mobile Accessibility', () => {
    test('should be accessible on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
      await redundancyButton.tap()
      
      const overlay = page.locator('[role="dialog"][aria-modal="true"]')
      await expect(overlay).toBeVisible()
      
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
      
      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should have adequate touch target sizes', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
      const buttonBox = await redundancyButton.boundingBox()
      
      // WCAG requires minimum 44x44 CSS pixels for touch targets
      expect(buttonBox?.width).toBeGreaterThanOrEqual(44)
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44)
      
      await redundancyButton.tap()
      
      const closeButton = page.locator('[data-testid="close-redundancy-button"]')
      const closeButtonBox = await closeButton.boundingBox()
      
      expect(closeButtonBox?.width).toBeGreaterThanOrEqual(44)
      expect(closeButtonBox?.height).toBeGreaterThanOrEqual(44)
    })
  })

  test.describe('Comprehensive WCAG Compliance', () => {
    test('should pass WCAG 2.1 AA compliance', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
      await redundancyButton.click()
      
      await page.waitForTimeout(6000)
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      
      // Log any violations for debugging
      if (accessibilityScanResults.violations.length > 0) {
        console.log('Accessibility violations found:', 
          JSON.stringify(accessibilityScanResults.violations, null, 2))
      }
      
      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should meet best practice guidelines', async ({ page }) => {
      const redundancyButton = page.locator('[data-testid="redundancy-toggle-button"]')
      await redundancyButton.click()
      
      await page.waitForTimeout(6000)
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['best-practice'])
        .analyze()
      
      // Allow for some best practice violations (they're not requirements)
      const criticalViolations = accessibilityScanResults.violations.filter(
        violation => violation.impact === 'critical' || violation.impact === 'serious'
      )
      
      expect(criticalViolations).toEqual([])
    })
  })
})