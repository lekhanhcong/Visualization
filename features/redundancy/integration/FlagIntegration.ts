/**
 * Feature Flag Integration for 2N+1 Redundancy
 * Connects the plugin registry to environment flags and validates feature loading
 */

import { pluginRegistry } from '@/lib/plugin-registry'
import { redundancyLifecycle } from '../lifecycle'
import { redundancyEventBus } from '../events'
import { redundancyMountingStrategy } from '../mounting/MountingStrategy'
import { isRedundancyEnabled, validateEnvironment, getFeatureFlag } from '../utils/env'
import { redundancyConfig } from '../config'
import { redundancyDependencyManager } from '../dependencies'

export interface FlagIntegrationConfig {
  autoRegister: boolean
  autoMount: boolean
  autoEnable: boolean
  validateOnChange: boolean
  fallbackBehavior: 'disable' | 'warn' | 'ignore'
}

export interface IntegrationStatus {
  flagEnabled: boolean
  registered: boolean
  mounted: boolean
  enabled: boolean
  validated: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Feature Flag Integration Manager
 * Handles the connection between environment flags and feature lifecycle
 */
export class RedundancyFlagIntegration {
  private config: FlagIntegrationConfig
  private status: IntegrationStatus
  private flagWatcher: (() => void) | null = null
  private initialized = false

  constructor(config: Partial<FlagIntegrationConfig> = {}) {
    this.config = {
      autoRegister: true,
      autoMount: true,
      autoEnable: true,
      validateOnChange: true,
      fallbackBehavior: 'warn',
      ...config
    }

    this.status = {
      flagEnabled: false,
      registered: false,
      mounted: false,
      enabled: false,
      validated: false,
      errors: [],
      warnings: []
    }
  }

  /**
   * Initialize flag integration
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      console.warn('[FlagIntegration] Already initialized')
      return true
    }

    try {
      // Validate environment first
      const envValidation = validateEnvironment()
      if (!envValidation.valid) {
        this.status.errors.push(...envValidation.errors)
        this.handleFallback('Environment validation failed')
        return false
      }

      this.status.warnings.push(...envValidation.warnings)

      // Check flag status
      this.updateFlagStatus()

      // Initialize based on flag
      if (this.status.flagEnabled) {
        await this.initializeFeature()
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('[FlagIntegration] Feature disabled by flag')
        }
      }

      // Setup flag watching if enabled
      if (this.config.validateOnChange) {
        this.setupFlagWatcher()
      }

      this.status.validated = true
      this.initialized = true

      if (process.env.NODE_ENV === 'development') {
        console.log('[FlagIntegration] Initialized successfully', this.status)
      }

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.status.errors.push(errorMessage)
      this.handleFallback(errorMessage)
      return false
    }
  }

  /**
   * Initialize the feature components
   */
  private async initializeFeature(): Promise<void> {
    try {
      // Resolve dependencies first
      const dependenciesResolved = await redundancyDependencyManager.resolveAll()
      if (!dependenciesResolved) {
        const unresolvedRequired = redundancyDependencyManager.getUnresolvedRequired()
        if (unresolvedRequired.length > 0) {
          throw new Error(`Required dependencies failed: ${unresolvedRequired.map(d => d.id).join(', ')}`)
        }
      }

      // Auto-register if enabled
      if (this.config.autoRegister && !this.status.registered) {
        await this.registerFeature()
      }

      // Auto-mount if enabled
      if (this.config.autoMount && !this.status.mounted) {
        await this.mountFeature()
      }

      // Auto-enable if enabled
      if (this.config.autoEnable && !this.status.enabled) {
        await this.enableFeature()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Feature initialization failed'
      this.status.errors.push(errorMessage)
      throw error
    }
  }

  /**
   * Register the feature in plugin registry
   */
  private async registerFeature(): Promise<void> {
    try {
      if (pluginRegistry.isRegistered('redundancy-2n1')) {
        this.status.registered = true
        return
      }

      // Dynamic import to avoid circular dependencies
      const { registerRedundancyFeature } = await import('../register')
      const success = registerRedundancyFeature()
      
      if (!success) {
        throw new Error('Feature registration failed')
      }

      this.status.registered = true
      
      // Emit registration event
      redundancyEventBus.emit('redundancy:state:initialized', {
        timestamp: Date.now()
      })

      if (process.env.NODE_ENV === 'development') {
        console.log('[FlagIntegration] Feature registered')
      }
    } catch (error) {
      const errorMessage = `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      this.status.errors.push(errorMessage)
      throw new Error(errorMessage)
    }
  }

  /**
   * Mount the feature mounting points
   */
  private async mountFeature(): Promise<void> {
    try {
      const success = await redundancyMountingStrategy.initialize()
      
      if (!success) {
        throw new Error('Mounting strategy initialization failed')
      }

      this.status.mounted = true

      if (process.env.NODE_ENV === 'development') {
        console.log('[FlagIntegration] Feature mounted')
      }
    } catch (error) {
      const errorMessage = `Mounting failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      this.status.errors.push(errorMessage)
      throw new Error(errorMessage)
    }
  }

  /**
   * Enable the feature lifecycle
   */
  private async enableFeature(): Promise<void> {
    try {
      if (!redundancyLifecycle.isMounted()) {
        await redundancyLifecycle.onMount()
      }

      if (!redundancyLifecycle.isEnabled()) {
        await redundancyLifecycle.onEnable()
      }

      this.status.enabled = true

      if (process.env.NODE_ENV === 'development') {
        console.log('[FlagIntegration] Feature enabled')
      }
    } catch (error) {
      const errorMessage = `Enable failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      this.status.errors.push(errorMessage)
      throw new Error(errorMessage)
    }
  }

  /**
   * Update flag status from environment
   */
  private updateFlagStatus(): void {
    this.status.flagEnabled = isRedundancyEnabled()
  }

  /**
   * Setup flag change watcher
   */
  private setupFlagWatcher(): void {
    if (typeof window === 'undefined') return

    // Watch for environment changes (mainly for development/testing)
    let previousFlag = this.status.flagEnabled

    const checkFlag = () => {
      const currentFlag = isRedundancyEnabled()
      
      if (currentFlag !== previousFlag) {
        this.handleFlagChange(previousFlag, currentFlag)
        previousFlag = currentFlag
      }
    }

    // Check every 5 seconds in development
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(checkFlag, 5000)
      
      this.flagWatcher = () => {
        clearInterval(interval)
      }
    }
  }

  /**
   * Handle flag change events
   */
  private async handleFlagChange(oldValue: boolean, newValue: boolean): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[FlagIntegration] Flag changed: ${oldValue} -> ${newValue}`)
    }

    this.status.flagEnabled = newValue

    try {
      if (newValue && !oldValue) {
        // Feature was enabled
        await this.initializeFeature()
        
        redundancyEventBus.emit('redundancy:state:changed', {
          state: {
            isActive: true,
            selectedSubstation: null,
            selectedLine: null,
            isPanelOpen: false,
            animationProgress: 0
          }
        })
      } else if (!newValue && oldValue) {
        // Feature was disabled
        await this.disableFeature()
        
        redundancyEventBus.emit('redundancy:state:changed', {
          state: {
            isActive: false,
            selectedSubstation: null,
            selectedLine: null,
            isPanelOpen: false,
            animationProgress: 0
          }
        })
      }
    } catch (error) {
      const errorMessage = `Flag change handling failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      this.status.errors.push(errorMessage)
      this.handleFallback(errorMessage)
    }
  }

  /**
   * Disable the feature
   */
  private async disableFeature(): Promise<void> {
    try {
      // Disable lifecycle
      if (redundancyLifecycle.isEnabled()) {
        await redundancyLifecycle.onDisable()
      }

      // Unmount if needed
      if (redundancyLifecycle.isMounted()) {
        await redundancyLifecycle.onUnmount()
      }

      // Unmount strategy
      redundancyMountingStrategy.unmountAll()

      // Unregister if needed
      if (pluginRegistry.isRegistered('redundancy-2n1')) {
        const { unregisterRedundancyFeature } = await import('../register')
        unregisterRedundancyFeature()
      }

      this.status.registered = false
      this.status.mounted = false
      this.status.enabled = false

      if (process.env.NODE_ENV === 'development') {
        console.log('[FlagIntegration] Feature disabled')
      }
    } catch (error) {
      const errorMessage = `Disable failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      this.status.errors.push(errorMessage)
      throw new Error(errorMessage)
    }
  }

