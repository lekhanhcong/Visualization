/**
 * Performance Test Setup
 * Additional setup for performance testing
 */

// Performance monitoring utilities
global.performanceThresholds = {
  renderTime: 100, // ms
  animationFrame: 16, // ms (60 FPS)
  memoryUsage: 50 * 1024 * 1024, // 50MB
  reRenderTime: 50 // ms
}

// Performance measurement helpers
global.measurePerformance = {
  start: (label) => {
    performance.mark(`${label}-start`)
  },
  end: (label) => {
    performance.mark(`${label}-end`)
    performance.measure(label, `${label}-start`, `${label}-end`)
    const measure = performance.getEntriesByName(label)[0]
    return measure.duration
  },
  clear: () => {
    performance.clearMarks()
    performance.clearMeasures()
  }
}

// Memory usage monitoring (if available)
if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
  global.getMemoryUsage = () => window.performance.memory.usedJSHeapSize
} else {
  global.getMemoryUsage = () => 0
}

beforeEach(() => {
  global.measurePerformance.clear()
})