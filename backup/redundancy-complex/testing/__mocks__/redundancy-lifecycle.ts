/**
 * Mock Redundancy Lifecycle
 * Mock implementations for testing redundancy lifecycle
 */

export const mockRedundancyLifecycle = {
  onMount: jest.fn(() => Promise.resolve()),
  onUnmount: jest.fn(() => Promise.resolve()),
  onEnable: jest.fn(() => Promise.resolve()),
  onDisable: jest.fn(() => Promise.resolve()),
  isMounted: jest.fn(() => true),
  isEnabled: jest.fn(() => true),
  getState: jest.fn(() => ({
    mounted: true,
    enabled: true,
    initialized: true
  })),
  reset: jest.fn()
}

export const mockLifecycleCallbacks = {
  onMount: jest.fn(),
  onUnmount: jest.fn(),
  onEnable: jest.fn(),
  onDisable: jest.fn(),
  onError: jest.fn(),
  onStateChange: jest.fn()
}

export default mockRedundancyLifecycle