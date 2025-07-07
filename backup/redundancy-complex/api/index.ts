/**
 * API Index
 * Central export point for all API routes and middleware
 */

// Export route handlers
export * from './routes/substations'
export * from './routes/lines'

// Export middleware
export * from './middleware/api-handler'

// Export repositories
export * from './repositories/base-repository'
export * from './repositories/substation-repository'
export * from './repositories/line-repository'

// Export route mappings
import { substationRoutes } from './routes/substations'
import { lineRoutes } from './routes/lines'

/**
 * All available API routes
 */
export const apiRoutes = {
  ...substationRoutes,
  ...lineRoutes
}

/**
 * Route configuration for Next.js API setup
 */
export const routeConfig = {
  substations: {
    basePath: '/api/substations',
    routes: substationRoutes
  },
  lines: {
    basePath: '/api/lines',
    routes: lineRoutes
  }
}

/**
 * API documentation metadata
 */
export const apiDocumentation = {
  version: '1.0.0',
  title: 'Redundancy Feature API',
  description: 'RESTful API for managing power grid redundancy infrastructure',
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  endpoints: {
    substations: {
      description: 'Manage electrical substations',
      basePath: '/api/substations',
      operations: [
        'GET /api/substations - List substations with filtering and pagination',
        'GET /api/substations/{id} - Get substation by ID',
        'POST /api/substations - Create new substation',
        'PUT /api/substations/{id} - Update substation',
        'PATCH /api/substations/{id} - Partial update substation',
        'DELETE /api/substations/{id} - Delete substation',
        'GET /api/substations/zone/{zone} - Get substations by zone',
        'GET /api/substations/redundancy-group/{group} - Get substations by redundancy group',
        'GET /api/substations/stats - Get substation statistics',
        'POST /api/substations/{id}/connections - Add line connection',
        'DELETE /api/substations/{id}/connections/{lineId} - Remove line connection',
        'PUT /api/substations/bulk - Bulk update substations',
        'GET /api/substations/search - Search substations',
        'GET /api/substations/nearby - Find nearby substations'
      ]
    },
    lines: {
      description: 'Manage power transmission lines',
      basePath: '/api/lines',
      operations: [
        'GET /api/lines - List lines with filtering and pagination',
        'GET /api/lines/{id} - Get line by ID',
        'POST /api/lines - Create new line',
        'PUT /api/lines/{id} - Update line',
        'PATCH /api/lines/{id} - Partial update line',
        'DELETE /api/lines/{id} - Delete line',
        'GET /api/lines/substation/{substationId} - Get lines by substation',
        'GET /api/lines/redundancy-group/{group} - Get lines by redundancy group',
        'GET /api/lines/stats - Get line statistics',
        'GET /api/lines/overloaded - Get overloaded lines',
        'GET /api/lines/critical - Get critical lines',
        'PUT /api/lines/power-flows/bulk - Bulk update power flows',
        'GET /api/lines/search - Search lines',
        'GET /api/lines/area - Get lines in geographic area',
        'GET /api/lines/{id}/optimize-path - Get path optimization suggestions'
      ]
    }
  },
  authentication: {
    type: 'Bearer Token',
    description: 'Include Authorization header with Bearer token'
  },
  rateLimit: {
    default: '100 requests per minute',
    authenticated: '1000 requests per minute'
  },
  responseFormat: {
    success: {
      success: true,
      data: '/* Response data */',
      metadata: {
        timestamp: 'ISO 8601 timestamp',
        version: 'API version',
        requestId: 'Unique request identifier',
        executionTime: 'Execution time in milliseconds'
      }
    },
    error: {
      success: false,
      error: {
        code: 'Error code',
        message: 'Error message',
        details: '/* Additional error details */'
      },
      metadata: {
        timestamp: 'ISO 8601 timestamp',
        version: 'API version',
        requestId: 'Unique request identifier',
        executionTime: 'Execution time in milliseconds'
      }
    }
  }
}

/**
 * API utilities
 */
