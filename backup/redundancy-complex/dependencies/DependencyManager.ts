/**
 * Dependency Management for 2N+1 Redundancy Feature
 * Handles feature dependencies, loading order, and resolution
 */

export interface FeatureDependency {
  id: string
  name: string
  version?: string
  required: boolean
  loadOrder: number
  checkFunction?: () => boolean | Promise<boolean>
  fallbackHandler?: () => void | Promise<void>
}

export interface DependencyResolution {
  dependency: FeatureDependency
  resolved: boolean
  error?: string
  fallbackUsed: boolean
  loadTime?: number
}

export interface DependencyManagerConfig {
  autoResolve: boolean
  timeout: number
  retryAttempts: number
  retryDelay: number
  failureStrategy: 'fail' | 'warn' | 'continue'
}

/**
 * Dependency Manager Class
 * Manages feature dependencies and resolution
 */
export class RedundancyDependencyManager {
  private dependencies = new Map<string, FeatureDependency>()
  private resolutions = new Map<string, DependencyResolution>()
  private config: DependencyManagerConfig
  private resolved = false

  constructor(config: Partial<DependencyManagerConfig> = {}) {
    this.config = {
      autoResolve: true,
      timeout: 5000,
      retryAttempts: 3,
      retryDelay: 1000,
      failureStrategy: 'warn',
      ...config
    }
  }

