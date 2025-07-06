/**
 * Tests for Redundancy Error Isolation
 */

import {
  RedundancyErrorIsolation,
  defaultIsolationConfig
} from '../../features/redundancy/errors/ErrorIsolation'
import type { ErrorContext, IsolationConfig } from '../../features/redundancy/errors/ErrorIsolation'
import { redundancyEventBus } from '../../features/redundancy/events'

// Mock the event bus
jest.mock('../../features/redundancy/events', () => ({
  redundancyEventBus: {
    emit: jest.fn()
  }
}))

describe('RedundancyErrorIsolation', () => {
  let isolation: RedundancyErrorIsolation
  let testContext: ErrorContext

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation()
    jest.spyOn(console, 'warn').mockImplementation()
    jest.spyOn(console, 'log').mockImplementation()

    isolation = new RedundancyErrorIsolation()
    testContext = {
      featureId: 'redundancy-2n1',
      componentName: 'TestComponent',
      operationName: 'testOperation',
      timestamp: Date.now()
    }
  })

  afterEach(() => {
    isolation.destroy()
    jest.restoreAllMocks()
  })

  describe('Error Reporting', () => {
    test('should report error and return error ID', () => {
      const error = new Error('Test error')
      const errorId = isolation.reportError(error, testContext)

      expect(errorId).toMatch(/^err-\d+-[a-z0-9]+$/)
      expect(redundancyEventBus.emit).toHaveBeenCalledWith(
        'redundancy:error:reported',
        expect.objectContaining({
          errorRecord: expect.objectContaining({
            id: errorId,
            error,
            context: testContext
          }),
          isolated: false,
          severity: expect.any(String)
        })
      )
    })

    test('should store error record correctly', () => {
      const error = new Error('Test error')
      isolation.reportError(error, testContext)

      const stats = isolation.getErrorStats(testContext)
      expect(stats.totalErrors).toBe(1)
      expect(stats.recentErrors).toBe(1)
      expect(stats.lastError?.error).toBe(error)
    })

    test('should clean old errors outside time window', () => {
      jest.useFakeTimers()
      
      const config: IsolationConfig = {
        ...defaultIsolationConfig,
        timeWindow: 1000 // 1 second
      }
      const testIsolation = new RedundancyErrorIsolation(config)

      // Report error at current time
      const oldError = new Error('Old error')
      testIsolation.reportError(oldError, testContext)

      // Advance time past window
      jest.advanceTimersByTime(1500)
      
      // Report new error - this should trigger cleanup
      const newError = new Error('New error')
      testIsolation.reportError(newError, testContext)

      const stats = testIsolation.getErrorStats(testContext)
      expect(stats.recentErrors).toBe(1) // Only recent error should count

      jest.useRealTimers()
      testIsolation.destroy()
    })
  })

  describe('Circuit Breaker', () => {
    test('should trigger circuit breaker after max errors', () => {
      const config: IsolationConfig = {
        ...defaultIsolationConfig,
        maxErrors: 3
      }
      const testIsolation = new RedundancyErrorIsolation(config)

      // Report errors up to the limit
      for (let i = 0; i < 3; i++) {
        const error = new Error(`Error ${i + 1}`)
        testIsolation.reportError(error, testContext)
      }

      const stats = testIsolation.getErrorStats(testContext)
      expect(stats.circuitState).toBe('open')
      
      expect(redundancyEventBus.emit).toHaveBeenCalledWith(
        'redundancy:error:isolated',
        expect.objectContaining({
          contextKey: 'redundancy-2n1:TestComponent:testOperation'
        })
      )

      testIsolation.destroy()
    })

    test('should allow operations when circuit is closed', () => {
      const allowed = isolation.shouldAllowOperation(testContext)
      expect(allowed).toBe(true)
    })

    test('should block operations when circuit is open', () => {
      // Trigger circuit breaker
      const config: IsolationConfig = {
        ...defaultIsolationConfig,
        maxErrors: 2
      }
      const testIsolation = new RedundancyErrorIsolation(config)

      for (let i = 0; i < 2; i++) {
        testIsolation.reportError(new Error(`Error ${i + 1}`), testContext)
      }

      const allowed = testIsolation.shouldAllowOperation(testContext)
      expect(allowed).toBe(false)

      testIsolation.destroy()
    })

    test('should transition to half-open after cooldown period', () => {
      jest.useFakeTimers()

      const config: IsolationConfig = {
        ...defaultIsolationConfig,
        maxErrors: 2,
        cooldownPeriod: 5000 // 5 seconds
      }
      const testIsolation = new RedundancyErrorIsolation(config)

      // Trigger circuit breaker
      for (let i = 0; i < 2; i++) {
        testIsolation.reportError(new Error(`Error ${i + 1}`), testContext)
      }

      expect(testIsolation.shouldAllowOperation(testContext)).toBe(false)

      // Fast-forward past cooldown
      jest.advanceTimersByTime(6000)

      expect(testIsolation.shouldAllowOperation(testContext)).toBe(true)
      const stats = testIsolation.getErrorStats(testContext)
      expect(stats.circuitState).toBe('half-open')

      jest.useRealTimers()
      testIsolation.destroy()
    })

    test('should close circuit after successful operation in half-open state', () => {
      jest.useFakeTimers()

      const config: IsolationConfig = {
        ...defaultIsolationConfig,
        maxErrors: 1,
        cooldownPeriod: 1000
      }
      const testIsolation = new RedundancyErrorIsolation(config)

      // Trigger circuit breaker
      testIsolation.reportError(new Error('Error'), testContext)

      // Fast-forward past cooldown to half-open
      jest.advanceTimersByTime(2000)
      expect(testIsolation.getErrorStats(testContext).circuitState).toBe('half-open')

      // Record success
      testIsolation.recordSuccess(testContext)
      expect(testIsolation.getErrorStats(testContext).circuitState).toBe('closed')

      expect(redundancyEventBus.emit).toHaveBeenCalledWith(
        'redundancy:error:circuit-recovered',
        expect.objectContaining({
          contextKey: 'redundancy-2n1:TestComponent:testOperation'
        })
      )

      jest.useRealTimers()
      testIsolation.destroy()
    })

    test('should respect circuit breaker disable config', () => {
      const config: IsolationConfig = {
        ...defaultIsolationConfig,
        enableCircuitBreaker: false,
        maxErrors: 1
      }
      const testIsolation = new RedundancyErrorIsolation(config)

      // Report multiple errors
      for (let i = 0; i < 5; i++) {
        testIsolation.reportError(new Error(`Error ${i + 1}`), testContext)
      }

      // Should still allow operations
      expect(testIsolation.shouldAllowOperation(testContext)).toBe(true)
      expect(testIsolation.getErrorStats(testContext).circuitState).toBe('closed')

      testIsolation.destroy()
    })
  })

  describe('Error Severity Classification', () => {
    test('should classify TypeError as high severity', () => {
      const error = new TypeError('Type error')
      isolation.reportError(error, testContext)

      const severity = isolation.getErrorSeverity(error, testContext)
      expect(severity).toBe('high')
    })

    test('should classify ReferenceError as high severity', () => {
      const error = new ReferenceError('Reference error')
      isolation.reportError(error, testContext)

      const severity = isolation.getErrorSeverity(error, testContext)
      expect(severity).toBe('high')
    })

    test('should classify network errors as medium severity', () => {
      const error = new Error('Network request failed')
      isolation.reportError(error, testContext)

      const severity = isolation.getErrorSeverity(error, testContext)
      expect(severity).toBe('medium')
    })

    test('should classify based on frequency', () => {
      const config: IsolationConfig = {
        ...defaultIsolationConfig,
        maxErrors: 4
      }
      const testIsolation = new RedundancyErrorIsolation(config)

      // Report multiple generic errors
      for (let i = 0; i < 4; i++) {
        const error = new Error(`Generic error ${i + 1}`)
        testIsolation.reportError(error, testContext)
      }

      const lastError = new Error('Last error')
      testIsolation.reportError(lastError, testContext)
      const severity = testIsolation.getErrorSeverity(lastError, testContext)
      expect(severity).toBe('critical')

      testIsolation.destroy()
    })

    test('should classify single error as low severity', () => {
      const error = new Error('Single error')
      isolation.reportError(error, testContext)

      const severity = isolation.getErrorSeverity(error, testContext)
      expect(severity).toBe('low')
    })
  })

  describe('Error Statistics', () => {
    test('should provide accurate error statistics', () => {
      const errors = [
        new Error('Error 1'),
        new Error('Error 2'),
        new Error('Error 3')
      ]

      errors.forEach(error => {
        isolation.reportError(error, testContext)
      })

      const stats = isolation.getErrorStats(testContext)
      expect(stats.totalErrors).toBe(3)
      expect(stats.recentErrors).toBe(3)
      expect(stats.circuitState).toBe('closed')
      expect(stats.lastError?.error).toBe(errors[2])
      expect(stats.errorRate).toBeGreaterThan(0)
    })

    test('should calculate error rate correctly', () => {
      const config: IsolationConfig = {
        ...defaultIsolationConfig,
        timeWindow: 60000 // 1 minute
      }
      const testIsolation = new RedundancyErrorIsolation(config)

      // Report 3 errors
      for (let i = 0; i < 3; i++) {
        testIsolation.reportError(new Error(`Error ${i + 1}`), testContext)
      }

      const stats = testIsolation.getErrorStats(testContext)
      expect(stats.errorRate).toBe(3) // 3 errors per minute

      testIsolation.destroy()
    })
  })

  describe('Context Management', () => {
    test('should group errors by context correctly', () => {
      const context1 = { ...testContext, componentName: 'Component1' }
      const context2 = { ...testContext, componentName: 'Component2' }

      isolation.reportError(new Error('Error 1'), context1)
      isolation.reportError(new Error('Error 2'), context2)
      isolation.reportError(new Error('Error 3'), context1)

      const stats1 = isolation.getErrorStats(context1)
      const stats2 = isolation.getErrorStats(context2)

      expect(stats1.totalErrors).toBe(2)
      expect(stats2.totalErrors).toBe(1)
    })

    test('should handle partial context correctly', () => {
      // Create a partial context that matches the test context
      const partialContext = { 
        featureId: 'redundancy-2n1',
        componentName: 'TestComponent',
        operationName: 'testOperation'
      } as ErrorContext
      
      isolation.reportError(new Error('Error'), testContext)
      const stats = isolation.getErrorStats(partialContext)
      
      // Should return stats for the matching context
      expect(stats.totalErrors).toBe(1)
    })

    test('should clear errors for specific context', () => {
      const context1 = { ...testContext, componentName: 'Component1' }
      const context2 = { ...testContext, componentName: 'Component2' }

      isolation.reportError(new Error('Error 1'), context1)
      isolation.reportError(new Error('Error 2'), context2)

      isolation.clearErrors(context1)

      expect(isolation.getErrorStats(context1).totalErrors).toBe(0)
      expect(isolation.getErrorStats(context2).totalErrors).toBe(1)
    })
  })

  describe('Isolated Contexts', () => {
    test('should track isolated contexts', () => {
      const config: IsolationConfig = {
        ...defaultIsolationConfig,
        maxErrors: 2
      }
      const testIsolation = new RedundancyErrorIsolation(config)

      // Trigger isolation
      for (let i = 0; i < 2; i++) {
        testIsolation.reportError(new Error(`Error ${i + 1}`), testContext)
      }

      const isolatedContexts = testIsolation.getIsolatedContexts()
      expect(isolatedContexts).toContain('redundancy-2n1:TestComponent:testOperation')

      testIsolation.destroy()
    })

    test('should not include closed circuits in isolated contexts', () => {
      isolation.reportError(new Error('Error'), testContext)
      
      const isolatedContexts = isolation.getIsolatedContexts()
      expect(isolatedContexts).toHaveLength(0)
    })
  })

  describe('Configuration Management', () => {
    test('should use custom configuration', () => {
      const customConfig: IsolationConfig = {
        maxErrors: 10,
        timeWindow: 120000,
        cooldownPeriod: 600000,
        enableCircuitBreaker: false,
        enableRetry: false,
        retryAttempts: 5,
        retryDelay: 2000
      }

      const testIsolation = new RedundancyErrorIsolation(customConfig)
      const config = testIsolation.getConfig()

      expect(config).toEqual(customConfig)

      testIsolation.destroy()
    })

    test('should update configuration', () => {
      isolation.updateConfig({ maxErrors: 10 })
      
      const config = isolation.getConfig()
      expect(config.maxErrors).toBe(10)
    })

    test('should have correct default configuration', () => {
      expect(defaultIsolationConfig).toEqual({
        maxErrors: 5,
        timeWindow: 60000,
        cooldownPeriod: 300000,
        enableCircuitBreaker: true,
        enableRetry: true,
        retryAttempts: 3,
        retryDelay: 1000
      })
    })
  })

  describe('Cleanup and Destruction', () => {
    test('should clear all data on destroy', () => {
      isolation.reportError(new Error('Error'), testContext)
      
      expect(isolation.getErrorStats(testContext).totalErrors).toBe(1)
      
      isolation.destroy()
      
      expect(isolation.getErrorStats(testContext).totalErrors).toBe(0)
    })

    test('should clear timers on destroy', () => {
      jest.useFakeTimers()
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

      const config: IsolationConfig = {
        ...defaultIsolationConfig,
        maxErrors: 1
      }
      const testIsolation = new RedundancyErrorIsolation(config)

      // Trigger isolation to create timer
      testIsolation.reportError(new Error('Error'), testContext)
      
      testIsolation.destroy()
      
      expect(clearTimeoutSpy).toHaveBeenCalled()

      jest.useRealTimers()
      clearTimeoutSpy.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    test('should handle errors without component name', () => {
      const contextWithoutComponent = {
        featureId: 'redundancy-2n1',
        timestamp: Date.now()
      } as ErrorContext

      const errorId = isolation.reportError(new Error('Error'), contextWithoutComponent)
      expect(errorId).toBeTruthy()
      
      const stats = isolation.getErrorStats(contextWithoutComponent)
      expect(stats.totalErrors).toBe(1)
    })

    test('should handle multiple errors at the same timestamp', () => {
      const timestamp = Date.now()
      const context1 = { ...testContext, timestamp }
      const context2 = { ...testContext, componentName: 'Component2', timestamp }

      isolation.reportError(new Error('Error 1'), context1)
      isolation.reportError(new Error('Error 2'), context2)

      expect(isolation.getErrorStats(context1).totalErrors).toBe(1)
      expect(isolation.getErrorStats(context2).totalErrors).toBe(1)
    })

    test('should handle empty error messages', () => {
      const error = new Error('')
      const errorId = isolation.reportError(error, testContext)
      
      expect(errorId).toBeTruthy()
      expect(isolation.getErrorStats(testContext).totalErrors).toBe(1)
    })
  })
})