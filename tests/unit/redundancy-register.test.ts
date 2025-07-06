/**
 * Tests for Redundancy Feature Registration
 */

import { 
  registerRedundancyFeature, 
  unregisterRedundancyFeature,
  getRedundancyFeatureStatus 
} from '../../features/redundancy/register'
import { pluginRegistry } from '@/lib/plugin-registry'
import { redundancyLifecycle } from '../../features/redundancy/lifecycle'
import { redundancyEventBus } from '../../features/redundancy/events'

// Mock the env module
jest.mock('../../features/redundancy/utils/env', () => ({
  isRedundancyEnabled: jest.fn(),
  getFeatureFlag: jest.fn(),
  validateEnvironment: jest.fn()
}))

// Import the mocked module
import { isRedundancyEnabled } from '../../features/redundancy/utils/env'

// Mock the plugin module
jest.mock('../../features/redundancy/plugin', () => ({
  redundancyFeatureDefinition: {
    id: 'redundancy-2n1',
    name: '2N+1 Redundancy Visualization',
    version: '1.0.0',
    description: 'Professional investor-grade power redundancy visualization',
    component: () => null,
    config: {
      featureFlag: 'NEXT_PUBLIC_ENABLE_REDUNDANCY',
      colors: { active: '#ef4444', standby: '#fbbf24', connection: '#8b5cf6' },
      animations: { overlay: {}, pulse: {} },
      substations: { main: {}, backup1: {}, backup2: {} },
      lines: [],
      statistics: { totalCapacity: '300MW', redundancyLevel: '2N+1' },
      cssPrefix: 'rdx-'
    },
    dependencies: [],
    enabled: true,
  }
}))

// Mock the config module
jest.mock('../../features/redundancy/config', () => ({
  redundancyConfig: {
    featureFlag: 'NEXT_PUBLIC_ENABLE_REDUNDANCY',
    colors: { active: '#ef4444', standby: '#fbbf24', connection: '#8b5cf6' },
    animations: { overlay: {}, pulse: {} },
    substations: { main: {}, backup1: {}, backup2: {} },
    lines: [],
    statistics: { totalCapacity: '300MW', redundancyLevel: '2N+1' },
    cssPrefix: 'rdx-'
  }
}))

// Mock dependencies
jest.mock('@/lib/plugin-registry', () => ({
  pluginRegistry: {
    register: jest.fn(),
    unregister: jest.fn(),
    isRegistered: jest.fn(),
    getFeature: jest.fn(),
  }
}))

jest.mock('../../features/redundancy/lifecycle', () => ({
  redundancyLifecycle: {
    isMounted: jest.fn(),
    isEnabled: jest.fn(),
    onUnmount: jest.fn(),
  }
}))

jest.mock('../../features/redundancy/events', () => ({
  redundancyEventBus: {
    emit: jest.fn(),
    clearAll: jest.fn(),
    getListenerCount: jest.fn(),
  }
}))

// Mock document.addEventListener
const mockAddEventListener = jest.fn()
const mockRemoveEventListener = jest.fn()
Object.defineProperty(document, 'addEventListener', {
  writable: true,
  value: mockAddEventListener,
})
Object.defineProperty(document, 'removeEventListener', {
  writable: true,
  value: mockRemoveEventListener,
})

