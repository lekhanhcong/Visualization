/**
 * Tests for Redundancy Event Bus Communication System
 */

import { 
  RedundancyEventBus, 
  redundancyEventBus,
  redundancyEvents 
} from '../../features/redundancy/events'
import type { RedundancyState, SubstationData, LineData } from '../../features/redundancy/types'

// Mock window.dispatchEvent
const mockDispatchEvent = jest.fn((event) => {
  // Call real event listeners when mocked
  const listeners = (window as any).__eventListeners?.[event.type] || []
  listeners.forEach((listener: Function) => listener(event))
  return true
})

// Track event listeners for testing
;(window as any).__eventListeners = {}

const originalAddEventListener = window.addEventListener
window.addEventListener = jest.fn((type: string, listener: EventListener) => {
  if (!(window as any).__eventListeners[type]) {
    (window as any).__eventListeners[type] = []
  }
  (window as any).__eventListeners[type].push(listener)
  originalAddEventListener.call(window, type, listener)
})

Object.defineProperty(window, 'dispatchEvent', {
  writable: true,
  value: mockDispatchEvent
})

// Mock CustomEvent
global.CustomEvent = jest.fn((type, options) => ({
  type,
  detail: options?.detail,
  bubbles: options?.bubbles || false,
  cancelable: options?.cancelable || false
})) as any

