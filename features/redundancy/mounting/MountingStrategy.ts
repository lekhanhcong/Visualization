/**
 * Mounting Strategy for 2N+1 Redundancy Feature
 * Defines how and where the feature overlays are mounted
 */

export interface MountPoint {
  id: string
  selector: string
  type: 'overlay' | 'panel' | 'widget'
  priority: number
  required: boolean
  fallbackSelector?: string
}

export interface MountingConfig {
  strategy: 'overlay' | 'portal' | 'inline'
  containerId: string
  zIndex: number
  position: 'absolute' | 'relative' | 'fixed'
  isolation: boolean
}

export interface MountResult {
  success: boolean
  mountPoint: MountPoint
  element: HTMLElement | null
  error?: string
}

/**
 * Default mounting points for the redundancy feature
 */
export const defaultMountPoints: MountPoint[] = [
  {
    id: 'redundancy-main-overlay',
    selector: '[data-testid="datacenter-main-view"]',
    type: 'overlay',
    priority: 1,
    required: true,
    fallbackSelector: '.main-content, main, #main, body'
  },
  {
    id: 'redundancy-info-panel',
    selector: '[data-testid="datacenter-sidebar"]', 
    type: 'panel',
    priority: 2,
    required: false,
    fallbackSelector: '.sidebar, .panel-container, body'
  },
  {
    id: 'redundancy-status-widget',
    selector: '[data-testid="datacenter-status-bar"]',
    type: 'widget', 
    priority: 3,
    required: false,
    fallbackSelector: '.status-bar, .toolbar, header'
  }
]

/**
 * Default mounting configuration
 */
export const defaultMountingConfig: MountingConfig = {
  strategy: 'overlay',
  containerId: 'redundancy-feature-root',
  zIndex: 1000,
  position: 'absolute',
  isolation: true
}

/**
 * Mounting Strategy Class
 * Handles the actual mounting and unmounting of feature components
 */
export class RedundancyMountingStrategy {
  private mountedElements = new Map<string, HTMLElement>()
  private config: MountingConfig
  private mountPoints: MountPoint[]

  constructor(
    config: MountingConfig = defaultMountingConfig,
    mountPoints: MountPoint[] = defaultMountPoints
  ) {
    this.config = { ...config }
    this.mountPoints = [...mountPoints]
  }

