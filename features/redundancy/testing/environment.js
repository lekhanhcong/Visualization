/**
 * Custom Jest Environment for Redundancy Feature
 * Extended jsdom environment with redundancy-specific setup
 */

const { TestEnvironment } = require('jest-environment-jsdom')

class RedundancyTestEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context)
    
    // Set redundancy-specific globals
    this.global.__REDUNDANCY_FEATURE_ENABLED__ = true
    this.global.__REDUNDANCY_TEST_MODE__ = true
    this.global.__REDUNDANCY_MOCK_DEPENDENCIES__ = true
    
    // Add test utilities to global scope
    this.global.redundancyTestUtils = {
      mockDependencies: true,
      enableDebugMode: false,
      performanceMonitoring: true
    }
  }

  async setup() {
    await super.setup()
    
    // Setup redundancy-specific DOM enhancements
    this.setupRedundancyDOM()
    
    // Setup performance monitoring
    this.setupPerformanceMonitoring()
    
    // Setup mock APIs
    this.setupMockAPIs()
  }

  setupRedundancyDOM() {
    // Create redundancy-specific DOM elements
    const testRoot = this.global.document.getElementById('redundancy-test-root')
    if (testRoot) {
      testRoot.innerHTML = `
        <div id="redundancy-overlay-container"></div>
        <div id="redundancy-ui-container"></div>
        <div id="redundancy-debug-container"></div>
      `
    }

    // Add CSS custom properties for testing
    const style = this.global.document.createElement('style')
    style.textContent = `
      :root {
        --rdx-primary-color: #28a745;
        --rdx-secondary-color: #ffc107;
        --rdx-error-color: #dc3545;
        --rdx-background-color: #ffffff;
        --rdx-text-color: #333333;
        --rdx-border-radius: 4px;
        --rdx-transition-duration: 0.3s;
        --rdx-z-index-overlay: 100;
        --rdx-z-index-modal: 200;
      }
      
      .rdx-test-mode {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
    `
    this.global.document.head.appendChild(style)
  }

  setupPerformanceMonitoring() {
    // Enhanced performance monitoring for redundancy tests
    const originalPerformance = this.global.performance

    this.global.performance = {
      ...originalPerformance,
      
      // Track redundancy-specific marks
      mark: (name) => {
        if (name.startsWith('redundancy-')) {
          console.log(`🔍 Performance mark: ${name}`)
        }
        return originalPerformance.mark(name)
      },
      
      // Track redundancy-specific measures
      measure: (name, startMark, endMark) => {
        const result = originalPerformance.measure(name, startMark, endMark)
        if (name.startsWith('redundancy-')) {
          console.log(`⏱️  Performance measure: ${name} - ${result.duration}ms`)
        }
        return result
      },
      
      // Memory usage tracking
      memory: {
        usedJSHeapSize: 1024 * 1024 * 10, // 10MB mock
        totalJSHeapSize: 1024 * 1024 * 50, // 50MB mock
        jsHeapSizeLimit: 1024 * 1024 * 100 // 100MB mock
      }
    }
  }

  setupMockAPIs() {
    // Mock canvas for SVG-to-canvas operations
    const mockCanvas = {
      getContext: () => ({
        measureText: () => ({ width: 100 }),
        fillText: () => {},
        strokeText: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {},
        fill: () => {},
        arc: () => {},
        clearRect: () => {},
        fillRect: () => {},
        drawImage: () => {},
        createImageData: () => ({ data: [] }),
        getImageData: () => ({ data: [] }),
        putImageData: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        scale: () => {},
        transform: () => {},
        setTransform: () => {},
        clip: () => {},
        isPointInPath: () => false
      }),
      toDataURL: () => 'data:image/png;base64,mock',
      toBlob: (callback) => callback(new Blob(['mock'], { type: 'image/png' })),
      width: 800,
      height: 600
    }

    this.global.HTMLCanvasElement.prototype.getContext = () => mockCanvas.getContext()
    this.global.HTMLCanvasElement.prototype.toDataURL = mockCanvas.toDataURL
    this.global.HTMLCanvasElement.prototype.toBlob = mockCanvas.toBlob

    // Mock Web APIs commonly used in redundancy feature
    this.global.IntersectionObserver = class MockIntersectionObserver {
      constructor(callback) {
        this.callback = callback
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }

    this.global.MutationObserver = class MockMutationObserver {
      constructor(callback) {
        this.callback = callback
      }
      observe() {}
      disconnect() {}
      takeRecords() { return [] }
    }

    // Mock geolocation for testing
    this.global.navigator.geolocation = {
      getCurrentPosition: (success) => {
        success({
          coords: {
            latitude: 37.7749,
            longitude: -122.4194,
            accuracy: 10
          }
        })
      },
      watchPosition: () => 1,
      clearWatch: () => {}
    }

    // Mock WebGL for advanced visualizations
    this.global.WebGLRenderingContext = function() {}
    this.global.WebGL2RenderingContext = function() {}
  }

  async teardown() {
    // Cleanup redundancy-specific resources
    delete this.global.__REDUNDANCY_FEATURE_ENABLED__
    delete this.global.__REDUNDANCY_TEST_MODE__
    delete this.global.__REDUNDANCY_MOCK_DEPENDENCIES__
    delete this.global.redundancyTestUtils

    await super.teardown()
  }

  getVmContext() {
    return super.getVmContext()
  }
}

module.exports = RedundancyTestEnvironment