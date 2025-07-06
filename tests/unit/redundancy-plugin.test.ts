/**
 * Tests for Redundancy Feature Plugin Registration
 */

import {
  redundancyFeatureDefinition,
  validateContractCompliance,
} from '../../features/redundancy/plugin'

describe('Redundancy Feature Registration Contract', () => {
  describe('Feature Interface', () => {
    test('should have valid feature definition structure', () => {
      expect(redundancyFeatureDefinition).toHaveProperty('id')
      expect(redundancyFeatureDefinition).toHaveProperty('name')
      expect(redundancyFeatureDefinition).toHaveProperty('version')
      expect(redundancyFeatureDefinition).toHaveProperty('description')
      expect(redundancyFeatureDefinition).toHaveProperty('component')
      expect(redundancyFeatureDefinition).toHaveProperty('config')
      expect(redundancyFeatureDefinition).toHaveProperty('enabled')
    })

    test('should have correct feature metadata', () => {
      expect(redundancyFeatureDefinition.id).toBe('redundancy-2n1')
      expect(redundancyFeatureDefinition.name).toBe(
        '2N+1 Redundancy Visualization'
      )
      expect(redundancyFeatureDefinition.version).toBe('1.0.0')
      expect(typeof redundancyFeatureDefinition.component).toBe('function')
    })

    test('should have zero dependencies for plugin architecture', () => {
      expect(redundancyFeatureDefinition.dependencies).toEqual([])
    })
  })

  describe('Registration Schema', () => {
    test('should have valid configuration structure', () => {
      const config = redundancyFeatureDefinition.config

      expect(config).toHaveProperty('featureFlag')
      expect(config).toHaveProperty('colors')
      expect(config).toHaveProperty('animations')
      expect(config).toHaveProperty('substations')
      expect(config).toHaveProperty('lines')
      expect(config).toHaveProperty('statistics')
      expect(config).toHaveProperty('cssPrefix')
    })

    test('should use correct feature flag', () => {
      expect(redundancyFeatureDefinition.config.featureFlag).toBe(
        'NEXT_PUBLIC_ENABLE_REDUNDANCY'
      )
    })

    test('should use rdx- CSS prefix', () => {
      expect(redundancyFeatureDefinition.config.cssPrefix).toBe('rdx-')
    })

    test('should have required color definitions', () => {
      const colors = redundancyFeatureDefinition.config.colors
      expect(colors).toHaveProperty('active')
      expect(colors).toHaveProperty('standby')
      expect(colors).toHaveProperty('connection')
    })

    test('should have animation configuration', () => {
      const animations = redundancyFeatureDefinition.config.animations
      expect(animations).toHaveProperty('overlay')
      expect(animations).toHaveProperty('pulse')
    })
  })

  describe('Contract Compliance', () => {
    test('should pass contract compliance validation', () => {
      const result = validateContractCompliance(redundancyFeatureDefinition)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should detect invalid feature ID', () => {
      const invalidFeature = {
        ...redundancyFeatureDefinition,
        id: 'wrong-id',
      }

      const result = validateContractCompliance(invalidFeature)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Feature ID must be "redundancy-2n1"')
    })

    test('should detect invalid CSS prefix', () => {
      const invalidFeature = {
        ...redundancyFeatureDefinition,
        config: {
          ...redundancyFeatureDefinition.config,
          cssPrefix: 'wrong-',
        },
      }

      const result = validateContractCompliance(invalidFeature)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('CSS prefix must start with "rdx-"')
    })

    test('should detect invalid feature flag', () => {
      const invalidFeature = {
        ...redundancyFeatureDefinition,
        config: {
          ...redundancyFeatureDefinition.config,
          featureFlag: 'WRONG_FLAG',
        },
      }

      const result = validateContractCompliance(invalidFeature)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        'Feature flag must be "NEXT_PUBLIC_ENABLE_REDUNDANCY"'
      )
    })

    test('should detect dependencies violation', () => {
      const invalidFeature = {
        ...redundancyFeatureDefinition,
        dependencies: ['some-dependency'],
      }

      const result = validateContractCompliance(invalidFeature)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        'Feature must have zero dependencies for plugin architecture compliance'
      )
    })

    test('should handle missing required fields', () => {
      const invalidFeature = {
        id: 'test',
        // missing required fields
      }

      const result = validateContractCompliance(invalidFeature)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})
