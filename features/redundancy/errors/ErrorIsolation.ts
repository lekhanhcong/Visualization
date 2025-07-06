/**
 * Error Isolation System for 2N+1 Redundancy Feature
 * Provides error containment and isolation mechanisms
 */

import { redundancyEventBus } from '../events'

export interface ErrorContext {
  featureId: string
  componentName?: string
  operationName?: string
  userId?: string
  sessionId?: string
  timestamp: number
  metadata?: Record<string, unknown>
}

export interface IsolationConfig {
  maxErrors: number
  timeWindow: number // milliseconds
  cooldownPeriod: number // milliseconds
  enableCircuitBreaker: boolean
  enableRetry: boolean
  retryAttempts: number
  retryDelay: number
}

export interface ErrorRecord {
  id: string
  error: Error
  context: ErrorContext
  timestamp: number
  attempt: number
  recovered: boolean
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

/**
 * Error Isolation Manager
 * Manages error isolation and circuit breaker patterns
 */
export class RedundancyErrorIsolation {
  private errors = new Map<string, ErrorRecord[]>()
  private circuitStates = new Map<string, 'closed' | 'open' | 'half-open'>()
  private lastFailures = new Map<string, number>()
  private cooldownTimers = new Map<string, NodeJS.Timeout>()
  private config: IsolationConfig

  constructor(config: Partial<IsolationConfig> = {}) {
    this.config = {
      maxErrors: 5,
      timeWindow: 60000, // 1 minute
      cooldownPeriod: 300000, // 5 minutes
      enableCircuitBreaker: true,
      enableRetry: true,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    }
  }

  /**
   * Report an error and apply isolation logic
   */
  reportError(error: Error, context: ErrorContext): string {
    const errorId = this.generateErrorId()
    const errorRecord: ErrorRecord = {
      id: errorId,
      error,
      context,
      timestamp: Date.now(),
      attempt: 1,
      recovered: false
    }

    // Store error record
    const contextKey = this.getContextKey(context)
    if (!this.errors.has(contextKey)) {
      this.errors.set(contextKey, [])
    }
    this.errors.get(contextKey)!.push(errorRecord)

    // Clean old errors
    this.cleanOldErrors(contextKey)

    // Check if isolation should be triggered
    const shouldIsolate = this.shouldTriggerIsolation(contextKey)
    if (shouldIsolate) {
      this.triggerIsolation(contextKey, context)
    }

    // Emit error event
    this.emitErrorEvent(errorRecord, shouldIsolate)

    // Log error details
    this.logError(errorRecord, shouldIsolate)

    return errorId
  }

  /**
   * Check if operation should be allowed based on circuit state
   */
  shouldAllowOperation(context: ErrorContext): boolean {
    if (!this.config.enableCircuitBreaker) {
      return true
    }

    const contextKey = this.getContextKey(context)
    const circuitState = this.circuitStates.get(contextKey) || 'closed'

    switch (circuitState) {
      case 'closed':
        return true
      case 'open':
        // Check if cooldown period has passed
        const lastFailure = this.lastFailures.get(contextKey) || 0
        const cooldownExpired = Date.now() - lastFailure > this.config.cooldownPeriod
        
        if (cooldownExpired) {
          this.circuitStates.set(contextKey, 'half-open')
          if (process.env.NODE_ENV === 'development') {
            console.log(`[ErrorIsolation] Circuit breaker half-open for: ${contextKey}`)
          }
          return true
        }
        return false
      case 'half-open':
        return true
      default:
        return true
    }
  }

  /**
   * Record successful operation (for circuit breaker recovery)
   */
  recordSuccess(context: ErrorContext): void {
    const contextKey = this.getContextKey(context)
    const circuitState = this.circuitStates.get(contextKey)

    if (circuitState === 'half-open') {
      this.circuitStates.set(contextKey, 'closed')
      this.lastFailures.delete(contextKey)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[ErrorIsolation] Circuit breaker closed for: ${contextKey}`)
      }

      // Emit recovery event
      redundancyEventBus.emit('redundancy:error:circuit-recovered', {
        contextKey,
        timestamp: Date.now()
      })
    }
  }

  /**
   * Get error severity based on error type and frequency
   */
  getErrorSeverity(error: Error, context: ErrorContext): ErrorSeverity {
    const contextKey = this.getContextKey(context)
    const recentErrors = this.getRecentErrors(contextKey)
    
    // Check error type for severity
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'high'
    }
    
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return 'medium'
    }

    // Check frequency
    if (recentErrors.length >= this.config.maxErrors) {
      return 'critical'
    } else if (recentErrors.length >= this.config.maxErrors / 2) {
      return 'high'
    } else if (recentErrors.length >= 2) {
      return 'medium'
    }

    return 'low'
  }

  /**
   * Get error statistics for a context
   */
  getErrorStats(context: Partial<ErrorContext>): {
    totalErrors: number
    recentErrors: number
    circuitState: string
    lastError?: ErrorRecord
    errorRate: number
  } {
    const contextKey = this.getContextKey(context as ErrorContext)
    const allErrors = this.errors.get(contextKey) || []
    const recentErrors = this.getRecentErrors(contextKey)
    const circuitState = this.circuitStates.get(contextKey) || 'closed'
    const lastError = allErrors[allErrors.length - 1]
    
    // Calculate error rate (errors per minute)
    const errorRate = recentErrors.length / (this.config.timeWindow / 60000)

    return {
      totalErrors: allErrors.length,
      recentErrors: recentErrors.length,
      circuitState,
      lastError,
      errorRate
    }
  }

  /**
   * Clear errors for a specific context
   */
  clearErrors(context: Partial<ErrorContext>): void {
    const contextKey = this.getContextKey(context as ErrorContext)
    this.errors.delete(contextKey)
    this.circuitStates.delete(contextKey)
    this.lastFailures.delete(contextKey)
    
    const timer = this.cooldownTimers.get(contextKey)
    if (timer) {
      clearTimeout(timer)
      this.cooldownTimers.delete(contextKey)
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[ErrorIsolation] Cleared errors for: ${contextKey}`)
    }
  }

