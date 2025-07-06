/**
 * Substations API Routes
 * API endpoints for substation management
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { 
  SubstationModel, 
  ApiResponse, 
  PaginatedResponse, 
  DataQuery,
  EntityStatus 
} from '../../models/interfaces'
import { validators } from '../../models/validators'
import { ApiHandler, ApiError, validateRequest } from '../middleware/api-handler'
import { SubstationRepository } from '../repositories/substation-repository'

/**
 * Initialize repository
 */
const substationRepo = new SubstationRepository()

/**
 * GET /api/substations
 * Get all substations with optional filtering and pagination
 */
export async function getSubstations(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    // Parse query parameters
    const query = handler.parseQuery()
    const filters = handler.parseFilters(['zone', 'status', 'redundancyGroup', 'redundancyLevel'])
    const pagination = handler.parsePagination()
    const sort = handler.parseSort()

    // Get substations from repository
    const result = await substationRepo.findMany({
      filters,
      pagination,
      sort,
      include: query.include
    })

    // Validate response data
    if (result.data) {
      result.data.forEach(substation => {
        const validation = validators.substation.validate(substation)
        if (!validation.valid) {
          handler.log('warn', `Invalid substation data: ${substation.id}`, validation.errors)
        }
      })
    }

    const response: PaginatedResponse<SubstationModel> = {
      success: true,
      data: result.data,
      pagination: result.pagination,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestId: handler.requestId,
        executionTime: handler.getExecutionTime()
      }
    }

    handler.success(response)

  } catch (error) {
    handler.error(error)
  }
}

/**
 * GET /api/substations/[id]
 * Get substation by ID
 */
export async function getSubstation(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const { id } = handler.getParams()
    
    if (!id) {
      throw new ApiError(400, 'Substation ID is required')
    }

    const substation = await substationRepo.findById(id)

    if (!substation) {
      throw new ApiError(404, `Substation not found: ${id}`)
    }

    // Validate data
    const validation = validators.substation.validate(substation)
    if (!validation.valid) {
      handler.log('warn', `Invalid substation data: ${id}`, validation.errors)
    }

    const response: ApiResponse<SubstationModel> = {
      success: true,
      data: substation,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestId: handler.requestId,
        executionTime: handler.getExecutionTime()
      }
    }

    handler.success(response)

  } catch (error) {
    handler.error(error)
  }
}

/**
 * POST /api/substations
 * Create new substation
 */
export async function createSubstation(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const body = handler.getBody()

    // Validate required fields
    const requiredFields = ['name', 'type', 'zone', 'position', 'powerRating', 'voltage', 'redundancyGroup']
    validateRequest(body, requiredFields)

    // Create substation data
    const substationData: Partial<SubstationModel> = {
      ...body,
      id: generateSubstationId(),
      status: body.status || EntityStatus.ACTIVE,
      currentLoad: body.currentLoad || 0,
      powerFactor: body.powerFactor || 0.95,
      efficiency: body.efficiency || 0.95,
      temperature: body.temperature || 25,
      operationalHours: body.operationalHours || 0,
      reliability: body.reliability || 0.99,
      availability: body.availability || 0.99,
      connections: body.connections || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Validate substation data
    const validation = validators.substation.validate(substationData as SubstationModel)
    if (!validation.valid) {
      throw new ApiError(400, 'Invalid substation data', validation.errors)
    }

    // Save to repository
    const createdSubstation = await substationRepo.create(substationData as SubstationModel)

    const response: ApiResponse<SubstationModel> = {
      success: true,
      data: createdSubstation,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestId: handler.requestId,
        executionTime: handler.getExecutionTime()
      }
    }

    handler.success(response, 201)

  } catch (error) {
    handler.error(error)
  }
}

/**
 * PUT /api/substations/[id]
 * Update substation
 */
