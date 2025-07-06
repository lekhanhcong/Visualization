/**
 * Feature Lifecycle Management for 2N+1 Redundancy
 * Handles initialization, cleanup, and state transitions
 */

import type { FeatureLifecycle, PluginError } from '@/types/plugin'
import { redundancyConfig } from './config'

export class RedundancyLifecycleManager implements FeatureLifecycle {
  private mounted = false
  private enabled = false
  private initialized = false
  private resources: Set<() => void> = new Set()

  constructor() {
    this.setupErrorHandling()
  }

  async onMount(): Promise<void> {
    if (this.mounted) {
      console.warn('[RedundancyLifecycle] Already mounted')
      return
    }

    try {
      await this.initializeResources()
      await this.setupEventListeners()
      await this.loadStylesheet()
      
      this.mounted = true
      this.initialized = true

      if (process.env.NODE_ENV === 'development') {
        console.log('[RedundancyLifecycle] Feature mounted successfully')
      }
    } catch (error) {
      this.handleError(error, 'mount')
      throw error
    }
  }

  async onUnmount(): Promise<void> {
    if (!this.mounted) {
      console.warn('[RedundancyLifecycle] Not mounted, skipping unmount')
      return
    }

    try {
      await this.cleanup()
      this.mounted = false
      this.enabled = false
      this.initialized = false

      if (process.env.NODE_ENV === 'development') {
        console.log('[RedundancyLifecycle] Feature unmounted successfully')
      }
    } catch (error) {
      this.handleError(error, 'unmount')
      throw error
    }
  }

  async onEnable(): Promise<void> {
    if (!this.mounted) {
      throw new Error('Cannot enable feature that is not mounted')
    }

    if (this.enabled) {
      console.warn('[RedundancyLifecycle] Already enabled')
      return
    }

    try {
      this.enabled = true
      await this.activateFeature()

      if (process.env.NODE_ENV === 'development') {
        console.log('[RedundancyLifecycle] Feature enabled successfully')
      }
    } catch (error) {
      this.enabled = false
      this.handleError(error, 'enable')
      throw error
    }
  }

  async onDisable(): Promise<void> {
    if (!this.enabled) {
      console.warn('[RedundancyLifecycle] Already disabled')
      return
    }

    try {
      await this.deactivateFeature()
      this.enabled = false

      if (process.env.NODE_ENV === 'development') {
        console.log('[RedundancyLifecycle] Feature disabled successfully')
      }
    } catch (error) {
      this.handleError(error, 'disable')
      throw error
    }
  }

  onError(error: PluginError): void {
    console.error('[RedundancyLifecycle] Plugin error:', error)
    
    // Attempt recovery for recoverable errors
    if (error.recoverable) {
      this.attemptRecovery(error)
    } else {
      // Force disable for critical errors
      this.forceDisable()
    }
  }

  // Public state getters
  isMounted(): boolean {
    return this.mounted
  }

  isEnabled(): boolean {
    return this.enabled
  }

  isInitialized(): boolean {
    return this.initialized
  }

  // Resource management
  private async initializeResources(): Promise<void> {
    // Initialize any required resources
    // This will be expanded when components are implemented
    
    // Validate configuration
    if (!redundancyConfig) {
      throw new Error('Redundancy configuration not found')
    }

    // Validate environment
    const envFlag = process.env[redundancyConfig.featureFlag]
    if (envFlag === undefined) {
      throw new Error(`Environment flag ${redundancyConfig.featureFlag} not found`)
    }
  }

