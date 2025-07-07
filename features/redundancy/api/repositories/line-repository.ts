/**
 * Line Repository
 * Data access layer for power line operations
 */

import { LineModel, EntityStatus, DataFilter, DataSort, Pagination, Coordinates } from '../../models/interfaces'
import { BaseRepository } from './base-repository'

/**
 * Line query options
 */
export interface LineQueryOptions {
  filters?: DataFilter[]
  pagination?: { page: number; limit: number }
  sort?: DataSort[]
  include?: string[]
}

/**
 * Line repository result
 */
export interface LineRepositoryResult {
  data: LineModel[]
  pagination: Pagination
}

/**
 * Line statistics
 */
export interface LineStats {
  total: number
  byStatus: Record<EntityStatus, number>
  byType: Record<string, number>
  byVoltageLevel: Record<string, number>
  totalCapacity: number
  totalPowerFlow: number
  averageLoadFactor: number
  averageEfficiency: number
  averageTemperature: number
  overloadedLines: number
  criticalLines: number
}

/**
 * Power flow update data
 */
export interface PowerFlowUpdate {
  lineId: string
  powerFlow: number
  current: number
  loadFactor: number
  timestamp: string
}

/**
 * Line repository implementation
 */
export class LineRepository extends BaseRepository<LineModel> {
  constructor() {
    super('lines')
  }

  /**
   * Load sample data for development
   */
  protected override async loadSampleData(): Promise<void> {
    const sampleLines: LineModel[] = [
      {
        id: 'line-001',
        name: 'North-East Transmission Line',
        description: 'High voltage transmission line connecting North and East sectors',
        type: 'TRANSMISSION',
        status: EntityStatus.ACTIVE,
        path: [
          { x: 200, y: 150 },
          { x: 350, y: 200 },
          { x: 600, y: 300 }
        ],
        length: 45.5,
        voltage: 230,
        capacity: 500,
        powerFlow: 380,
        current: 1652,
        impedance: {
          resistance: 0.05,
          reactance: 0.35
        },
        temperature: 65,
        loadFactor: 0.76,
        efficiency: 0.97,
        fromSubstation: 'sub-001',
        toSubstation: 'sub-003',
        redundancyGroup: 'north-group',
        backupLines: ['line-002'],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-03-01T15:30:00Z'
      },
      {
        id: 'line-002',
        name: 'North-East Backup Line',
        description: 'Backup transmission line for North-East connection',
        type: 'TRANSMISSION',
        status: EntityStatus.STANDBY,
        path: [
          { x: 200, y: 150 },
          { x: 400, y: 250 },
          { x: 600, y: 300 }
        ],
        length: 48.2,
        voltage: 230,
        capacity: 500,
        powerFlow: 0,
        current: 0,
        impedance: {
          resistance: 0.06,
          reactance: 0.38
        },
        temperature: 25,
        loadFactor: 0,
        efficiency: 0.96,
        fromSubstation: 'sub-002',
        toSubstation: 'sub-003',
        redundancyGroup: 'north-group',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-03-01T12:00:00Z'
      },
      {
        id: 'line-003',
        name: 'East-South Distribution Line',
        description: 'Medium voltage distribution line',
        type: 'DISTRIBUTION',
        status: EntityStatus.ACTIVE,
        path: [
          { x: 600, y: 300 },
          { x: 550, y: 450 },
          { x: 500, y: 600 }
        ],
        length: 32.1,
        voltage: 115,
        capacity: 200,
        powerFlow: 150,
        current: 1304,
        impedance: {
          resistance: 0.12,
          reactance: 0.25
        },
        temperature: 58,
        loadFactor: 0.75,
        efficiency: 0.94,
        fromSubstation: 'sub-003',
        toSubstation: 'sub-005',
        createdAt: '2024-01-20T14:00:00Z',
        updatedAt: '2024-03-01T16:45:00Z'
      }
    ]

    for (const line of sampleLines) {
      this.storage[line.id] = line
    }
  }

  /**
   * Find many lines with filtering, pagination, and sorting
   */
  async findMany(options: LineQueryOptions = {}): Promise<LineRepositoryResult> {
    let data = await this.getAll()

    // Apply filters
    if (options.filters) {
      data = this.applyFilters(data, options.filters)
    }

    // Apply sorting
    if (options.sort) {
      data = this.applySort(data, options.sort)
    }

    // Calculate pagination
    const pagination = this.calculatePagination(data.length, options.pagination)

    // Apply pagination
    if (options.pagination) {
      const start = (options.pagination.page - 1) * options.pagination.limit
      const end = start + options.pagination.limit
      data = data.slice(start, end)
    }

    return {
      data,
      pagination
    }
  }

