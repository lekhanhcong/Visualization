/**
 * Error Boundary for 2N+1 Redundancy Feature
 * Handles errors within the feature to prevent crashing the main application
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { redundancyEventBus } from '../events'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  isolateErrors?: boolean
  featureId?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

/**
 * Feature-specific error boundary component
 * Isolates errors within the redundancy feature
 */
export class RedundancyErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorCount = 0
  private maxErrors = 5
  private resetTimeoutId: NodeJS.Timeout | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state to render fallback UI
    return {
      hasError: true,
      error,
      errorId: `redundancy-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.errorCount++
    
    // Store error info in state
    this.setState({
      errorInfo
    })

    // Log error details
    this.logError(error, errorInfo)
    
    // Emit error event
    this.emitErrorEvent(error, errorInfo)
    
    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Reset error boundary after delay if not too many errors
    if (this.errorCount < this.maxErrors) {
      this.scheduleReset()
    } else {
      console.error('[RedundancyErrorBoundary] Too many errors, disabling auto-reset')
    }
  }

  /**
   * Log error with context information
   */
  private logError(error: Error, errorInfo: ErrorInfo): void {
    const errorContext = {
      featureId: this.props.featureId || 'redundancy-2n1',
      errorId: this.state.errorId,
      errorCount: this.errorCount,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    }

    console.group(`[RedundancyErrorBoundary] Error Caught`)
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
    console.error('Context:', errorContext)
    console.groupEnd()

    // Send to error reporting service if available
    if (typeof window !== 'undefined' && (window as any).__REDUNDANCY_ERROR_REPORTER__) {
      try {
        ;(window as any).__REDUNDANCY_ERROR_REPORTER__({
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          },
          errorInfo,
          context: errorContext
        })
      } catch (reportingError) {
        console.error('[RedundancyErrorBoundary] Failed to report error:', reportingError)
      }
    }
  }

  /**
   * Emit error event through event bus
   */
  private emitErrorEvent(error: Error, errorInfo: ErrorInfo): void {
    try {
      redundancyEventBus.emit('redundancy:error:boundary', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo,
        errorId: this.state.errorId,
        featureId: this.props.featureId || 'redundancy-2n1',
        timestamp: Date.now()
      })
    } catch (eventError) {
      console.error('[RedundancyErrorBoundary] Failed to emit error event:', eventError)
    }
  }

  /**
   * Schedule error boundary reset
   */
  private scheduleReset(): void {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }

    // Reset after 30 seconds
    this.resetTimeoutId = setTimeout(() => {
      this.resetErrorBoundary()
    }, 30000)

    if (process.env.NODE_ENV === 'development') {
      console.log('[RedundancyErrorBoundary] Error boundary will reset in 30 seconds')
    }
  }

  /**
   * Reset error boundary state
   */
  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('[RedundancyErrorBoundary] Error boundary reset')
    }

    // Emit recovery event
    try {
      redundancyEventBus.emit('redundancy:error:recovered', {
        timestamp: Date.now(),
        errorCount: this.errorCount
      })
    } catch (eventError) {
      console.error('[RedundancyErrorBoundary] Failed to emit recovery event:', eventError)
    }
  }

  /**
   * Manual retry function
   */
  private handleRetry = (): void => {
    this.resetErrorBoundary()
  }

  /**
   * Render error fallback UI
   */
  private renderErrorFallback(): ReactNode {
    const { error, errorInfo, errorId } = this.state
    
    // Use custom fallback if provided
    if (this.props.fallback) {
      return this.props.fallback
    }

    // Default error UI
    return (
      <div className="rdx-error-boundary">
        <div className="rdx-error-boundary__container">
          <div className="rdx-error-boundary__header">
            <h3 className="rdx-error-boundary__title">
              Redundancy Feature Error
            </h3>
            <p className="rdx-error-boundary__subtitle">
              The redundancy visualization encountered an error
            </p>
          </div>
          
          <div className="rdx-error-boundary__content">
            <div className="rdx-error-boundary__message">
              <strong>Error:</strong> {error?.message || 'Unknown error occurred'}
            </div>
            
            {errorId && (
              <div className="rdx-error-boundary__error-id">
                <strong>Error ID:</strong> {errorId}
              </div>
            )}
            
            {process.env.NODE_ENV === 'development' && errorInfo && (
              <details className="rdx-error-boundary__details">
                <summary>Technical Details (Development)</summary>
                <pre className="rdx-error-boundary__stack">
                  {error?.stack}
                </pre>
                <pre className="rdx-error-boundary__component-stack">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
          
          <div className="rdx-error-boundary__actions">
            <button 
              className="rdx-error-boundary__retry-btn"
              onClick={this.handleRetry}
              type="button"
            >
              Retry Feature
            </button>
            
            {this.errorCount < this.maxErrors && (
              <p className="rdx-error-boundary__auto-retry">
                Feature will automatically retry in 30 seconds
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  override componentWillUnmount(): void {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return this.renderErrorFallback()
    }

    return this.props.children
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withRedundancyErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <RedundancyErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </RedundancyErrorBoundary>
  )

  WrappedComponent.displayName = `withRedundancyErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

/**
 * Hook for accessing error boundary context
 */
export function useRedundancyErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: Record<string, unknown>) => {
    // Log error with context
    console.error('[RedundancyErrorHandler] Manual error reported:', error, context)
    
    // Emit error event
    redundancyEventBus.emit('redundancy:error:manual', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: { componentStack: 'manual error' },
      errorId: `redundancy-manual-error-${Date.now()}`,
      featureId: 'manual-handler',
      context: context ? JSON.stringify(context) : '{}',
      timestamp: Date.now()
    })
  }, [])

  const reportError = React.useCallback((errorMessage: string, context?: Record<string, unknown>) => {
    const error = new Error(errorMessage)
    handleError(error, context)
  }, [handleError])

  return {
    handleError,
    reportError
  }
}