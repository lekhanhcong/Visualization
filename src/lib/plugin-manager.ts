/**
 * Plugin Manager - Central management for all application plugins
 * Provides monitoring, status checking, and plugin lifecycle management
 */

import { pluginRegistry } from './plugin-registry'
import type { FeatureDefinition } from '@/types/plugin'

export interface PluginStatus {
  id: string
  name: string
  version: string
  enabled: boolean
  registered: boolean
  lastError?: Error
  registrationTime?: number
}

export interface PluginManagerState {
  plugins: Record<string, PluginStatus>
  totalPlugins: number
  enabledPlugins: number
  lastUpdate: number
}

class PluginManagerImpl {
  private state: PluginManagerState = {
    plugins: {},
    totalPlugins: 0,
    enabledPlugins: 0,
    lastUpdate: Date.now()
  }

  private listeners = new Set<(state: PluginManagerState) => void>()

  constructor() {
    this.init()
  }

  private init(): void {
    if (typeof window !== 'undefined') {
      // Monitor plugin registry changes
      this.updateState()
      
      // Set up periodic health checks
      setInterval(() => {
        this.updateState()
      }, 5000)

      if (process.env.NODE_ENV === 'development') {
        console.log('[PluginManager] Initialized')
      }
    }
  }

  private updateState(): void {
    const allFeatures = pluginRegistry.getAllFeatures()
    const plugins: Record<string, PluginStatus> = {}

    for (const feature of allFeatures) {
      plugins[feature.id] = {
        id: feature.id,
        name: feature.name,
        version: feature.version,
        enabled: feature.enabled,
        registered: true,
        registrationTime: Date.now()
      }
    }

    this.state = {
      plugins,
      totalPlugins: allFeatures.length,
      enabledPlugins: allFeatures.filter(f => f.enabled).length,
      lastUpdate: Date.now()
    }

    this.notifyListeners()
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.state)
      } catch (error) {
        console.error('[PluginManager] Listener error:', error)
      }
    })
  }

  /**
   * Get current plugin manager state
   */
  getState(): PluginManagerState {
    return { ...this.state }
  }

  /**
   * Get status of a specific plugin
   */
  getPluginStatus(pluginId: string): PluginStatus | undefined {
    return this.state.plugins[pluginId]
  }

  /**
   * Check if a plugin is ready (registered and enabled)
   */
  isPluginReady(pluginId: string): boolean {
    const status = this.getPluginStatus(pluginId)
    return status?.registered === true && status?.enabled === true
  }

  /**
   * Get all plugin statuses
   */
  getAllPluginStatuses(): PluginStatus[] {
    return Object.values(this.state.plugins)
  }

  /**
   * Register a new plugin
   */
  async registerPlugin(feature: FeatureDefinition): Promise<boolean> {
    try {
      pluginRegistry.register(feature)
      this.updateState()
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[PluginManager] Successfully registered plugin: ${feature.id}`)
      }
      
      return true
    } catch (error) {
      console.error(`[PluginManager] Failed to register plugin ${feature.id}:`, error)
      
      // Update plugin status with error
      this.state.plugins[feature.id] = {
        id: feature.id,
        name: feature.name,
        version: feature.version,
        enabled: false,
        registered: false,
        lastError: error instanceof Error ? error : new Error('Unknown error')
      }
      
      this.notifyListeners()
      return false
    }
  }

  /**
   * Unregister a plugin
   */
  async unregisterPlugin(pluginId: string): Promise<boolean> {
    try {
      pluginRegistry.unregister(pluginId)
      delete this.state.plugins[pluginId]
      this.updateState()
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[PluginManager] Successfully unregistered plugin: ${pluginId}`)
      }
      
      return true
    } catch (error) {
      console.error(`[PluginManager] Failed to unregister plugin ${pluginId}:`, error)
      return false
    }
  }

  /**
   * Enable a plugin
   */
  async enablePlugin(pluginId: string): Promise<boolean> {
    try {
      pluginRegistry.enableFeature(pluginId)
      this.updateState()
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[PluginManager] Successfully enabled plugin: ${pluginId}`)
      }
      
      return true
    } catch (error) {
      console.error(`[PluginManager] Failed to enable plugin ${pluginId}:`, error)
      return false
    }
  }

  /**
   * Disable a plugin
   */
  async disablePlugin(pluginId: string): Promise<boolean> {
    try {
      pluginRegistry.disableFeature(pluginId)
      this.updateState()
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[PluginManager] Successfully disabled plugin: ${pluginId}`)
      }
      
      return true
    } catch (error) {
      console.error(`[PluginManager] Failed to disable plugin ${pluginId}:`, error)
      return false
    }
  }

  /**
   * Subscribe to plugin manager state changes
   */
  subscribe(listener: (state: PluginManagerState) => void): () => void {
    this.listeners.add(listener)
    
    // Call immediately with current state
    listener(this.state)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Get detailed health report
   */
  getHealthReport(): {
    healthy: boolean
    issues: string[]
    summary: {
      totalPlugins: number
      enabledPlugins: number
      disabledPlugins: number
      erroredPlugins: number
    }
    details: PluginStatus[]
  } {
    const statuses = this.getAllPluginStatuses()
    const issues: string[] = []
    
    // Check for issues
    const erroredPlugins = statuses.filter(s => s.lastError)
    const disabledPlugins = statuses.filter(s => s.registered && !s.enabled)
    
    if (erroredPlugins.length > 0) {
      issues.push(`${erroredPlugins.length} plugin(s) have errors`)
    }
    
    if (disabledPlugins.length > 0) {
      issues.push(`${disabledPlugins.length} plugin(s) are disabled`)
    }

    return {
      healthy: issues.length === 0,
      issues,
      summary: {
        totalPlugins: this.state.totalPlugins,
        enabledPlugins: this.state.enabledPlugins,
        disabledPlugins: disabledPlugins.length,
        erroredPlugins: erroredPlugins.length
      },
      details: statuses
    }
  }

  /**
   * Development helper: Print status to console
   */
  printStatus(): void {
    if (process.env.NODE_ENV === 'development') {
      const report = this.getHealthReport()
      console.table(report.details)
      console.log('[PluginManager] Health Report:', report.summary)
      if (report.issues.length > 0) {
        console.warn('[PluginManager] Issues:', report.issues)
      }
    }
  }
}

// Singleton instance
export const pluginManager = new PluginManagerImpl()

// Export for development/debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as unknown as { __pluginManager: typeof pluginManager }).__pluginManager = pluginManager
}

export default pluginManager