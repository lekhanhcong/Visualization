/**
 * Test Environment Configuration
 * Configuration utilities for redundancy test environment
 */

/**
 * Environment configuration for different test types
 */
const testEnvironmentConfigs = {
  unit: {
    testTimeout: 10000,
    setupTimeout: 5000,
    teardownTimeout: 5000,
    detectHandles: false,
    errorOnDeprecated: true,
    globals: {
      __REDUNDANCY_UNIT_TEST__: true
    }
  },
  
  integration: {
    testTimeout: 20000,
    setupTimeout: 10000,
    teardownTimeout: 10000,
    detectHandles: true,
    errorOnDeprecated: false,
    globals: {
      __REDUNDANCY_INTEGRATION_TEST__: true
    }
  },
  
  performance: {
    testTimeout: 30000,
    setupTimeout: 15000,
    teardownTimeout: 15000,
    detectHandles: true,
    errorOnDeprecated: false,
    globals: {
      __REDUNDANCY_PERFORMANCE_TEST__: true,
      __REDUNDANCY_MONITOR_PERFORMANCE__: true
    }
  },
  
  accessibility: {
    testTimeout: 15000,
    setupTimeout: 10000,
    teardownTimeout: 10000,
    detectHandles: false,
    errorOnDeprecated: false,
    globals: {
      __REDUNDANCY_A11Y_TEST__: true,
      __REDUNDANCY_AXE_ENABLED__: true
    }
  },
  
  visual: {
    testTimeout: 20000,
    setupTimeout: 10000,
    teardownTimeout: 10000,
    detectHandles: false,
    errorOnDeprecated: false,
    globals: {
      __REDUNDANCY_VISUAL_TEST__: true,
      __REDUNDANCY_SNAPSHOT_MODE__: true
    }
  }
}

/**
 * Get configuration for specific test type
 */
function getTestEnvironmentConfig(testType = 'unit') {
  const config = testEnvironmentConfigs[testType]
  if (!config) {
    throw new Error(`Unknown test environment type: ${testType}`)
  }
  
  return {
    ...config,
    globals: {
      ...config.globals,
      __REDUNDANCY_TEST_TYPE__: testType,
      __REDUNDANCY_TEST_TIMESTAMP__: Date.now()
    }
  }
}

/**
 * Environment setup utilities
 */
const environmentUtils = {
  /**
   * Setup mock DOM for testing
   */
  setupMockDOM: (window, document) => {
    // Add redundancy-specific DOM setup
    if (document.getElementById('redundancy-test-root')) {
      const container = document.createElement('div')
      container.id = 'redundancy-main-container'
      container.className = 'rdx-test-container'
      document.getElementById('redundancy-test-root').appendChild(container)
    }
  },

  /**
   * Setup mock CSS for testing
   */
  setupMockCSS: (document) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/mock-redundancy-styles.css'
    document.head.appendChild(link)
  },

  /**
   * Setup mock fonts for testing
   */
  setupMockFonts: (document) => {
    const style = document.createElement('style')
    style.textContent = `
      @font-face {
        font-family: 'Mock Sans';
        src: url('data:font/woff2;base64,mock') format('woff2');
      }
      
      body, .rdx-test-container {
        font-family: 'Mock Sans', sans-serif;
      }
    `
    document.head.appendChild(style)
  },

  /**
   * Setup mock media queries
   */
  setupMockMediaQueries: (window) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('max-width: 768px') ? false : true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  },

  /**
   * Setup mock intersection observer
   */
  setupMockIntersectionObserver: (window) => {
    window.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      root: null,
      rootMargin: '',
      thresholds: []
    }))
  },

  /**
   * Setup mock resize observer
   */
  setupMockResizeObserver: (window) => {
    window.ResizeObserver = jest.fn().mockImplementation((callback) => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    }))
  },

  /**
   * Cleanup environment after tests
   */
  cleanup: (window, document) => {
    // Remove added elements
    const testRoot = document.getElementById('redundancy-test-root')
    if (testRoot) {
      testRoot.innerHTML = ''
    }

    // Clear added styles
    const mockStyles = document.querySelectorAll('style[data-test="mock"]')
    mockStyles.forEach(style => style.remove())

    // Reset mock implementations
    if (window.matchMedia && jest.isMockFunction(window.matchMedia)) {
      window.matchMedia.mockClear()
    }
  }
}

/**
 * Performance monitoring setup
 */
const performanceSetup = {
  /**
   * Setup performance monitoring
   */
  setup: (global) => {
    global.redundancyPerformance = {
      marks: {},
      measures: {},
      
      mark: (name) => {
        global.redundancyPerformance.marks[name] = performance.now()
        performance.mark(name)
      },
      
      measure: (name, startMark, endMark) => {
        const startTime = global.redundancyPerformance.marks[startMark]
        const endTime = global.redundancyPerformance.marks[endMark]
        
        if (startTime && endTime) {
          const duration = endTime - startTime
          global.redundancyPerformance.measures[name] = duration
          performance.measure(name, startMark, endMark)
          return duration
        }
        
        return 0
      },
      
      getReport: () => ({
        marks: global.redundancyPerformance.marks,
        measures: global.redundancyPerformance.measures,
        summary: {
          totalMarks: Object.keys(global.redundancyPerformance.marks).length,
          totalMeasures: Object.keys(global.redundancyPerformance.measures).length,
          averageDuration: Object.values(global.redundancyPerformance.measures)
            .reduce((sum, duration) => sum + duration, 0) / 
            Object.keys(global.redundancyPerformance.measures).length || 0
        }
      })
    }
  },
  
  /**
   * Cleanup performance monitoring
   */
  cleanup: (global) => {
    if (global.redundancyPerformance) {
      performance.clearMarks()
      performance.clearMeasures()
      delete global.redundancyPerformance
    }
  }
}

module.exports = {
  testEnvironmentConfigs,
  getTestEnvironmentConfig,
  environmentUtils,
  performanceSetup
}