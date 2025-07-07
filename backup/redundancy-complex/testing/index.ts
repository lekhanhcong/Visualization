/**
 * Redundancy Testing Module Index
 * Central export point for all testing utilities, mocks, and fixtures
 */

// Core testing utilities
export { default as testingUtils } from './utils'
export { 
  renderWithRedundancy, 
  createMockSubstationData, 
  createMockLineData, 
  createMockRedundancyData,
  mockDependencies,
  mockEventSystem,
  mockErrorSystem,
  mockLifecycle,
  waitForRedundancyMount,
  simulateSubstationClick,
  simulateLineHover,
  MockRedundancyProvider 
} from './utils'

// Component testing utilities
export { 
  ComponentWrapper,
  renderRedundancyComponent,
  componentTestUtils,
  eventTestUtils,
  performanceTestUtils,
  a11yTestUtils,
  visualTestUtils
} from './component-test-utils'

// Utility functions
export {
  asyncUtils,
  domUtils,
  eventUtils,
  validationUtils,
  performanceUtils,
  mathUtils,
  stringUtils,
  assertionUtils
} from './test-utils-functions'

// Mock implementations
export {
  createMockRedundancyStore,
  mockApiResponses,
  mockDOMAPIs,
  mockReactHooks,
  mockAnimationAPIs,
  mockNetworkAPIs,
  mockPerformanceAPIs,
  mockErrorHandling,
  mockDataGenerators,
  setupAllMocks
} from './mock-implementations'

// Test fixtures and scenarios
export {
  substationFixtures,
  lineFixtures,
  redundancyPairFixtures,
  systemHealthFixtures,
  testScenarios,
  animationFixtures,
  errorFixtures
} from './test-fixtures'

// Environment configuration
export {
  testEnvironmentConfigs,
  getTestEnvironmentConfig,
  environmentUtils,
  performanceSetup
} from './environment-config'

/**
 * Quick setup function for test environment
 */
export const setupTestEnvironment = (testType: string = 'unit') => {
  // Setup mocks
  const cleanup = setupAllMocks()
  
  // Get environment config
  const envConfig = getTestEnvironmentConfig(testType)
  
  // Setup performance monitoring if needed
  if (testType === 'performance') {
    performanceSetup.setup(global)
  }
  
  // Return cleanup function
  return () => {
    cleanup()
    if (testType === 'performance') {
      performanceSetup.cleanup(global)
    }
  }
}

/**
 * Common test patterns and helpers
 */
export const testPatterns = {
  /**
   * Standard component test setup
   */
  setupComponentTest: (componentName: string) => {
    const cleanup = setupTestEnvironment('unit')
    
    return {
      cleanup,
      renderComponent: renderRedundancyComponent,
      utils: componentTestUtils,
      events: eventTestUtils,
      assert: assertionUtils
    }
  },

  /**
   * Integration test setup
   */
  setupIntegrationTest: () => {
    const cleanup = setupTestEnvironment('integration')
    
    return {
      cleanup,
      store: createMockRedundancyStore(),
      api: mockApiResponses,
      scenarios: testScenarios
    }
  },

  /**
   * Performance test setup
   */
  setupPerformanceTest: () => {
    const cleanup = setupTestEnvironment('performance')
    
    return {
      cleanup,
      measure: performanceUtils,
      scenarios: testScenarios.loadTestingScenario
    }
  },

  /**
   * Accessibility test setup
   */
  setupA11yTest: () => {
    const cleanup = setupTestEnvironment('accessibility')
    
    return {
      cleanup,
      a11y: a11yTestUtils,
      render: renderRedundancyComponent
    }
  },

  /**
   * Visual regression test setup
   */
  setupVisualTest: () => {
    const cleanup = setupTestEnvironment('visual')
    
    return {
      cleanup,
      visual: visualTestUtils,
      fixtures: animationFixtures
    }
  }
}

/**
 * Test data generators for common scenarios
 */
export const quickTestData = {
  /**
   * Generate minimal test data for unit tests
   */
  minimal: () => ({
    substations: [substationFixtures.activeSubstation],
    lines: [lineFixtures.activeLine],
    redundancyPairs: [redundancyPairFixtures.activePair]
  }),

  /**
   * Generate comprehensive test data for integration tests
   */
  comprehensive: () => testScenarios.normalOperation,

  /**
   * Generate error scenario data for error handling tests
   */
  errorScenario: () => testScenarios.emergencyScenario,

  /**
   * Generate large dataset for performance tests
   */
  largeDataset: () => testScenarios.loadTestingScenario,

  /**
   * Generate custom test data
   */
  custom: (substationCount: number, lineCount: number) => 
    mockDataGenerators.generateRedundancyDataSet(substationCount, lineCount)
}

export default {
  // Utilities
  componentTestUtils,
  eventTestUtils,
  performanceTestUtils,
  a11yTestUtils,
  visualTestUtils,
  asyncUtils,
  domUtils,
  validationUtils,
  mathUtils,
  stringUtils,
  assertionUtils,

  // Mocks
  createMockRedundancyStore,
  mockApiResponses,
  mockDOMAPIs,
  mockDataGenerators,
  setupAllMocks,

  // Fixtures
  substationFixtures,
  lineFixtures,
  testScenarios,

  // Patterns
  testPatterns,
  quickTestData,

  // Setup
  setupTestEnvironment
}