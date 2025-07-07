/**
 * Error Handling Exports
 * Centralized export point for error handling components and utilities
 */

export {
  RedundancyErrorBoundary,
  withRedundancyErrorBoundary,
  useRedundancyErrorHandler
} from './ErrorBoundary'

export {
  RedundancyErrorIsolation,
  redundancyErrorIsolation,
  defaultIsolationConfig
} from './ErrorIsolation'

export type {
  ErrorContext,
  IsolationConfig,
  ErrorRecord,
  ErrorSeverity
} from './ErrorIsolation'

// Import CSS styles
import '../styles/error-boundary.css'