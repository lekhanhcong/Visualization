'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundaryClass extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToErrorReporting(error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  override render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent
          error={this.state.error!}
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
      <motion.div
        className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 text-center"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
        }}
      >
        {/* Error icon */}
        <motion.div
          className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 15 }}
        >
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </motion.div>

        {/* Error message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mb-6">
            We encountered an unexpected error while loading the visualization.
          </p>
        </motion.div>

        {/* Error details in development */}
        {isDevelopment && error && (
          <motion.div
            className="bg-gray-100 dark:bg-slate-700 rounded-lg p-4 mb-6 text-left"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-2">
              Error Details:
            </h3>
            <code className="text-xs text-red-600 dark:text-red-400 font-mono break-all">
              {error.message}
            </code>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs text-gray-600 dark:text-slate-400 cursor-pointer">
                  Stack trace
                </summary>
                <pre className="text-xs text-gray-500 dark:text-slate-500 mt-1 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            )}
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          className="flex gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={resetError}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </motion.div>

        {/* Additional help */}
        <motion.p
          className="text-xs text-gray-500 dark:text-slate-500 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          If the problem persists, please refresh the page or contact support.
        </motion.p>
      </motion.div>
    </div>
  )
}

// Hook for error boundaries
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by hook:', error, errorInfo)

    // Re-throw the error to be caught by error boundary
    throw error
  }
}

// Higher-order component for error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundaryClass {...(fallback && { fallback })}>
      <Component {...props} />
    </ErrorBoundaryClass>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

export { ErrorBoundaryClass as ErrorBoundary }
