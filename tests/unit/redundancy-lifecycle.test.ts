/**
 * Tests for Redundancy Feature Lifecycle Management
 */

import { RedundancyLifecycleManager } from '../../features/redundancy/lifecycle'

// Mock DOM methods
// Mock event handlers
const mockAddEventListener = jest.fn()
const mockRemoveEventListener = jest.fn()
const mockDispatchEvent = jest.fn()

Object.defineProperty(document, 'hidden', {
  writable: true,
  configurable: true,
  value: false,
})

Object.defineProperty(document, 'querySelectorAll', {
  writable: true,
  value: jest.fn(() => []),
})

Object.defineProperty(document, 'addEventListener', {
  writable: true,
  value: mockAddEventListener,
})

Object.defineProperty(document, 'removeEventListener', {
  writable: true,
  value: mockRemoveEventListener,
})

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  value: mockAddEventListener,
})

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  value: mockRemoveEventListener,
})

Object.defineProperty(window, 'dispatchEvent', {
  writable: true,
  value: mockDispatchEvent,
})

// Mock CustomEvent
global.CustomEvent = jest.fn((type, options) => ({
  type,
  detail: options?.detail,
  bubbles: options?.bubbles || false,
  cancelable: options?.cancelable || false,
  composed: options?.composed || false
})) as any

