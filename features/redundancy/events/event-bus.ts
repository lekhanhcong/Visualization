/**
 * Event Bus
 * Centralized event handling system for the redundancy feature
 */

import { 
  SystemEventModel, 
  AlertModel, 
  Priority,
  EntityStatus 
} from '../models/interfaces'

/**
 * Event types in the redundancy system
 */
export enum RedundancyEventType {
  // System events
  SYSTEM_STARTUP = 'SYSTEM_STARTUP',
  SYSTEM_SHUTDOWN = 'SYSTEM_SHUTDOWN',
  SYSTEM_HEALTH_CHANGE = 'SYSTEM_HEALTH_CHANGE',
  REDUNDANCY_LEVEL_CHANGE = 'REDUNDANCY_LEVEL_CHANGE',
  
  // Equipment events
  SUBSTATION_STATUS_CHANGE = 'SUBSTATION_STATUS_CHANGE',
  SUBSTATION_LOAD_CHANGE = 'SUBSTATION_LOAD_CHANGE',
  SUBSTATION_FAULT = 'SUBSTATION_FAULT',
  SUBSTATION_RECOVERY = 'SUBSTATION_RECOVERY',
  
  LINE_STATUS_CHANGE = 'LINE_STATUS_CHANGE',
  LINE_OVERLOAD = 'LINE_OVERLOAD',
  LINE_FAULT = 'LINE_FAULT',
  LINE_RECOVERY = 'LINE_RECOVERY',
  
  // Redundancy events
  FAILOVER_INITIATED = 'FAILOVER_INITIATED',
  FAILOVER_COMPLETED = 'FAILOVER_COMPLETED',
  FAILOVER_FAILED = 'FAILOVER_FAILED',
  REDUNDANCY_LOST = 'REDUNDANCY_LOST',
  REDUNDANCY_RESTORED = 'REDUNDANCY_RESTORED',
  
  // Maintenance events
  MAINTENANCE_SCHEDULED = 'MAINTENANCE_SCHEDULED',
  MAINTENANCE_STARTED = 'MAINTENANCE_STARTED',
  MAINTENANCE_COMPLETED = 'MAINTENANCE_COMPLETED',
  MAINTENANCE_OVERDUE = 'MAINTENANCE_OVERDUE',
  
  // Alert events
  ALERT_CREATED = 'ALERT_CREATED',
  ALERT_ACKNOWLEDGED = 'ALERT_ACKNOWLEDGED',
  ALERT_RESOLVED = 'ALERT_RESOLVED',
  ALERT_ESCALATED = 'ALERT_ESCALATED',
  
  // User events
  USER_ACTION = 'USER_ACTION',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  
  // Configuration events
  CONFIG_CHANGED = 'CONFIG_CHANGED',
  THRESHOLD_EXCEEDED = 'THRESHOLD_EXCEEDED',
  
  // Custom events
  CUSTOM = 'CUSTOM'
}

/**
 * Event data interface
 */
export interface RedundancyEvent<T = any> {
  id: string
  type: RedundancyEventType
  timestamp: Date
  source: string
  entityId?: string
  entityType?: string
  severity: Priority
  data: T
  metadata?: Record<string, any>
  correlationId?: string
  causedBy?: string[]
}

/**
 * Event handler function type
 */
export type EventHandler<T = any> = (event: RedundancyEvent<T>) => void | Promise<void>

/**
 * Event filter function type
 */
export type EventFilter<T = any> = (event: RedundancyEvent<T>) => boolean

/**
 * Event subscription configuration
 */
export interface EventSubscription {
  id: string
  type: RedundancyEventType | '*'
  handler: EventHandler
  filter?: EventFilter
  once?: boolean
  priority?: number
  metadata?: Record<string, any>
}

/**
 * Event bus statistics
 */
export interface EventBusStats {
  totalEvents: number
  eventsByType: Record<string, number>
  eventsBySeverity: Record<Priority, number>
  subscriptionCount: number
  averageProcessingTime: number
  lastEventTime?: Date
  errorCount: number
}

/**
 * Main event bus implementation
 */
export class RedundancyEventBus {
  private subscriptions = new Map<string, EventSubscription>()
  private eventHistory: RedundancyEvent[] = []
  private stats: EventBusStats = {
    totalEvents: 0,
    eventsByType: {},
    eventsBySeverity: {
      [Priority.LOW]: 0,
      [Priority.MEDIUM]: 0,
      [Priority.HIGH]: 0,
      [Priority.CRITICAL]: 0
    },
    subscriptionCount: 0,
    averageProcessingTime: 0,
    errorCount: 0
  }
  private processingTimes: number[] = []
  private maxHistorySize = 1000
  private isProcessing = false
  private eventQueue: RedundancyEvent[] = []

