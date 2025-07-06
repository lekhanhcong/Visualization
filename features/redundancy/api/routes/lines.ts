/**
 * Lines API Routes
 * API endpoints for power line management
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { 
  LineModel, 
  ApiResponse, 
  PaginatedResponse, 
  EntityStatus 
} from '../../models/interfaces'
import { validators } from '../../models/validators'
import { ApiHandler, ApiError, validateRequest } from '../middleware/api-handler'
import { LineRepository } from '../repositories/line-repository'

/**
 * Initialize repository
 */
const lineRepo = new LineRepository()

/**
 * GET /api/lines
 * Get all lines with optional filtering and pagination
 */
export async function getLines(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const query = handler.parseQuery()
    const filters = handler.parseFilters(['status', 'type', 'fromSubstation', 'toSubstation', 'redundancyGroup'])
    const pagination = handler.parsePagination()
    const sort = handler.parseSort()

    const result = await lineRepo.findMany({
      filters,
      pagination,
      sort,
      include: query.include
    })

    // Validate response data
    if (result.data) {
      result.data.forEach(line => {
        const validation = validators.line.validate(line)
        if (!validation.valid) {
          handler.log('warn', `Invalid line data: ${line.id}`, validation.errors)
        }
      })
    }

    const response: PaginatedResponse<LineModel> = {
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
 * GET /api/lines/[id]
 * Get line by ID
 */
export async function getLine(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const { id } = handler.getParams()
    
    if (!id) {
      throw new ApiError(400, 'Line ID is required')
    }

    const line = await lineRepo.findById(id)

    if (!line) {
      throw new ApiError(404, `Line not found: ${id}`)
    }

    // Validate data
    const validation = validators.line.validate(line)
    if (!validation.valid) {
      handler.log('warn', `Invalid line data: ${id}`, validation.errors)
    }

    const response: ApiResponse<LineModel> = {
      success: true,
      data: line,
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
 * POST /api/lines
 * Create new line
 */
export async function createLine(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const body = handler.getBody()

    // Validate required fields
    const requiredFields = ['name', 'type', 'path', 'length', 'voltage', 'capacity', 'fromSubstation', 'toSubstation']
    validateRequest(body, requiredFields)

    // Create line data
    const lineData: Partial<LineModel> = {
      ...body,
      id: generateLineId(),
      status: body.status || EntityStatus.ACTIVE,
      powerFlow: body.powerFlow || 0,
      current: body.current || 0,
      temperature: body.temperature || 25,
      loadFactor: body.loadFactor || 0,
      efficiency: body.efficiency || 0.95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Validate line data
    const validation = validators.line.validate(lineData as LineModel)
    if (!validation.valid) {
      throw new ApiError(400, 'Invalid line data', validation.errors)
    }

    // Validate line path
    const pathValidation = validateLinePath(lineData.path!)
    if (!pathValidation.valid) {
      throw new ApiError(400, 'Invalid line path', pathValidation.errors)
    }

    // Save to repository
    const createdLine = await lineRepo.create(lineData as LineModel)

    const response: ApiResponse<LineModel> = {
      success: true,
      data: createdLine,
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
 * PUT /api/lines/[id]
 * Update line
 */
export async function updateLine(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const { id } = handler.getParams()
    const body = handler.getBody()

    if (!id) {
      throw new ApiError(400, 'Line ID is required')
    }

    // Check if line exists
    const existingLine = await lineRepo.findById(id)
    if (!existingLine) {
      throw new ApiError(404, `Line not found: ${id}`)
    }

    // Update data
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString()
    }

    // Merge with existing data
    const updatedLine = {
      ...existingLine,
      ...updateData,
      id // Ensure ID doesn't change
    }

    // Validate updated data
    const validation = validators.line.validate(updatedLine)
    if (!validation.valid) {
      throw new ApiError(400, 'Invalid line data', validation.errors)
    }

    // Validate path if provided
    if (updateData.path) {
      const pathValidation = validateLinePath(updateData.path)
      if (!pathValidation.valid) {
        throw new ApiError(400, 'Invalid line path', pathValidation.errors)
      }
    }

    // Save to repository
    const result = await lineRepo.update(id, updatedLine)

    const response: ApiResponse<LineModel> = {
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
 * PATCH /api/lines/[id]
 * Partial update line
 */
export async function patchLine(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const { id } = handler.getParams()
    const body = handler.getBody()

    if (!id) {
      throw new ApiError(400, 'Line ID is required')
    }

    // Check if line exists
    const existingLine = await lineRepo.findById(id)
    if (!existingLine) {
      throw new ApiError(404, `Line not found: ${id}`)
    }

    // Apply partial update
    const patchData = {
      ...body,
      updatedAt: new Date().toISOString()
    }

    // Validate path if provided
    if (patchData.path) {
      const pathValidation = validateLinePath(patchData.path)
      if (!pathValidation.valid) {
        throw new ApiError(400, 'Invalid line path', pathValidation.errors)
      }
    }

    const result = await lineRepo.patch(id, patchData)

    // Validate patched data
    const validation = validators.line.validate(result)
    if (!validation.valid) {
      handler.log('warn', `Validation warnings after patch: ${id}`, validation.warnings)
    }

    const response: ApiResponse<LineModel> = {
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
 * DELETE /api/lines/[id]
 * Delete line
 */
export async function deleteLine(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const { id } = handler.getParams()

    if (!id) {
      throw new ApiError(400, 'Line ID is required')
    }

    // Check if line exists
    const existingLine = await lineRepo.findById(id)
    if (!existingLine) {
      throw new ApiError(404, `Line not found: ${id}`)
    }

    // Delete from repository
    await lineRepo.delete(id)

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
 * GET /api/lines/substation/[substationId]
 * Get lines connected to a substation
 */
export async function getLinesBySubstation(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const { substationId } = handler.getParams()

    if (!substationId) {
      throw new ApiError(400, 'Substation ID is required')
    }

    const lines = await lineRepo.findBySubstation(substationId)

    const response: ApiResponse<LineModel[]> = {
      success: true,
      data: lines,
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
 * GET /api/lines/redundancy-group/[group]
 * Get lines by redundancy group
 */
export async function getLinesByRedundancyGroup(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const { group } = handler.getParams()

    if (!group) {
      throw new ApiError(400, 'Redundancy group is required')
    }

    const lines = await lineRepo.findByRedundancyGroup(group)

    const response: ApiResponse<LineModel[]> = {
      success: true,
      data: lines,
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
 * GET /api/lines/stats
 * Get line statistics
 */
export async function getLineStats(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const stats = await lineRepo.getStats()

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
 * GET /api/lines/overloaded
 * Get overloaded lines
 */
export async function getOverloadedLines(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const query = handler.parseQuery()
    const threshold = parseFloat(query.threshold as string) || 0.9

    const lines = await lineRepo.getOverloadedLines(threshold)

    const response: ApiResponse<LineModel[]> = {
      success: true,
      data: lines,
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
 * GET /api/lines/critical
 * Get critical lines
 */
export async function getCriticalLines(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const lines = await lineRepo.getCriticalLines()

    const response: ApiResponse<LineModel[]> = {
      success: true,
      data: lines,
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
 * PUT /api/lines/power-flows/bulk
 * Bulk update power flows
 */
export async function bulkUpdatePowerFlows(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const updates = handler.getBody()

    if (!Array.isArray(updates)) {
      throw new ApiError(400, 'Updates must be an array')
    }

    // Validate each update
    updates.forEach((update, index) => {
      if (!update.lineId) {
        throw new ApiError(400, `Update at index ${index} missing lineId`)
      }
      if (typeof update.powerFlow !== 'number') {
        throw new ApiError(400, `Update at index ${index} missing or invalid powerFlow`)
      }
      if (typeof update.current !== 'number') {
        throw new ApiError(400, `Update at index ${index} missing or invalid current`)
      }
    })

    const results = await lineRepo.bulkUpdatePowerFlows(updates)

    const response: ApiResponse<LineModel[]> = {
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
 * GET /api/lines/search
 * Search lines
 */
export async function searchLines(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const query = handler.parseQuery()
    const searchQuery = query.q as string
    const limit = parseInt(query.limit as string) || 10

    if (!searchQuery) {
      throw new ApiError(400, 'Search query is required')
    }

    const lines = await lineRepo.search(searchQuery, limit)

    const response: ApiResponse<LineModel[]> = {
      success: true,
      data: lines,
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
 * GET /api/lines/area
 * Get lines in geographic area
 */
export async function getLinesInArea(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const query = handler.parseQuery()
    const north = parseFloat(query.north as string)
    const south = parseFloat(query.south as string)
    const east = parseFloat(query.east as string)
    const west = parseFloat(query.west as string)

    if (isNaN(north) || isNaN(south) || isNaN(east) || isNaN(west)) {
      throw new ApiError(400, 'Valid bounds (north, south, east, west) are required')
    }

    const bounds = { north, south, east, west }
    const lines = await lineRepo.findInArea(bounds)

    const response: ApiResponse<LineModel[]> = {
      success: true,
      data: lines,
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
 * GET /api/lines/[id]/optimize-path
 * Get path optimization suggestions
 */
export async function getPathOptimization(req: NextApiRequest, res: NextApiResponse) {
  const handler = new ApiHandler(req, res)

  try {
    const { id } = handler.getParams()

    if (!id) {
      throw new ApiError(400, 'Line ID is required')
    }

    const line = await lineRepo.findById(id)
    if (!line) {
      throw new ApiError(404, `Line not found: ${id}`)
    }

    const optimization = await lineRepo.getPathOptimization(id)

    const response: ApiResponse<any> = {
      success: true,
      data: optimization,
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
 * Helper function to generate line ID
 */
function generateLineId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `line-${timestamp}-${random}`
}

/**
 * Helper function to validate line path
 */
function validateLinePath(path: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!Array.isArray(path)) {
    errors.push('Path must be an array')
    return { valid: false, errors }
  }

  if (path.length < 2) {
    errors.push('Path must have at least 2 points')
  }
  
  // Check for duplicate consecutive points
  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1]
    const curr = path[i]
    
    if (!prev || !curr) {
      errors.push(`Invalid point at index ${i}`)
      continue
    }
    
    if (prev.x === curr.x && prev.y === curr.y) {
      errors.push(`Duplicate consecutive points at index ${i}`)
    }
  }
  
  // Check for valid coordinates
  path.forEach((point, index) => {
    if (!point || typeof point !== 'object') {
      errors.push(`Invalid point object at index ${index}`)
      return
    }
    
    if (typeof point.x !== 'number' || typeof point.y !== 'number') {
      errors.push(`Invalid coordinates at index ${index}`)
    }
    
    if (isNaN(point.x) || isNaN(point.y)) {
      errors.push(`NaN coordinates at index ${index}`)
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Route handler mapping
 */
export const lineRoutes = {
  'GET /api/lines': getLines,
  'GET /api/lines/[id]': getLine,
  'POST /api/lines': createLine,
  'PUT /api/lines/[id]': updateLine,
  'PATCH /api/lines/[id]': patchLine,
  'DELETE /api/lines/[id]': deleteLine,
  'GET /api/lines/substation/[substationId]': getLinesBySubstation,
  'GET /api/lines/redundancy-group/[group]': getLinesByRedundancyGroup,
  'GET /api/lines/stats': getLineStats,
  'GET /api/lines/overloaded': getOverloadedLines,
  'GET /api/lines/critical': getCriticalLines,
  'PUT /api/lines/power-flows/bulk': bulkUpdatePowerFlows,
  'GET /api/lines/search': searchLines,
  'GET /api/lines/area': getLinesInArea,
  'GET /api/lines/[id]/optimize-path': getPathOptimization
}