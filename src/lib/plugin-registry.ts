/**
 * Plugin Registry System for Feature Management
 * Enables zero-modification plugin architecture
 */

import type {
  FeatureDefinition,
  FeatureRegistry,
  PluginError,
} from '@/types/plugin'

class PluginRegistryImpl implements FeatureRegistry {
  private features = new Map<string, FeatureDefinition>()
  private initialized = false

  constructor() {
    this.init()
  }

  private init(): void {
    if (this.initialized) return

    // Initialize plugin system
    this.setupErrorHandling()
    this.initialized = true

    if (process.env.NODE_ENV === 'development') {
      console.log('[PluginRegistry] Initialized')
    }
  }

  private setupErrorHandling(): void {
    // Global error handling for plugin errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        if (event.error?.featureId) {
          this.handlePluginError(event.error as PluginError)
        }
      })
    }
  }

  private handlePluginError(error: PluginError): void {
    console.error(
      `[PluginRegistry] Error in feature ${error.featureId}:`,
      error
    )

    // Disable feature on critical errors
    if (!error.recoverable && error.featureId) {
      const feature = this.features.get(error.featureId)
      if (feature) {
        feature.enabled = false
        console.warn(
          `[PluginRegistry] Disabled feature ${error.featureId} due to critical error`
        )
      }
    }
  }

  register(feature: FeatureDefinition): void {
    // Validate feature definition
    if (!this.validateFeature(feature)) {
      throw new Error(`Invalid feature definition: ${feature.id}`)
    }

    // Check for duplicate registration
    if (this.features.has(feature.id)) {
      console.warn(
        `[PluginRegistry] Feature ${feature.id} already registered, updating...`
      )
    }

    // Validate dependencies
    if (feature.dependencies) {
      for (const depId of feature.dependencies) {
        if (!this.features.has(depId)) {
          throw new Error(
            `Feature ${feature.id} depends on unregistered feature: ${depId}`
          )
        }
      }
    }

    // Register feature
    this.features.set(feature.id, { ...feature })

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[PluginRegistry] Registered feature: ${feature.id} v${feature.version}`
      )
    }
  }

  unregister(featureId: string): void {
    if (!this.features.has(featureId)) {
      console.warn(
        `[PluginRegistry] Attempted to unregister non-existent feature: ${featureId}`
      )
      return
    }

    // Check if other features depend on this one
    const dependents = this.getDependents(featureId)
    if (dependents.length > 0) {
      throw new Error(
        `Cannot unregister feature ${featureId}, it has dependents: ${dependents.join(', ')}`
      )
    }

    this.features.delete(featureId)

    if (process.env.NODE_ENV === 'development') {
      console.log(`[PluginRegistry] Unregistered feature: ${featureId}`)
    }
  }

  isRegistered(featureId: string): boolean {
    return this.features.has(featureId)
  }

  getFeature(featureId: string): FeatureDefinition | undefined {
    return this.features.get(featureId)
  }

  getAllFeatures(): FeatureDefinition[] {
    return Array.from(this.features.values())
  }

  getEnabledFeatures(): FeatureDefinition[] {
    return this.getAllFeatures().filter((feature) => feature.enabled)
  }

  enableFeature(featureId: string): void {
    const feature = this.features.get(featureId)
    if (!feature) {
      throw new Error(`Feature not found: ${featureId}`)
    }

    // Check dependencies are enabled
    if (feature.dependencies) {
      for (const depId of feature.dependencies) {
        const dep = this.features.get(depId)
        if (!dep?.enabled) {
          throw new Error(
            `Cannot enable ${featureId}, dependency ${depId} is not enabled`
          )
        }
      }
    }

    feature.enabled = true

    if (process.env.NODE_ENV === 'development') {
      console.log(`[PluginRegistry] Enabled feature: ${featureId}`)
    }
  }

  disableFeature(featureId: string): void {
    const feature = this.features.get(featureId)
    if (!feature) {
      throw new Error(`Feature not found: ${featureId}`)
    }

    // Disable dependents first
    const dependents = this.getDependents(featureId)
    for (const depId of dependents) {
      this.disableFeature(depId)
    }

    feature.enabled = false

    if (process.env.NODE_ENV === 'development') {
      console.log(`[PluginRegistry] Disabled feature: ${featureId}`)
    }
  }

  private validateFeature(feature: FeatureDefinition): boolean {
    // Required fields
    if (!feature.id || typeof feature.id !== 'string') return false
    if (!feature.name || typeof feature.name !== 'string') return false
    if (!feature.version || typeof feature.version !== 'string') return false
    if (!feature.component || typeof feature.component !== 'function')
      return false

    // Optional fields validation
    if (feature.dependencies && !Array.isArray(feature.dependencies))
      return false
    if (typeof feature.enabled !== 'boolean') return false

    return true
  }

  private getDependents(featureId: string): string[] {
    const dependents: string[] = []

    for (const [id, feature] of this.features) {
      if (feature.dependencies?.includes(featureId)) {
        dependents.push(id)
      }
    }

    return dependents
  }

  // Development/debugging methods
  getRegistryState(): Record<string, unknown> {
    return {
      totalFeatures: this.features.size,
      enabledFeatures: this.getEnabledFeatures().length,
      features: Object.fromEntries(
        Array.from(this.features.entries()).map(([id, feature]) => [
          id,
          {
            name: feature.name,
            version: feature.version,
            enabled: feature.enabled,
            dependencies: feature.dependencies || [],
          },
        ])
      ),
    }
  }

  clear(): void {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[PluginRegistry] clear() should only be used in tests')
    }
    this.features.clear()
  }
}

// Singleton instance
export const pluginRegistry = new PluginRegistryImpl()

// Export for testing
export { PluginRegistryImpl }