  /**
   * Subscribe to events
   */
  subscribe<T = any>(
    type: RedundancyEventType | '*',
    handler: EventHandler<T>,
    options: {
      filter?: EventFilter<T>
      once?: boolean
      priority?: number
      metadata?: Record<string, any>
    } = {}
  ): string {
    const subscription: EventSubscription = {
      id: this.generateSubscriptionId(),
      type,
      handler: handler as EventHandler,
      filter: options.filter as EventFilter,
      once: options.once || false,
      priority: options.priority || 0,
      metadata: options.metadata
    }

    this.subscriptions.set(subscription.id, subscription)
    this.stats.subscriptionCount = this.subscriptions.size

    return subscription.id
  }

  /**
   * Subscribe to events with a specific filter
   */
  subscribeWithFilter<T = any>(
    type: RedundancyEventType | '*',
    filter: EventFilter<T>,
    handler: EventHandler<T>,
    options: {
      once?: boolean
      priority?: number
      metadata?: Record<string, any>
    } = {}
  ): string {
    return this.subscribe(type, handler, { ...options, filter })
  }

  /**
   * Subscribe to events once
   */
  once<T = any>(
    type: RedundancyEventType | '*',
    handler: EventHandler<T>,
    options: {
      filter?: EventFilter<T>
      priority?: number
      metadata?: Record<string, any>
    } = {}
  ): string {
    return this.subscribe(type, handler, { ...options, once: true })
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): boolean {
    const removed = this.subscriptions.delete(subscriptionId)
    if (removed) {
      this.stats.subscriptionCount = this.subscriptions.size
    }
    return removed
  }

  /**
   * Unsubscribe all handlers for a specific event type
   */
  unsubscribeAll(type: RedundancyEventType): number {
    let removed = 0
    for (const [id, subscription] of this.subscriptions) {
      if (subscription.type === type) {
        this.subscriptions.delete(id)
        removed++
      }
    }
    this.stats.subscriptionCount = this.subscriptions.size
    return removed
  }

