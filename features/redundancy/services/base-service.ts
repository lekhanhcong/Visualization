/**
 * Base Service
 * Abstract base class for all data services in the redundancy feature
 */

import { 
  ApiResponse, 
  PaginatedResponse, 
  DataQuery, 
  ValidationResult 
} from '../models/interfaces'

/**
 * Service configuration interface
 */
export interface ServiceConfig {
  baseUrl?: string
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
  cache?: boolean
  cacheTimeout?: number
}

/**
 * Service error types
 */
export enum ServiceErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMITED = 'RATE_LIMITED'
}

/**
 * Service error class
 */
export class ServiceError extends Error {
  constructor(
    public type: ServiceErrorType,
    message: string,
    public code?: string,
    public details?: any,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}

/**
 * Request options interface
 */
export interface RequestOptions {
  timeout?: number
  retries?: number
  cache?: boolean
  headers?: Record<string, string>
  signal?: AbortSignal
}

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

/**
 * Abstract base service class
 */
export abstract class BaseService {
  protected config: Required<ServiceConfig>
  private cache = new Map<string, CacheEntry<any>>()

  constructor(config: ServiceConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || '',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      cache: config.cache ?? true,
      cacheTimeout: config.cacheTimeout || 300000 // 5 minutes
    }
  }