  /**
   * Find lines connected to a substation
   */
  async findBySubstation(substationId: string): Promise<LineModel[]> {
    const allLines = await this.getAll()
    return allLines.filter(line => 
      line.fromSubstation === substationId || line.toSubstation === substationId
    )
  }

  /**
   * Find lines by redundancy group
   */
  async findByRedundancyGroup(group: string): Promise<LineModel[]> {
    const allLines = await this.getAll()
    return allLines.filter(line => line.redundancyGroup === group)
  }

  /**
   * Find lines by status
   */
  async findByStatus(status: EntityStatus): Promise<LineModel[]> {
    const allLines = await this.getAll()
    return allLines.filter(line => line.status === status)
  }

  /**
   * Find lines by type
   */
  async findByType(type: string): Promise<LineModel[]> {
    const allLines = await this.getAll()
    return allLines.filter(line => line.type === type)
  }

  /**
   * Get overloaded lines
   */
  async getOverloadedLines(threshold = 0.9): Promise<LineModel[]> {
    const allLines = await this.getAll()
    return allLines.filter(line => line.loadFactor > threshold)
  }

  /**
   * Get critical lines (high risk)
   */
  async getCriticalLines(): Promise<LineModel[]> {
    const allLines = await this.getAll()
    
    return allLines.filter(line => {
      // High load factor
      if (line.loadFactor > 0.95) return true
      
      // High temperature
      if (line.temperature > 85) return true
      
      // Low efficiency
      if (line.efficiency < 0.90) return true
      
      // Fault status
      if (line.status === EntityStatus.FAULT) return true
      
      return false
    })
  }

  /**
   * Bulk update power flows
   */
  async bulkUpdatePowerFlows(updates: PowerFlowUpdate[]): Promise<LineModel[]> {
    const results: LineModel[] = []

    for (const update of updates) {
      try {
        const existing = await this.findById(update.lineId)
        if (!existing) {
          console.error(`Line not found: ${update.lineId}`)
          continue
        }

        const updated = {
          ...existing,
          powerFlow: update.powerFlow,
          current: update.current,
          loadFactor: update.loadFactor,
          updatedAt: new Date().toISOString()
        }

        const result = await this.update(update.lineId, updated)
        results.push(result)
      } catch (error) {
        console.error(`Failed to update power flow for line ${update.lineId}:`, error)
      }
    }

    return results
  }

  /**
   * Search lines by name or description
   */
  async search(query: string, limit = 10): Promise<LineModel[]> {
    const allLines = await this.getAll()
    const lowerQuery = query.toLowerCase()

    const matches = allLines.filter(line => {
      return (
        line.name.toLowerCase().includes(lowerQuery) ||
        (line.description && line.description.toLowerCase().includes(lowerQuery)) ||
        line.type.toLowerCase().includes(lowerQuery) ||
        (line.redundancyGroup && line.redundancyGroup.toLowerCase().includes(lowerQuery))
      )
    })

    return matches.slice(0, limit)
  }

  /**
   * Find lines in geographic area
   */
  async findInArea(bounds: { north: number; south: number; east: number; west: number }): Promise<LineModel[]> {
    const allLines = await this.getAll()

    return allLines.filter(line => {
      if (!line.path || line.path.length === 0) return false

      // Check if any point in the path is within bounds
      return line.path.some(point => {
        return (
          point.y >= bounds.south &&
          point.y <= bounds.north &&
          point.x >= bounds.west &&
          point.x <= bounds.east
        )
      })
    })
  }

  /**
   * Get line statistics
   */
  override async getStats(): Promise<{
    totalEntities: number
    createdToday: number
    updatedToday: number
    oldestEntity?: string
    newestEntity?: string
  }> {
    const allLines = await this.getAll()

    const stats: LineStats = {
      total: allLines.length,
      byStatus: {} as Record<EntityStatus, number>,
      byType: {},
      byVoltageLevel: {},
      totalCapacity: 0,
      totalPowerFlow: 0,
      averageLoadFactor: 0,
      averageEfficiency: 0,
      averageTemperature: 0,
      overloadedLines: 0,
      criticalLines: 0
    }

    // Initialize status counts
    Object.values(EntityStatus).forEach(status => {
      stats.byStatus[status] = 0
    })

    let totalLoadFactor = 0
    let totalEfficiency = 0
    let totalTemperature = 0

    allLines.forEach(line => {
      // Count by status
      stats.byStatus[line.status] = (stats.byStatus[line.status] || 0) + 1

      // Count by type
      stats.byType[line.type] = (stats.byType[line.type] || 0) + 1

      // Count by voltage level
      const voltageLevel = getVoltageLevel(line.voltage)
      stats.byVoltageLevel[voltageLevel] = (stats.byVoltageLevel[voltageLevel] || 0) + 1

      // Sum capacities and power flows
      stats.totalCapacity += line.capacity
      stats.totalPowerFlow += Math.abs(line.powerFlow)

      // Sum for averages
      totalLoadFactor += line.loadFactor
      totalEfficiency += line.efficiency
      totalTemperature += line.temperature

      // Count overloaded lines
      if (line.loadFactor > 0.9) {
        stats.overloadedLines++
      }

      // Count critical lines
      if (line.loadFactor > 0.95 || line.temperature > 85 || line.efficiency < 0.90) {
        stats.criticalLines++
      }
    })

    // Calculate averages
    if (allLines.length > 0) {
      stats.averageLoadFactor = totalLoadFactor / allLines.length
      stats.averageEfficiency = totalEfficiency / allLines.length
      stats.averageTemperature = totalTemperature / allLines.length
    }

    return await super.getStats()
  }