  /**
   * Initialize mounting points
   */
  initialize(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof document === 'undefined') {
        resolve(false)
        return
      }

      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          resolve(this.setupMountPoints())
        })
      } else {
        resolve(this.setupMountPoints())
      }
    })
  }

  /**
   * Setup mounting points in the DOM
   */
  private setupMountPoints(): boolean {
    try {
      for (const mountPoint of this.mountPoints) {
        const result = this.createMountPoint(mountPoint)
        if (!result.success && mountPoint.required) {
          console.error(`[MountingStrategy] Required mount point failed: ${mountPoint.id}`)
          return false
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[MountingStrategy] All mount points setup successfully')
      }
      
      return true
    } catch (error) {
      console.error('[MountingStrategy] Setup failed:', error)
      return false
    }
  }

  /**
   * Create a single mount point
   */
  createMountPoint(mountPoint: MountPoint): MountResult {
    try {
      // Try primary selector first
      let targetElement = document.querySelector(mountPoint.selector) as HTMLElement
      
      // Try fallback selector if primary fails
      if (!targetElement && mountPoint.fallbackSelector) {
        const fallbackSelectors = mountPoint.fallbackSelector.split(',').map(s => s.trim())
        for (const selector of fallbackSelectors) {
          targetElement = document.querySelector(selector) as HTMLElement
          if (targetElement) break
        }
      }

      if (!targetElement) {
        return {
          success: false,
          mountPoint,
          element: null,
          error: `Target element not found for selectors: ${mountPoint.selector}${
            mountPoint.fallbackSelector ? `, ${mountPoint.fallbackSelector}` : ''
          }`
        }
      }

      // Create mount container
      const mountContainer = this.createMountContainer(mountPoint, targetElement)
      
      // Store the mounted element
      this.mountedElements.set(mountPoint.id, mountContainer)

      if (process.env.NODE_ENV === 'development') {
        console.log(`[MountingStrategy] Created mount point: ${mountPoint.id}`)
      }

      return {
        success: true,
        mountPoint,
        element: mountContainer
      }
    } catch (error) {
      return {
        success: false,
        mountPoint,
        element: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Create mount container element
   */
  private createMountContainer(mountPoint: MountPoint, targetElement: HTMLElement): HTMLElement {
    const container = document.createElement('div')
    
    // Set container attributes
    container.id = `${this.config.containerId}-${mountPoint.id}`
    container.className = `redundancy-mount-${mountPoint.type}`
    container.setAttribute('data-feature', 'redundancy-2n1')
    container.setAttribute('data-mount-point', mountPoint.id)
    container.setAttribute('data-priority', mountPoint.priority.toString())

    // Apply styling based on mount point type
    this.applyContainerStyles(container, mountPoint)

    // Mount strategy
    switch (this.config.strategy) {
      case 'overlay':
        this.mountAsOverlay(container, targetElement, mountPoint)
        break
      case 'portal':
        this.mountAsPortal(container, targetElement)
        break
      case 'inline':
        this.mountInline(container, targetElement)
        break
    }

    return container
  }

  /**
   * Apply CSS styles to mount container
   */
  private applyContainerStyles(container: HTMLElement, mountPoint: MountPoint): void {
    const baseStyles: Record<string, string> = {
      position: this.config.position,
      zIndex: (this.config.zIndex + mountPoint.priority).toString(),
      pointerEvents: 'auto',
    }

    // Type-specific styles
    switch (mountPoint.type) {
      case 'overlay':
        Object.assign(baseStyles, {
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          pointerEvents: 'none', // Allow clicks through overlay
        })
        break
      case 'panel':
        Object.assign(baseStyles, {
          width: '100%',
          minHeight: '200px',
        })
        break
      case 'widget':
        Object.assign(baseStyles, {
          display: 'inline-block',
          verticalAlign: 'top',
        })
        break
    }

    // Isolation styles
    if (this.config.isolation) {
      Object.assign(baseStyles, {
        isolation: 'isolate',
        contain: 'layout style paint',
      })
    }

    // Apply styles
    Object.assign(container.style, baseStyles)
  }

  /**
   * Mount as overlay
   */
  private mountAsOverlay(
    container: HTMLElement, 
    targetElement: HTMLElement, 
    mountPoint: MountPoint
  ): void {
    // Make target element relative if it's not positioned
    const targetPosition = window.getComputedStyle(targetElement).position
    if (targetPosition === 'static') {
      targetElement.style.position = 'relative'
    }

    targetElement.appendChild(container)
  }

  /**
   * Mount as portal (append to body)
   */
  private mountAsPortal(container: HTMLElement, targetElement: HTMLElement): void {
    // Get target element position for portal positioning
    const rect = targetElement.getBoundingClientRect()
    
    Object.assign(container.style, {
      position: 'fixed',
      top: rect.top + 'px',
      left: rect.left + 'px',
      width: rect.width + 'px',
      height: rect.height + 'px',
    })

    document.body.appendChild(container)
  }

  /**
   * Mount inline
   */
  private mountInline(container: HTMLElement, targetElement: HTMLElement): void {
    container.style.position = 'relative'
    targetElement.appendChild(container)
  }

  /**
   * Get mount point by ID
   */
  getMountPoint(id: string): HTMLElement | null {
    return this.mountedElements.get(id) || null
  }

  /**
   * Get all mount points
   */
  getAllMountPoints(): Record<string, HTMLElement> {
    return Object.fromEntries(this.mountedElements)
  }

  /**
   * Check if mount point exists
   */
  hasMountPoint(id: string): boolean {
    return this.mountedElements.has(id)
  }

  /**
   * Unmount a specific mount point
   */
  unmountPoint(id: string): boolean {
    const element = this.mountedElements.get(id)
    if (!element) {
      return false
    }

    try {
      element.remove()
      this.mountedElements.delete(id)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[MountingStrategy] Unmounted: ${id}`)
      }
      
      return true
    } catch (error) {
      console.error(`[MountingStrategy] Failed to unmount ${id}:`, error)
      return false
    }
  }

  /**
   * Unmount all mount points
   */
  unmountAll(): void {
    for (const [id, element] of this.mountedElements) {
      try {
        element.remove()
        this.mountedElements.delete(id)
      } catch (error) {
        console.error(`[MountingStrategy] Failed to unmount ${id}:`, error)
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[MountingStrategy] All mount points unmounted')
    }
  }

  /**
   * Update mount point configuration
   */
  updateConfig(newConfig: Partial<MountingConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Add new mount point
   */
  addMountPoint(mountPoint: MountPoint): MountResult {
    this.mountPoints.push(mountPoint)
    return this.createMountPoint(mountPoint)
  }

  /**
   * Get mount point configuration
   */
  getConfig(): MountingConfig {
    return { ...this.config }
  }

  /**
   * Get mount point definitions
   */
  getMountPointDefinitions(): MountPoint[] {
    return [...this.mountPoints]
  }

  /**
   * Validate mounting environment
   */
  validateEnvironment(): {
    valid: boolean
    warnings: string[]
    errors: string[]
  } {
    const warnings: string[] = []
    const errors: string[] = []

    if (typeof document === 'undefined' || !document) {
      errors.push('Document not available (SSR environment)')
      return { valid: false, warnings, errors }
    }

    // Check for required mount points
    for (const mountPoint of this.mountPoints) {
      if (mountPoint.required) {
        const element = document.querySelector(mountPoint.selector)
        if (!element) {
          const fallbackElement = mountPoint.fallbackSelector 
            ? document.querySelector(mountPoint.fallbackSelector.split(',')[0].trim())
            : null
          
          if (!fallbackElement) {
            errors.push(`Required mount point not available: ${mountPoint.id}`)
          } else {
            warnings.push(`Using fallback for mount point: ${mountPoint.id}`)
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors
    }
  }
}

// Singleton instance
export const redundancyMountingStrategy = new RedundancyMountingStrategy()