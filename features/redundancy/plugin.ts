/**
 * Plugin registration for 2N+1 Redundancy Feature
 */

import type { FeatureDefinition, FeatureRegistry } from '@/types/plugin'
import { redundancyConfig } from './config'
import { isRedundancyEnabled } from './utils/env'

// Feature registration contract for redundancy feature
export const redundancyFeatureDefinition: FeatureDefinition = {
  id: 'redundancy-2n1',
  name: '2N+1 Redundancy Visualization',
  version: '1.0.0',
  description: 'Professional investor-grade power redundancy visualization',
  component: () => null, // Will be replaced with actual component
  config: redundancyConfig,
  dependencies: [], // No dependencies for this feature
  enabled: isRedundancyEnabled(),
}

// Registration function
export function registerRedundancyFeature(registry: FeatureRegistry): void {
  try {
    // Validate environment before registration
    if (!isRedundancyEnabled()) {
      console.log('[RedundancyFeature] Feature disabled by environment flag')
      return
    }

    // Validate feature contract compliance
    if (!validateFeatureContract(redundancyFeatureDefinition)) {
      throw new Error('Feature contract validation failed')
    }

    // Register feature in plugin system
    registry.register(redundancyFeatureDefinition)

    console.log('[RedundancyFeature] Registered successfully')
  } catch (error) {
    console.error('[RedundancyFeature] Registration failed:', error)
    throw error
  }
}

// Contract validation function
function validateFeatureContract(feature: FeatureDefinition): boolean {
  // Required fields validation
  if (!feature.id || typeof feature.id !== 'string') {
    console.error('Feature contract: id is required and must be string')
    return false
  }

  if (!feature.name || typeof feature.name !== 'string') {
    console.error('Feature contract: name is required and must be string')
    return false
  }

  if (!feature.version || typeof feature.version !== 'string') {
    console.error('Feature contract: version is required and must be string')
    return false
  }

  if (!feature.component || typeof feature.component !== 'function') {
    console.error(
      'Feature contract: component is required and must be function'
    )
    return false
  }

  if (typeof feature.enabled !== 'boolean') {
    console.error('Feature contract: enabled is required and must be boolean')
    return false
  }

  // Configuration validation
  if (!feature.config || typeof feature.config !== 'object') {
    console.error('Feature contract: config is required and must be object')
    return false
  }

  // Redundancy-specific validations
  const config = feature.config

  if (!config.featureFlag || typeof config.featureFlag !== 'string') {
    console.error('Feature contract: config.featureFlag is required')
    return false
  }

  if (!config.colors || typeof config.colors !== 'object') {
    console.error('Feature contract: config.colors is required')
    return false
  }

  if (!config.animations || typeof config.animations !== 'object') {
    console.error('Feature contract: config.animations is required')
    return false
  }

  if (!config.substations || typeof config.substations !== 'object') {
    console.error('Feature contract: config.substations is required')
    return false
  }

  if (!Array.isArray(config.lines)) {
    console.error(
      'Feature contract: config.lines is required and must be array'
    )
    return false
  }

  if (!config.statistics || typeof config.statistics !== 'object') {
    console.error('Feature contract: config.statistics is required')
    return false
  }

  if (!config.cssPrefix || typeof config.cssPrefix !== 'string') {
    console.error('Feature contract: config.cssPrefix is required')
    return false
  }

  return true
}

// Schema definition for feature registration
export const redundancyFeatureSchema = {
  type: 'object',
  required: ['id', 'name', 'version', 'component', 'config', 'enabled'],
  properties: {
    id: {
      type: 'string',
      pattern: '^[a-z0-9-]+$',
      description: 'Unique feature identifier',
    },
    name: {
      type: 'string',
      minLength: 1,
      description: 'Human-readable feature name',
    },
    version: {
      type: 'string',
      pattern: '^\\d+\\.\\d+\\.\\d+$',
      description: 'Semantic version string',
    },
    description: {
      type: 'string',
      minLength: 1,
      description: 'Feature description',
    },
    component: {
      type: 'function',
      description: 'React component for the feature',
    },
    config: {
      type: 'object',
      required: [
        'featureFlag',
        'colors',
        'animations',
        'substations',
        'lines',
        'statistics',
        'cssPrefix',
      ],
      properties: {
        featureFlag: { type: 'string' },
        colors: { type: 'object' },
        animations: { type: 'object' },
        substations: { type: 'object' },
        lines: { type: 'array' },
        statistics: { type: 'object' },
        cssPrefix: { type: 'string' },
      },
      description: 'Feature configuration object',
    },
    dependencies: {
      type: 'array',
      items: { type: 'string' },
      description: 'Array of feature IDs this feature depends on',
    },
    enabled: {
      type: 'boolean',
      description: 'Whether the feature is enabled',
    },
  },
}

// Compliance validator using schema
export function validateContractCompliance(feature: unknown): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  try {
    if (!validateFeatureContract(feature)) {
      errors.push('Basic contract validation failed')
    }

    // Additional compliance checks with type checking
    const typedFeature = feature as Record<string, unknown>

    if (typedFeature.id !== 'redundancy-2n1') {
      errors.push('Feature ID must be "redundancy-2n1"')
    }

    const config = typedFeature.config as Record<string, unknown>
    if (
      config &&
      typeof config.cssPrefix === 'string' &&
      !config.cssPrefix.startsWith('rdx-')
    ) {
      errors.push('CSS prefix must start with "rdx-"')
    }

    if (config && config.featureFlag !== 'NEXT_PUBLIC_ENABLE_REDUNDANCY') {
      errors.push('Feature flag must be "NEXT_PUBLIC_ENABLE_REDUNDANCY"')
    }

    // Validate architecture compliance
    const dependencies = typedFeature.dependencies as string[] | undefined
    if (dependencies && dependencies.length > 0) {
      // This feature should have zero dependencies for plugin architecture compliance
      errors.push(
        'Feature must have zero dependencies for plugin architecture compliance'
      )
    }
  } catch (error) {
    errors.push(
      `Validation error: ${error instanceof Error ? error.message : String(error)}`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