describe('Redundancy Feature Registration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { 
      ...originalEnv,
      NEXT_PUBLIC_ENABLE_REDUNDANCY: 'true',
      NODE_ENV: 'test'
    }
    
    // Reset window cleanup
    if ((window as any).__redundancyCleanup) {
      delete (window as any).__redundancyCleanup
    }
    
    // Set default mock return values
    ;(isRedundancyEnabled as jest.Mock).mockReturnValue(true)
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('registerRedundancyFeature', () => {
    test('should successfully register when enabled', () => {
      ;(pluginRegistry.isRegistered as jest.Mock).mockReturnValue(false)
      ;(pluginRegistry.register as jest.Mock).mockImplementation(() => {
        // Success - no error thrown
      })
      
      // Use try-catch to see the actual error
      let actualError: any = null
      const errorSpy = jest.spyOn(console, 'error').mockImplementation((...args) => {
        actualError = args
      })
      
      const result = registerRedundancyFeature()
      
      if (actualError) {
        console.log('Actual error captured:', actualError)
      }
      
      errorSpy.mockRestore()
      
      expect(result).toBe(true)
      expect(pluginRegistry.register).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'redundancy-2n1',
          name: '2N+1 Redundancy Visualization',
          version: '1.0.0',
          component: expect.any(Function),
          config: expect.any(Object),
          enabled: true,
        })
      )
    })

    test('should return false when feature is disabled', () => {
      ;(isRedundancyEnabled as jest.Mock).mockReturnValue(false)
      
      const result = registerRedundancyFeature()
      
      expect(result).toBe(false)
      expect(pluginRegistry.register).not.toHaveBeenCalled()
    })

    test('should handle already registered feature', () => {
      ;(isRedundancyEnabled as jest.Mock).mockReturnValue(true)
      ;(pluginRegistry.isRegistered as jest.Mock).mockReturnValue(true)
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const result = registerRedundancyFeature()
      
      expect(result).toBe(true)
      expect(consoleSpy).toHaveBeenCalledWith('[RedundancyFeature] Feature already registered')
      expect(pluginRegistry.register).not.toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    test('should handle registration errors', () => {
      ;(isRedundancyEnabled as jest.Mock).mockReturnValue(true)
      ;(pluginRegistry.isRegistered as jest.Mock).mockReturnValue(false)
      ;(pluginRegistry.register as jest.Mock).mockImplementation(() => {
        throw new Error('Registration failed')
      })
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = registerRedundancyFeature()
      
      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        '[RedundancyFeature] Registration failed:',
        expect.any(Error)
      )
      expect(redundancyEventBus.emit).toHaveBeenCalledWith('redundancy:state:error', {
        error: expect.any(Error),
        context: 'registration'
      })
      
      consoleSpy.mockRestore()
    })

    test('should setup global handlers on success', () => {
      ;(isRedundancyEnabled as jest.Mock).mockReturnValue(true)
      ;(pluginRegistry.isRegistered as jest.Mock).mockReturnValue(false)
      ;(pluginRegistry.register as jest.Mock).mockImplementation(() => {
        // Success - no error thrown
      })
      
      registerRedundancyFeature()
      
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      )
      expect((window as any).__redundancyCleanup).toBeDefined()
    })
  })

  describe('unregisterRedundancyFeature', () => {
    test('should successfully unregister when registered', () => {
      ;(pluginRegistry.isRegistered as jest.Mock).mockReturnValue(true)
      ;(redundancyLifecycle.isMounted as jest.Mock).mockReturnValue(true)
      
      // Setup cleanup handler
      Object.defineProperty(window, '__redundancyCleanup', {
        value: jest.fn(),
        writable: true,
        configurable: true
      })
      
      const result = unregisterRedundancyFeature()
      
      expect(result).toBe(true)
      expect(redundancyLifecycle.onUnmount).toHaveBeenCalled()
      expect(redundancyEventBus.clearAll).toHaveBeenCalled()
      expect(pluginRegistry.unregister).toHaveBeenCalledWith('redundancy-2n1')
      const cleanup = (window as any).__redundancyCleanup
      expect(typeof cleanup).toBe('function')
      cleanup() // Call it to ensure it works
    })

    test('should skip unregister when not registered', () => {
      ;(pluginRegistry.isRegistered as jest.Mock).mockReturnValue(false)
      
      const result = unregisterRedundancyFeature()
      
      expect(result).toBe(true)
      expect(pluginRegistry.unregister).not.toHaveBeenCalled()
      expect(redundancyLifecycle.onUnmount).not.toHaveBeenCalled()
    })

    test('should handle unmounted lifecycle', () => {
      ;(pluginRegistry.isRegistered as jest.Mock).mockReturnValue(true)
      ;(redundancyLifecycle.isMounted as jest.Mock).mockReturnValue(false)
      
      const result = unregisterRedundancyFeature()
      
      expect(result).toBe(true)
      expect(redundancyLifecycle.onUnmount).not.toHaveBeenCalled()
      expect(pluginRegistry.unregister).toHaveBeenCalled()
    })

    test('should handle unregistration errors', () => {
      ;(pluginRegistry.isRegistered as jest.Mock).mockReturnValue(true)
      ;(pluginRegistry.unregister as jest.Mock).mockImplementation(() => {
        throw new Error('Unregistration failed')
      })
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = unregisterRedundancyFeature()
      
      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        '[RedundancyFeature] Unregistration failed:',
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('getRedundancyFeatureStatus', () => {
    test('should return complete status object', () => {
      const mockFeature = { id: 'redundancy-2n1', name: 'Test' }
      
      ;(pluginRegistry.isRegistered as jest.Mock).mockReturnValue(true)
      ;(pluginRegistry.getFeature as jest.Mock).mockReturnValue(mockFeature)
      ;(redundancyLifecycle.isMounted as jest.Mock).mockReturnValue(true)
      ;(redundancyLifecycle.isEnabled as jest.Mock).mockReturnValue(true)
      ;(redundancyEventBus.getListenerCount as jest.Mock).mockReturnValue(5)
      ;(isRedundancyEnabled as jest.Mock).mockReturnValue(true)
      
      const status = getRedundancyFeatureStatus()
      
      expect(status).toEqual({
        registered: true,
        enabled: true,
        mounted: true,
        active: true,
        eventBusActive: true,
        feature: mockFeature,
      })
    })

    test('should handle unregistered state', () => {
      ;(pluginRegistry.isRegistered as jest.Mock).mockReturnValue(false)
      ;(pluginRegistry.getFeature as jest.Mock).mockReturnValue(undefined)
      ;(redundancyLifecycle.isMounted as jest.Mock).mockReturnValue(false)
      ;(redundancyLifecycle.isEnabled as jest.Mock).mockReturnValue(false)
      ;(redundancyEventBus.getListenerCount as jest.Mock).mockReturnValue(0)
      ;(isRedundancyEnabled as jest.Mock).mockReturnValue(false)
      
      const status = getRedundancyFeatureStatus()
      
      expect(status).toEqual({
        registered: false,
        enabled: false,
        mounted: false,
        active: false,
        eventBusActive: false,
        feature: undefined,
      })
    })
  })

  describe('Global Handlers', () => {
    test('should emit visibility change events', () => {
      ;(isRedundancyEnabled as jest.Mock).mockReturnValue(true)
      ;(pluginRegistry.isRegistered as jest.Mock).mockReturnValue(false)
      ;(pluginRegistry.register as jest.Mock).mockImplementation(() => {
        // Success - no error thrown
      })
      
      registerRedundancyFeature()
      
      // Get the visibility change handler
      const visibilityHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'visibilitychange'
      )?.[1]
      
      expect(visibilityHandler).toBeDefined()
      
      // Test visibility change
      Object.defineProperty(document, 'hidden', { 
        value: true, 
        configurable: true 
      })
      
      visibilityHandler()
      
      expect(redundancyEventBus.emit).toHaveBeenCalledWith(
        'redundancy:visibility:changed',
        { visible: false }
      )
    })

    test('should cleanup handlers properly', () => {
      ;(isRedundancyEnabled as jest.Mock).mockReturnValue(true)
      ;(pluginRegistry.isRegistered as jest.Mock).mockReturnValue(false)
      ;(pluginRegistry.register as jest.Mock).mockImplementation(() => {
        // Success - no error thrown
      })
      
      registerRedundancyFeature()
      
      const cleanup = (window as any).__redundancyCleanup
      expect(cleanup).toBeDefined()
      
      cleanup()
      
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      )
    })
  })

  describe('Component Placeholder', () => {
    test('should render null component', () => {
      ;(isRedundancyEnabled as jest.Mock).mockReturnValue(true)
      ;(pluginRegistry.isRegistered as jest.Mock).mockReturnValue(false)
      ;(pluginRegistry.register as jest.Mock).mockImplementation(() => {
        // Success - no error thrown
      })
      
      registerRedundancyFeature()
      
      // Get the registered component
      const registeredCall = (pluginRegistry.register as jest.Mock).mock.calls[0]
      const component = registeredCall[0].component
      
      expect(component).toBeDefined()
      expect(component()).toBeNull()
    })
  })
})