  /**
   * Get path optimization suggestions
   */
  async getPathOptimization(lineId: string): Promise<{
    currentPath: Coordinates[]
    optimizedPath: Coordinates[]
    savings: {
      distance: number
      cost: number
    }
  }> {
    const line = await this.findById(lineId)
    
    if (!line) {
      throw new Error(`Line not found: ${lineId}`)
    }

    const currentPath = line.path
    const currentDistance = this.calculatePathDistance(currentPath)

    // Simple optimization: direct path between start and end points
    const optimizedPath = [
      currentPath[0],
      currentPath[currentPath.length - 1]
    ]
    const optimizedDistance = this.calculatePathDistance(optimizedPath)

    const distanceSaving = currentDistance - optimizedDistance
    const costSaving = distanceSaving * 50000 // $50k per km saved

    return {
      currentPath,
      optimizedPath,
      savings: {
        distance: distanceSaving,
        cost: costSaving
      }
    }
  }

  /**
   * Calculate path distance
   */
  private calculatePathDistance(path: Coordinates[]): number {
    if (path.length < 2) return 0
    
    let totalDistance = 0
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1]
      const curr = path[i]
      const distance = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      )
      totalDistance += distance
    }
    
    return totalDistance / 1000 // Convert to km (assuming coordinates are in meters)
  }

  /**
   * Apply filters to line data
   */
  private applyFilters(data: LineModel[], filters: DataFilter[]): LineModel[] {
    return data.filter(line => {
      return filters.every(filter => {
        const value = this.getNestedValue(line, filter.field)
        
        switch (filter.operator) {
          case 'EQUALS':
            return value === filter.value
          case 'NOT_EQUALS':
            return value !== filter.value
          case 'CONTAINS':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
          case 'GREATER_THAN':
            return Number(value) > Number(filter.value)
          case 'LESS_THAN':
            return Number(value) < Number(filter.value)
          case 'BETWEEN':
            if (filter.values && filter.values.length >= 2) {
              return Number(value) >= Number(filter.values[0]) && Number(value) <= Number(filter.values[1])
            }
            return false
          case 'IN':
            return filter.values ? filter.values.includes(value) : false
          default:
            return true
        }
      })
    })
  }

  /**
   * Apply sorting to line data
   */
  private applySort(data: LineModel[], sorts: DataSort[]): LineModel[] {
    return data.sort((a, b) => {
      for (const sort of sorts) {
        const aValue = this.getNestedValue(a, sort.field)
        const bValue = this.getNestedValue(b, sort.field)
        
        let comparison = 0
        
        if (aValue < bValue) {
          comparison = -1
        } else if (aValue > bValue) {
          comparison = 1
        }
        
        if (comparison !== 0) {
          return sort.direction === 'DESC' ? -comparison : comparison
        }
      }
      
      return 0
    })
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Calculate pagination information
   */
  private calculatePagination(
    totalCount: number, 
    pagination?: { page: number; limit: number }
  ): Pagination {
    if (!pagination) {
      return {
        page: 1,
        limit: totalCount,
        total: totalCount,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false
      }
    }

    const { page, limit } = pagination
    const totalPages = Math.ceil(totalCount / limit)

    return {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    }
  }
}

/**
 * Helper function to categorize voltage levels
 */
function getVoltageLevel(voltage: number): string {
  if (voltage >= 345) return 'Extra High Voltage (≥345kV)'
  if (voltage >= 138) return 'High Voltage (138-344kV)'
  if (voltage >= 35) return 'Medium Voltage (35-137kV)'
  if (voltage >= 1) return 'Low Voltage (1-34kV)'
  return 'Unknown'
}