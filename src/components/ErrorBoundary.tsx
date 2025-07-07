/**
 * Error Boundary Component for 2N+1 Redundancy Visualization
 * Handles React errors gracefully with fallback UI
 */

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
} as const

const modalVariants = {
  initial: { scale: 0.8, y: 20 },
  animate: { scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
} as const

const iconVariants = {
  initial: { scale: 0 },
  animate: { scale: 1, transition: { delay: 0.2, type: 'spring' } },
} as const

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class RedundancyErrorBoundary extends Component<Props, State> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Redundancy Visualization Error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to monitoring service (placeholder)
    this.logErrorToService(error, errorInfo)
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to your monitoring service
    console.error('Error logged to monitoring service:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  override render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <motion.div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm"
          variants={overlayVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div 
            className="bg-white rounded-xl p-8 max-w-md mx-4 shadow-2xl"
            variants={modalVariants}
            initial="initial"
            animate="animate"
          >
            <div className="text-center">
              {/* Error Icon */}
              <motion.div 
                className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
                variants={iconVariants}
                initial="initial"
                animate="animate"
              >
                <span className="text-red-600 text-2xl">⚠️</span>
              </motion.div>

              {/* Error Title */}
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Visualization Error
              </h2>

              {/* Error Description */}
              <p className="text-gray-600 mb-6">
                The 2N+1 redundancy visualization encountered an unexpected error. 
                This doesn&apos;t affect the main application.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 overflow-auto max-h-32">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                {this.retryCount < this.maxRetries && (
                  <motion.button
                    onClick={this.handleRetry}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Try Again ({this.maxRetries - this.retryCount} left)
                  </motion.button>
                )}
                
                <motion.button
                  onClick={this.handleReload}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Reload Page
                </motion.button>
              </div>

              {/* Help Text */}
              <p className="text-xs text-gray-500 mt-4">
                If this problem persists, please contact support with the error details above.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )
    }

    return this.props.children
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <RedundancyErrorBoundary fallback={fallback} onError={onError}>
      <WrappedComponent {...props} />
    </RedundancyErrorBoundary>
  )

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`

  return WithErrorBoundaryComponent
}

/**
 * Simple fallback UI component
 */
export const RedundancyFallback: React.FC<{ message?: string }> = ({ 
  message = "The redundancy visualization is temporarily unavailable." 
}) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-yellow-600 text-xl">⚡</span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">Feature Unavailable</h3>
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  </div>
)