  /**
   * Get all error contexts with active isolation
   */
  getIsolatedContexts(): string[] {
    return Array.from(this.circuitStates.entries())
      .filter(([_, state]) => state === 'open')
      .map(([contextKey, _]) => contextKey)
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate context key for grouping errors
   */
  private getContextKey(context: ErrorContext): string {
    const parts = [
      context.featureId,
      context.componentName || 'unknown',
      context.operationName || 'unknown'
    ]
    return parts.join(':')
  }

  /**
   * Check if isolation should be triggered
   */
  private shouldTriggerIsolation(contextKey: string): boolean {
    if (!this.config.enableCircuitBreaker) {
      return false
    }

    const recentErrors = this.getRecentErrors(contextKey)
    return recentErrors.length >= this.config.maxErrors
  }

  /**
   * Trigger isolation for a context
   */
  private triggerIsolation(contextKey: string, context: ErrorContext): void {
    this.circuitStates.set(contextKey, 'open')
    this.lastFailures.set(contextKey, Date.now())

    if (process.env.NODE_ENV === 'development') {
      console.warn(`[ErrorIsolation] Circuit breaker opened for: ${contextKey}`)
    }

    // Set cooldown timer
    const timer = setTimeout(() => {
      this.circuitStates.set(contextKey, 'half-open')
      this.cooldownTimers.delete(contextKey)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[ErrorIsolation] Circuit breaker half-open for: ${contextKey}`)
      }
    }, this.config.cooldownPeriod)

    this.cooldownTimers.set(contextKey, timer)

    // Emit isolation event
    redundancyEventBus.emit('redundancy:error:isolated', {
      contextKey,
      context,
      timestamp: Date.now(),
      cooldownPeriod: this.config.cooldownPeriod
    })
  }

  /**
   * Get recent errors within time window
   */
  private getRecentErrors(contextKey: string): ErrorRecord[] {
    const allErrors = this.errors.get(contextKey) || []
    const cutoff = Date.now() - this.config.timeWindow
    return allErrors.filter(error => error.timestamp > cutoff)
  }

  /**
   * Clean old errors outside time window
   */
  private cleanOldErrors(contextKey: string): void {
    const allErrors = this.errors.get(contextKey) || []
    const cutoff = Date.now() - this.config.timeWindow * 2 // Keep history for 2x time window
    const recentErrors = allErrors.filter(error => error.timestamp > cutoff)
    
    if (recentErrors.length !== allErrors.length) {
      this.errors.set(contextKey, recentErrors)
    }
  }

  /**
   * Emit error event
   */
  private emitErrorEvent(errorRecord: ErrorRecord, isolated: boolean): void {
    try {
      redundancyEventBus.emit('redundancy:error:reported', {
        errorRecord,
        isolated,
        severity: this.getErrorSeverity(errorRecord.error, errorRecord.context),
        timestamp: Date.now()
      })
    } catch (eventError) {
      console.error('[ErrorIsolation] Failed to emit error event:', eventError)
    }
  }

  /**
   * Log error with context
   */
  private logError(errorRecord: ErrorRecord, isolated: boolean): void {
    const severity = this.getErrorSeverity(errorRecord.error, errorRecord.context)
    const contextKey = this.getContextKey(errorRecord.context)
    
    const logMethod = severity === 'critical' ? 'error' : 
                     severity === 'high' ? 'warn' : 'log'
    
    console[logMethod](`[ErrorIsolation] ${isolated ? 'ISOLATED' : 'REPORTED'}`, {
      errorId: errorRecord.id,
      contextKey,
      severity,
      error: errorRecord.error.message,
      timestamp: new Date(errorRecord.timestamp).toISOString()
    })
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<IsolationConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current configuration
   */
  getConfig(): IsolationConfig {
    return { ...this.config }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    // Clear all timers
    for (const timer of this.cooldownTimers.values()) {
      clearTimeout(timer)
    }
    
    // Clear all data
    this.errors.clear()
    this.circuitStates.clear()
    this.lastFailures.clear()
    this.cooldownTimers.clear()

    if (process.env.NODE_ENV === 'development') {
      console.log('[ErrorIsolation] Destroyed error isolation manager')
    }
  }
}

// Default configuration
export const defaultIsolationConfig: IsolationConfig = {
  maxErrors: 5,
  timeWindow: 60000,
  cooldownPeriod: 300000,
  enableCircuitBreaker: true,
  enableRetry: true,
  retryAttempts: 3,
  retryDelay: 1000
}

// Singleton instance
export const redundancyErrorIsolation = new RedundancyErrorIsolation(defaultIsolationConfig)