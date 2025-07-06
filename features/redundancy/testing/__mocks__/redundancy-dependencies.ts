/**
 * Mock Redundancy Dependencies
 * Mock implementations for testing redundancy dependencies
 */

export const mockRedundancyDependencyManager = {
  resolveAll: jest.fn(() => Promise.resolve(true)),
  resolve: jest.fn((dependency: string) => Promise.resolve(true)),
  isResolved: jest.fn(() => true),
  getStatus: jest.fn(() => ({
    resolved: true,
    failed: [],
    pending: []
  })),
  onResolved: jest.fn(),
  onFailed: jest.fn(),
  reset: jest.fn()
}

export const mockDependencies = {
  react: { status: 'resolved', version: '18.0.0' },
  'react-dom': { status: 'resolved', version: '18.0.0' },
  next: { status: 'resolved', version: '13.0.0' }
}

// Default export for __mocks__ folder
export default mockRedundancyDependencyManager