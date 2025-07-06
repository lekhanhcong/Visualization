/**
 * API Handler Middleware
 * Centralized request/response handling and error management
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { DataQuery, DataFilter, DataSort, Pagination } from '../../models/interfaces'

/**
 * API Error class for structured error handling
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code || `API_ERROR_${statusCode}`
  }
}

/**
 * Request validation error
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, message, details, 'VALIDATION_ERROR')
  }
}

/**
 * Not found error
 */
export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} not found: ${id}` : `${resource} not found`
    super(404, message, { resource, id }, 'NOT_FOUND')
  }
}

/**
 * Conflict error
 */
export class ConflictError extends ApiError {
  constructor(message: string, details?: any) {
    super(409, message, details, 'CONFLICT')
  }
}

/**
 * Main API handler class
 */
export class ApiHandler {
  public readonly requestId: string
  private readonly startTime: number

  constructor(
    private req: NextApiRequest,
    private res: NextApiResponse
  ) {
    this.requestId = this.generateRequestId()
    this.startTime = Date.now()
    
    // Set CORS headers
    this.setCorsHeaders()
    
    // Log request
    this.logRequest()
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Set CORS headers
   */
  private setCorsHeaders(): void {
    this.res.setHeader('Access-Control-Allow-Origin', '*')
    this.res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    this.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID')
    this.res.setHeader('X-Request-ID', this.requestId)
  }

  /**
   * Log request details
   */
  private logRequest(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.requestId}] ${this.req.method} ${this.req.url}`)
    }
  }

  /**
   * Get request parameters
   */
  getParams(): Record<string, string> {
    return (this.req.query as Record<string, string>) || {}
  }

  /**
   * Get request body
   */
  getBody(): any {
    return this.req.body || {}
  }

  /**
   * Get query parameters
   */
  parseQuery(): Record<string, any> {
    const query: Record<string, any> = {}
    
    Object.entries(this.req.query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        query[key] = value
      } else if (typeof value === 'string') {
        // Try to parse JSON values
        if (value.startsWith('{') || value.startsWith('[')) {
          try {
            query[key] = JSON.parse(value)
          } catch {
            query[key] = value
          }
        } else {
          query[key] = value
        }
      } else {
        query[key] = value
      }
    })
    
    return query
  }

  /**
   * Parse filters from query parameters
   */
  parseFilters(allowedFields?: string[]): DataFilter[] {
    const query = this.parseQuery()
    const filters: DataFilter[] = []

    // Parse filter array format: filter[0][field]=name&filter[0][operator]=EQUALS&filter[0][value]=test
    Object.keys(query).forEach(key => {
      const filterMatch = key.match(/^filter\[(\d+)\]\[(\w+)\]$/)
      if (filterMatch) {
        const index = parseInt(filterMatch[1])
        const property = filterMatch[2]
        
        if (!filters[index]) {
          filters[index] = {} as DataFilter
        }
        
        if (property === 'values' && Array.isArray(query[key])) {
          filters[index].values = query[key]
        } else {
          (filters[index] as any)[property] = query[key]
        }
      }
    })

    // Filter out incomplete filters and validate allowed fields
    return filters.filter(filter => {
      if (!filter.field || !filter.operator) {
        return false
      }
      
      if (allowedFields && !allowedFields.includes(filter.field)) {
        return false
      }
      
      return true
    })
  }

  /**
   * Parse sorting from query parameters
   */
  parseSort(): DataSort[] {
    const query = this.parseQuery()
    const sorts: DataSort[] = []

    // Parse sort array format: sort[0][field]=name&sort[0][direction]=ASC
    Object.keys(query).forEach(key => {
      const sortMatch = key.match(/^sort\[(\d+)\]\[(\w+)\]$/)
      if (sortMatch) {
        const index = parseInt(sortMatch[1])
        const property = sortMatch[2]
        
        if (!sorts[index]) {
          sorts[index] = {} as DataSort
        }
        
        (sorts[index] as any)[property] = query[key]
      }
    })

    // Filter out incomplete sorts
    return sorts.filter(sort => sort.field && sort.direction)
  }

  /**
   * Parse pagination from query parameters
   */
  parsePagination(): { page: number; limit: number } {
    const query = this.parseQuery()
    
    const page = Math.max(1, parseInt(query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20))
    
    return { page, limit }
  }

  /**
   * Get execution time in milliseconds
   */
  getExecutionTime(): number {
    return Date.now() - this.startTime
  }

  /**
   * Send success response
   */
  success<T>(data: T, statusCode = 200): void {
    this.logResponse(statusCode)
    this.res.status(statusCode).json(data)
  }

  /**
   * Send error response
   */
  error(error: any): void {
    let statusCode = 500
    let message = 'Internal Server Error'
    let code = 'INTERNAL_ERROR'
    let details: any = undefined

    // Handle different error types
    if (error instanceof ApiError) {
      statusCode = error.statusCode
      message = error.message
      code = error.code || `API_ERROR_${statusCode}`
      details = error.details
    } else if (error instanceof Error) {
      message = error.message
      if (process.env.NODE_ENV === 'development') {
        details = { stack: error.stack }
      }
    } else if (typeof error === 'string') {
      message = error
    }

    const errorResponse = {
      success: false,
      error: {
        code,
        message,
        details
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestId: this.requestId,
        executionTime: this.getExecutionTime()
      }
    }

    this.logResponse(statusCode, errorResponse.error)
    this.res.status(statusCode).json(errorResponse)
  }

  /**
   * Log response details
   */
  private logResponse(statusCode: number, error?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const duration = this.getExecutionTime()
      const level = statusCode >= 400 ? 'error' : 'info'
      
      console[level](`[${this.requestId}] ${statusCode} ${this.req.method} ${this.req.url} - ${duration}ms`)
      
      if (error) {
        console.error(`[${this.requestId}] Error:`, error)
      }
    }
  }

  /**
   * Log custom message
   */
  log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console[level](`[${this.requestId}] ${message}`, data || '')
    }
  }
}

