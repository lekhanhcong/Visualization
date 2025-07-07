/**
 * Base Repository
 * Abstract base class for data repositories with common CRUD operations
 */

import { BaseEntity } from '../../models/interfaces'

/**
 * Repository configuration
 */
export interface RepositoryConfig {
  storage?: 'memory' | 'file' | 'database'
  filePath?: string
  cacheTimeout?: number
  enableCache?: boolean
}

/**
 * In-memory storage interface
 */
export interface InMemoryStorage<T extends BaseEntity> {
  [id: string]: T
}

/**
 * Abstract base repository class
 */
export abstract class BaseRepository<T extends BaseEntity> {
  protected storage: InMemoryStorage<T> = {}
  protected config: RepositoryConfig
  protected entityName: string
  private cache = new Map<string, { data: T[]; timestamp: number }>()

  constructor(entityName: string, config: RepositoryConfig = {}) {
    this.entityName = entityName
    this.config = {
      storage: 'memory',
      cacheTimeout: 300000, // 5 minutes
      enableCache: true,
      ...config
    }
    
    this.initialize()
  }

  /**
   * Initialize repository with sample data
   */
  protected async initialize(): Promise<void> {
    if (this.config.storage === 'memory') {
      await this.loadSampleData()
    } else if (this.config.storage === 'file') {
      await this.loadFromFile()
    }
  }

  /**
   * Load sample data for development/testing
   */
  protected async loadSampleData(): Promise<void> {
    // Override in subclasses to load specific sample data
  }

  /**
   * Load data from file
   */
  protected async loadFromFile(): Promise<void> {
    if (!this.config.filePath) return

    try {
      const fs = await import('fs').then(module => module.promises)
      const data = await fs.readFile(this.config.filePath!, 'utf8')
      const entities = JSON.parse(data)
      
      if (Array.isArray(entities)) {
        entities.forEach(entity => {
          this.storage[entity.id] = entity
        })
      }
    } catch (error) {
      console.warn(`Failed to load data from file ${this.config.filePath}:`, error)
    }
  }

  /**
   * Save data to file
   */
  protected async saveToFile(): Promise<void> {
    if (!this.config.filePath) return

    try {
      const fs = await import('fs').then(module => module.promises)
      const entities = Object.values(this.storage)
      await fs.writeFile(this.config.filePath!, JSON.stringify(entities, null, 2))
    } catch (error) {
      console.error(`Failed to save data to file ${this.config.filePath}:`, error)
    }
  }

