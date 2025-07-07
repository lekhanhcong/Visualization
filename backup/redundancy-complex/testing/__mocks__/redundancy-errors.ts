/**
 * Mock Redundancy Errors
 * Mock implementations for testing redundancy error handling
 */

export const mockRedundancyErrorIsolation = {
  reportError: jest.fn(),
  getErrorStats: jest.fn(() => ({
    totalErrors: 0,
    recentErrors: 0,
    circuitState: 'closed',
    isIsolated: false,
    lastError: null
  })),
  isCircuitOpen: jest.fn(() => false),
  reset: jest.fn(),
  configure: jest.fn()
}

export const mockErrorBoundary = {
  hasError: false,
  error: null,
  errorInfo: null,
  componentStack: '',
  reset: jest.fn(),
  onError: jest.fn()
}

export const createMockError = (message = 'Test error', name = 'TestError') => {
  const error = new Error(message)
  error.name = name
  return error
}

export default mockRedundancyErrorIsolation