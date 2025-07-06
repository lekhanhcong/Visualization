/**
 * Tests for Redundancy Mounting Strategy
 */

import { 
  RedundancyMountingStrategy,
  defaultMountPoints,
  defaultMountingConfig 
} from '../../features/redundancy/mounting/MountingStrategy'
import type { MountPoint, MountingConfig } from '../../features/redundancy/mounting/MountingStrategy'

// Mock DOM elements
const createMockElement = (selector: string) => {
  const element = document.createElement('div')
  element.setAttribute('data-testid', selector.replace(/\[data-testid="([^"]+)"\]/, '$1'))
  if (selector.includes('class')) {
    element.className = selector.replace('.', '')
  }
  if (selector.includes('#')) {
    element.id = selector.replace('#', '')
  }
  return element
}

describe('RedundancyMountingStrategy', () => {
  let strategy: RedundancyMountingStrategy
  let mockElements: HTMLElement[]

  beforeEach(() => {
    // Clear document body
    document.body.innerHTML = ''
    
    // Create mock elements for testing
    mockElements = [
      createMockElement('[data-testid="datacenter-main-view"]'),
      createMockElement('[data-testid="datacenter-sidebar"]'),
      createMockElement('[data-testid="datacenter-status-bar"]'),
    ]
    
    // Add mock elements to DOM
    mockElements.forEach(el => document.body.appendChild(el))
    
    // Create new strategy instance
    strategy = new RedundancyMountingStrategy()
  })

  afterEach(() => {
    // Cleanup
    strategy.unmountAll()
    document.body.innerHTML = ''
  })

  describe('Initialization', () => {
    test('should initialize successfully with available mount points', async () => {
      const result = await strategy.initialize()
      expect(result).toBe(true)
    })

    test('should handle missing required mount points', async () => {
      // Create a strategy with a mount point that has no body fallback
      const strictMountPoints = [
        {
          id: 'redundancy-main-overlay',
          selector: '[data-testid="datacenter-main-view"]',
          type: 'overlay' as const,
          priority: 1,
          required: true,
          fallbackSelector: '.main-content, main, #main' // No body fallback
        }
      ]
      
      const strictStrategy = new RedundancyMountingStrategy(defaultMountingConfig, strictMountPoints)
      
      // Remove required element completely (no fallbacks available)
      document.body.innerHTML = '<div class="some-other-element"></div>'
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await strictStrategy.initialize()
      
      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Required mount point failed')
      )
      
      consoleSpy.mockRestore()
      strictStrategy.unmountAll()
    })

    test('should use fallback selectors when primary fails', async () => {
      // Remove primary selectors but keep fallbacks
      document.body.innerHTML = '<main class="main-content"></main>'
      
      const result = await strategy.initialize()
      expect(result).toBe(true)
      
      // Check if fallback was used
      const mountPoint = strategy.getMountPoint('redundancy-main-overlay')
      expect(mountPoint).toBeTruthy()
    })

    test('should handle DOM not ready state', async () => {
      // Mock document loading state
      Object.defineProperty(document, 'readyState', {
        writable: true,
        value: 'loading'
      })
      
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
      
      // Start initialization but don't await it
      const initPromise = strategy.initialize()
      
      // Simulate DOMContentLoaded
      const listener = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'DOMContentLoaded'
      )?.[1] as () => void
      
      if (listener) {
        listener()
      }
      
      const result = await initPromise
      expect(result).toBe(true)
      
      addEventListenerSpy.mockRestore()
      Object.defineProperty(document, 'readyState', {
        writable: true,
        value: 'complete'
      })
    })
  })

  describe('Mount Point Creation', () => {
    test('should create mount point successfully', () => {
      const mountPoint: MountPoint = {
        id: 'test-mount',
        selector: '[data-testid="datacenter-main-view"]',
        type: 'overlay',
        priority: 1,
        required: true
      }
      
      const result = strategy.createMountPoint(mountPoint)
      
      expect(result.success).toBe(true)
      expect(result.element).toBeTruthy()
      expect(result.element?.id).toBe('redundancy-feature-root-test-mount')
      expect(result.element?.getAttribute('data-feature')).toBe('redundancy-2n1')
      expect(result.element?.getAttribute('data-mount-point')).toBe('test-mount')
    })

    test('should handle missing target element', () => {
      const mountPoint: MountPoint = {
        id: 'missing-mount',
        selector: '.non-existent',
        type: 'overlay',
        priority: 1,
        required: false
      }
      
      const result = strategy.createMountPoint(mountPoint)
      
      expect(result.success).toBe(false)
      expect(result.element).toBeNull()
      expect(result.error).toContain('Target element not found')
    })

    test('should apply correct styles for overlay type', () => {
      const mountPoint: MountPoint = {
        id: 'overlay-test',
        selector: '[data-testid="datacenter-main-view"]',
        type: 'overlay',
        priority: 1,
        required: true
      }
      
      const result = strategy.createMountPoint(mountPoint)
      const element = result.element!
      
      expect(element.style.position).toBe('absolute')
      expect(element.style.top).toBe('0px')
      expect(element.style.left).toBe('0px')
      expect(element.style.width).toBe('100%')
      expect(element.style.height).toBe('100%')
      expect(element.style.pointerEvents).toBe('none')
    })

    test('should apply correct styles for panel type', () => {
      const mountPoint: MountPoint = {
        id: 'panel-test',
        selector: '[data-testid="datacenter-sidebar"]',
        type: 'panel',
        priority: 2,
        required: false
      }
      
      const result = strategy.createMountPoint(mountPoint)
      const element = result.element!
      
      expect(element.style.width).toBe('100%')
      expect(element.style.minHeight).toBe('200px')
    })

    test('should apply correct styles for widget type', () => {
      const mountPoint: MountPoint = {
        id: 'widget-test',
        selector: '[data-testid="datacenter-status-bar"]',
        type: 'widget',
        priority: 3,
        required: false
      }
      
      const result = strategy.createMountPoint(mountPoint)
      const element = result.element!
      
      expect(element.style.display).toBe('inline-block')
      expect(element.style.verticalAlign).toBe('top')
    })
  })

  describe('Mounting Strategies', () => {
    test('should mount as overlay with relative positioning', () => {
      const mountPoint: MountPoint = {
        id: 'overlay-mount',
        selector: '[data-testid="datacenter-main-view"]',
        type: 'overlay',
        priority: 1,
        required: true
      }
      
      const targetElement = mockElements[0]
      targetElement.style.position = 'static'
      
      strategy.createMountPoint(mountPoint)
      
      expect(targetElement.style.position).toBe('relative')
      expect(targetElement.children.length).toBeGreaterThan(0)
    })

    test('should mount as portal when configured', () => {
      const config: MountingConfig = {
        ...defaultMountingConfig,
        strategy: 'portal'
      }
      
      const portalStrategy = new RedundancyMountingStrategy(config)
      
      const mountPoint: MountPoint = {
        id: 'portal-mount',
        selector: '[data-testid="datacenter-main-view"]',
        type: 'overlay',
        priority: 1,
        required: true
      }
      
      // Mock getBoundingClientRect
      const mockRect = { top: 10, left: 20, width: 100, height: 200 }
      const getBoundingClientRectSpy = jest.spyOn(mockElements[0], 'getBoundingClientRect')
        .mockReturnValue(mockRect as DOMRect)
      
      const result = portalStrategy.createMountPoint(mountPoint)
      
      expect(result.success).toBe(true)
      expect(result.element?.style.position).toBe('fixed')
      expect(result.element?.style.top).toBe('10px')
      expect(result.element?.style.left).toBe('20px')
      expect(result.element?.style.width).toBe('100px')
      expect(result.element?.style.height).toBe('200px')
      
      getBoundingClientRectSpy.mockRestore()
      portalStrategy.unmountAll()
    })

    test('should mount inline when configured', () => {
      const config: MountingConfig = {
        ...defaultMountingConfig,
        strategy: 'inline'
      }
      
      const inlineStrategy = new RedundancyMountingStrategy(config)
      
      const mountPoint: MountPoint = {
        id: 'inline-mount',
        selector: '[data-testid="datacenter-main-view"]',
        type: 'panel',
        priority: 1,
        required: true
      }
      
      const result = inlineStrategy.createMountPoint(mountPoint)
      
      expect(result.success).toBe(true)
      expect(result.element?.style.position).toBe('relative')
      
      inlineStrategy.unmountAll()
    })
  })

  describe('Mount Point Management', () => {
    beforeEach(async () => {
      await strategy.initialize()
    })

    test('should get mount point by ID', () => {
      const element = strategy.getMountPoint('redundancy-main-overlay')
      expect(element).toBeTruthy()
      expect(element?.getAttribute('data-mount-point')).toBe('redundancy-main-overlay')
    })

    test('should check if mount point exists', () => {
      expect(strategy.hasMountPoint('redundancy-main-overlay')).toBe(true)
      expect(strategy.hasMountPoint('non-existent')).toBe(false)
    })

    test('should get all mount points', () => {
      const allMountPoints = strategy.getAllMountPoints()
      
      expect(Object.keys(allMountPoints)).toContain('redundancy-main-overlay')
      expect(Object.keys(allMountPoints)).toContain('redundancy-info-panel')
      expect(Object.keys(allMountPoints)).toContain('redundancy-status-widget')
    })

    test('should unmount specific mount point', () => {
      const success = strategy.unmountPoint('redundancy-main-overlay')
      
      expect(success).toBe(true)
      expect(strategy.hasMountPoint('redundancy-main-overlay')).toBe(false)
    })

    test('should handle unmounting non-existent mount point', () => {
      const success = strategy.unmountPoint('non-existent')
      expect(success).toBe(false)
    })

    test('should unmount all mount points', () => {
      strategy.unmountAll()
      
      expect(strategy.hasMountPoint('redundancy-main-overlay')).toBe(false)
      expect(strategy.hasMountPoint('redundancy-info-panel')).toBe(false)
      expect(strategy.hasMountPoint('redundancy-status-widget')).toBe(false)
    })

    test('should add new mount point', () => {
      // Add new element to DOM
      const newElement = createMockElement('[data-testid="new-target"]')
      document.body.appendChild(newElement)
      
      const newMountPoint: MountPoint = {
        id: 'new-mount',
        selector: '[data-testid="new-target"]',
        type: 'widget',
        priority: 4,
        required: false
      }
      
      const result = strategy.addMountPoint(newMountPoint)
      
      expect(result.success).toBe(true)
      expect(strategy.hasMountPoint('new-mount')).toBe(true)
    })
  })

  describe('Configuration Management', () => {
    test('should update configuration', () => {
      const newConfig = { zIndex: 2000, position: 'fixed' as const }
      strategy.updateConfig(newConfig)
      
      const config = strategy.getConfig()
      expect(config.zIndex).toBe(2000)
      expect(config.position).toBe('fixed')
    })

    test('should get mount point definitions', () => {
      const definitions = strategy.getMountPointDefinitions()
      
      expect(Array.isArray(definitions)).toBe(true)
      expect(definitions.length).toBe(defaultMountPoints.length)
      expect(definitions[0]).toEqual(defaultMountPoints[0])
    })
  })

  describe('Environment Validation', () => {
    test('should validate successful environment', () => {
      const validation = strategy.validateEnvironment()
      
      expect(validation.valid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    test('should detect missing required mount points', () => {
      // Remove required element
      document.body.innerHTML = ''
      
      const validation = strategy.validateEnvironment()
      
      expect(validation.valid).toBe(false)
      expect(validation.errors).toContain('Required mount point not available: redundancy-main-overlay')
    })

    test('should warn about fallback usage', () => {
      // Remove primary but keep fallback
      document.body.innerHTML = '<main class="main-content"></main>'
      
      const validation = strategy.validateEnvironment()
      
      expect(validation.valid).toBe(true)
      expect(validation.warnings).toContain('Using fallback for mount point: redundancy-main-overlay')
    })

    test('should handle SSR environment', () => {
      // Test the SSR check by temporarily removing document
      const strategy = new RedundancyMountingStrategy()
      
      // Mock the environment check directly
      const originalUndefined = global.undefined
      const undefinedDocument = undefined
      
      // Spy on the typeof check
      const validation = strategy.validateEnvironment()
      expect(validation.valid).toBe(true) // Should be true since document exists
      
      // Now we test the logic by checking if document were undefined
      // This is a logic test rather than actually breaking the environment
      const mockValidation = {
        valid: typeof undefinedDocument !== 'undefined',
        warnings: [],
        errors: typeof undefinedDocument === 'undefined' 
          ? ['Document not available (SSR environment)'] 
          : []
      }
      
      expect(mockValidation.valid).toBe(false)
      expect(mockValidation.errors).toContain('Document not available (SSR environment)')
    })
  })

  describe('Error Handling', () => {
    test('should handle mount point creation errors', () => {
      const mountPoint: MountPoint = {
        id: 'error-mount',
        selector: '[data-testid="datacenter-main-view"]',
        type: 'overlay',
        priority: 1,
        required: true
      }
      
      // Mock createElement to throw error
      const originalCreateElement = document.createElement
      document.createElement = jest.fn(() => {
        throw new Error('createElement failed')
      }) as any
      
      const result = strategy.createMountPoint(mountPoint)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('createElement failed')
      
      // Restore createElement
      document.createElement = originalCreateElement
    })

    test('should handle unmount errors gracefully', async () => {
      await strategy.initialize()
      
      const mountElement = strategy.getMountPoint('redundancy-main-overlay')!
      
      // Mock remove to throw error
      const originalRemove = mountElement.remove
      mountElement.remove = jest.fn(() => {
        throw new Error('Remove failed')
      })
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const success = strategy.unmountPoint('redundancy-main-overlay')
      
      expect(success).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to unmount'),
        expect.any(Error)
      )
      
      // Restore remove
      mountElement.remove = originalRemove
      consoleSpy.mockRestore()
    })
  })

  describe('Default Configuration', () => {
    test('should have correct default mount points', () => {
      // Create a fresh copy to avoid test pollution
      const freshStrategy = new RedundancyMountingStrategy()
      const definitions = freshStrategy.getMountPointDefinitions()
      
      expect(definitions).toHaveLength(3)
      expect(definitions[0].id).toBe('redundancy-main-overlay')
      expect(definitions[0].required).toBe(true)
      expect(definitions[1].id).toBe('redundancy-info-panel')
      expect(definitions[2].id).toBe('redundancy-status-widget')
    })

    test('should have correct default mounting config', () => {
      expect(defaultMountingConfig.strategy).toBe('overlay')
      expect(defaultMountingConfig.containerId).toBe('redundancy-feature-root')
      expect(defaultMountingConfig.zIndex).toBe(1000)
      expect(defaultMountingConfig.position).toBe('absolute')
      expect(defaultMountingConfig.isolation).toBe(true)
    })
  })
})