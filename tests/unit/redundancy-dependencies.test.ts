/**
 * Tests for Redundancy Dependencies
 */

import {
  redundancyDependencies,
  developmentDependencies,
  enhancementDependencies,
  getAllDependencies,
  getRequiredDependencies,
  getOptionalDependencies
} from '../../features/redundancy/dependencies/RedundancyDependencies'

// Mock DOM methods
const mockQuerySelector = jest.fn()
const mockCreateElement = jest.fn(() => ({
  style: {},
  className: '',
  setAttribute: jest.fn(),
  getAttribute: jest.fn()
}))
const mockAppendChild = jest.fn()
const mockAddEventListener = jest.fn()

// Mock window object
;(global as any).window = {
  React: {},
  __REACT_DEVTOOLS_GLOBAL_HOOK__: {}
}

// Mock require function
;(global as any).require = jest.fn()

// Mock document methods
Object.defineProperty(global.document, 'querySelector', {
  value: mockQuerySelector,
  writable: true
})

Object.defineProperty(global.document, 'createElement', {
  value: mockCreateElement,
  writable: true
})

Object.defineProperty(global.document, 'readyState', {
  value: 'complete',
  writable: true,
  configurable: true
})

if (global.document.head) {
  Object.defineProperty(global.document.head, 'appendChild', {
    value: mockAppendChild,
    writable: true
  })
}

if (global.document.body) {
  Object.defineProperty(global.document.body, 'appendChild', {
    value: mockAppendChild,
    writable: true
  })
}

Object.defineProperty(global.document, 'addEventListener', {
  value: mockAddEventListener,
  writable: true
})