  /**
   * Register a dependency
   */
  registerDependency(dependency: FeatureDependency): void {
    this.dependencies.set(dependency.id, dependency)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DependencyManager] Registered dependency: ${dependency.id}`)
    }
  }

  /**
   * Register multiple dependencies
   */
  registerDependencies(dependencies: FeatureDependency[]): void {
    dependencies.forEach(dep => this.registerDependency(dep))
  }

  /**
   * Resolve all dependencies
   */
  async resolveAll(): Promise<boolean> {
    if (this.resolved) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[DependencyManager] Dependencies already resolved')
      }
      return true
    }

    const sortedDependencies = this.getSortedDependencies()
    let allResolved = true

    for (const dependency of sortedDependencies) {
      const resolution = await this.resolveDependency(dependency)
      this.resolutions.set(dependency.id, resolution)

      if (!resolution.resolved && dependency.required) {
        allResolved = false
        
        if (this.config.failureStrategy === 'fail') {
          throw new Error(`Required dependency failed: ${dependency.id}`)
        }
      }
    }

    this.resolved = allResolved || this.config.failureStrategy !== 'fail'

    if (process.env.NODE_ENV === 'development') {
      console.log('[DependencyManager] Resolution complete:', {
        total: sortedDependencies.length,
        resolved: this.getResolvedCount(),
        failed: this.getFailedCount()
      })
    }

    return this.resolved
  }

  /**
   * Resolve a single dependency
   */
  private async resolveDependency(dependency: FeatureDependency): Promise<DependencyResolution> {
    const startTime = Date.now()
    
    try {
      let resolved = false
      let fallbackUsed = false

      // Check if dependency is available
      if (dependency.checkFunction) {
        resolved = await this.attemptResolution(dependency)
      } else {
        // Default check: assume dependency exists if no check function provided
        resolved = true
      }

      // Use fallback if main resolution failed
      if (!resolved && dependency.fallbackHandler) {
        try {
          await dependency.fallbackHandler()
          resolved = true
          fallbackUsed = true
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`[DependencyManager] Using fallback for: ${dependency.id}`)
          }
        } catch (fallbackError) {
          if (process.env.NODE_ENV === 'development') {
            console.error(`[DependencyManager] Fallback failed for: ${dependency.id}`, fallbackError)
          }
        }
      }

      return {
        dependency,
        resolved,
        fallbackUsed,
        loadTime: Date.now() - startTime
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      if (this.config.failureStrategy === 'warn') {
        console.warn(`[DependencyManager] Dependency resolution failed: ${dependency.id}`, error)
      }

      return {
        dependency,
        resolved: false,
        error: errorMessage,
        fallbackUsed: false,
        loadTime: Date.now() - startTime
      }
    }
  }

  /**
   * Attempt to resolve dependency with retries
   */
  private async attemptResolution(dependency: FeatureDependency): Promise<boolean> {
    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const result = await Promise.race([
          dependency.checkFunction!(),
          this.createTimeout()
        ])

        if (result === true) {
          return true
        }
      } catch (error) {
        if (attempt === this.config.retryAttempts) {
          throw error
        }
        
        // Wait before retry
        await this.delay(this.config.retryDelay)
      }
    }

    return false
  }

  /**
   * Create timeout promise
   */
  private createTimeout(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Dependency resolution timeout')), this.config.timeout)
    })
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Sort dependencies by load order
   */
  private getSortedDependencies(): FeatureDependency[] {
    return Array.from(this.dependencies.values())
      .sort((a, b) => a.loadOrder - b.loadOrder)
  }

  /**
   * Check if specific dependency is resolved
   */
  isDependencyResolved(id: string): boolean {
    const resolution = this.resolutions.get(id)
    return resolution?.resolved ?? false
  }

  /**
   * Get dependency resolution
   */
  getDependencyResolution(id: string): DependencyResolution | null {
    return this.resolutions.get(id) || null
  }

  /**
   * Get all resolutions
   */
  getAllResolutions(): DependencyResolution[] {
    return Array.from(this.resolutions.values())
  }

  /**
   * Get resolved dependencies count
   */
  getResolvedCount(): number {
    return Array.from(this.resolutions.values()).filter(r => r.resolved).length
  }

  /**
   * Get failed dependencies count
   */
  getFailedCount(): number {
    return Array.from(this.resolutions.values()).filter(r => !r.resolved).length
  }

  /**
   * Check if all dependencies are resolved
   */
  areAllResolved(): boolean {
    return this.resolved
  }

  /**
   * Get unresolved required dependencies
   */
  getUnresolvedRequired(): FeatureDependency[] {
    return Array.from(this.dependencies.values()).filter(dep => {
      const resolution = this.resolutions.get(dep.id)
      return dep.required && (!resolution || !resolution.resolved)
    })
  }

  /**
   * Clear all dependencies and resolutions
   */
  clear(): void {
    this.dependencies.clear()
    this.resolutions.clear()
    this.resolved = false
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[DependencyManager] Cleared all dependencies')
    }
  }

  /**
   * Reset resolution state (keep dependencies)
   */
  reset(): void {
    this.resolutions.clear()
    this.resolved = false
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[DependencyManager] Reset resolution state')
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<DependencyManagerConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current configuration
   */
  getConfig(): DependencyManagerConfig {
    return { ...this.config }
  }

  /**
   * Validate dependency configuration
   */
  validateDependencies(): {
    valid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for duplicate load orders
    const loadOrders = Array.from(this.dependencies.values()).map(d => d.loadOrder)
    const duplicateOrders = loadOrders.filter((order, index) => loadOrders.indexOf(order) !== index)
    
    if (duplicateOrders.length > 0) {
      warnings.push(`Duplicate load orders found: ${duplicateOrders.join(', ')}`)
    }

    // Check for circular dependencies (basic check)
    const sortedDeps = this.getSortedDependencies()
    for (let i = 0; i < sortedDeps.length; i++) {
      for (let j = i + 1; j < sortedDeps.length; j++) {
        if (sortedDeps[i].loadOrder === sortedDeps[j].loadOrder) {
          warnings.push(`Dependencies ${sortedDeps[i].id} and ${sortedDeps[j].id} have same load order`)
        }
      }
    }

    // Check for required dependencies without check functions
    for (const dep of this.dependencies.values()) {
      if (dep.required && !dep.checkFunction && !dep.fallbackHandler) {
        warnings.push(`Required dependency ${dep.id} has no check function or fallback`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
}

// Default dependency configuration
export const defaultDependencyConfig: DependencyManagerConfig = {
  autoResolve: true,
  timeout: 5000,
  retryAttempts: 3,
  retryDelay: 1000,
  failureStrategy: 'warn'
}

// Singleton instance
export const redundancyDependencyManager = new RedundancyDependencyManager(defaultDependencyConfig)