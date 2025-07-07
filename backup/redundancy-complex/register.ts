/**
 * Feature registration entry point for 2N+1 Redundancy
 * This file should be imported where features are registered
 */

import { pluginRegistry } from '@/lib/plugin-registry'
import { redundancyFeatureDefinition } from './plugin'
import { redundancyLifecycle } from './lifecycle'
import { redundancyEventBus } from './events'
import { isRedundancyEnabled } from './utils/env'
import type { FeatureDefinition } from '@/types/plugin'

// Import the actual RedundancyFeature component
import { RedundancyFeature } from './RedundancyFeature'

// Complete feature definition with lifecycle
const completeFeatureDefinition: FeatureDefinition = {
  ...redundancyFeatureDefinition,
  component: RedundancyFeature,
  // Add lifecycle hooks to the definition
  lifecycle: redundancyLifecycle,
}

/**
 * Register the redundancy feature in the plugin system
 * This should be called during application initialization
 */
export function registerRedundancyFeature(): boolean {
  try {
    // Check if feature is enabled
    if (!isRedundancyEnabled()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[RedundancyFeature] Feature disabled by environment flag')
      }
      return false
    }

    // Check if already registered
    if (pluginRegistry.isRegistered('redundancy-2n1')) {
      console.warn('[RedundancyFeature] Feature already registered')
      return true
    }

    // Register the feature
    pluginRegistry.register(completeFeatureDefinition)

    // Setup global event handling
    setupGlobalHandlers()

    if (process.env.NODE_ENV === 'development') {
      console.log('[RedundancyFeature] Successfully registered')
      console.log('[RedundancyFeature] Config:', completeFeatureDefinition.config)
    }

    return true
  } catch (error) {
    console.error('[RedundancyFeature] Registration failed:', error)
    
    // Emit error event
    redundancyEventBus.emit('redundancy:state:error', {
      error: error instanceof Error ? error : new Error('Unknown registration error'),
      context: 'registration'
    })
    
    return false
  }
}

/**
 * Unregister the redundancy feature
 * This should be called during cleanup or when disabling the feature
 */
export function unregisterRedundancyFeature(): boolean {
  try {
    // Check if registered
    if (!pluginRegistry.isRegistered('redundancy-2n1')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[RedundancyFeature] Feature not registered, skipping unregister')
      }
      return true
    }

    // Cleanup lifecycle if mounted
    if (redundancyLifecycle.isMounted()) {
      redundancyLifecycle.onUnmount()
    }

    // Clear event bus
    redundancyEventBus.clearAll()

    // Unregister from plugin system
    pluginRegistry.unregister('redundancy-2n1')

    // Remove global handlers
    removeGlobalHandlers()

    if (process.env.NODE_ENV === 'development') {
      console.log('[RedundancyFeature] Successfully unregistered')
    }

    return true
  } catch (error) {
    console.error('[RedundancyFeature] Unregistration failed:', error)
    return false
  }
}

/**
 * Get the current registration status
 */
export function getRedundancyFeatureStatus() {
  return {
    registered: pluginRegistry.isRegistered('redundancy-2n1'),
    enabled: isRedundancyEnabled(),
    mounted: redundancyLifecycle.isMounted(),
    active: redundancyLifecycle.isEnabled(),
    eventBusActive: redundancyEventBus.getListenerCount() > 0,
    feature: pluginRegistry.getFeature('redundancy-2n1'),
  }
}

// Setup global handlers
function setupGlobalHandlers(): void {
  if (typeof window !== 'undefined') {
    // Handle visibility changes
    const handleVisibilityChange = () => {
      redundancyEventBus.emit('redundancy:visibility:changed', {
        visible: !document.hidden
      })
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Store cleanup function
    (window as any).__redundancyCleanup = () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }
}

// Remove global handlers
function removeGlobalHandlers(): void {
  if (typeof window !== 'undefined' && (window as any).__redundancyCleanup) {
    (window as any).__redundancyCleanup()
    delete (window as any).__redundancyCleanup
  }
}

// Auto-register if environment variable is set and in browser
// Skip auto-registration in test environment
if (typeof window !== 'undefined' && isRedundancyEnabled() && process.env.NODE_ENV !== 'test') {
  // Delay registration to ensure plugin registry is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      registerRedundancyFeature()
    })
  } else {
    // DOM already loaded
    setTimeout(() => {
      registerRedundancyFeature()
    }, 0)
  }
}