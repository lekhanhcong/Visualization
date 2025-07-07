/**
 * Services Index
 * Central export point for all data services
 */

// Export base service and related types
export { BaseService, ServiceError, ServiceErrorType } from './base-service'
export type { ServiceConfig, RequestOptions } from './base-service'

// Export individual services
export { SubstationService } from './substation-service'
export { LineService } from './line-service'
export { SystemHealthService } from './system-health-service'

// Export service-specific types
export type {
  SubstationFilters,
  SubstationCreateData,
  SubstationUpdateData,
  SubstationStats
} from './substation-service'

export type {
  LineFilters,
  LineCreateData,
  LineUpdateData,
  LineStats,
  PowerFlowUpdate
} from './line-service'

export type {
  HealthMetricsQuery,
  HealthTrend,
  SystemPerformance,
  HealthSummaryReport
} from './system-health-service'

/**
 * Service configuration for the redundancy feature
 */
export interface RedundancyServiceConfig {
  baseUrl?: string
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
  cache?: boolean
  cacheTimeout?: number
  enableMocking?: boolean
  mockDelay?: number
}

/**
 * Service registry for dependency injection and centralized management
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry
  private services = new Map<string, any>()
  private config: RedundancyServiceConfig

  private constructor(config: RedundancyServiceConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || '',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      cache: config.cache ?? true,
      cacheTimeout: config.cacheTimeout || 300000,
      enableMocking: config.enableMocking ?? (process.env.NODE_ENV === 'development'),
      mockDelay: config.mockDelay || 500
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: RedundancyServiceConfig): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry(config)
    }
    return ServiceRegistry.instance
  }

  /**
   * Register a service
   */
  register<T>(name: string, service: T): void {
    this.services.set(name, service)
  }

  /**
   * Get a service
   */
  get<T>(name: string): T {
    const service = this.services.get(name)
    if (!service) {
      throw new Error(`Service ${name} not found`)
    }
    return service
  }

  /**
   * Check if service is registered
   */
  has(name: string): boolean {
    return this.services.has(name)
  }

  /**
   * Initialize all services
   */
  initialize(): void {
    // Register substation service
    if (!this.has('substations')) {
      this.register('substations', new SubstationService(this.config))
    }

    // Register line service
    if (!this.has('lines')) {
      this.register('lines', new LineService(this.config))
    }

    // Register system health service
    if (!this.has('systemHealth')) {
      this.register('systemHealth', new SystemHealthService(this.config))
    }
  }

  /**
   * Get substation service
   */
  getSubstationService(): SubstationService {
    return this.get<SubstationService>('substations')
  }

  /**
   * Get line service
   */
  getLineService(): LineService {
    return this.get<LineService>('lines')
  }

  /**
   * Get system health service
   */
  getSystemHealthService(): SystemHealthService {
    return this.get<SystemHealthService>('systemHealth')
  }

  /**
   * Clear all service caches
   */
  clearAllCaches(): void {
    this.services.forEach(service => {
      if (service instanceof BaseService) {
        service.clearCache()
      }
    })
  }

  /**
   * Get service health status
   */
  async getServicesHealth(): Promise<Record<string, { status: 'healthy' | 'unhealthy', details?: any }>> {
    const healthStatus: Record<string, any> = {}

    for (const [name, service] of this.services.entries()) {
      if (service instanceof BaseService) {
        try {
          healthStatus[name] = await service.getHealth()
        } catch (error) {
          healthStatus[name] = {
            status: 'unhealthy',
            details: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }
    }

    return healthStatus
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<RedundancyServiceConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // Reinitialize services with new config
    this.services.clear()
    this.initialize()
  }

  /**
   * Get current configuration
   */
  getConfig(): RedundancyServiceConfig {
    return { ...this.config }
  }
}

/**
 * Default service registry instance
 */
export const serviceRegistry = ServiceRegistry.getInstance()

/**
 * Initialize services with default configuration
 */
export function initializeServices(config?: RedundancyServiceConfig): ServiceRegistry {
  const registry = ServiceRegistry.getInstance(config)
  registry.initialize()
  return registry
}

/**
 * Service factory functions for easy access
 */
export const createServices = {
  /**
   * Create substation service
   */
  substation: (config?: RedundancyServiceConfig) => new SubstationService(config),

  /**
   * Create line service
   */
  line: (config?: RedundancyServiceConfig) => new LineService(config),

  /**
   * Create system health service
   */
  systemHealth: (config?: RedundancyServiceConfig) => new SystemHealthService(config)
}

/**
 * Service utility functions
 */
export const serviceUtils = {
  /**
   * Create service with retry configuration
   */
  withRetry: <T extends BaseService>(
    ServiceClass: new (config: any) => T,
    retryAttempts: number,
    retryDelay: number
  ) => {
    return new ServiceClass({
      retryAttempts,
      retryDelay
    })
  },

  /**
   * Create service with caching disabled
   */
  withoutCache: <T extends BaseService>(
    ServiceClass: new (config: any) => T
  ) => {
    return new ServiceClass({
      cache: false
    })
  },

  /**
   * Create service with custom timeout
   */
  withTimeout: <T extends BaseService>(
    ServiceClass: new (config: any) => T,
    timeout: number
  ) => {
    return new ServiceClass({
      timeout
    })
  },

  /**
   * Create service for testing with mocking enabled
   */
  forTesting: <T extends BaseService>(
    ServiceClass: new (config: any) => T,
    mockDelay = 100
  ) => {
    return new ServiceClass({
      enableMocking: true,
      mockDelay,
      cache: false
    })
  }
}

/**
 * Service hooks for React integration (if needed)
 */
export const serviceHooks = {
  /**
   * Create a hook that provides a service instance
   */
  createServiceHook: <T>(serviceName: string) => {
    return (): T => {
      const registry = ServiceRegistry.getInstance()
      if (!registry.has(serviceName)) {
        registry.initialize()
      }
      return registry.get<T>(serviceName)
    }
  }
}

/**
 * Convenient hook factories
 */
export const useSubstationService = serviceHooks.createServiceHook<SubstationService>('substations')
export const useLineService = serviceHooks.createServiceHook<LineService>('lines')
export const useSystemHealthService = serviceHooks.createServiceHook<SystemHealthService>('systemHealth')

/**
 * Service middleware for request/response interception
 */
export interface ServiceMiddleware {
  name: string
  onRequest?: (url: string, options: RequestInit) => Promise<void> | void
  onResponse?: (response: Response) => Promise<void> | void
  onError?: (error: Error) => Promise<void> | void
}

/**
 * Middleware registry
 */
class MiddlewareRegistry {
  private middlewares: ServiceMiddleware[] = []

  add(middleware: ServiceMiddleware): void {
    this.middlewares.push(middleware)
  }

  remove(name: string): void {
    this.middlewares = this.middlewares.filter(m => m.name !== name)
  }

  async executeRequest(url: string, options: RequestInit): Promise<void> {
    for (const middleware of this.middlewares) {
      if (middleware.onRequest) {
        await middleware.onRequest(url, options)
      }
    }
  }

  async executeResponse(response: Response): Promise<void> {
    for (const middleware of this.middlewares) {
      if (middleware.onResponse) {
        await middleware.onResponse(response)
      }
    }
  }

  async executeError(error: Error): Promise<void> {
    for (const middleware of this.middlewares) {
      if (middleware.onError) {
        await middleware.onError(error)
      }
    }
  }
}

export const middlewareRegistry = new MiddlewareRegistry()

/**
 * Built-in middleware
 */
export const builtInMiddleware = {
  /**
   * Logging middleware
   */
  logging: {
    name: 'logging',
    onRequest: (url: string, options: RequestInit) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API Request] ${options.method || 'GET'} ${url}`)
      }
    },
    onResponse: (response: Response) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API Response] ${response.status} ${response.url}`)
      }
    },
    onError: (error: Error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[API Error]`, error)
      }
    }
  },

  /**
   * Performance monitoring middleware
   */
  performance: {
    name: 'performance',
    onRequest: (url: string) => {
      (performance as any).mark(`api-start-${url}`)
    },
    onResponse: (response: Response) => {
      (performance as any).mark(`api-end-${response.url}`)
      try {
        (performance as any).measure(
          `api-duration-${response.url}`,
          `api-start-${response.url}`,
          `api-end-${response.url}`
        )
      } catch (error) {
        // Ignore measurement errors
      }
    }
  },

  /**
   * Error reporting middleware
   */
  errorReporting: {
    name: 'error-reporting',
    onError: (error: Error) => {
      // In a real implementation, this would send errors to a monitoring service
      if (process.env.NODE_ENV === 'production') {
        console.error('Service error reported:', error)
      }
    }
  }
}

/**
 * Install default middleware
 */
export function installDefaultMiddleware(): void {
  middlewareRegistry.add(builtInMiddleware.logging)
  middlewareRegistry.add(builtInMiddleware.performance)
  middlewareRegistry.add(builtInMiddleware.errorReporting)
}

/**
 * Service configuration presets
 */
export const servicePresets = {
  /**
   * Development preset
   */
  development: {
    timeout: 10000,
    retryAttempts: 1,
    retryDelay: 500,
    cache: true,
    cacheTimeout: 60000, // 1 minute
    enableMocking: true,
    mockDelay: 200
  },

  /**
   * Production preset
   */
  production: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    cache: true,
    cacheTimeout: 300000, // 5 minutes
    enableMocking: false,
    mockDelay: 0
  },

  /**
   * Testing preset
   */
  testing: {
    timeout: 5000,
    retryAttempts: 0,
    retryDelay: 0,
    cache: false,
    cacheTimeout: 0,
    enableMocking: true,
    mockDelay: 0
  }
}

/**
 * Initialize services with environment-based preset
 */
export function initializeWithPreset(environment: keyof typeof servicePresets = 'development'): ServiceRegistry {
  const config = servicePresets[environment]
  installDefaultMiddleware()
  return initializeServices(config)
}