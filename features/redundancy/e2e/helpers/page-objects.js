/**
 * Page Objects for Redundancy E2E Tests
 * Centralized page object models for consistent test interactions
 */

/**
 * Base Page Object
 */
class BasePage {
  constructor(page) {
    this.page = page
    this.timeout = 10000
  }

  async goto(path = '/') {
    await this.page.goto(path)
    await this.waitForPageLoad()
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForSelector('body')
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: `./test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    })
  }

  async waitForSelector(selector, options = {}) {
    return await this.page.waitForSelector(selector, { 
      timeout: this.timeout, 
      ...options 
    })
  }

  async clickElement(selector) {
    await this.waitForSelector(selector)
    await this.page.click(selector)
  }

  async fillInput(selector, value) {
    await this.waitForSelector(selector)
    await this.page.fill(selector, value)
  }

  async getText(selector) {
    await this.waitForSelector(selector)
    return await this.page.textContent(selector)
  }

  async isVisible(selector) {
    try {
      await this.waitForSelector(selector, { timeout: 5000 })
      return await this.page.isVisible(selector)
    } catch {
      return false
    }
  }

  async getAttribute(selector, attribute) {
    await this.waitForSelector(selector)
    return await this.page.getAttribute(selector, attribute)
  }
}

/**
 * Main Application Page Object
 */
class MainPage extends BasePage {
  constructor(page) {
    super(page)
    
    // Selectors
    this.selectors = {
      // Main app elements
      appContainer: '[data-testid="app-container"]',
      loadingSpinner: '[data-testid="loading-spinner"]',
      errorBoundary: '[data-testid="error-boundary"]',
      
      // Navigation
      header: '[data-testid="app-header"]',
      navigation: '[data-testid="main-navigation"]',
      
      // Feature toggle
      featureToggle: '[data-testid="feature-toggle"]',
      redundancyToggle: '[data-testid="redundancy-toggle"]'
    }
  }

  async waitForAppLoad() {
    await this.waitForSelector(this.selectors.appContainer)
    
    // Wait for loading to complete
    try {
      await this.page.waitForSelector(this.selectors.loadingSpinner, { 
        state: 'detached', 
        timeout: 30000 
      })
    } catch {
      // Loading spinner might not appear for fast loads
    }
  }

  async enableRedundancyFeature() {
    if (await this.isVisible(this.selectors.redundancyToggle)) {
      const isEnabled = await this.getAttribute(this.selectors.redundancyToggle, 'aria-checked')
      if (isEnabled !== 'true') {
        await this.clickElement(this.selectors.redundancyToggle)
        await this.page.waitForTimeout(1000) // Wait for feature to initialize
      }
    }
  }

  async hasError() {
    return await this.isVisible(this.selectors.errorBoundary)
  }

  async getErrorMessage() {
    if (await this.hasError()) {
      return await this.getText(this.selectors.errorBoundary)
    }
    return null
  }
}

/**
 * Redundancy Feature Page Object
 */
class RedundancyPage extends BasePage {
  constructor(page) {
    super(page)
    
    // Selectors
    this.selectors = {
      // Main containers
      redundancyContainer: '[data-testid="redundancy-container"]',
      redundancyOverlay: '.rdx-overlay',
      redundancyButton: '.rdx-button',
      
      // Components
      infoPanel: '.rdx-info-panel',
      substationMarkers: '.rdx-substation-marker',
      lineHighlights: '.rdx-line-highlight',
      powerFlowAnimation: '.rdx-power-flow-animation',
      
      // UI Elements
      showButton: '[data-testid="redundancy-show-button"]',
      hideButton: '[data-testid="redundancy-hide-button"]',
      settingsButton: '[data-testid="redundancy-settings-button"]',
      
      // Info Panel Elements
      statsDisplay: '[data-testid="stats-display"]',
      redundancyLevel: '[data-testid="redundancy-level"]',
      systemHealth: '[data-testid="system-health"]',
      alertCount: '[data-testid="alert-count"]',
      
      // Interactive Elements
      substationClickable: '[data-testid^="substation-"]',
      lineClickable: '[data-testid^="line-"]',
      
      // Modal/Dialog
      settingsModal: '[data-testid="settings-modal"]',
      confirmDialog: '[data-testid="confirm-dialog"]'
    }
  }

  async isRedundancyEnabled() {
    return await this.isVisible(this.selectors.redundancyContainer)
  }

  async showRedundancyOverlay() {
    if (await this.isVisible(this.selectors.showButton)) {
      await this.clickElement(this.selectors.showButton)
      await this.waitForSelector(this.selectors.redundancyOverlay)
    }
  }

  async hideRedundancyOverlay() {
    if (await this.isVisible(this.selectors.hideButton)) {
      await this.clickElement(this.selectors.hideButton)
      await this.page.waitForSelector(this.selectors.redundancyOverlay, { 
        state: 'detached',
        timeout: 5000 
      })
    }
  }

  async isOverlayVisible() {
    return await this.isVisible(this.selectors.redundancyOverlay)
  }

  async getSubstationCount() {
    const substations = await this.page.locator(this.selectors.substationMarkers).count()
    return substations
  }

  async getLineCount() {
    const lines = await this.page.locator(this.selectors.lineHighlights).count()
    return lines
  }

  async clickSubstation(substationId) {
    const selector = `[data-testid="substation-${substationId}"]`
    await this.clickElement(selector)
  }

  async hoverLine(lineId) {
    const selector = `[data-testid="line-${lineId}"]`
    await this.waitForSelector(selector)
    await this.page.hover(selector)
  }

  async getRedundancyLevel() {
    if (await this.isVisible(this.selectors.redundancyLevel)) {
      return await this.getText(this.selectors.redundancyLevel)
    }
    return null
  }

  async getSystemHealth() {
    if (await this.isVisible(this.selectors.systemHealth)) {
      return await this.getText(this.selectors.systemHealth)
    }
    return null
  }

  async getAlertCount() {
    if (await this.isVisible(this.selectors.alertCount)) {
      const text = await this.getText(this.selectors.alertCount)
      return parseInt(text) || 0
    }
    return 0
  }

  async openSettings() {
    await this.clickElement(this.selectors.settingsButton)
    await this.waitForSelector(this.selectors.settingsModal)
  }

  async closeSettings() {
    const closeButton = `${this.selectors.settingsModal} [data-testid="close-button"]`
    if (await this.isVisible(closeButton)) {
      await this.clickElement(closeButton)
    }
  }

  async isSettingsOpen() {
    return await this.isVisible(this.selectors.settingsModal)
  }

  async triggerFailover(fromSubstation, toSubstation) {
    // Click on source substation
    await this.clickSubstation(fromSubstation)
    
    // Wait for context menu or failover options
    const failoverButton = '[data-testid="failover-button"]'
    await this.waitForSelector(failoverButton)
    await this.clickElement(failoverButton)
    
    // Select target substation
    const targetSelector = `[data-testid="target-${toSubstation}"]`
    await this.clickElement(targetSelector)
    
    // Confirm failover
    const confirmButton = `${this.selectors.confirmDialog} [data-testid="confirm-button"]`
    await this.clickElement(confirmButton)
    
    // Wait for failover to complete
    await this.page.waitForTimeout(2000)
  }

  async waitForAnimations() {
    // Wait for power flow animations to stabilize
    if (await this.isVisible(this.selectors.powerFlowAnimation)) {
      await this.page.waitForTimeout(3000)
    }
  }

  async captureOverlayScreenshot(name) {
    if (await this.isOverlayVisible()) {
      await this.page.locator(this.selectors.redundancyOverlay).screenshot({
        path: `./test-results/screenshots/overlay-${name}-${Date.now()}.png`
      })
    }
  }

  async verifyInfoPanelData() {
    const data = {}
    
    if (await this.isVisible(this.selectors.redundancyLevel)) {
      data.redundancyLevel = await this.getText(this.selectors.redundancyLevel)
    }
    
    if (await this.isVisible(this.selectors.systemHealth)) {
      data.systemHealth = await this.getText(this.selectors.systemHealth)
    }
    
    if (await this.isVisible(this.selectors.alertCount)) {
      data.alertCount = await this.getAlertCount()
    }
    
    return data
  }

  async performKeyboardNavigation() {
    // Test keyboard accessibility
    await this.page.keyboard.press('Tab')
    await this.page.keyboard.press('Enter')
    await this.page.keyboard.press('Escape')
  }

  async checkAccessibility() {
    // Basic accessibility checks
    const focusableElements = await this.page.locator('[tabindex="0"], button, input, select, textarea, a[href]').count()
    const ariaLabels = await this.page.locator('[aria-label]').count()
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').count()
    
    return {
      focusableElements,
      ariaLabels,
      headings
    }
  }
}

/**
 * Performance Testing Page Object
 */
class PerformancePage extends BasePage {
  constructor(page) {
    super(page)
    this.metrics = {}
  }

  async startPerformanceMonitoring() {
    await this.page.evaluate(() => {
      window.performanceMetrics = {
        startTime: performance.now(),
        marks: {},
        measures: {}
      }
    })
  }

  async stopPerformanceMonitoring() {
    this.metrics = await this.page.evaluate(() => {
      const endTime = performance.now()
      const metrics = window.performanceMetrics || {}
      
      return {
        totalTime: endTime - (metrics.startTime || endTime),
        marks: metrics.marks || {},
        measures: metrics.measures || {},
        memory: performance.memory ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        } : null
      }
    })
    
    return this.metrics
  }

  async measurePageLoad() {
    const navigationTiming = await this.page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0]
      return {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
        loadComplete: nav.loadEventEnd - nav.loadEventStart,
        responseTime: nav.responseEnd - nav.requestStart,
        renderTime: nav.domComplete - nav.domLoading
      }
    })
    
    return navigationTiming
  }

  async getResourceMetrics() {
    return await this.page.evaluate(() => {
      const resources = performance.getEntriesByType('resource')
      return resources.map(resource => ({
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize,
        type: resource.initiatorType
      }))
    })
  }
}

module.exports = {
  BasePage,
  MainPage,
  RedundancyPage,
  PerformancePage
}