export async function updateSubstation(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const { id } = handler.getParams()
    const body = handler.getBody()

    if (!id) {
      throw new ApiError(400, 'Substation ID is required')
    }

    // Check if substation exists
    const existingSubstation = await substationRepo.findById(id)
    if (!existingSubstation) {
      throw new ApiError(404, `Substation not found: ${id}`)
    }

    // Update data
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString()
    }

    // Merge with existing data
    const updatedSubstation = {
      ...existingSubstation,
      ...updateData,
      id // Ensure ID doesn't change
    }

    // Validate updated data
    const validation = validators.substation.validate(updatedSubstation)
    if (!validation.valid) {
      throw new ApiError(400, 'Invalid substation data', validation.errors)
    }

    // Save to repository
    const result = await substationRepo.update(id, updatedSubstation)

    const response: ApiResponse<SubstationModel> = {
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestId: handler.requestId,
        executionTime: handler.getExecutionTime()
      }
    }

    handler.success(response)

  } catch (error) {
    handler.error(error)
  }
}

/**
 * PATCH /api/substations/[id]
 * Partial update substation
 */
export async function patchSubstation(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const { id } = handler.getParams()
    const body = handler.getBody()

    if (!id) {
      throw new ApiError(400, 'Substation ID is required')
    }

    // Check if substation exists
    const existingSubstation = await substationRepo.findById(id)
    if (!existingSubstation) {
      throw new ApiError(404, `Substation not found: ${id}`)
    }

    // Apply partial update
    const patchData = {
      ...body,
      updatedAt: new Date().toISOString()
    }

    const result = await substationRepo.patch(id, patchData)

    // Validate patched data
    const validation = validators.substation.validate(result)
    if (!validation.valid) {
      handler.log('warn', `Validation warnings after patch: ${id}`, validation.warnings)
    }

    const response: ApiResponse<SubstationModel> = {
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestId: handler.requestId,
        executionTime: handler.getExecutionTime()
      }
    }

    handler.success(response)

  } catch (error) {
    handler.error(error)
  }
}

/**
 * DELETE /api/substations/[id]
 * Delete substation
 */
export async function deleteSubstation(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const { id } = handler.getParams()

    if (!id) {
      throw new ApiError(400, 'Substation ID is required')
    }

    // Check if substation exists
    const existingSubstation = await substationRepo.findById(id)
    if (!existingSubstation) {
      throw new ApiError(404, `Substation not found: ${id}`)
    }

    // Check for dependencies (connections to lines)
    if (existingSubstation.connections && existingSubstation.connections.length > 0) {
      throw new ApiError(409, 'Cannot delete substation with active connections', {
        connections: existingSubstation.connections
      })
    }

    // Delete from repository
    await substationRepo.delete(id)

    const response: ApiResponse<boolean> = {
      success: true,
      data: true,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestId: handler.requestId,
        executionTime: handler.getExecutionTime()
      }
    }

    handler.success(response)

  } catch (error) {
    handler.error(error)
  }
}

/**
 * GET /api/substations/zone/[zone]
 * Get substations by zone
 */
export async function getSubstationsByZone(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const { zone } = handler.getParams()

    if (!zone) {
      throw new ApiError(400, 'Zone is required')
    }

    const substations = await substationRepo.findByZone(zone)

    const response: ApiResponse<SubstationModel[]> = {
      success: true,
      data: substations,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestId: handler.requestId,
        executionTime: handler.getExecutionTime()
      }
    }

    handler.success(response)

  } catch (error) {
    handler.error(error)
  }
}

/**
 * GET /api/substations/redundancy-group/[group]
 * Get substations by redundancy group
 */
export async function getSubstationsByRedundancyGroup(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const { group } = handler.getParams()

    if (!group) {
      throw new ApiError(400, 'Redundancy group is required')
    }

    const substations = await substationRepo.findByRedundancyGroup(group)

    const response: ApiResponse<SubstationModel[]> = {
      success: true,
      data: substations,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestId: handler.requestId,
        executionTime: handler.getExecutionTime()
      }
    }

    handler.success(response)

  } catch (error) {
    handler.error(error)
  }
}

/**
 * GET /api/substations/stats
 * Get substation statistics
 */
export async function getSubstationStats(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const stats = await substationRepo.getStats()

    const response: ApiResponse<any> = {
      success: true,
      data: stats,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestId: handler.requestId,
        executionTime: handler.getExecutionTime()
      }
    }

    handler.success(response)

  } catch (error) {
    handler.error(error)
  }
}

/**
 * POST /api/substations/[id]/connections
 * Add connection to substation
 */