describe('Redundancy Lifecycle Management', () => {
  let lifecycle: RedundancyLifecycleManager
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    
    // Setup environment
    process.env = { 
      ...originalEnv,
      NEXT_PUBLIC_ENABLE_REDUNDANCY: 'true',
      NODE_ENV: 'test'
    }
    
    lifecycle = new RedundancyLifecycleManager()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('Initial State', () => {
    test('should start in unmounted, disabled, uninitialized state', () => {
      expect(lifecycle.isMounted()).toBe(false)
      expect(lifecycle.isEnabled()).toBe(false)
      expect(lifecycle.isInitialized()).toBe(false)
    })

    test('should have correct initial state object', () => {
      const state = lifecycle.getState()
      expect(state).toEqual({
        mounted: false,
        enabled: false,
        initialized: false,
        resourceCount: 0
      })
    })
  })

  describe('Mount Lifecycle', () => {
    test('should mount successfully with valid environment', async () => {
      await lifecycle.onMount()
      
      expect(lifecycle.isMounted()).toBe(true)
      expect(lifecycle.isInitialized()).toBe(true)
      expect(lifecycle.isEnabled()).toBe(false) // Still disabled until enabled
    })

    test('should setup event listeners on mount', async () => {
      await lifecycle.onMount()
      
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      )
      
      // Resource count should include cleanup functions
      expect(lifecycle.getState().resourceCount).toBeGreaterThan(0)
    })

    test('should prevent double mounting', async () => {
      await lifecycle.onMount()
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      await lifecycle.onMount()
      
      expect(consoleSpy).toHaveBeenCalledWith('[RedundancyLifecycle] Already mounted')
      consoleSpy.mockRestore()
    })

    test('should fail mount with missing environment variable', async () => {
      delete process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY
      
      const newLifecycle = new RedundancyLifecycleManager()
      await expect(newLifecycle.onMount()).rejects.toThrow(
        'Environment flag NEXT_PUBLIC_ENABLE_REDUNDANCY not found'
      )
    })
  })

  describe('Enable/Disable Lifecycle', () => {
    beforeEach(async () => {
      await lifecycle.onMount()
    })

    test('should enable successfully when mounted', async () => {
      await lifecycle.onEnable()
      
      expect(lifecycle.isEnabled()).toBe(true)
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'redundancy:lifecycle',
          detail: expect.objectContaining({
            featureId: 'redundancy-2n1',
            type: 'activated'
          })
        })
      )
    })

    test('should fail to enable when not mounted', async () => {
      const unmountedLifecycle = new RedundancyLifecycleManager()
      
      await expect(unmountedLifecycle.onEnable()).rejects.toThrow(
        'Cannot enable feature that is not mounted'
      )
    })

    test('should disable successfully when enabled', async () => {
      await lifecycle.onEnable()
      expect(lifecycle.isEnabled()).toBe(true)
      
      await lifecycle.onDisable()
      expect(lifecycle.isEnabled()).toBe(false)
      
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'redundancy:lifecycle',
          detail: expect.objectContaining({
            type: 'deactivated'
          })
        })
      )
    })

    test('should handle double enable gracefully', async () => {
      await lifecycle.onEnable()
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      await lifecycle.onEnable()
      
      expect(consoleSpy).toHaveBeenCalledWith('[RedundancyLifecycle] Already enabled')
      consoleSpy.mockRestore()
    })

    test('should handle double disable gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      await lifecycle.onDisable()
      
      expect(consoleSpy).toHaveBeenCalledWith('[RedundancyLifecycle] Already disabled')
      consoleSpy.mockRestore()
    })
  })

  describe('Unmount Lifecycle', () => {
    test('should unmount successfully', async () => {
      await lifecycle.onMount()
      await lifecycle.onEnable()
      
      await lifecycle.onUnmount()
      
      expect(lifecycle.isMounted()).toBe(false)
      expect(lifecycle.isEnabled()).toBe(false)
      expect(lifecycle.isInitialized()).toBe(false)
      expect(lifecycle.getState().resourceCount).toBe(0)
    })

    test('should clean up event listeners on unmount', async () => {
      await lifecycle.onMount()
      const initialResourceCount = lifecycle.getState().resourceCount
      
      await lifecycle.onUnmount()
      
      expect(lifecycle.getState().resourceCount).toBe(0)
      expect(initialResourceCount).toBeGreaterThan(0)
    })

    test('should handle unmount when not mounted', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      await lifecycle.onUnmount()
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[RedundancyLifecycle] Not mounted, skipping unmount'
      )
      consoleSpy.mockRestore()
    })
  })

  describe('Error Handling', () => {
    test('should handle recoverable errors', async () => {
      await lifecycle.onMount()
      await lifecycle.onEnable()
      
      const recoverableError = {
        name: 'TestError',
        message: 'Test recoverable error',
        featureId: 'redundancy-2n1',
        phase: 'runtime',
        recoverable: true
      }
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      lifecycle.onError(recoverableError)
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Attempting recovery')
      )
      
      // Feature should still be enabled after recovery
      expect(lifecycle.isEnabled()).toBe(true)
      consoleSpy.mockRestore()
    })

    test('should handle critical errors by force disabling', async () => {
      await lifecycle.onMount()
      await lifecycle.onEnable()
      
      const criticalError = {
        name: 'CriticalError',
        message: 'Test critical error',
        featureId: 'redundancy-2n1',
        phase: 'runtime',
        recoverable: false
      }
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      lifecycle.onError(criticalError)
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Force disabling feature')
      )
      
      // Feature should be disabled after critical error
      expect(lifecycle.isEnabled()).toBe(false)
      consoleSpy.mockRestore()
    })
  })

  describe('Animation Management', () => {
    beforeEach(async () => {
      await lifecycle.onMount()
    })

    test('should pause animations when tab becomes hidden', async () => {
      await lifecycle.onEnable()
      
      // Create a proper mock HTMLElement
      const mockElement = {
        style: { animationPlayState: 'running' },
        // Make it pass the instanceof HTMLElement check
        constructor: { name: 'HTMLElement' }
      }
      
      // Mock instanceof check
      Object.setPrototypeOf(mockElement, HTMLElement.prototype)
      
      // Mock querySelectorAll to return elements based on selector
      ;(document.querySelectorAll as jest.Mock).mockImplementation((selector) => {
        if (selector === '.rdx-animated') {
          return [mockElement]
        }
        return []
      })
      
      // Simulate visibility change
      ;(document as any).hidden = true
      
      // Trigger the visibility change handler
      const visibilityHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'visibilitychange'
      )?.[1]
      
      if (visibilityHandler) {
        visibilityHandler()
        expect(mockElement.style.animationPlayState).toBe('paused')
      }
    })

    test('should resume animations when tab becomes visible', async () => {
      await lifecycle.onEnable()
      
      // Create a proper mock HTMLElement
      const mockElement = {
        style: { animationPlayState: 'paused' },
        // Make it pass the instanceof HTMLElement check
        constructor: { name: 'HTMLElement' }
      }
      
      // Mock instanceof check
      Object.setPrototypeOf(mockElement, HTMLElement.prototype)
      
      // Mock querySelectorAll to return elements based on selector
      ;(document.querySelectorAll as jest.Mock).mockImplementation((selector) => {
        if (selector === '.rdx-animated') {
          return [mockElement]
        }
        return []
      })
      
      // Simulate visibility change
      ;(document as any).hidden = false
      
      // Trigger the visibility change handler
      const visibilityHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'visibilitychange'
      )?.[1]
      
      if (visibilityHandler) {
        visibilityHandler()
        expect(mockElement.style.animationPlayState).toBe('running')
      }
    })
  })

  describe('State Transitions', () => {
    test('should complete full lifecycle: mount -> enable -> disable -> unmount', async () => {
      // Initial state
      expect(lifecycle.getState()).toEqual({
        mounted: false,
        enabled: false,
        initialized: false,
        resourceCount: 0
      })
      
      // Mount
      await lifecycle.onMount()
      expect(lifecycle.getState()).toEqual({
        mounted: true,
        enabled: false,
        initialized: true,
        resourceCount: expect.any(Number)
      })
      
      // Enable
      await lifecycle.onEnable()
      expect(lifecycle.getState()).toEqual({
        mounted: true,
        enabled: true,
        initialized: true,
        resourceCount: expect.any(Number)
      })
      
      // Disable
      await lifecycle.onDisable()
      expect(lifecycle.getState()).toEqual({
        mounted: true,
        enabled: false,
        initialized: true,
        resourceCount: expect.any(Number)
      })
      
      // Unmount
      await lifecycle.onUnmount()
      expect(lifecycle.getState()).toEqual({
        mounted: false,
        enabled: false,
        initialized: false,
        resourceCount: 0
      })
    })

    test('should emit lifecycle events at appropriate times', async () => {
      await lifecycle.onMount()
      await lifecycle.onEnable()
      
      // Check activation event
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'redundancy:lifecycle',
          detail: expect.objectContaining({
            featureId: 'redundancy-2n1',
            type: 'activated',
            timestamp: expect.any(Number),
            state: {
              mounted: true,
              enabled: true,
              initialized: true
            }
          })
        })
      )
      
      await lifecycle.onDisable()
      
      // Check deactivation event
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'redundancy:lifecycle',
          detail: expect.objectContaining({
            type: 'deactivated'
          })
        })
      )
    })
  })
})