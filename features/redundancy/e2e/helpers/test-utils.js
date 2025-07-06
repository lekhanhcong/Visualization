/**
 * E2E Test Utilities
 * Helper functions for redundancy E2E tests
 */

const fs = require('fs')
const path = require('path')

/**
 * Test data utilities
 */
const testData = {
  /**
   * Load test data from JSON files
   */
  load: (filename) => {
    const dataPath = path.resolve(__dirname, '../data', filename)
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    }
    throw new Error(`Test data file not found: ${filename}`)
  },

  /**
   * Get test scenarios
   */
  getScenarios: () => {
    return testData.load('e2e-test-data.json').scenarios
  },

  /**
   * Get test substations
   */
  getSubstations: () => {
    return testData.load('e2e-test-data.json').substations
  },

  /**
   * Get test lines
   */
  getLines: () => {
    return testData.load('e2e-test-data.json').lines
  }
}

/**
 * Browser utilities
 */
const browser = {
  /**
   * Setup browser context with redundancy-specific settings
   */
  setupContext: async (browser, options = {}) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
      hasTouch: false,
      isMobile: false,
      ...options,
      
      // Redundancy-specific settings
      extraHTTPHeaders: {
        'X-Redundancy-Test': 'true',
        'X-E2E-Test': 'true',
        ...options.extraHTTPHeaders
      }
    })

    // Setup context with redundancy feature enabled
    await context.addInitScript(() => {
      localStorage.setItem('redundancy-feature-enabled', 'true')
      localStorage.setItem('redundancy-debug-mode', 'true')
      localStorage.setItem('e2e-test-mode', 'true')
    })

    return context
  },

  /**
   * Setup page with event listeners for debugging
   */
  setupPage: async (context) => {
    const page = await context.newPage()

    // Add console logging
    page.on('console', msg => {
      if (process.env.DEBUG_E2E === 'true') {
        console.log(`🖥️  [${msg.type()}] ${msg.text()}`)
      }
    })

    // Add error logging
    page.on('pageerror', error => {
      console.error(`❌ Page error: ${error.message}`)
    })

    // Add request logging
    if (process.env.DEBUG_NETWORK === 'true') {
      page.on('request', request => {
        console.log(`📤 ${request.method()} ${request.url()}`)
      })

      page.on('response', response => {
        console.log(`📥 ${response.status()} ${response.url()}`)
      })
    }

    return page
  }
}

/**
 * Assertion utilities
 */
const assertions = {
  /**
   * Assert element exists and is visible
   */
  assertVisible: async (page, selector, message) => {
    const element = page.locator(selector)
    await expect(element).toBeVisible({ timeout: 10000 })
    if (message) {
      console.log(`✅ ${message}`)
    }
  },

  /**
   * Assert element contains text
   */
  assertText: async (page, selector, expectedText, message) => {
    const element = page.locator(selector)
    await expect(element).toContainText(expectedText, { timeout: 10000 })
    if (message) {
      console.log(`✅ ${message}: "${expectedText}"`)
    }
  },

  /**
   * Assert element count
   */
  assertCount: async (page, selector, expectedCount, message) => {
    const elements = page.locator(selector)
    await expect(elements).toHaveCount(expectedCount, { timeout: 10000 })
    if (message) {
      console.log(`✅ ${message}: ${expectedCount}`)
    }
  },

  /**
   * Assert attribute value
   */
  assertAttribute: async (page, selector, attribute, expectedValue, message) => {
    const element = page.locator(selector)
    await expect(element).toHaveAttribute(attribute, expectedValue, { timeout: 10000 })
    if (message) {
      console.log(`✅ ${message}: ${attribute}="${expectedValue}"`)
    }
  },

  /**
   * Assert CSS property
   */
  assertCSS: async (page, selector, property, expectedValue, message) => {
    const element = page.locator(selector)
    await expect(element).toHaveCSS(property, expectedValue, { timeout: 10000 })
    if (message) {
      console.log(`✅ ${message}: ${property}="${expectedValue}"`)
    }
  },

  /**
   * Assert no errors in console
   */
  assertNoErrors: async (page) => {
    const errors = []
    page.on('pageerror', error => errors.push(error))
    
    await page.waitForTimeout(1000) // Wait for potential errors
    
    if (errors.length > 0) {
      throw new Error(`Page errors detected: ${errors.map(e => e.message).join(', ')}`)
    }
    
    console.log('✅ No page errors detected')
  }
}

/**
 * Wait utilities
 */