export async function addConnection(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const { id } = handler.getParams()
    const { lineId } = handler.getBody()

    if (!id) {
      throw new ApiError(400, 'Substation ID is required')
    }

    if (!lineId) {
      throw new ApiError(400, 'Line ID is required')
    }

    const result = await substationRepo.addConnection(id, lineId)

    const response: ApiResponse<SubstationModel> = {
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestId: handler.requestId,
        executionTime: handler.getExecutionTime()
      }
    }

    handler.success(response)

  } catch (error) {
    handler.error(error)
  }
}

/**
 * DELETE /api/substations/[id]/connections/[lineId]
 * Remove connection from substation
 */
export async function removeConnection(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const { id, lineId } = handler.getParams()

    if (!id) {
      throw new ApiError(400, 'Substation ID is required')
    }

    if (!lineId) {
      throw new ApiError(400, 'Line ID is required')
    }

    const result = await substationRepo.removeConnection(id, lineId)

    const response: ApiResponse<SubstationModel> = {
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestId: handler.requestId,
        executionTime: handler.getExecutionTime()
      }
    }

    handler.success(response)

  } catch (error) {
    handler.error(error)
  }
}

/**
 * PUT /api/substations/bulk
 * Bulk update substations
 */
export async function bulkUpdateSubstations(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const updates = handler.getBody()

    if (!Array.isArray(updates)) {
      throw new ApiError(400, 'Updates must be an array')
    }

    // Validate each update
    updates.forEach((update, index) => {
      if (!update.id) {
        throw new ApiError(400, `Update at index ${index} missing ID`)
      }
      if (!update.data) {
        throw new ApiError(400, `Update at index ${index} missing data`)
      }
    })

    const results = await substationRepo.bulkUpdate(updates)

    const response: ApiResponse<SubstationModel[]> = {
      success: true,
      data: results,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestId: handler.requestId,
        executionTime: handler.getExecutionTime()
      }
    }

    handler.success(response)

  } catch (error) {
    handler.error(error)
  }
}

/**
 * GET /api/substations/search
 * Search substations
 */
export async function searchSubstations(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const query = handler.parseQuery()
    const searchQuery = query.q as string
    const limit = parseInt(query.limit as string) || 10

    if (!searchQuery) {
      throw new ApiError(400, 'Search query is required')
    }

    const substations = await substationRepo.search(searchQuery, limit)

    const response: ApiResponse<SubstationModel[]> = {
      success: true,
      data: substations,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestId: handler.requestId,
        executionTime: handler.getExecutionTime()
      }
    }

    handler.success(response)

  } catch (error) {
    handler.error(error)
  }
}

/**
 * GET /api/substations/nearby
 * Get nearby substations
 */
export async function getNearbySubstations(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const query = handler.parseQuery()
    const lat = parseFloat(query.lat as string)
    const lng = parseFloat(query.lng as string)
    const radius = parseFloat(query.radius as string) || 10

    if (isNaN(lat) || isNaN(lng)) {
      throw new ApiError(400, 'Valid latitude and longitude are required')
    }

    const substations = await substationRepo.findNearby(lat, lng, radius)

    const response: ApiResponse<SubstationModel[]> = {
      success: true,
      data: substations,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestId: handler.requestId,
        executionTime: handler.getExecutionTime()
      }
    }

    handler.success(response)

  } catch (error) {
    handler.error(error)
  }
}

/**
 * Helper function to generate substation ID
 */
function generateSubstationId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `sub-${timestamp}-${random}`
}

/**
 * Route handler mapping
 */
export const substationRoutes = {
  'GET /api/substations': getSubstations,
  'GET /api/substations/[id]': getSubstation,
  'POST /api/substations': createSubstation,
  'PUT /api/substations/[id]': updateSubstation,
  'PATCH /api/substations/[id]': patchSubstation,
  'DELETE /api/substations/[id]': deleteSubstation,
  'GET /api/substations/zone/[zone]': getSubstationsByZone,
  'GET /api/substations/redundancy-group/[group]': getSubstationsByRedundancyGroup,
  'GET /api/substations/stats': getSubstationStats,
  'POST /api/substations/[id]/connections': addConnection,
  'DELETE /api/substations/[id]/connections/[lineId]': removeConnection,
  'PUT /api/substations/bulk': bulkUpdateSubstations,
  'GET /api/substations/search': searchSubstations,
  'GET /api/substations/nearby': getNearbySubstations
}