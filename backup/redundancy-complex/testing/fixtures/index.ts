/**
 * Test Data Fixtures Index
 * Central export point for all test data fixtures
 */

// Export schemas and types
export * from './data-schemas'

// Export datasets
export {
  smallDataset,
  mediumDataset,
  largeDataset,
  edgeCaseDataset,
  animationDataset,
  getDatasetBySize,
  generateCustomDataset
} from './mock-datasets'

// Export validation
export {
  validateDataset,
  validateSubstation,
  validateLine,
  validateRedundancyPair,
  validateSystemHealth,
  isValidDataset,
  getValidationReport
} from './data-validator'

// Re-export types for convenience
export type {
  SubstationData,
  LineData,
  RedundancyPairData,
  SystemHealthData,
  TestScenarioData,
  PowerFlowAnimationData,
  TestDatasetSchema,
  Coordinates,
  ValidationResult,
  ValidationError
} from './data-schemas'

/**
 * Fixture categories for easy access
 */
export const fixtureCategories = {
  /**
   * Unit testing fixtures - Small, focused datasets
   */
  unit: {
    small: 'small',
    minimal: 'small'
  },

  /**
   * Integration testing fixtures - Medium complexity
   */
  integration: {
    medium: 'medium',
    standard: 'medium'
  },

  /**
   * Performance testing fixtures - Large datasets
   */
  performance: {
    large: 'large',
    stress: 'large'
  },

  /**
   * Error testing fixtures - Edge cases and failures
   */
  error: {
    edge: 'edge',
    failure: 'edge'
  },

  /**
   * Animation testing fixtures - Optimized for animations
   */
  animation: {
    animation: 'animation',
    visual: 'animation'
  }
} as const

/**
 * Quick access to common test scenarios
 */
export const testScenarios = {
  /**
   * Normal operation scenario
   */
  normalOperation: {
    name: 'Normal Operation',
    description: 'Standard operation with healthy redundancy',
    datasetSize: 'small' as const,
    expectedOutcome: 'HEALTHY'
  },

  /**
   * Maintenance scenario
   */
  maintenanceMode: {
    name: 'Maintenance Mode',
    description: 'Some components under maintenance',
    datasetSize: 'medium' as const,
    expectedOutcome: 'DEGRADED'
  },

  /**
   * Emergency scenario
   */
  emergencyResponse: {
    name: 'Emergency Response',
    description: 'Multiple failures requiring emergency response',
    datasetSize: 'edge' as const,
    expectedOutcome: 'CRITICAL'
  },

  /**
   * Load testing scenario
   */
  heavyLoad: {
    name: 'Heavy Load Testing',
    description: 'High capacity utilization testing',
    datasetSize: 'large' as const,
    expectedOutcome: 'DEGRADED'
  },

  /**
   * Animation testing scenario
   */
  animationTesting: {
    name: 'Animation Performance',
    description: 'Optimized for animation testing',
    datasetSize: 'animation' as const,
    expectedOutcome: 'HEALTHY'
  }
}

/**
 * Data size specifications
 */
export const dataSizeSpecs = {
  small: {
    substations: 5,
    lines: 8,
    redundancyPairs: 2,
    description: 'Minimal dataset for unit tests'
  },
  medium: {
    substations: 20,
    lines: 40,
    redundancyPairs: 10,
    description: 'Standard dataset for integration tests'
  },
  large: {
    substations: 100,
    lines: 200,
    redundancyPairs: 50,
    description: 'Large dataset for performance tests'
  },
  edge: {
    substations: 3,
    lines: 3,
    redundancyPairs: 1,
    description: 'Edge cases and error conditions'
  },
  animation: {
    substations: 2,
    lines: 3,
    redundancyPairs: 0,
    description: 'Optimized for animation testing'
  }
}

/**
 * Helper functions for common operations
 */
export const fixtureHelpers = {
  /**
   * Get dataset by name
   */
  getDataset: (name: keyof typeof fixtureCategories.unit | 
                      keyof typeof fixtureCategories.integration |
                      keyof typeof fixtureCategories.performance |
                      keyof typeof fixtureCategories.error |
                      keyof typeof fixtureCategories.animation |
                      'small' | 'medium' | 'large' | 'edge' | 'animation') => {
    return getDatasetBySize(name as any)
  },

  /**
   * Create custom dataset with validation
   */
  createValidatedDataset: (substations: number, lines: number, pairs: number) => {
    const dataset = generateCustomDataset(substations, lines, pairs)
    const validation = validateDataset(dataset)
    
    if (!validation.valid) {
      throw new Error(`Generated dataset is invalid: ${validation.errors.map(e => e.message).join(', ')}`)
    }
    
    return dataset
  },

  /**
   * Get scenario configuration
   */
  getScenario: (scenarioName: keyof typeof testScenarios) => {
    const scenario = testScenarios[scenarioName]
    return {
      ...scenario,
      dataset: getDatasetBySize(scenario.datasetSize)
    }
  },

  /**
   * Validate all built-in datasets
   */
  validateAllDatasets: () => {
    const results = {
      small: validateDataset(getDatasetBySize('small')),
      medium: validateDataset(getDatasetBySize('medium')),
      large: validateDataset(getDatasetBySize('large')),
      edge: validateDataset(getDatasetBySize('edge')),
      animation: validateDataset(getDatasetBySize('animation'))
    }
    
    const summary = {
      allValid: Object.values(results).every(r => r.valid),
      totalErrors: Object.values(results).reduce((sum, r) => sum + r.summary.totalErrors, 0),
      totalWarnings: Object.values(results).reduce((sum, r) => sum + r.summary.totalWarnings, 0)
    }
    
    return { results, summary }
  },

  /**
   * Get random dataset for testing
   */
  getRandomDataset: () => {
    const sizes = ['small', 'medium', 'large', 'animation'] as const
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)]
    return getDatasetBySize(randomSize)
  },

  /**
   * Generate test data summary
   */
  getDatasetSummary: (dataset: any) => {
    return {
      version: dataset.version,
      name: dataset.name,
      substations: dataset.substations.length,
      lines: dataset.lines.length,
      redundancyPairs: dataset.redundancyPairs.length,
      systemHealth: dataset.systemHealth.overall,
      redundancyLevel: dataset.systemHealth.redundancyLevel,
      alerts: dataset.systemHealth.criticalAlerts + 
              dataset.systemHealth.warningAlerts + 
              dataset.systemHealth.infoAlerts
    }
  }
}

/**
 * Export everything for easy import
 */
export default {
  // Datasets
  datasets: {
    small: getDatasetBySize('small'),
    medium: getDatasetBySize('medium'),
    large: getDatasetBySize('large'),
    edge: getDatasetBySize('edge'),
    animation: getDatasetBySize('animation')
  },
  
  // Categories
  categories: fixtureCategories,
  
  // Scenarios
  scenarios: testScenarios,
  
  // Specs
  specs: dataSizeSpecs,
  
  // Helpers
  helpers: fixtureHelpers,
  
  // Functions
  getDatasetBySize,
  generateCustomDataset,
  validateDataset,
  isValidDataset
}