/**
 * Validate request data
 */
export function validateRequest(data: any, requiredFields: string[]): void {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Request body must be an object')
  }

  const missingFields = requiredFields.filter(field => {
    return data[field] === undefined || data[field] === null || data[field] === ''
  })

  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`,
      { missingFields }
    )
  }
}

/**
 * Validate field types
 */
export function validateFieldTypes(data: any, fieldTypes: Record<string, string>): void {
  Object.entries(fieldTypes).forEach(([field, expectedType]) => {
    if (data[field] !== undefined) {
      const actualType = typeof data[field]
      
      if (expectedType === 'array' && !Array.isArray(data[field])) {
        throw new ValidationError(`Field '${field}' must be an array`)
      } else if (expectedType !== 'array' && actualType !== expectedType) {
        throw new ValidationError(`Field '${field}' must be of type ${expectedType}, got ${actualType}`)
      }
    }
  })
}

/**
 * Validate enum values
 */
export function validateEnumValues(data: any, enumFields: Record<string, string[]>): void {
  Object.entries(enumFields).forEach(([field, allowedValues]) => {
    if (data[field] !== undefined && !allowedValues.includes(data[field])) {
      throw new ValidationError(
        `Field '${field}' must be one of: ${allowedValues.join(', ')}`,
        { field, value: data[field], allowedValues }
      )
    }
  })
}

/**
 * Validate number ranges
 */
export function validateNumberRanges(data: any, ranges: Record<string, [number, number]>): void {
  Object.entries(ranges).forEach(([field, [min, max]]) => {
    if (data[field] !== undefined) {
      const value = data[field]
      
      if (typeof value !== 'number') {
        throw new ValidationError(`Field '${field}' must be a number`)
      }
      
      if (value < min || value > max) {
        throw new ValidationError(
          `Field '${field}' must be between ${min} and ${max}`,
          { field, value, min, max }
        )
      }
    }
  })
}

/**
 * Rate limiting middleware
 */
export class RateLimiter {
  private requests = new Map<string, number[]>()
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  check(identifier: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    
    return true
  }

  getResetTime(identifier: string): number {
    const requests = this.requests.get(identifier) || []
    if (requests.length === 0) return 0
    
    const oldestRequest = Math.min(...requests)
    return oldestRequest + this.windowMs
  }
}

/**
 * Authentication middleware
 */
export function authenticate(req: NextApiRequest): { userId: string; permissions: string[] } {
  const authHeader = req.headers.authorization
  
  if (!authHeader) {
    throw new ApiError(401, 'Authentication required')
  }

  const token = authHeader.replace('Bearer ', '')
  
  if (!token) {
    throw new ApiError(401, 'Invalid authentication token')
  }

  // In a real implementation, this would validate the JWT token
  // For now, we'll return a mock user
  return {
    userId: 'user-123',
    permissions: ['read:substations', 'write:substations', 'read:lines', 'write:lines']
  }
}

/**
 * Authorization middleware
 */
export function authorize(userPermissions: string[], requiredPermission: string): void {
  if (!userPermissions.includes(requiredPermission)) {
    throw new ApiError(403, `Permission required: ${requiredPermission}`)
  }
}

/**
 * Request size limiter
 */
export function validateRequestSize(req: NextApiRequest, maxSizeBytes: number): void {
  const contentLength = parseInt(req.headers['content-length'] || '0')
  
  if (contentLength > maxSizeBytes) {
    throw new ApiError(413, `Request too large. Maximum size: ${maxSizeBytes} bytes`)
  }
}

/**
 * CORS middleware
 */
export function handleCors(req: NextApiRequest, res: NextApiResponse): boolean {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID')
    res.setHeader('Access-Control-Max-Age', '86400') // 24 hours
    res.status(200).end()
    return true
  }
  
  return false
}

/**
 * API method wrapper for common functionality
 */
export function withApiHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  options: {
    methods?: string[]
    requireAuth?: boolean
    requiredPermission?: string
    rateLimit?: { maxRequests: number; windowMs: number }
    maxRequestSize?: number
  } = {}
) {
  const rateLimiter = options.rateLimit 
    ? new RateLimiter(options.rateLimit.maxRequests, options.rateLimit.windowMs)
    : null

  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Handle CORS
      if (handleCors(req, res)) {
        return
      }

      // Check allowed methods
      if (options.methods && !options.methods.includes(req.method || '')) {
        throw new ApiError(405, `Method ${req.method} not allowed`)
      }

      // Check request size
      if (options.maxRequestSize) {
        validateRequestSize(req, options.maxRequestSize)
      }

      // Rate limiting
      if (rateLimiter) {
        const clientId = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'
        
        if (!rateLimiter.check(clientId as string)) {
          const resetTime = rateLimiter.getResetTime(clientId as string)
          res.setHeader('X-Rate-Limit-Reset', resetTime.toString())
          throw new ApiError(429, 'Rate limit exceeded')
        }
      }

      // Authentication
      let user: { userId: string; permissions: string[] } | null = null
      if (options.requireAuth) {
        user = authenticate(req)
        
        // Authorization
        if (options.requiredPermission) {
          authorize(user.permissions, options.requiredPermission)
        }
      }

      // Add user to request if authenticated
      if (user) {
        (req as any).user = user
      }

      // Execute handler
      await handler(req, res)
      
    } catch (error) {
      const apiHandler = new ApiHandler(req, res)
      apiHandler.error(error)
    }
  }
}