export const apiUtils = {
  /**
   * Get route handler by path and method
   */
  getRouteHandler: (method: string, path: string) => {
    const routeKey = `${method.toUpperCase()} ${path}` as keyof typeof apiRoutes
    return apiRoutes[routeKey]
  },

  /**
   * Get all routes for a resource
   */
  getResourceRoutes: (resource: 'substations' | 'lines') => {
    const basePath = routeConfig[resource].basePath
    return Object.keys(apiRoutes)
      .filter(route => route.includes(basePath))
      .reduce((acc, route) => {
        acc[route] = apiRoutes[route]
        return acc
      }, {} as Record<string, any>)
  },

  /**
   * Validate route exists
   */
  routeExists: (method: string, path: string): boolean => {
    const routeKey = `${method.toUpperCase()} ${path}`
    return routeKey in apiRoutes
  },

  /**
   * Get route documentation
   */
  getRouteDocumentation: (resource?: 'substations' | 'lines') => {
    if (resource) {
      return apiDocumentation.endpoints[resource]
    }
    return apiDocumentation
  }
}

/**
 * OpenAPI/Swagger specification generator
 */
export const generateOpenAPISpec = () => {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: apiDocumentation.title,
      description: apiDocumentation.description,
      version: apiDocumentation.version
    },
    servers: [
      {
        url: apiDocumentation.baseUrl,
        description: 'Main API server'
      }
    ],
    paths: {},
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'object' }
              }
            },
            metadata: {
              type: 'object',
              properties: {
                timestamp: { type: 'string', format: 'date-time' },
                version: { type: 'string' },
                requestId: { type: 'string' },
                executionTime: { type: 'number' }
              }
            }
          }
        },
        PaginatedResponse: {
          allOf: [
            { $ref: '#/components/schemas/ApiResponse' },
            {
              type: 'object',
              properties: {
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'number' },
                    limit: { type: 'number' },
                    total: { type: 'number' },
                    totalPages: { type: 'number' },
                    hasNext: { type: 'boolean' },
                    hasPrevious: { type: 'boolean' }
                  }
                }
              }
            }
          ]
        },
        SubstationModel: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: { 
              type: 'string', 
              enum: ['PRIMARY', 'BACKUP', 'AUXILIARY', 'DISTRIBUTION']
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'FAULT', 'OFFLINE', 'STANDBY', 'EMERGENCY']
            },
            zone: { type: 'string' },
            position: {
              type: 'object',
              properties: {
                x: { type: 'number' },
                y: { type: 'number' }
              }
            },
            powerRating: { type: 'number' },
            currentLoad: { type: 'number' },
            voltage: { type: 'number' },
            frequency: { type: 'number' },
            powerFactor: { type: 'number' },
            efficiency: { type: 'number' },
            redundancyGroup: { type: 'string' },
            redundancyLevel: {
              type: 'string',
              enum: ['N', 'N+1', '2N', '2N+1']
            },
            temperature: { type: 'number' },
            operationalHours: { type: 'number' },
            reliability: { type: 'number' },
            availability: { type: 'number' },
            connections: {
              type: 'array',
              items: { type: 'string' }
            },
            backupSubstations: {
              type: 'array',
              items: { type: 'string' }
            },
            primarySubstation: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        LineModel: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: {
              type: 'string',
              enum: ['TRANSMISSION', 'DISTRIBUTION', 'INTERCONNECTION']
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'FAULT', 'OFFLINE', 'STANDBY', 'EMERGENCY']
            },
            path: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' }
                }
              }
            },
            length: { type: 'number' },
            voltage: { type: 'number' },
            capacity: { type: 'number' },
            powerFlow: { type: 'number' },
            current: { type: 'number' },
            impedance: {
              type: 'object',
              properties: {
                resistance: { type: 'number' },
                reactance: { type: 'number' }
              }
            },
            temperature: { type: 'number' },
            loadFactor: { type: 'number' },
            efficiency: { type: 'number' },
            fromSubstation: { type: 'string' },
            toSubstation: { type: 'string' },
            redundancyGroup: { type: 'string' },
            backupLines: {
              type: 'array',
              items: { type: 'string' }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  }

  return spec
}

/**
 * API health check endpoint
 */
export const healthCheck = async () => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: apiDocumentation.version,
    services: {
      api: 'healthy',
      database: 'healthy', // Would check actual database in real implementation
      cache: 'healthy'
    },
    statistics: {
      totalEndpoints: Object.keys(apiRoutes).length,
      activeConnections: 0, // Would get from actual metrics
      responseTime: 0 // Average response time
    }
  }

  return health
}

/**
 * Export configuration
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    },
    responseLimit: '50mb'
  }
}