describe('Redundancy Event Bus', () => {
  let eventBus: RedundancyEventBus

  beforeEach(() => {
    jest.clearAllMocks()
    eventBus = new RedundancyEventBus()
    eventBus.clearAll()
  })

  describe('Event Subscription', () => {
    test('should subscribe to events and receive data', () => {
      const listener = jest.fn()
      
      eventBus.on('redundancy:state:changed', listener)
      
      const testState: RedundancyState = {
        isActive: true,
        selectedSubstation: null,
        selectedLine: null,
        isPanelOpen: false,
        animationProgress: 0
      }
      
      eventBus.emit('redundancy:state:changed', { state: testState })
      
      expect(listener).toHaveBeenCalledWith({ state: testState })
      expect(listener).toHaveBeenCalledTimes(1)
    })

    test('should handle multiple listeners for same event', () => {
      const listener1 = jest.fn()
      const listener2 = jest.fn()
      
      eventBus.on('redundancy:panel:opened', listener1)
      eventBus.on('redundancy:panel:opened', listener2)
      
      eventBus.emit('redundancy:panel:opened', { timestamp: 12345 })
      
      expect(listener1).toHaveBeenCalledWith({ timestamp: 12345 })
      expect(listener2).toHaveBeenCalledWith({ timestamp: 12345 })
    })

    test('should return unsubscribe function', () => {
      const listener = jest.fn()
      
      const unsubscribe = eventBus.on('redundancy:line:hover', listener)
      
      eventBus.emit('redundancy:line:hover', { line: null })
      expect(listener).toHaveBeenCalledTimes(1)
      
      unsubscribe()
      
      eventBus.emit('redundancy:line:hover', { line: null })
      expect(listener).toHaveBeenCalledTimes(1) // Still 1, not called again
    })

    test('should handle once subscription', () => {
      const listener = jest.fn()
      
      eventBus.once('redundancy:animation:started', listener)
      
      eventBus.emit('redundancy:animation:started', { type: 'pulse' })
      eventBus.emit('redundancy:animation:started', { type: 'fade' })
      
      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith({ type: 'pulse' })
    })
  })

  describe('Event Unsubscription', () => {
    test('should unsubscribe specific listener', () => {
      const listener1 = jest.fn()
      const listener2 = jest.fn()
      
      eventBus.on('redundancy:state:error', listener1)
      eventBus.on('redundancy:state:error', listener2)
      
      eventBus.off('redundancy:state:error', listener1)
      
      const error = new Error('Test error')
      eventBus.emit('redundancy:state:error', { error, context: 'test' })
      
      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).toHaveBeenCalledWith({ error, context: 'test' })
    })

    test('should clear all listeners for specific event', () => {
      const listener1 = jest.fn()
      const listener2 = jest.fn()
      
      eventBus.on('redundancy:overlay:mounted', listener1)
      eventBus.on('redundancy:overlay:mounted', listener2)
      
      eventBus.clearEvent('redundancy:overlay:mounted')
      
      eventBus.emit('redundancy:overlay:mounted', { timestamp: 12345 })
      
      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).not.toHaveBeenCalled()
    })

    test('should clear all listeners', () => {
      const listener1 = jest.fn()
      const listener2 = jest.fn()
      
      eventBus.on('redundancy:panel:closed', listener1)
      eventBus.on('redundancy:visibility:changed', listener2)
      
      eventBus.clearAll()
      
      eventBus.emit('redundancy:panel:closed', { timestamp: 12345 })
      eventBus.emit('redundancy:visibility:changed', { visible: true })
      
      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).not.toHaveBeenCalled()
    })
  })

  describe('Event Emission', () => {
    test('should emit events with correct data', () => {
      const listener = jest.fn()
      eventBus.on('redundancy:substation:selected', listener)
      
      const substation: SubstationData = {
        id: 'sub1',
        name: 'Substation 1',
        position: { x: 100, y: 200 },
        status: 'active',
        capacity: '100MW',
        load: '80MW'
      }
      
      eventBus.emit('redundancy:substation:selected', { substation })
      
      expect(listener).toHaveBeenCalledWith({ substation })
    })

    test('should emit DOM custom events', () => {
      const lineData: LineData = {
        id: 'line1',
        from: 'sub1',
        to: 'sub2',
        status: 'active',
        capacity: '50MW',
        load: '40MW',
        path: []
      }
      
      eventBus.emit('redundancy:line:selected', { line: lineData })
      
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'redundancy:line:selected',
          detail: { line: lineData }
        })
      )
    })

    test('should handle listener errors gracefully', () => {
      const goodListener = jest.fn()
      const badListener = jest.fn(() => {
        throw new Error('Listener error')
      })
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      eventBus.on('redundancy:animation:paused', badListener)
      eventBus.on('redundancy:animation:paused', goodListener)
      
      eventBus.emit('redundancy:animation:paused', { reason: 'tab-hidden' })
      
      expect(badListener).toHaveBeenCalled()
      expect(goodListener).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in listener'),
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('Event History', () => {
    test('should record event history', () => {
      eventBus.emit('redundancy:state:initialized', { timestamp: 12345 })
      eventBus.emit('redundancy:panel:opened', { timestamp: 12346 })
      
      const history = eventBus.getHistory()
      
      expect(history).toHaveLength(2)
      expect(history[0]).toMatchObject({
        type: 'redundancy:state:initialized',
        data: { timestamp: 12345 }
      })
      expect(history[1]).toMatchObject({
        type: 'redundancy:panel:opened',
        data: { timestamp: 12346 }
      })
    })

    test('should filter history by event type', () => {
      eventBus.emit('redundancy:animation:started', { type: 'pulse' })
      eventBus.emit('redundancy:animation:completed', { type: 'pulse' })
      eventBus.emit('redundancy:animation:started', { type: 'fade' })
      
      const history = eventBus.getHistory('redundancy:animation:started')
      
      expect(history).toHaveLength(2)
      expect(history[0].data).toEqual({ type: 'pulse' })
      expect(history[1].data).toEqual({ type: 'fade' })
    })

    test('should limit history size', () => {
      // Create event bus with small history limit
      const smallHistoryBus = new RedundancyEventBus()
      ;(smallHistoryBus as any).maxHistorySize = 5
      
      // Emit more events than the limit
      for (let i = 0; i < 10; i++) {
        smallHistoryBus.emit('redundancy:state:changed', { 
          state: { isActive: true } as RedundancyState 
        })
      }
      
      const history = smallHistoryBus.getHistory()
      expect(history).toHaveLength(5)
    })

    test('should clear history', () => {
      eventBus.emit('redundancy:overlay:mounted', { timestamp: 12345 })
      eventBus.emit('redundancy:overlay:unmounted', { timestamp: 12346 })
      
      expect(eventBus.getHistory()).toHaveLength(2)
      
      eventBus.clearHistory()
      
      expect(eventBus.getHistory()).toHaveLength(0)
    })
  })

  describe('Event Bus Control', () => {
    test('should disable event bus', () => {
      const listener = jest.fn()
      eventBus.on('redundancy:visibility:changed', listener)
      
      eventBus.setEnabled(false)
      
      eventBus.emit('redundancy:visibility:changed', { visible: true })
      
      expect(listener).not.toHaveBeenCalled()
      expect(eventBus.getListenerCount()).toBe(0) // Listeners cleared
    })

    test('should re-enable event bus', () => {
      eventBus.setEnabled(false)
      eventBus.setEnabled(true)
      
      const listener = jest.fn()
      eventBus.on('redundancy:panel:position:changed', listener)
      
      eventBus.emit('redundancy:panel:position:changed', { x: 100, y: 200 })
      
      expect(listener).toHaveBeenCalledWith({ x: 100, y: 200 })
    })
  })

  describe('Utility Methods', () => {
    test('should get listener count', () => {
      eventBus.on('redundancy:state:changed', jest.fn())
      eventBus.on('redundancy:state:changed', jest.fn())
      eventBus.on('redundancy:panel:opened', jest.fn())
      
      expect(eventBus.getListenerCount('redundancy:state:changed')).toBe(2)
      expect(eventBus.getListenerCount('redundancy:panel:opened')).toBe(1)
      expect(eventBus.getListenerCount()).toBe(3)
    })

    test('should get registered events', () => {
      eventBus.on('redundancy:state:changed', jest.fn())
      eventBus.on('redundancy:line:hover', jest.fn())
      
      const events = eventBus.getRegisteredEvents()
      
      expect(events).toContain('redundancy:state:changed')
      expect(events).toContain('redundancy:line:hover')
      expect(events).toHaveLength(2)
    })
  })

  describe('Event Naming Conventions', () => {
    test('should ensure all events have redundancy prefix', () => {
      const listener = jest.fn()
      
      // Without prefix
      eventBus.on('state:changed' as any, listener)
      eventBus.emit('state:changed' as any, { state: {} as RedundancyState })
      
      expect(listener).toHaveBeenCalled()
      
      // Check that it was registered with prefix
      const events = eventBus.getRegisteredEvents()
      expect(events).toContain('redundancy:state:changed')
    })

    test('should not double-prefix events', () => {
      const listener = jest.fn()
      
      eventBus.on('redundancy:panel:opened', listener)
      
      const events = eventBus.getRegisteredEvents()
      expect(events).toContain('redundancy:panel:opened')
      expect(events).not.toContain('redundancy:redundancy:panel:opened')
    })
  })

  describe('Helper Functions', () => {
    test('should emit state change using helper', () => {
      const listener = jest.fn()
      redundancyEventBus.on('redundancy:state:changed', listener)
      
      const state: RedundancyState = {
        isActive: true,
        selectedSubstation: null,
        selectedLine: null,
        isPanelOpen: true,
        animationProgress: 0.5
      }
      
      redundancyEvents.emitStateChange(state)
      
      expect(listener).toHaveBeenCalledWith({ state })
    })

    test('should subscribe to state change using helper', () => {
      const state: RedundancyState = {
        isActive: false,
        selectedSubstation: null,
        selectedLine: null,
        isPanelOpen: false,
        animationProgress: 0
      }
      
      const listener = jest.fn()
      const unsubscribe = redundancyEvents.onStateChange(listener)
      
      redundancyEventBus.emit('redundancy:state:changed', { state })
      
      expect(listener).toHaveBeenCalledWith(state)
      
      unsubscribe()
      
      redundancyEventBus.emit('redundancy:state:changed', { state })
      expect(listener).toHaveBeenCalledTimes(1)
    })

    test('should handle panel toggle helper', () => {
      const openListener = jest.fn()
      const closeListener = jest.fn()
      
      redundancyEventBus.on('redundancy:panel:opened', openListener)
      redundancyEventBus.on('redundancy:panel:closed', closeListener)
      
      redundancyEvents.emitPanelToggle(true)
      expect(openListener).toHaveBeenCalledWith({ timestamp: expect.any(Number) })
      expect(closeListener).not.toHaveBeenCalled()
      
      redundancyEvents.emitPanelToggle(false)
      expect(closeListener).toHaveBeenCalledWith({ timestamp: expect.any(Number) })
    })

    test('should handle animation state helper', () => {
      const startListener = jest.fn()
      const completeListener = jest.fn()
      
      redundancyEventBus.on('redundancy:animation:started', startListener)
      redundancyEventBus.on('redundancy:animation:completed', completeListener)
      
      redundancyEvents.emitAnimationState('pulse', true)
      expect(startListener).toHaveBeenCalledWith({ type: 'pulse' })
      
      redundancyEvents.emitAnimationState('pulse', false)
      expect(completeListener).toHaveBeenCalledWith({ type: 'pulse' })
    })
  })

  describe('Event Isolation', () => {
    test('should not interfere with non-redundancy events', () => {
      const redundancyListener = jest.fn()
      const otherListener = jest.fn()
      
      eventBus.on('redundancy:state:changed', redundancyListener)
      
      // Try to emit a non-redundancy event
      window.addEventListener('other:event', otherListener)
      window.dispatchEvent(new CustomEvent('other:event'))
      
      expect(otherListener).toHaveBeenCalled()
      expect(redundancyListener).not.toHaveBeenCalled()
    })

    test('should handle global errors only for redundancy feature', () => {
      const errorListener = jest.fn()
      eventBus.on('redundancy:state:error', errorListener)
      
      // Emit error with feature ID
      const redundancyError = new Error('Redundancy error')
      ;(redundancyError as any).featureId = 'redundancy-2n1'
      
      window.dispatchEvent(new ErrorEvent('error', { error: redundancyError }))
      
      expect(errorListener).toHaveBeenCalledWith({
        error: redundancyError,
        context: 'global'
      })
      
      // Emit error without feature ID
      errorListener.mockClear()
      const otherError = new Error('Other error')
      
      window.dispatchEvent(new ErrorEvent('error', { error: otherError }))
      
      expect(errorListener).not.toHaveBeenCalled()
    })
  })
})