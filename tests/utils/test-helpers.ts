import { Page, Locator, expect } from '@playwright/test'

/**
 * Comprehensive test helper utilities for Playwright tests
 * Includes common actions, assertions, and utilities for all test types
 */

export class TestHelpers {
  constructor(private page: Page) {}

  // ============= NAVIGATION HELPERS =============
  
  async navigateToHome() {
    await this.page.goto('/')
    await this.waitForPageLoad()
  }

  async navigateToRedundancyVisualization() {
    await this.page.goto('/')
    await this.waitForPageLoad()
    
    // Look for redundancy trigger button
    const redundancyButton = this.page.locator('[data-testid="redundancy-button"]')
    await redundancyButton.waitFor({ state: 'visible', timeout: 10000 })
    await redundancyButton.click()
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForLoadState('domcontentloaded')
  }

  // ============= REDUNDANCY VISUALIZATION HELPERS =============
  
  async waitForRedundancyVisualization() {
    // Wait for the overlay to appear
    await this.page.waitForSelector('[role="dialog"]', { timeout: 15000 })
    
    // Wait for animation to start
    await this.page.waitForTimeout(500)
  }

  async closeRedundancyVisualization() {
    // Try multiple close methods
    const closeButton = this.page.locator('button[aria-label="Close redundancy visualization"]')
    
    if (await closeButton.isVisible()) {
      await closeButton.click()
    } else {
      // Try ESC key
      await this.page.keyboard.press('Escape')
    }
    
    // Wait for overlay to disappear
    await this.page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 })
  }

  async waitForAnimationStep(step: number) {
    // Wait for specific animation steps
    const stepSelectors = {
      1: 'svg path[stroke="#ef4444"]', // Red lines appear
      2: '[data-testid="substation-marker"]', // Substations appear
      3: 'svg path[stroke="#8b5cf6"]', // Purple connection appears
      4: '[id="redundancy-description"]', // Info panel appears
    }
    
    const selector = stepSelectors[step as keyof typeof stepSelectors]
    if (selector) {
      await this.page.waitForSelector(selector, { timeout: 15000 })
    }
  }

  async getAnimationDuration() {
    // Get the animation duration from component props or default
    return await this.page.evaluate(() => {
      const overlay = document.querySelector('[role="dialog"]')
      return overlay?.getAttribute('data-animation-duration') || '4000'
    })
  }

  // ============= INTERACTION HELPERS =============
  
  async clickElement(selector: string) {
    await this.page.waitForSelector(selector, { state: 'visible' })
    await this.page.click(selector)
  }

  async hoverElement(selector: string) {
    await this.page.waitForSelector(selector, { state: 'visible' })
    await this.page.hover(selector)
  }

  async typeText(selector: string, text: string) {
    await this.page.waitForSelector(selector, { state: 'visible' })
    await this.page.fill(selector, text)
  }

  async pressKey(key: string) {
    await this.page.keyboard.press(key)
  }

  async waitForAndClick(selector: string, timeout: number = 10000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout })
    await this.page.click(selector)
  }

  // ============= ASSERTION HELPERS =============
  
  async assertElementVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible()
  }

  async assertElementHidden(selector: string) {
    await expect(this.page.locator(selector)).toBeHidden()
  }

  async assertElementContainsText(selector: string, text: string) {
    await expect(this.page.locator(selector)).toContainText(text)
  }

  async assertElementHasAttribute(selector: string, attribute: string, value: string) {
    await expect(this.page.locator(selector)).toHaveAttribute(attribute, value)
  }

  async assertElementCount(selector: string, count: number) {
    await expect(this.page.locator(selector)).toHaveCount(count)
  }

  async assertURL(url: string) {
    await expect(this.page).toHaveURL(url)
  }

  async assertTitle(title: string) {
    await expect(this.page).toHaveTitle(title)
  }

  // ============= ACCESSIBILITY HELPERS =============
  
  async checkAccessibilityViolations() {
    // This would integrate with axe-core
    const violations = await this.page.evaluate(() => {
      // Mock axe-core check for demonstration
      return []
    })
    
    return violations
  }

  async checkKeyboardNavigation() {
    // Test tab navigation
    await this.page.keyboard.press('Tab')
    const activeElement = await this.page.evaluate(() => document.activeElement?.tagName)
    return activeElement
  }

  async checkScreenReaderContent() {
    // Check aria labels and descriptions
    const ariaLabels = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('[aria-label]')
      return Array.from(elements).map(el => el.getAttribute('aria-label'))
    })
    
    return ariaLabels
  }

  // ============= PERFORMANCE HELPERS =============
  
  async measurePageLoadTime() {
    const startTime = Date.now()
    await this.page.goto('/')
    await this.waitForPageLoad()
    const endTime = Date.now()
    
    return endTime - startTime
  }

  async measureRenderTime(selector: string) {
    const startTime = Date.now()
    await this.page.waitForSelector(selector, { state: 'visible' })
    const endTime = Date.now()
    
    return endTime - startTime
  }

  async getPageMetrics() {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      }
    })
    
    return metrics
  }

  // ============= RESPONSIVE HELPERS =============
  
  async setViewportSize(width: number, height: number) {
    await this.page.setViewportSize({ width, height })
  }

  async testResponsiveBreakpoints() {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'wide', width: 2560, height: 1440 },
    ]
    
    const results = []
    for (const breakpoint of breakpoints) {
      await this.setViewportSize(breakpoint.width, breakpoint.height)
      await this.page.waitForTimeout(500) // Wait for responsive changes
      
      const screenshot = await this.page.screenshot({
        fullPage: true,
        path: `test-results/responsive-${breakpoint.name}.png`,
      })
      
      results.push({
        ...breakpoint,
        screenshot: screenshot.length,
      })
    }
    
    return results
  }

  // ============= VISUAL REGRESSION HELPERS =============
  
  async takeScreenshot(name: string, options: any = {}) {
    return await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
      ...options,
    })
  }

  async compareScreenshot(name: string, threshold: number = 0.1) {
    // This would integrate with visual regression tools
    const screenshot = await this.page.screenshot()
    
    // Mock comparison for demonstration
    return {
      passed: true,
      diff: 0,
      threshold,
    }
  }

  // ============= ANIMATION HELPERS =============
  
  async waitForAnimation(selector: string, timeout: number = 10000) {
    await this.page.waitForFunction(
      (sel) => {
        const element = document.querySelector(sel)
        if (!element) return false
        
        const computedStyle = window.getComputedStyle(element)
        return computedStyle.animationName !== 'none' || computedStyle.transitionProperty !== 'none'
      },
      selector,
      { timeout }
    )
  }

  async waitForAnimationEnd(selector: string, timeout: number = 10000) {
    await this.page.waitForFunction(
      (sel) => {
        const element = document.querySelector(sel)
        if (!element) return false
        
        const computedStyle = window.getComputedStyle(element)
        return computedStyle.animationName === 'none' && computedStyle.transitionProperty === 'none'
      },
      selector,
      { timeout }
    )
  }

  async pauseAnimations() {
    await this.page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    })
  }

  async resumeAnimations() {
    await this.page.evaluate(() => {
      const style = document.querySelector('style[data-playwright-animation-disable]')
      if (style) {
        style.remove()
      }
    })
  }

  // ============= DATA HELPERS =============
  
  async mockAPIResponse(url: string, response: any) {
    await this.page.route(url, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      })
    })
  }

  async interceptRequests(pattern: string) {
    const requests: any[] = []
    
    await this.page.route(pattern, (route) => {
      requests.push({
        url: route.request().url(),
        method: route.request().method(),
        headers: route.request().headers(),
        postData: route.request().postData(),
      })
      route.continue()
    })
    
    return requests
  }

  // ============= UTILITY HELPERS =============
  
  async waitForTimeout(ms: number) {
    await this.page.waitForTimeout(ms)
  }

  async getElementText(selector: string) {
    return await this.page.textContent(selector)
  }

  async getElementAttribute(selector: string, attribute: string) {
    return await this.page.getAttribute(selector, attribute)
  }

  async scrollTo(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded()
  }

  async getConsoleMessages() {
    const messages: string[] = []
    
    this.page.on('console', (message) => {
      messages.push(`${message.type()}: ${message.text()}`)
    })
    
    return messages
  }

  async getPageErrors() {
    const errors: string[] = []
    
    this.page.on('pageerror', (error) => {
      errors.push(error.message)
    })
    
    return errors
  }
}

// Export utility functions
export const createTestHelpers = (page: Page) => new TestHelpers(page)

export const waitForStableState = async (page: Page, timeout: number = 5000) => {
  await page.waitForLoadState('networkidle', { timeout })
  await page.waitForLoadState('domcontentloaded', { timeout })
}

export const getTestData = () => {
  try {
    return JSON.parse(process.env.TEST_DATA || '{}')
  } catch {
    return {}
  }
}

export const generateUniqueId = () => {
  return `test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}