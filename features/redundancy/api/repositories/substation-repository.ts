/**
 * Substation Repository
 * Data access layer for substation operations
 */

import { SubstationModel, EntityStatus, DataFilter, DataSort, Pagination } from '../../models/interfaces'
import { BaseRepository } from './base-repository'

/**
 * Substation query options
 */
export interface SubstationQueryOptions {
  filters?: DataFilter[]
  pagination?: { page: number; limit: number }
  sort?: DataSort[]
  include?: string[]
}

/**
 * Substation repository result
 */
export interface SubstationRepositoryResult {
  data: SubstationModel[]
  pagination: Pagination
}

/**
 * Substation statistics
 */
export interface SubstationStats {
  total: number
  byStatus: Record<EntityStatus, number>
  byType: Record<string, number>
  byZone: Record<string, number>
  byRedundancyLevel: Record<string, number>
  totalCapacity: number
  totalLoad: number
  averageEfficiency: number
  averageReliability: number
  averageAvailability: number
  averageTemperature: number
}

/**
 * Substation repository implementation
 */
export class SubstationRepository extends BaseRepository<SubstationModel> {
  constructor() {
    super('substations')
  }

  /**
   * Find many substations with filtering, pagination, and sorting
   */
  async findMany(options: SubstationQueryOptions = {}): Promise<SubstationRepositoryResult> {
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
   * Find substations by zone
   */
  async findByZone(zone: string): Promise<SubstationModel[]> {
    const allSubstations = await this.getAll()
    return allSubstations.filter(substation => substation.zone === zone)
  }

  /**
   * Find substations by redundancy group
   */
  async findByRedundancyGroup(group: string): Promise<SubstationModel[]> {
    const allSubstations = await this.getAll()
    return allSubstations.filter(substation => substation.redundancyGroup === group)
  }

  /**
   * Find substations by status
   */
  async findByStatus(status: EntityStatus): Promise<SubstationModel[]> {
    const allSubstations = await this.getAll()
    return allSubstations.filter(substation => substation.status === status)
  }

  /**
   * Find substations by type
   */
  async findByType(type: string): Promise<SubstationModel[]> {
    const allSubstations = await this.getAll()
    return allSubstations.filter(substation => substation.type === type)
  }

  /**
   * Add connection to substation
   */
  async addConnection(substationId: string, lineId: string): Promise<SubstationModel> {
    const substation = await this.findById(substationId)
    
    if (!substation) {
      throw new Error(`Substation not found: ${substationId}`)
    }

    if (!substation.connections) {
      substation.connections = []
    }

    if (!substation.connections.includes(lineId)) {
      substation.connections.push(lineId)
      substation.updatedAt = new Date().toISOString()
      
      await this.update(substationId, substation)
    }

    return substation
  }

  /**
   * Remove connection from substation
   */
  async removeConnection(substationId: string, lineId: string): Promise<SubstationModel> {
    const substation = await this.findById(substationId)
    
    if (!substation) {
      throw new Error(`Substation not found: ${substationId}`)
    }

    if (substation.connections) {
      substation.connections = substation.connections.filter(id => id !== lineId)
      substation.updatedAt = new Date().toISOString()
      
      await this.update(substationId, substation)
    }

    return substation
  }

  /**
   * Bulk update substations
   */
  async bulkUpdate(updates: Array<{ id: string; data: Partial<SubstationModel> }>): Promise<SubstationModel[]> {
    const results: SubstationModel[] = []

    for (const update of updates) {
      try {
        const existing = await this.findById(update.id)
        if (!existing) {
          throw new Error(`Substation not found: ${update.id}`)
        }

        const updated = {
          ...existing,
          ...update.data,
          id: update.id, // Ensure ID doesn't change
          updatedAt: new Date().toISOString()
        }

        const result = await this.update(update.id, updated)
        results.push(result)
      } catch (error) {
        console.error(`Failed to update substation ${update.id}:`, error)
        // Continue with other updates
      }
    }

    return results
  }

  /**
   * Search substations by name or description
   */
  async search(query: string, limit = 10): Promise<SubstationModel[]> {
    const allSubstations = await this.getAll()
    const lowerQuery = query.toLowerCase()

    const matches = allSubstations.filter(substation => {
      return (
        substation.name.toLowerCase().includes(lowerQuery) ||
        (substation.description && substation.description.toLowerCase().includes(lowerQuery)) ||
        substation.zone.toLowerCase().includes(lowerQuery) ||
        substation.redundancyGroup.toLowerCase().includes(lowerQuery)
      )
    })

    return matches.slice(0, limit)
  }

  /**
   * Find nearby substations using coordinates
   */
  async findNearby(latitude: number, longitude: number, radiusKm: number): Promise<SubstationModel[]> {
    const allSubstations = await this.getAll()

    return allSubstations.filter(substation => {
      if (!substation.position) return false

      const distance = this.calculateDistance(
        latitude,
        longitude,
        substation.position.y, // Assuming y is latitude
        substation.position.x  // Assuming x is longitude
      )

      return distance <= radiusKm
    })
  }

  /**
   * Get substation statistics
   */
  override async getStats(): Promise<{
    totalEntities: number
    createdToday: number
    updatedToday: number
    oldestEntity?: string
    newestEntity?: string
  }> {
    const allSubstations = await this.getAll()

    const stats: SubstationStats = {
      total: allSubstations.length,
      byStatus: {} as Record<EntityStatus, number>,
      byType: {},
      byZone: {},
      byRedundancyLevel: {},
      totalCapacity: 0,
      totalLoad: 0,
      averageEfficiency: 0,
      averageReliability: 0,
      averageAvailability: 0,
      averageTemperature: 0
    }

    // Initialize status counts
    Object.values(EntityStatus).forEach(status => {
      stats.byStatus[status] = 0
    })

    let totalEfficiency = 0
    let totalReliability = 0
    let totalAvailability = 0
    let totalTemperature = 0

    allSubstations.forEach(substation => {
      // Count by status
      stats.byStatus[substation.status] = (stats.byStatus[substation.status] || 0) + 1

      // Count by type
      stats.byType[substation.type] = (stats.byType[substation.type] || 0) + 1

      // Count by zone
      stats.byZone[substation.zone] = (stats.byZone[substation.zone] || 0) + 1

      // Count by redundancy level
      stats.byRedundancyLevel[substation.redundancyLevel] = 
        (stats.byRedundancyLevel[substation.redundancyLevel] || 0) + 1

      // Sum capacities and loads
      stats.totalCapacity += substation.powerRating
      stats.totalLoad += substation.currentLoad

      // Sum for averages
      totalEfficiency += substation.efficiency
      totalReliability += substation.reliability
      totalAvailability += substation.availability
      totalTemperature += substation.temperature
    })

    // Calculate averages
    if (allSubstations.length > 0) {
      stats.averageEfficiency = totalEfficiency / allSubstations.length
      stats.averageReliability = totalReliability / allSubstations.length
      stats.averageAvailability = totalAvailability / allSubstations.length
      stats.averageTemperature = totalTemperature / allSubstations.length
    }

    return await super.getStats()
  }

  /**
   * Get active substations
   */
  async getActiveSubstations(): Promise<SubstationModel[]> {
    return this.findByStatus(EntityStatus.ACTIVE)
  }

  /**
   * Get overloaded substations
   */
  async getOverloadedSubstations(threshold = 0.9): Promise<SubstationModel[]> {
    const allSubstations = await this.getAll()
    
    return allSubstations.filter(substation => {
      const loadFactor = substation.currentLoad / substation.powerRating
      return loadFactor > threshold
    })
  }

  /**
   * Get substations requiring maintenance
   */
  async getMaintenanceRequiredSubstations(): Promise<SubstationModel[]> {
    const allSubstations = await this.getAll()
    const now = new Date()

    return allSubstations.filter(substation => {
      // Check if maintenance is overdue
      if (substation.nextMaintenance) {
        const nextMaintenance = new Date(substation.nextMaintenance)
        if (nextMaintenance <= now) {
          return true
        }
      }

      // Check if reliability is below threshold
      if (substation.reliability < 0.95) {
        return true
      }

      // Check if availability is below threshold
      if (substation.availability < 0.98) {
        return true
      }

      return false
    })
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.degToRad(lat2 - lat1)
    const dLon = this.degToRad(lon2 - lon1)
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(lat1)) * Math.cos(this.degToRad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * Convert degrees to radians
   */
  private degToRad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  /**
   * Apply filters to substation data
   */
  private applyFilters(data: SubstationModel[], filters: DataFilter[]): SubstationModel[] {
    return data.filter(substation => {
      return filters.every(filter => {
        const value = this.getNestedValue(substation, filter.field)
        
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
   * Apply sorting to substation data
   */
  private applySort(data: SubstationModel[], sorts: DataSort[]): SubstationModel[] {
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