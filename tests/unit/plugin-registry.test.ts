/**
 * Tests for Plugin Registry System
 */

import { PluginRegistryImpl } from '@/lib/plugin-registry'
import type { FeatureDefinition } from '@/types/plugin'

const TestComponent = () => null

describe('Plugin Registry System', () => {
  let registry: PluginRegistryImpl

  beforeEach(() => {
    registry = new PluginRegistryImpl()
    registry.clear()
  })

  describe('Registry Interface', () => {
    test('should implement all required methods', () => {
      expect(typeof registry.register).toBe('function')
      expect(typeof registry.unregister).toBe('function')
      expect(typeof registry.isRegistered).toBe('function')
      expect(typeof registry.getFeature).toBe('function')
      expect(typeof registry.getAllFeatures).toBe('function')
    })

    test('should start with empty registry', () => {
      expect(registry.getAllFeatures()).toHaveLength(0)
      expect(registry.isRegistered('test')).toBe(false)
    })
  })

  describe('Registration Mechanism', () => {
    const validFeature: FeatureDefinition = {
      id: 'test-feature',
      name: 'Test Feature',
      version: '1.0.0',
      description: 'Test feature for registry',
      component: TestComponent,
      config: { test: true },
      enabled: true,
    }

    test('should register valid feature', () => {
      registry.register(validFeature)

      expect(registry.isRegistered('test-feature')).toBe(true)
      expect(registry.getAllFeatures()).toHaveLength(1)

      const registered = registry.getFeature('test-feature')
      expect(registered).toEqual(validFeature)
    })

    test('should validate feature definition', () => {
      const invalidFeature = {
        id: '',
        name: 'Test',
        version: '1.0.0',
        description: 'Test',
        component: TestComponent,
        config: {},
        enabled: true,
      } as FeatureDefinition

      expect(() => registry.register(invalidFeature)).toThrow(
        'Invalid feature definition'
      )
    })

    test('should handle duplicate registration', () => {
      registry.register(validFeature)

      // Should not throw, but warn
      expect(() => registry.register(validFeature)).not.toThrow()
      expect(registry.getAllFeatures()).toHaveLength(1)
    })

    test('should validate dependencies', () => {
      const featureWithDeps: FeatureDefinition = {
        ...validFeature,
        id: 'dependent-feature',
        dependencies: ['non-existent'],
      }

      expect(() => registry.register(featureWithDeps)).toThrow(
        'depends on unregistered feature: non-existent'
      )
    })
  })

  describe('Registry Functionality', () => {
    test('should unregister features', () => {
      const feature: FeatureDefinition = {
        id: 'removable',
        name: 'Removable Feature',
        version: '1.0.0',
        description: 'Test',
        component: TestComponent,
        config: {},
        enabled: true,
      }

      registry.register(feature)
      expect(registry.isRegistered('removable')).toBe(true)

      registry.unregister('removable')
      expect(registry.isRegistered('removable')).toBe(false)
      expect(registry.getAllFeatures()).toHaveLength(0)
    })

    test('should prevent unregistering features with dependents', () => {
      const baseFeature: FeatureDefinition = {
        id: 'base',
        name: 'Base Feature',
        version: '1.0.0',
        description: 'Test',
        component: TestComponent,
        config: {},
        enabled: true,
      }

      const dependentFeature: FeatureDefinition = {
        id: 'dependent',
        name: 'Dependent Feature',
        version: '1.0.0',
        description: 'Test',
        component: TestComponent,
        config: {},
        dependencies: ['base'],
        enabled: true,
      }

      registry.register(baseFeature)
      registry.register(dependentFeature)

      expect(() => registry.unregister('base')).toThrow(
        'Cannot unregister feature base, it has dependents: dependent'
      )
    })

    test('should handle non-existent feature operations', () => {
      expect(() => registry.unregister('non-existent')).not.toThrow()
      expect(registry.getFeature('non-existent')).toBeUndefined()
    })
  })
})
