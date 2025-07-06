/**
 * Plugin Registration System for 2N+1 Redundancy Feature
 * Handles feature registration, lifecycle management, and integration
 */

import { FeatureRegistry, FeatureDefinition, PluginError } from './types';

// Global feature registry
class RedundancyFeatureRegistry implements FeatureRegistry {
  private features = new Map<string, FeatureDefinition>();
  private initialized = false;

  register(feature: FeatureDefinition): void {
    try {
      // Validate feature definition
      this.validateFeature(feature);
      
      // Check for conflicts
      if (this.features.has(feature.id)) {
        throw new PluginError(`Feature ${feature.id} is already registered`);
      }
      
      // Register feature
      this.features.set(feature.id, feature);
      
      console.log(`[RedundancyRegistry] Registered feature: ${feature.id}`);
    } catch (error) {
      const pluginError = error instanceof PluginError ? error : new PluginError(
        `Failed to register feature ${feature.id}: ${error.message}`
      );
      pluginError.featureId = feature.id;
      pluginError.phase = 'registration';
      throw pluginError;
    }
  }

  unregister(featureId: string): void {
    try {
      if (!this.features.has(featureId)) {
        throw new PluginError(`Feature ${featureId} is not registered`);
      }
      
      this.features.delete(featureId);
      console.log(`[RedundancyRegistry] Unregistered feature: ${featureId}`);
    } catch (error) {
      const pluginError = error instanceof PluginError ? error : new PluginError(
        `Failed to unregister feature ${featureId}: ${error.message}`
      );
      pluginError.featureId = featureId;
      pluginError.phase = 'unregistration';
      throw pluginError;
    }
  }

  isRegistered(featureId: string): boolean {
    return this.features.has(featureId);
  }

  getFeature(featureId: string): FeatureDefinition | undefined {
    return this.features.get(featureId);
  }

  getAllFeatures(): FeatureDefinition[] {
    return Array.from(this.features.values());
  }

  private validateFeature(feature: FeatureDefinition): void {
    if (!feature.id) {
      throw new PluginError('Feature ID is required');
    }
    
    if (!feature.name) {
      throw new PluginError('Feature name is required');
    }
    
    if (!feature.version) {
      throw new PluginError('Feature version is required');
    }
    
    if (!feature.component) {
      throw new PluginError('Feature component is required');
    }
    
    // Validate ID format
    if (!/^[a-z0-9-]+$/.test(feature.id)) {
      throw new PluginError('Feature ID must contain only lowercase letters, numbers, and hyphens');
    }
    
    // Validate version format (semver)
    if (!/^\d+\.\d+\.\d+$/.test(feature.version)) {
      throw new PluginError('Feature version must follow semantic versioning (x.y.z)');
    }
  }
}

// Create global registry instance
export const featureRegistry = new RedundancyFeatureRegistry();

// Feature registration helper
export function registerRedundancyFeature(): void {
  const featureFlag = process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY;
  
  if (featureFlag !== 'true') {
    console.log('[RedundancyFeature] Feature disabled by flag');
    return;
  }

  try {
    // Lazy import to avoid loading when disabled
    import('./index').then(({ redundancyFeatureDefinition }) => {
      featureRegistry.register(redundancyFeatureDefinition);
      console.log('[RedundancyFeature] Successfully registered');
    }).catch((error) => {
      console.error('[RedundancyFeature] Failed to load feature:', error);
    });
  } catch (error) {
    console.error('[RedundancyFeature] Registration failed:', error);
  }
}

// Feature unregistration helper
export function unregisterRedundancyFeature(): void {
  try {
    featureRegistry.unregister('redundancy-2n1');
    console.log('[RedundancyFeature] Successfully unregistered');
  } catch (error) {
    console.error('[RedundancyFeature] Unregistration failed:', error);
  }
}

// Plugin lifecycle management
export class RedundancyPlugin {
  private isInitialized = false;
  private isEnabled = false;

  constructor() {
    this.isEnabled = process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY === 'true';
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (!this.isEnabled) {
      console.log('[RedundancyPlugin] Plugin disabled by configuration');
      return;
    }

    try {
      registerRedundancyFeature();
      this.isInitialized = true;
      console.log('[RedundancyPlugin] Plugin initialized successfully');
    } catch (error) {
      console.error('[RedundancyPlugin] Initialization failed:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      unregisterRedundancyFeature();
      this.isInitialized = false;
      console.log('[RedundancyPlugin] Plugin cleaned up successfully');
    } catch (error) {
      console.error('[RedundancyPlugin] Cleanup failed:', error);
      throw error;
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.isEnabled;
  }
}

// Default plugin instance
export const redundancyPlugin = new RedundancyPlugin();

// Auto-registration on module load
if (typeof window !== 'undefined') {
  // Client-side auto-registration
  redundancyPlugin.initialize().catch(console.error);
}

// Error boundary for plugin errors
export class PluginErrorBoundary extends Error {
  constructor(
    message: string,
    public featureId?: string,
    public phase?: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'PluginError';
  }
}

// Plugin health check
export function checkPluginHealth(): {
  isHealthy: boolean;
  features: number;
  errors: string[];
} {
  const errors: string[] = [];
  let isHealthy = true;

  try {
    const features = featureRegistry.getAllFeatures();
    
    // Check if any features failed to load
    if (redundancyPlugin.isReady() && features.length === 0) {
      errors.push('No features registered despite plugin being ready');
      isHealthy = false;
    }
    
    // Check feature flag consistency
    const featureFlag = process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY === 'true';
    if (featureFlag !== redundancyPlugin.isReady()) {
      errors.push('Feature flag and plugin state mismatch');
      isHealthy = false;
    }

    return {
      isHealthy,
      features: features.length,
      errors
    };
  } catch (error) {
    errors.push(`Health check failed: ${error.message}`);
    return {
      isHealthy: false,
      features: 0,
      errors
    };
  }
}