  /**
   * Make HTTP request with error handling and retries
   */
  protected async request<T>(
    url: string,
    options: RequestInit & RequestOptions = {}
  ): Promise<T> {
    const fullUrl = this.buildUrl(url)
    const requestOptions = this.buildRequestOptions(options)
    
    // Check cache first
    if (options.cache !== false && this.config.cache && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
      const cached = this.getFromCache<T>(fullUrl)
      if (cached) {
        return cached
      }
    }

    let lastError: Error | null = null
    const maxRetries = options.retries ?? this.config.retryAttempts

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(fullUrl, requestOptions)
        
        if (!response.ok) {
          throw this.createErrorFromResponse(response)
        }

        const data = await response.json()
        
        // Cache successful GET requests
        if (this.config.cache && (!options.method || options.method === 'GET')) {
          this.setCache(fullUrl, data)
        }

        return data
      } catch (error) {
        lastError = error as Error
        
        // Don't retry on certain errors
        if (error instanceof ServiceError && 
            [ServiceErrorType.VALIDATION_ERROR, ServiceErrorType.NOT_FOUND, 
             ServiceErrorType.UNAUTHORIZED, ServiceErrorType.FORBIDDEN].includes(error.type)) {
          throw error
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await this.delay(this.config.retryDelay * Math.pow(2, attempt))
        }
      }
    }

    throw lastError || new ServiceError(ServiceErrorType.INTERNAL_ERROR, 'Request failed after retries')
  }

  /**
   * Make GET request
   */
  protected async get<T>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' })
  }

  /**
   * Make POST request
   */
  protected async post<T>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
  }

  /**
   * Make PUT request
   */
  protected async put<T>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
  }

  /**
   * Make PATCH request
   */
  protected async patch<T>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
  }

  /**
   * Make DELETE request
   */
  protected async delete<T>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' })
  }

  /**
   * Build full URL
   */
  private buildUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return `${this.config.baseUrl}${url.startsWith('/') ? url : '/' + url}`
  }

  /**
   * Build request options
   */
  private buildRequestOptions(options: RequestInit & RequestOptions): RequestInit {
    return {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...options.headers
      }
    }
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: options.signal || controller.signal
      })
      return response
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new ServiceError(ServiceErrorType.TIMEOUT, 'Request timeout')
      }
      throw new ServiceError(ServiceErrorType.NETWORK_ERROR, 'Network error', undefined, undefined, error as Error)
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Create error from HTTP response
   */
  private async createErrorFromResponse(response: Response): Promise<ServiceError> {
    let errorData: any = null
    
    try {
      errorData = await response.json()
    } catch {
      // Ignore JSON parsing errors
    }

    const message = errorData?.message || `HTTP ${response.status}: ${response.statusText}`
    const code = errorData?.code || response.status.toString()

    switch (response.status) {
      case 400:
        return new ServiceError(ServiceErrorType.VALIDATION_ERROR, message, code, errorData)
      case 401:
        return new ServiceError(ServiceErrorType.UNAUTHORIZED, message, code, errorData)
      case 403:
        return new ServiceError(ServiceErrorType.FORBIDDEN, message, code, errorData)
      case 404:
        return new ServiceError(ServiceErrorType.NOT_FOUND, message, code, errorData)
      case 409:
        return new ServiceError(ServiceErrorType.CONFLICT, message, code, errorData)
      case 429:
        return new ServiceError(ServiceErrorType.RATE_LIMITED, message, code, errorData)
      case 500:
      default:
        return new ServiceError(ServiceErrorType.INTERNAL_ERROR, message, code, errorData)
    }
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Cache management
   */
  private getCacheKey(url: string): string {
    return url
  }

  private getFromCache<T>(url: string): T | null {
    const key = this.getCacheKey(url)
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  private setCache<T>(url: string, data: T, ttl?: number): void {
    const key = this.getCacheKey(url)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.cacheTimeout
    })
  }

  /**
   * Clear cache
   */
  protected clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Build query string from DataQuery
   */
  protected buildQueryString(query?: DataQuery): string {
    if (!query) return ''

    const params = new URLSearchParams()

    // Add filters
    if (query.filters) {
      query.filters.forEach((filter, index) => {
        params.append(`filter[${index}][field]`, filter.field)
        params.append(`filter[${index}][operator]`, filter.operator)
        
        if (filter.values) {
          filter.values.forEach((value, valueIndex) => {
            params.append(`filter[${index}][values][${valueIndex}]`, String(value))
          })
        } else {
          params.append(`filter[${index}][value]`, String(filter.value))
        }
      })
    }

    // Add sorting
    if (query.sort) {
      query.sort.forEach((sort, index) => {
        params.append(`sort[${index}][field]`, sort.field)
        params.append(`sort[${index}][direction]`, sort.direction)
      })
    }

    // Add pagination
    if (query.pagination) {
      params.append('page', String(query.pagination.page))
      params.append('limit', String(query.pagination.limit))
    }

    // Add field selection
    if (query.fields) {
      params.append('fields', query.fields.join(','))
    }

    // Add includes
    if (query.include) {
      params.append('include', query.include.join(','))
    }

    return params.toString()
  }

  /**
   * Create API response wrapper
   */
  protected createResponse<T>(data: T, success = true, error?: any): ApiResponse<T> {
    return {
      success,
      data: success ? data : undefined,
      error: error ? {
        code: error.code || 'UNKNOWN',
        message: error.message || 'Unknown error',
        details: error.details
      } : undefined,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestId: this.generateRequestId(),
        executionTime: 0 // Would be calculated in real implementation
      }
    }
  }

  /**
   * Create paginated response wrapper
   */
  protected createPaginatedResponse<T>(
    data: T[], 
    page: number, 
    limit: number, 
    total: number
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit)
    
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestId: this.generateRequestId(),
        executionTime: 0
      }
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Validate data using provided validator
   */
  protected validateData<T>(data: T, validator: (data: T) => ValidationResult): T {
    const result = validator(data)
    
    if (!result.valid) {
      const errors = result.errors.map(e => `${e.field}: ${e.message}`).join(', ')
      throw new ServiceError(
        ServiceErrorType.VALIDATION_ERROR,
        `Validation failed: ${errors}`,
        'VALIDATION_FAILED',
        result
      )
    }

    return data
  }

  /**
   * Log service operation (for debugging)
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console[level](`[${this.constructor.name}] ${message}`, data || '')
    }
  }

  /**
   * Get service health status
   */
  async getHealth(): Promise<{ status: 'healthy' | 'unhealthy', details?: any }> {
    try {
      await this.get('/health')
      return { status: 'healthy' }
    } catch (error) {
      return { 
        status: 'unhealthy', 
        details: error instanceof ServiceError ? error.message : 'Unknown error'
      }
    }
  }
}