  /**
   * Handle fallback behavior
   */
  private handleFallback(errorMessage: string): void {
    switch (this.config.fallbackBehavior) {
      case 'disable':
        this.disableFeature().catch(console.error)
        break
      case 'warn':
        console.warn(`[FlagIntegration] ${errorMessage}`)
        break
      case 'ignore':
        // Do nothing
        break
    }
  }

  /**
   * Get current integration status
   */
  getStatus(): IntegrationStatus {
    return { ...this.status }
  }

  /**
   * Get feature flag value
   */
  getFlagValue(): string | undefined {
    return getFeatureFlag()
  }

  /**
   * Validate current state
   */
  validate(): {
    valid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate environment
    const envValidation = validateEnvironment()
    errors.push(...envValidation.errors)
    warnings.push(...envValidation.warnings)

    // Check flag consistency
    const currentFlag = isRedundancyEnabled()
    if (currentFlag !== this.status.flagEnabled) {
      warnings.push('Flag status inconsistent with cached value')
    }

    // Check feature state consistency
    if (this.status.flagEnabled) {
      if (this.config.autoRegister && !this.status.registered) {
        errors.push('Feature should be registered but is not')
      }
      if (this.config.autoMount && !this.status.mounted) {
        errors.push('Feature should be mounted but is not')
      }
      if (this.config.autoEnable && !this.status.enabled) {
        errors.push('Feature should be enabled but is not')
      }
    } else {
      if (this.status.registered || this.status.mounted || this.status.enabled) {
        warnings.push('Feature components active but flag is disabled')
      }
    }

    return {
      valid: errors.length === 0,
      errors: [...this.status.errors, ...errors],
      warnings: [...this.status.warnings, ...warnings]
    }
  }

  /**
   * Force refresh flag status and reinitialize
   */
  async refresh(): Promise<boolean> {
    this.updateFlagStatus()
    
    if (this.status.flagEnabled) {
      try {
        await this.initializeFeature()
        return true
      } catch (error) {
        console.error('[FlagIntegration] Refresh failed:', error)
        return false
      }
    } else {
      await this.disableFeature()
      return true
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<FlagIntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Cleanup and destroy
   */
  destroy(): void {
    if (this.flagWatcher) {
      this.flagWatcher()
      this.flagWatcher = null
    }

    this.disableFeature().catch(console.error)
    
    this.initialized = false
    this.status = {
      flagEnabled: false,
      registered: false,
      mounted: false,
      enabled: false,
      validated: false,
      errors: [],
      warnings: []
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[FlagIntegration] Destroyed')
    }
  }
}

// Default configuration
export const defaultFlagIntegrationConfig: FlagIntegrationConfig = {
  autoRegister: true,
  autoMount: true,
  autoEnable: true,
  validateOnChange: true,
  fallbackBehavior: 'warn'
}

// Singleton instance
export const redundancyFlagIntegration = new RedundancyFlagIntegration(defaultFlagIntegrationConfig)