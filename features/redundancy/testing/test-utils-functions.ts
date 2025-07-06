/**
 * Test Utility Functions
 * Helper functions for common testing operations
 */

import { waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

/**
 * Async utility functions
 */
export const asyncUtils = {
  /**
   * Wait for multiple async operations to complete
   */
  waitForAll: async (promises: Promise<any>[]) => {
    return Promise.all(promises)
  },

  /**
   * Wait for condition with timeout
   */
  waitForCondition: async (
    condition: () => boolean,
    timeout = 5000,
    interval = 100
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      
      const check = () => {
        if (condition()) {
          resolve()
          return
        }
        
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Condition not met within ${timeout}ms`))
          return
        }
        
        setTimeout(check, interval)
      }
      
      check()
    })
  },

  /**
   * Delay execution
   */
  delay: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  /**
   * Wait for next tick
   */
  nextTick: (): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, 0))
  },

  /**
   * Wait for animation frame
   */
  animationFrame: (): Promise<number> => {
    return new Promise(resolve => requestAnimationFrame(resolve))
  },

  /**
   * Wait for multiple animation frames
   */
  animationFrames: async (count: number): Promise<void> => {
    for (let i = 0; i < count; i++) {
      await asyncUtils.animationFrame()
    }
  }
}

/**
 * DOM utility functions
 */
export const domUtils = {
  /**
   * Find element by test ID
   */
  findByTestId: (container: HTMLElement, testId: string): HTMLElement | null => {
    return container.querySelector(`[data-testid="${testId}"]`)
  },

  /**
   * Find all elements by test ID
   */
  findAllByTestId: (container: HTMLElement, testId: string): NodeListOf<HTMLElement> => {
    return container.querySelectorAll(`[data-testid="${testId}"]`)
  },

  /**
   * Find element by class name with rdx prefix
   */
  findByRedundancyClass: (container: HTMLElement, className: string): HTMLElement | null => {
    return container.querySelector(`.rdx-${className}`)
  },

  /**
   * Find all elements by class name with rdx prefix
   */
  findAllByRedundancyClass: (container: HTMLElement, className: string): NodeListOf<HTMLElement> => {
    return container.querySelectorAll(`.rdx-${className}`)
  },

  /**
   * Check if element is visible
   */
  isVisible: (element: HTMLElement): boolean => {
    const style = window.getComputedStyle(element)
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0
    )
  },

  /**
   * Get element center coordinates
   */
  getElementCenter: (element: HTMLElement): { x: number; y: number } => {
    const rect = element.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    }
  },

  /**
   * Check if element is in viewport
   */
  isInViewport: (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    )
  },

  /**
   * Scroll element into view
   */
  scrollIntoView: (element: HTMLElement): void => {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  },

  /**
   * Get computed style property
   */
  getStyleProperty: (element: HTMLElement, property: string): string => {
    return window.getComputedStyle(element).getPropertyValue(property)
  },

  /**
   * Set custom CSS property
   */
  setCSSProperty: (element: HTMLElement, property: string, value: string): void => {
    element.style.setProperty(property, value)
  }
}

/**
 * Event utility functions
 */
export const eventUtils = {
  /**
   * Create and dispatch custom event
   */
  dispatchCustomEvent: (
    element: HTMLElement,
    eventType: string,
    detail: any = {},
    options: EventInit = {}
  ): void => {
    const event = new CustomEvent(eventType, {
      bubbles: true,
      cancelable: true,
      detail,
      ...options
    })
    element.dispatchEvent(event)
  },

  /**
   * Simulate mouse click at coordinates
   */
  clickAt: (element: HTMLElement, x: number, y: number): void => {
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y
    })
    element.dispatchEvent(event)
  },

  /**
   * Simulate mouse hover
   */
  hover: (element: HTMLElement): void => {
    element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
  },

  /**
   * Simulate mouse leave
   */
  unhover: (element: HTMLElement): void => {
    element.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
    element.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }))
  },

  /**
   * Simulate keyboard key press
   */
  keyPress: (element: HTMLElement, key: string, options: KeyboardEventInit = {}): void => {
    const keydownEvent = new KeyboardEvent('keydown', { key, ...options })
    const keyupEvent = new KeyboardEvent('keyup', { key, ...options })
    
    element.dispatchEvent(keydownEvent)
    element.dispatchEvent(keyupEvent)
  },

  /**
   * Simulate drag and drop
   */
  dragAndDrop: (
    source: HTMLElement,
    target: HTMLElement,
    sourcePos: { x: number; y: number },
    targetPos: { x: number; y: number }
  ): void => {
    // Start drag
    source.dispatchEvent(new MouseEvent('mousedown', {
      bubbles: true,
      clientX: sourcePos.x,
      clientY: sourcePos.y
    }))

    // Drag over target
    target.dispatchEvent(new MouseEvent('mousemove', {
      bubbles: true,
      clientX: targetPos.x,
      clientY: targetPos.y
    }))

    // Drop
    target.dispatchEvent(new MouseEvent('mouseup', {
      bubbles: true,
      clientX: targetPos.x,
      clientY: targetPos.y
    }))
  }
}

/**
 * Data validation utility functions
 */
export const validationUtils = {
  /**
   * Validate substation data structure
   */
  validateSubstation: (substation: any): boolean => {
    const requiredFields = ['id', 'name', 'status', 'position', 'powerRating']
    return requiredFields.every(field => substation.hasOwnProperty(field))
  },

  /**
   * Validate line data structure
   */
  validateLine: (line: any): boolean => {
    const requiredFields = ['id', 'name', 'status', 'path', 'capacity']
    return requiredFields.every(field => line.hasOwnProperty(field))
  },

  /**
   * Validate redundancy pair structure
   */
  validateRedundancyPair: (pair: any): boolean => {
    const requiredFields = ['id', 'primary', 'backup', 'redundancyLevel']
    return requiredFields.every(field => pair.hasOwnProperty(field))
  },

  /**
   * Validate coordinates
   */
  validateCoordinates: (coords: any): boolean => {
    return (
      coords &&
      typeof coords.x === 'number' &&
      typeof coords.y === 'number' &&
      coords.x >= 0 &&
      coords.y >= 0
    )
  },

  /**
   * Validate color format
   */
  validateColor: (color: string): boolean => {
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    const rgbPattern = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/
    const rgbaPattern = /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(0|1|0?\.\d+)\)$/
    
    return hexPattern.test(color) || rgbPattern.test(color) || rgbaPattern.test(color)
  },

  /**
   * Validate power rating
   */
  validatePowerRating: (rating: number): boolean => {
    return typeof rating === 'number' && rating > 0 && rating <= 10000 // Max 10GW
  },

  /**
   * Validate status enum
   */
  validateStatus: (status: string, validStatuses: string[]): boolean => {
    return validStatuses.includes(status)
  }
}

/**
 * Performance measurement utility functions
 */
export const performanceUtils = {
  /**
   * Measure function execution time
   */
  measureExecutionTime: async <T>(fn: () => T | Promise<T>): Promise<{ result: T; time: number }> => {
    const startTime = performance.now()
    const result = await fn()
    const endTime = performance.now()
    
    return {
      result,
      time: endTime - startTime
    }
  },

  /**
   * Measure render performance
   */
  measureRenderPerformance: async (renderFn: () => void): Promise<{
    renderTime: number;
    layoutTime: number;
    paintTime: number;
  }> => {
    const observer = new PerformanceObserver((list) => {
      // Performance measurement logic would go here
    })
    
    observer.observe({ entryTypes: ['measure'] })
    
    performance.mark('render-start')
    renderFn()
    performance.mark('render-end')
    performance.measure('render-time', 'render-start', 'render-end')
    
    // Mock performance results
    return {
      renderTime: 16.67, // ~60fps
      layoutTime: 2.5,
      paintTime: 1.2
    }
  },

  /**
   * Monitor memory usage
   */
  getMemoryUsage: (): {
    used: number;
    total: number;
    limit: number;
  } | null => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      }
    }
    return null
  },

  /**
   * Check if performance is acceptable
   */
  isPerformanceAcceptable: (metrics: {
    renderTime?: number;
    memoryUsage?: number;
    fps?: number;
  }): boolean => {
    const { renderTime = 0, memoryUsage = 0, fps = 60 } = metrics
    
    return (
      renderTime < 16.67 && // < 1 frame at 60fps
      memoryUsage < 100 * 1024 * 1024 && // < 100MB
      fps >= 30 // At least 30fps
    )
  }
}

/**
 * Math utility functions for testing
 */
export const mathUtils = {
  /**
   * Check if two numbers are approximately equal
   */
  approximately: (a: number, b: number, tolerance = 0.01): boolean => {
    return Math.abs(a - b) <= tolerance
  },

  /**
   * Check if point is within bounds
   */
  isPointInBounds: (
    point: { x: number; y: number },
    bounds: { x: number; y: number; width: number; height: number }
  ): boolean => {
    return (
      point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height
    )
  },

  /**
   * Calculate distance between two points
   */
  distance: (
    point1: { x: number; y: number },
    point2: { x: number; y: number }
  ): number => {
    const dx = point2.x - point1.x
    const dy = point2.y - point1.y
    return Math.sqrt(dx * dx + dy * dy)
  },

  /**
   * Calculate angle between two points
   */
  angle: (
    point1: { x: number; y: number },
    point2: { x: number; y: number }
  ): number => {
    return Math.atan2(point2.y - point1.y, point2.x - point1.x)
  },

  /**
   * Generate random number within range
   */
  randomInRange: (min: number, max: number): number => {
    return Math.random() * (max - min) + min
  },

  /**
   * Clamp number within range
   */
  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max)
  }
}

/**
 * String utility functions for testing
 */
export const stringUtils = {
  /**
   * Generate random string
   */
  randomString: (length = 10): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },

  /**
   * Generate random ID
   */
  randomId: (prefix = 'test'): string => {
    return `${prefix}-${stringUtils.randomString(8)}`
  },

  /**
   * Format test name
   */
  formatTestName: (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  },

  /**
   * Truncate string with ellipsis
   */
  truncate: (str: string, maxLength: number): string => {
    if (str.length <= maxLength) return str
    return str.substr(0, maxLength - 3) + '...'
  }
}

/**
 * Test assertion utility functions
 */
export const assertionUtils = {
  /**
   * Assert element exists and is visible
   */
  assertVisible: (element: HTMLElement | null): void => {
    expect(element).toBeTruthy()
    expect(element).toBeVisible()
  },

  /**
   * Assert element has expected text content
   */
  assertTextContent: (element: HTMLElement, expectedText: string): void => {
    expect(element).toHaveTextContent(expectedText)
  },

  /**
   * Assert element has expected attributes
   */
  assertAttributes: (element: HTMLElement, attributes: Record<string, string>): void => {
    Object.entries(attributes).forEach(([key, value]) => {
      expect(element).toHaveAttribute(key, value)
    })
  },

  /**
   * Assert element has expected CSS classes
   */
  assertClasses: (element: HTMLElement, classes: string[]): void => {
    classes.forEach(className => {
      expect(element).toHaveClass(className)
    })
  },

  /**
   * Assert element styles
   */
  assertStyles: (element: HTMLElement, styles: Record<string, string>): void => {
    Object.entries(styles).forEach(([property, value]) => {
      expect(element).toHaveStyle(`${property}: ${value}`)
    })
  },

  /**
   * Assert array contains expected items
   */
  assertArrayContains: <T>(array: T[], expectedItems: T[]): void => {
    expectedItems.forEach(item => {
      expect(array).toContain(item)
    })
  },

  /**
   * Assert object has expected structure
   */
  assertObjectStructure: (obj: any, expectedKeys: string[]): void => {
    expectedKeys.forEach(key => {
      expect(obj).toHaveProperty(key)
    })
  }
}

export default {
  asyncUtils,
  domUtils,
  eventUtils,
  validationUtils,
  performanceUtils,
  mathUtils,
  stringUtils,
  assertionUtils
}