const wait = {
  /**
   * Wait for redundancy feature to load
   */
  forRedundancyLoad: async (page, timeout = 30000) => {
    await page.waitForSelector('[data-testid="redundancy-container"]', { timeout })
    await page.waitForFunction(
      () => window.redundancyFeature && window.redundancyFeature.isLoaded,
      { timeout }
    )
    console.log('✅ Redundancy feature loaded')
  },

  /**
   * Wait for overlay to appear
   */
  forOverlay: async (page, timeout = 10000) => {
    await page.waitForSelector('.rdx-overlay', { timeout })
    await page.waitForTimeout(500) // Wait for animations
    console.log('✅ Redundancy overlay appeared')
  },

  /**
   * Wait for overlay to disappear
   */
  forOverlayHidden: async (page, timeout = 10000) => {
    await page.waitForSelector('.rdx-overlay', { state: 'detached', timeout })
    console.log('✅ Redundancy overlay hidden')
  },

  /**
   * Wait for animations to complete
   */
  forAnimations: async (page, timeout = 5000) => {
    // Wait for any running animations
    await page.waitForFunction(
      () => !document.querySelector('.rdx-power-flow-animation[data-animating="true"]'),
      { timeout }
    ).catch(() => {
      // Animation might not have the data-animating attribute
    })
    
    await page.waitForTimeout(1000) // Additional buffer
    console.log('✅ Animations completed')
  },

  /**
   * Wait for network requests to complete
   */
  forNetwork: async (page, timeout = 10000) => {
    await page.waitForLoadState('networkidle', { timeout })
    console.log('✅ Network requests completed')
  },

  /**
   * Wait for specific element count
   */
  forElementCount: async (page, selector, expectedCount, timeout = 10000) => {
    await page.waitForFunction(
      (sel, count) => document.querySelectorAll(sel).length === count,
      [selector, expectedCount],
      { timeout }
    )
    console.log(`✅ Found ${expectedCount} elements matching "${selector}"`)
  }
}

/**
 * Screenshot utilities
 */
const screenshot = {
  /**
   * Take full page screenshot
   */
  fullPage: async (page, name) => {
    const filename = `${name}-${Date.now()}.png`
    const path = `./test-results/screenshots/${filename}`
    await page.screenshot({ path, fullPage: true })
    console.log(`📸 Screenshot saved: ${filename}`)
    return path
  },

  /**
   * Take element screenshot
   */
  element: async (page, selector, name) => {
    const filename = `${name}-element-${Date.now()}.png`
    const path = `./test-results/screenshots/${filename}`
    await page.locator(selector).screenshot({ path })
    console.log(`📸 Element screenshot saved: ${filename}`)
    return path
  },

  /**
   * Take overlay screenshot
   */
  overlay: async (page, name) => {
    return await screenshot.element(page, '.rdx-overlay', `overlay-${name}`)
  },

  /**
   * Compare screenshots (placeholder for visual regression)
   */
  compare: async (currentPath, baselinePath, threshold = 0.1) => {
    // In a real implementation, you'd use a visual diff tool
    console.log(`🔍 Comparing ${currentPath} with ${baselinePath} (threshold: ${threshold})`)
    return { match: true, difference: 0 }
  }
}

/**
 * Performance utilities
 */
const performance = {
  /**
   * Measure page load performance
   */
  measurePageLoad: async (page) => {
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0]
      return {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.navigationStart,
        loadComplete: nav.loadEventEnd - nav.navigationStart,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        largestContentfulPaint: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0
      }
    })
    
    console.log('⏱️  Page Load Metrics:', metrics)
    return metrics
  },

  /**
   * Measure redundancy feature performance
   */
  measureRedundancyPerformance: async (page) => {
    const metrics = await page.evaluate(() => {
      const redundancyMarks = performance.getEntriesByType('mark')
        .filter(mark => mark.name.startsWith('redundancy-'))
      
      const redundancyMeasures = performance.getEntriesByType('measure')
        .filter(measure => measure.name.startsWith('redundancy-'))
      
      return {
        marks: redundancyMarks.map(mark => ({ name: mark.name, time: mark.startTime })),
        measures: redundancyMeasures.map(measure => ({ 
          name: measure.name, 
          duration: measure.duration 
        }))
      }
    })
    
    console.log('⏱️  Redundancy Performance:', metrics)
    return metrics
  },

  /**
   * Check memory usage
   */
  checkMemory: async (page) => {
    const memory = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        }
      }
      return null
    })
    
    if (memory) {
      console.log('🧠 Memory Usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
      })
    }
    
    return memory
  }
}

/**
 * Debug utilities
 */
const debug = {
  /**
   * Log test step
   */
  step: (message) => {
    console.log(`🔍 Step: ${message}`)
  },

  /**
   * Log test info
   */
  info: (message) => {
    console.log(`ℹ️  Info: ${message}`)
  },

  /**
   * Save page HTML for debugging
   */
  saveHTML: async (page, name) => {
    const html = await page.content()
    const filename = `debug-${name}-${Date.now()}.html`
    const filePath = path.resolve(__dirname, '../test-results', filename)
    fs.writeFileSync(filePath, html)
    console.log(`💾 HTML saved: ${filename}`)
    return filePath
  },

  /**
   * Save console logs
   */
  saveLogs: (logs, name) => {
    const filename = `logs-${name}-${Date.now()}.json`
    const filePath = path.resolve(__dirname, '../test-results', filename)
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2))
    console.log(`📋 Logs saved: ${filename}`)
    return filePath
  }
}

module.exports = {
  testData,
  browser,
  assertions,
  wait,
  screenshot,
  performance,
  debug
}