  /**
   * Emit an event
   */
  async emit<T = any>(
    type: RedundancyEventType,
    data: T,
    options: {
      source?: string
      entityId?: string
      entityType?: string
      severity?: Priority
      metadata?: Record<string, any>
      correlationId?: string
      causedBy?: string[]
    } = {}
  ): Promise<void> {
    const event: RedundancyEvent<T> = {
      id: this.generateEventId(),
      type,
      timestamp: new Date(),
      source: options.source || 'system',
      entityId: options.entityId,
      entityType: options.entityType,
      severity: options.severity || Priority.MEDIUM,
      data,
      metadata: options.metadata,
      correlationId: options.correlationId,
      causedBy: options.causedBy
    }

    // Add to queue for processing
    this.eventQueue.push(event)
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      await this.processEventQueue()
    }
  }

  /**
   * Process event queue
   */
  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return
    }

    this.isProcessing = true

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()!
        await this.processEvent(event)
      }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Process individual event
   */
  private async processEvent<T = any>(event: RedundancyEvent<T>): Promise<void> {
    const startTime = Date.now()

    try {
      // Add to history
      this.addToHistory(event)

      // Update statistics
      this.updateStats(event)

      // Get matching subscriptions
      const matchingSubscriptions = this.getMatchingSubscriptions(event)

      // Sort by priority (higher priority first)
      matchingSubscriptions.sort((a, b) => (b.priority || 0) - (a.priority || 0))

      // Execute handlers
      const handlerPromises = matchingSubscriptions.map(async (subscription) => {
        try {
          await subscription.handler(event)
          
          // Remove one-time subscriptions
          if (subscription.once) {
            this.subscriptions.delete(subscription.id)
          }
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error)
          this.stats.errorCount++
        }
      })

      // Wait for all handlers to complete
      await Promise.all(handlerPromises)

    } catch (error) {
      console.error(`Error processing event ${event.type}:`, error)
      this.stats.errorCount++
    } finally {
      // Update processing time statistics
      const processingTime = Date.now() - startTime
      this.updateProcessingTime(processingTime)
    }
  }

  /**
   * Get matching subscriptions for an event
   */
  private getMatchingSubscriptions<T = any>(event: RedundancyEvent<T>): EventSubscription[] {
    const matching: EventSubscription[] = []

    for (const subscription of this.subscriptions.values()) {
      // Check type match
      if (subscription.type !== '*' && subscription.type !== event.type) {
        continue
      }

      // Check filter
      if (subscription.filter && !subscription.filter(event)) {
        continue
      }

      matching.push(subscription)
    }

    return matching
  }

  /**
   * Add event to history
   */
  private addToHistory<T = any>(event: RedundancyEvent<T>): void {
    this.eventHistory.push(event)

    // Maintain maximum history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }
  }

  /**
   * Update statistics
   */
  private updateStats<T = any>(event: RedundancyEvent<T>): void {
    this.stats.totalEvents++
    this.stats.lastEventTime = event.timestamp

    // Update by type
    if (!this.stats.eventsByType[event.type]) {
      this.stats.eventsByType[event.type] = 0
    }
    this.stats.eventsByType[event.type]++

    // Update by severity
    this.stats.eventsBySeverity[event.severity]++
  }

  /**
   * Update processing time statistics
   */
  private updateProcessingTime(time: number): void {
    this.processingTimes.push(time)

    // Keep only last 100 processing times
    if (this.processingTimes.length > 100) {
      this.processingTimes.shift()
    }

    // Calculate average
    this.stats.averageProcessingTime = 
      this.processingTimes.reduce((sum, t) => sum + t, 0) / this.processingTimes.length
  }

  /**
   * Get event history
   */
  getHistory(
    options: {
      type?: RedundancyEventType
      limit?: number
      since?: Date
      severity?: Priority
    } = {}
  ): RedundancyEvent[] {
    let filtered = [...this.eventHistory]

    // Filter by type
    if (options.type) {
      filtered = filtered.filter(event => event.type === options.type)
    }

    // Filter by time
    if (options.since) {
      filtered = filtered.filter(event => event.timestamp >= options.since!)
    }

    // Filter by severity
    if (options.severity) {
      filtered = filtered.filter(event => event.severity === options.severity)
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Apply limit
    if (options.limit) {
      filtered = filtered.slice(0, options.limit)
    }

    return filtered
  }

  /**
   * Get event statistics
   */
  getStats(): EventBusStats {
    return { ...this.stats }
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = []
  }

  /**
   * Clear all subscriptions
   */
  clearSubscriptions(): void {
    this.subscriptions.clear()
    this.stats.subscriptionCount = 0
  }

  /**
   * Get subscription count
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size
  }

  /**
   * Get active subscriptions
   */
  getSubscriptions(): EventSubscription[] {
    return Array.from(this.subscriptions.values())
  }

  /**
   * Check if there are subscribers for an event type
   */
  hasSubscribers(type: RedundancyEventType): boolean {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.type === '*' || subscription.type === type) {
        return true
      }
    }
    return false
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Create system event
   */
  createSystemEvent(
    type: RedundancyEventType,
    message: string,
    severity: Priority = Priority.MEDIUM,
    entityId?: string,
    entityType?: string
  ): SystemEventModel {
    return {
      id: this.generateEventId(),
      name: type,
      description: message,
      type: this.getSystemEventType(type),
      severity,
      status: 'ACTIVE',
      message,
      source: entityId || 'system',
      category: entityType || 'system',
      startTime: new Date().toISOString(),
      impactLevel: severity === Priority.CRITICAL ? 'CRITICAL' : 
                   severity === Priority.HIGH ? 'HIGH' :
                   severity === Priority.MEDIUM ? 'MEDIUM' : 'LOW',
      affectedEntities: entityId ? [entityId] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  /**
   * Map event type to system event type
   */
  private getSystemEventType(eventType: RedundancyEventType): 'FAULT' | 'MAINTENANCE' | 'SWITCHING' | 'ALERT' | 'RECOVERY' {
    if (eventType.includes('FAULT')) return 'FAULT'
    if (eventType.includes('MAINTENANCE')) return 'MAINTENANCE'
    if (eventType.includes('FAILOVER') || eventType.includes('SWITCHING')) return 'SWITCHING'
    if (eventType.includes('ALERT')) return 'ALERT'
    if (eventType.includes('RECOVERY')) return 'RECOVERY'
    return 'ALERT'
  }
}

/**
 * Default event bus instance
 */
let defaultEventBus: RedundancyEventBus | null = null

/**
 * Get default event bus instance
 */
export function getEventBus(): RedundancyEventBus {
  if (!defaultEventBus) {
    defaultEventBus = new RedundancyEventBus()
  }
  return defaultEventBus
}

/**
 * Event bus factory for creating isolated instances
 */
export class EventBusFactory {
  private static instances = new Map<string, RedundancyEventBus>()

  /**
   * Get or create named event bus instance
   */
  static getInstance(name: string = 'default'): RedundancyEventBus {
    if (!this.instances.has(name)) {
      this.instances.set(name, new RedundancyEventBus())
    }
    return this.instances.get(name)!
  }

  /**
   * Remove event bus instance
   */
  static removeInstance(name: string): boolean {
    return this.instances.delete(name)
  }

  /**
   * Get all instance names
   */
  static getInstanceNames(): string[] {
    return Array.from(this.instances.keys())
  }

  /**
   * Clear all instances
   */
  static clearAll(): void {
    this.instances.clear()
  }
}