  private async setupEventListeners(): Promise<void> {
    // Setup event listeners for the feature
    const handleVisibilityChange = () => {
      if (document.hidden && this.enabled) {
        // Pause animations when tab is hidden
        this.pauseAnimations()
      } else if (!document.hidden && this.enabled) {
        // Resume animations when tab is visible
        this.resumeAnimations()
      }
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange)
      
      // Track cleanup function
      this.resources.add(() => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      })
    }
  }

  private async loadStylesheet(): Promise<void> {
    // CSS will be loaded via component imports
    // This method is a placeholder for future stylesheet loading logic
    if (process.env.NODE_ENV === 'development') {
      console.log('[RedundancyLifecycle] Stylesheet loading placeholder')
    }
  }

  private async activateFeature(): Promise<void> {
    // Activate feature-specific functionality
    this.resumeAnimations()
    
    // Emit activation event
    this.emitLifecycleEvent('activated')
  }

  private async deactivateFeature(): Promise<void> {
    // Deactivate feature-specific functionality
    this.pauseAnimations()
    
    // Emit deactivation event
    this.emitLifecycleEvent('deactivated')
  }

  private async cleanup(): Promise<void> {
    // Execute all cleanup functions
    for (const cleanup of this.resources) {
      try {
        cleanup()
      } catch (error) {
        console.error('[RedundancyLifecycle] Cleanup error:', error)
      }
    }
    
    this.resources.clear()
    
    // Remove any DOM elements
    this.removeDOMElements()
  }

  private setupErrorHandling(): void {
    // Setup feature-specific error handling
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        if (event.reason?.featureId === 'redundancy-2n1') {
          this.handleError(event.reason, 'unhandled')
        }
      })
    }
  }

  private handleError(error: unknown, phase: string): void {
    const pluginError: PluginError = error instanceof Error 
      ? Object.assign(error, { 
          featureId: 'redundancy-2n1', 
          phase,
          recoverable: phase !== 'mount' 
        })
      : new Error(`Unknown error in ${phase}`)

    this.onError(pluginError)
  }

  private attemptRecovery(error: PluginError): void {
    console.log(`[RedundancyLifecycle] Attempting recovery from: ${error.message}`)
    
    // Basic recovery strategy
    try {
      if (this.enabled) {
        this.pauseAnimations()
        setTimeout(() => {
          if (this.enabled) {
            this.resumeAnimations()
          }
        }, 1000)
      }
    } catch (recoveryError) {
      console.error('[RedundancyLifecycle] Recovery failed:', recoveryError)
      this.forceDisable()
    }
  }

  private forceDisable(): void {
    console.warn('[RedundancyLifecycle] Force disabling feature due to critical error')
    
    try {
      this.enabled = false
      this.pauseAnimations()
      this.removeDOMElements()
    } catch (error) {
      console.error('[RedundancyLifecycle] Force disable failed:', error)
    }
  }

  private pauseAnimations(): void {
    // Pause all feature animations
    const elements = document.querySelectorAll(`.${redundancyConfig.cssPrefix}animated`)
    elements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.animationPlayState = 'paused'
      }
    })
  }

  private resumeAnimations(): void {
    // Resume all feature animations
    const elements = document.querySelectorAll(`.${redundancyConfig.cssPrefix}animated`)
    elements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.animationPlayState = 'running'
      }
    })
  }

  private removeDOMElements(): void {
    // Remove any DOM elements created by the feature
    if (typeof document !== 'undefined') {
      const elements = document.querySelectorAll(`[data-feature="redundancy-2n1"]`)
      elements.forEach(element => {
        if (element.remove) {
          element.remove()
        } else if (element.parentNode) {
          element.parentNode.removeChild(element)
        }
      })
    }
  }

  private emitLifecycleEvent(eventType: string): void {
    // Emit custom lifecycle events
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('redundancy:lifecycle', {
        detail: {
          featureId: 'redundancy-2n1',
          type: eventType,
          timestamp: Date.now(),
          state: {
            mounted: this.mounted,
            enabled: this.enabled,
            initialized: this.initialized
          }
        }
      })
      
      window.dispatchEvent(event)
    }
  }

  // Public methods for external lifecycle control
  getState() {
    return {
      mounted: this.mounted,
      enabled: this.enabled,
      initialized: this.initialized,
      resourceCount: this.resources.size
    }
  }
}

// Singleton instance
export const redundancyLifecycle = new RedundancyLifecycleManager()