describe('Redundancy Dependencies', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset document mock
    mockQuerySelector.mockReturnValue(null)
  })

  describe('Core Dependencies', () => {
    test('should include all required core dependencies', () => {
      expect(redundancyDependencies).toHaveLength(5)
      
      const dependencyIds = redundancyDependencies.map(dep => dep.id)
      expect(dependencyIds).toContain('dom-ready')
      expect(dependencyIds).toContain('css-support')
      expect(dependencyIds).toContain('react-runtime')
      expect(dependencyIds).toContain('datacenter-view')
      expect(dependencyIds).toContain('plugin-registry')
    })

    test('should have correct load order for core dependencies', () => {
      const sortedDeps = [...redundancyDependencies].sort((a, b) => a.loadOrder - b.loadOrder)
      
      expect(sortedDeps[0].id).toBe('dom-ready')
      expect(sortedDeps[1].id).toBe('css-support')
      expect(sortedDeps[2].id).toBe('react-runtime')
      expect(sortedDeps[3].id).toBe('datacenter-view')
      expect(sortedDeps[4].id).toBe('plugin-registry')
    })

    test('should mark required dependencies correctly', () => {
      const requiredDeps = redundancyDependencies.filter(dep => dep.required)
      const optionalDeps = redundancyDependencies.filter(dep => !dep.required)
      
      expect(requiredDeps).toHaveLength(4)
      expect(optionalDeps).toHaveLength(1)
      expect(optionalDeps[0].id).toBe('plugin-registry')
    })
  })

  describe('DOM Ready Dependency', () => {
    test('should check DOM ready state correctly', () => {
      const domDep = redundancyDependencies.find(dep => dep.id === 'dom-ready')!
      
      // Document complete
      ;(document as any).readyState = 'complete'
      expect(domDep.checkFunction!()).toBe(true)
      
      // Document interactive
      ;(document as any).readyState = 'interactive'
      expect(domDep.checkFunction!()).toBe(true)
      
      // Document loading
      ;(document as any).readyState = 'loading'
      expect(domDep.checkFunction!()).toBe(false)
    })

    test('should have fallback for DOM ready', async () => {
      const domDep = redundancyDependencies.find(dep => dep.id === 'dom-ready')!
      
      expect(domDep.fallbackHandler).toBeDefined()
      
      // Mock document ready state as loading to trigger event listener
      Object.defineProperty(global.document, 'readyState', {
        value: 'loading',
        writable: true,
        configurable: true
      })
      
      // Start the fallback handler
      const fallbackPromise = domDep.fallbackHandler!()
      
      // Simulate DOMContentLoaded event
      setTimeout(() => {
        const listener = mockAddEventListener.mock.calls.find(
          call => call[0] === 'DOMContentLoaded'
        )?.[1]
        if (listener) listener()
      }, 10)
      
      // Should resolve without throwing
      await expect(fallbackPromise).resolves.toBeUndefined()
    }, 15000)
  })

  describe('CSS Support Dependency', () => {
    test('should check CSS support correctly', () => {
      const cssDep = redundancyDependencies.find(dep => dep.id === 'css-support')!
      
      // Mock createElement to return element with working style
      const mockElement = {
        style: {} as CSSStyleDeclaration
      }
      
      mockCreateElement.mockReturnValue(mockElement)
      
      // CSS should work when position property can be set
      Object.defineProperty(mockElement.style, 'position', {
        get: () => 'absolute',
        set: () => {},
        configurable: true
      })
      
      expect(cssDep.checkFunction!()).toBe(true)
    })

    test('should have CSS fallback', () => {
      const cssDep = redundancyDependencies.find(dep => dep.id === 'css-support')!
      
      expect(cssDep.fallbackHandler).toBeDefined()
      
      // Should not throw
      expect(() => cssDep.fallbackHandler!()).not.toThrow()
      expect(mockAppendChild).toHaveBeenCalled()
    })
  })

  describe('React Runtime Dependency', () => {
    test('should check React availability', () => {
      const reactDep = redundancyDependencies.find(dep => dep.id === 'react-runtime')!
      
      // Reset window mock for this test
      const originalWindow = global.window
      const originalRequire = (global as any).require
      
      try {
        // React available on window
        ;(global as any).window = { React: {} }
        expect(reactDep.checkFunction!()).toBe(true)
        
        // No React on window, but require available
        ;(global as any).window = {}
        ;(global as any).require = jest.fn()
        expect(reactDep.checkFunction!()).toBe(true)
        
        // No React at all
        ;(global as any).window = {}
        delete (global as any).require
        expect(reactDep.checkFunction!()).toBe(false)
      } finally {
        // Restore original values
        ;(global as any).window = originalWindow
        ;(global as any).require = originalRequire
      }
    })
  })

  describe('Datacenter View Dependency', () => {
    test('should check for datacenter view elements', () => {
      const datacenterDep = redundancyDependencies.find(dep => dep.id === 'datacenter-view')!
      
      // Primary selector found
      mockQuerySelector.mockImplementation((selector) => {
        if (selector === '[data-testid="datacenter-main-view"]') {
          return { id: 'main-view' }
        }
        return null
      })
      
      expect(datacenterDep.checkFunction!()).toBe(true)
      
      // Fallback selector found
      mockQuerySelector.mockImplementation((selector) => {
        if (selector === '.main-content') {
          return { className: 'main-content' }
        }
        return null
      })
      
      expect(datacenterDep.checkFunction!()).toBe(true)
      
      // No elements found
      mockQuerySelector.mockReturnValue(null)
      expect(datacenterDep.checkFunction!()).toBe(false)
    })

    test('should have fallback to create DOM structure', () => {
      const datacenterDep = redundancyDependencies.find(dep => dep.id === 'datacenter-view')!
      
      expect(datacenterDep.fallbackHandler).toBeDefined()
      
      // Should not throw
      expect(() => datacenterDep.fallbackHandler!()).not.toThrow()
      expect(mockAppendChild).toHaveBeenCalled()
    })
  })

  describe('Development Dependencies', () => {
    test('should include development-specific dependencies', () => {
      expect(developmentDependencies).toHaveLength(2)
      
      const devDepIds = developmentDependencies.map(dep => dep.id)
      expect(devDepIds).toContain('dev-tools')
      expect(devDepIds).toContain('hot-reload')
    })

    test('should check for React DevTools', () => {
      const devToolsDep = developmentDependencies.find(dep => dep.id === 'dev-tools')!
      
      // DevTools available
      expect(devToolsDep.checkFunction!()).toBe(true)
      
      // No DevTools
      delete (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
      expect(devToolsDep.checkFunction!()).toBe(false)
    })

    test('should check for Hot Module Reload', () => {
      const hotReloadDep = developmentDependencies.find(dep => dep.id === 'hot-reload')!
      
      // Mock module with hot reload
      Object.defineProperty(global, 'module', {
        value: { hot: {} },
        configurable: true
      })
      
      expect(hotReloadDep.checkFunction!()).toBe(true)
      
      // No hot reload
      delete (global as any).module
      expect(hotReloadDep.checkFunction!()).toBe(false)
    })

    test('should mark development dependencies as optional', () => {
      developmentDependencies.forEach(dep => {
        expect(dep.required).toBe(false)
      })
    })
  })

  describe('Enhancement Dependencies', () => {
    test('should include enhancement dependencies', () => {
      expect(enhancementDependencies).toHaveLength(3)
      
      const enhancementIds = enhancementDependencies.map(dep => dep.id)
      expect(enhancementIds).toContain('animation-api')
      expect(enhancementIds).toContain('intersection-observer')
      expect(enhancementIds).toContain('resize-observer')
    })

    test('should check for Web Animations API', () => {
      const animationDep = enhancementDependencies.find(dep => dep.id === 'animation-api')!
      
      // Mock element with animate method
      const mockElement = { animate: jest.fn() }
      mockCreateElement.mockReturnValue(mockElement)
      
      expect(animationDep.checkFunction!()).toBe(true)
      
      // No animate method
      mockCreateElement.mockReturnValue({})
      expect(animationDep.checkFunction!()).toBe(false)
    })

    test('should check for Intersection Observer API', () => {
      const intersectionDep = enhancementDependencies.find(dep => dep.id === 'intersection-observer')!
      
      // Mock IntersectionObserver
      ;(window as any).IntersectionObserver = jest.fn()
      expect(intersectionDep.checkFunction!()).toBe(true)
      
      // No IntersectionObserver
      delete (window as any).IntersectionObserver
      expect(intersectionDep.checkFunction!()).toBe(false)
    })

    test('should check for Resize Observer API', () => {
      const resizeDep = enhancementDependencies.find(dep => dep.id === 'resize-observer')!
      
      // Mock ResizeObserver
      ;(window as any).ResizeObserver = jest.fn()
      expect(resizeDep.checkFunction!()).toBe(true)
      
      // No ResizeObserver
      delete (window as any).ResizeObserver
      expect(resizeDep.checkFunction!()).toBe(false)
    })

    test('should mark enhancement dependencies as optional', () => {
      enhancementDependencies.forEach(dep => {
        expect(dep.required).toBe(false)
      })
    })
  })

  describe('Dependency Aggregation Functions', () => {
    test('should get all dependencies correctly', () => {
      const originalEnv = process.env.NODE_ENV
      
      // Production environment
      process.env.NODE_ENV = 'production'
      let allDeps = getAllDependencies()
      expect(allDeps.length).toBe(redundancyDependencies.length + enhancementDependencies.length)
      
      // Development environment
      process.env.NODE_ENV = 'development'
      allDeps = getAllDependencies()
      expect(allDeps.length).toBe(
        redundancyDependencies.length + 
        developmentDependencies.length + 
        enhancementDependencies.length
      )
      
      process.env.NODE_ENV = originalEnv
    })

    test('should get required dependencies only', () => {
      const requiredDeps = getRequiredDependencies()
      
      requiredDeps.forEach(dep => {
        expect(dep.required).toBe(true)
      })
      
      // Should include required core dependencies
      const requiredIds = requiredDeps.map(dep => dep.id)
      expect(requiredIds).toContain('dom-ready')
      expect(requiredIds).toContain('css-support')
      expect(requiredIds).toContain('react-runtime')
      expect(requiredIds).toContain('datacenter-view')
    })

    test('should get optional dependencies only', () => {
      const optionalDeps = getOptionalDependencies()
      
      optionalDeps.forEach(dep => {
        expect(dep.required).toBe(false)
      })
      
      // Should include optional dependencies
      const optionalIds = optionalDeps.map(dep => dep.id)
      expect(optionalIds).toContain('plugin-registry')
      expect(optionalIds).toContain('animation-api')
      expect(optionalIds).toContain('intersection-observer')
      expect(optionalIds).toContain('resize-observer')
    })
  })

  describe('Load Order Validation', () => {
    test('should have unique load orders within dependency groups', () => {
      const checkUniqueOrders = (deps: any[]) => {
        const orders = deps.map(dep => dep.loadOrder)
        const uniqueOrders = new Set(orders)
        return orders.length === uniqueOrders.size
      }
      
      expect(checkUniqueOrders(redundancyDependencies)).toBe(true)
      expect(checkUniqueOrders(developmentDependencies)).toBe(true)
      expect(checkUniqueOrders(enhancementDependencies)).toBe(true)
    })

    test('should have correct load order ranges', () => {
      // Core dependencies: 1-10
      redundancyDependencies.forEach(dep => {
        expect(dep.loadOrder).toBeGreaterThanOrEqual(1)
        expect(dep.loadOrder).toBeLessThanOrEqual(10)
      })
      
      // Development dependencies: 10-20
      developmentDependencies.forEach(dep => {
        expect(dep.loadOrder).toBeGreaterThanOrEqual(10)
        expect(dep.loadOrder).toBeLessThanOrEqual(20)
      })
      
      // Enhancement dependencies: 20+
      enhancementDependencies.forEach(dep => {
        expect(dep.loadOrder).toBeGreaterThanOrEqual(20)
      })
    })
  })
})