  /**
   * Get all entities
   */
  async getAll(): Promise<T[]> {
    const cacheKey = 'all'
    
    // Check cache
    if (this.config.enableCache) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached
      }
    }

    const entities = Object.values(this.storage)
    
    // Cache result
    if (this.config.enableCache) {
      this.setCache(cacheKey, entities)
    }

    return entities
  }

  /**
   * Find entity by ID
   */
  async findById(id: string): Promise<T | null> {
    const entity = this.storage[id] || null
    return entity ? { ...entity } : null // Return copy to prevent mutations
  }

  /**
   * Create new entity
   */
  async create(entity: T): Promise<T> {
    if (!entity.id) {
      throw new Error('Entity must have an ID')
    }

    if (this.storage[entity.id]) {
      throw new Error(`Entity with ID ${entity.id} already exists`)
    }

    const newEntity = {
      ...entity,
      createdAt: entity.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.storage[entity.id] = newEntity
    this.clearCache()
    
    if (this.config.storage === 'file') {
      await this.saveToFile()
    }

    return { ...newEntity }
  }

  /**
   * Update entity
   */
  async update(id: string, entity: T): Promise<T> {
    if (!this.storage[id]) {
      throw new Error(`Entity with ID ${id} not found`)
    }

    const updatedEntity = {
      ...entity,
      id, // Ensure ID doesn't change
      createdAt: this.storage[id].createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    }

    this.storage[id] = updatedEntity
    this.clearCache()
    
    if (this.config.storage === 'file') {
      await this.saveToFile()
    }

    return { ...updatedEntity }
  }

  /**
   * Partial update entity
   */
  async patch(id: string, data: Partial<T>): Promise<T> {
    const existing = this.storage[id]
    
    if (!existing) {
      throw new Error(`Entity with ID ${id} not found`)
    }

    const patchedEntity = {
      ...existing,
      ...data,
      id, // Ensure ID doesn't change
      createdAt: existing.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    }

    this.storage[id] = patchedEntity
    this.clearCache()
    
    if (this.config.storage === 'file') {
      await this.saveToFile()
    }

    return { ...patchedEntity }
  }

  /**
   * Delete entity
   */
  async delete(id: string): Promise<boolean> {
    if (!this.storage[id]) {
      throw new Error(`Entity with ID ${id} not found`)
    }

    delete this.storage[id]
    this.clearCache()
    
    if (this.config.storage === 'file') {
      await this.saveToFile()
    }

    return true
  }

  /**
   * Check if entity exists
   */
  async exists(id: string): Promise<boolean> {
    return !!this.storage[id]
  }

  /**
   * Count entities
   */
  async count(): Promise<number> {
    return Object.keys(this.storage).length
  }

  /**
   * Find entities by field value
   */
  async findBy(field: keyof T, value: any): Promise<T[]> {
    const entities = await this.getAll()
    return entities.filter(entity => entity[field] === value)
  }

  /**
   * Find first entity by field value
   */
  async findOneBy(field: keyof T, value: any): Promise<T | null> {
    const entities = await this.findBy(field, value)
    return entities.length > 0 ? entities[0] : null
  }

  /**
   * Bulk create entities
   */
  async bulkCreate(entities: T[]): Promise<T[]> {
    const results: T[] = []

    for (const entity of entities) {
      try {
        const created = await this.create(entity)
        results.push(created)
      } catch (error) {
        console.error(`Failed to create entity ${entity.id}:`, error)
        // Continue with other entities
      }
    }

    return results
  }

  /**
   * Bulk delete entities
   */
  async bulkDelete(ids: string[]): Promise<string[]> {
    const deleted: string[] = []

    for (const id of ids) {
      try {
        await this.delete(id)
        deleted.push(id)
      } catch (error) {
        console.error(`Failed to delete entity ${id}:`, error)
        // Continue with other entities
      }
    }

    return deleted
  }

  /**
   * Clear all entities
   */
  async clear(): Promise<void> {
    this.storage = {}
    this.clearCache()
    
    if (this.config.storage === 'file') {
      await this.saveToFile()
    }
  }

  /**
   * Get entity count by field value
   */
  async countBy(field: keyof T, value: any): Promise<number> {
    const entities = await this.findBy(field, value)
    return entities.length
  }

  /**
   * Get unique values for a field
   */
  async getUniqueValues(field: keyof T): Promise<any[]> {
    const entities = await this.getAll()
    const values = entities.map(entity => entity[field])
    return [...new Set(values)]
  }

  /**
   * Get entities created after a date
   */
  async getCreatedAfter(date: Date | string): Promise<T[]> {
    const entities = await this.getAll()
    const filterDate = new Date(date)
    
    return entities.filter(entity => {
      const createdAt = new Date(entity.createdAt)
      return createdAt > filterDate
    })
  }

  /**
   * Get entities updated after a date
   */
  async getUpdatedAfter(date: Date | string): Promise<T[]> {
    const entities = await this.getAll()
    const filterDate = new Date(date)
    
    return entities.filter(entity => {
      const updatedAt = new Date(entity.updatedAt)
      return updatedAt > filterDate
    })
  }

  /**
   * Export entities to JSON
   */
  async exportToJson(): Promise<string> {
    const entities = await this.getAll()
    return JSON.stringify(entities, null, 2)
  }

  /**
   * Import entities from JSON
   */
  async importFromJson(jsonData: string): Promise<T[]> {
    try {
      const entities = JSON.parse(jsonData)
      
      if (!Array.isArray(entities)) {
        throw new Error('JSON data must be an array of entities')
      }

      const imported: T[] = []
      
      for (const entity of entities) {
        try {
          // Check if entity already exists
          if (await this.exists(entity.id)) {
            // Update existing entity
            const updated = await this.update(entity.id, entity)
            imported.push(updated)
          } else {
            // Create new entity
            const created = await this.create(entity)
            imported.push(created)
          }
        } catch (error) {
          console.error(`Failed to import entity ${entity.id}:`, error)
        }
      }

      return imported
    } catch (error) {
      throw new Error(`Failed to import from JSON: ${error}`)
    }
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): T[] | null {
    if (!this.config.enableCache) return null

    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > this.config.cacheTimeout!) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  private setCache(key: string, data: T[]): void {
    if (!this.config.enableCache) return

    this.cache.set(key, {
      data: [...data], // Store copy
      timestamp: Date.now()
    })
  }

  private clearCache(): void {
    this.cache.clear()
  }

  /**
   * Repository health check
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy'
    entityCount: number
    storageType: string
    cacheSize: number
    lastUpdated?: string
  }> {
    try {
      const count = await this.count()
      const entities = Object.values(this.storage)
      const lastUpdated = entities.length > 0 
        ? Math.max(...entities.map(e => new Date(e.updatedAt).getTime()))
        : undefined

      return {
        status: 'healthy',
        entityCount: count,
        storageType: this.config.storage || 'memory',
        cacheSize: this.cache.size,
        lastUpdated: lastUpdated ? new Date(lastUpdated).toISOString() : undefined
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        entityCount: 0,
        storageType: this.config.storage || 'memory',
        cacheSize: 0
      }
    }
  }

  /**
   * Get repository statistics
   */
  async getStats(): Promise<{
    totalEntities: number
    createdToday: number
    updatedToday: number
    oldestEntity?: string
    newestEntity?: string
  }> {
    const entities = await this.getAll()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const createdToday = entities.filter(entity => {
      const created = new Date(entity.createdAt)
      return created >= today
    }).length

    const updatedToday = entities.filter(entity => {
      const updated = new Date(entity.updatedAt)
      return updated >= today
    }).length

    let oldestEntity: string | undefined
    let newestEntity: string | undefined

    if (entities.length > 0) {
      const sorted = entities.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      oldestEntity = sorted[0].createdAt.toString()
      newestEntity = sorted[sorted.length - 1].createdAt.toString()
    }

    return {
      totalEntities: entities.length,
      createdToday,
      updatedToday,
      oldestEntity,
      newestEntity
    }
  }
}