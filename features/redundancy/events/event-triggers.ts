/**
 * Event Triggers
 * Automated event detection and triggering for the redundancy system
 */

import { 
  SubstationModel, 
  LineModel, 
  SystemHealthModel,
  EntityStatus,
  Priority 
} from '../models/interfaces'
import { RedundancyEventType, getEventBus } from './event-bus'

/**
 * Trigger configuration interface
 */
export interface TriggerConfig {
  enabled: boolean
  threshold?: number
  cooldownMs?: number
  priority?: Priority
  metadata?: Record<string, any>
}

/**
 * Base trigger class
 */
export abstract class BaseTrigger {
  protected lastTriggered = new Map<string, number>()
  protected config: Required<TriggerConfig>

  constructor(config: Partial<TriggerConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      threshold: config.threshold ?? 0,
      cooldownMs: config.cooldownMs ?? 30000, // 30 seconds default
      priority: config.priority ?? Priority.MEDIUM,
      metadata: config.metadata ?? {}
    }
  }

  /**
   * Check if trigger is enabled and not in cooldown
   */
  protected canTrigger(key: string): boolean {
    if (!this.config.enabled) return false

    const lastTime = this.lastTriggered.get(key) || 0
    const now = Date.now()
    
    return (now - lastTime) >= this.config.cooldownMs
  }

  /**
   * Mark trigger as fired
   */
  protected markTriggered(key: string): void {
    this.lastTriggered.set(key, Date.now())
  }

  /**
   * Get trigger statistics
   */
  getTriggerStats(): {
    totalTriggers: number
    lastTriggered: Record<string, Date>
    config: Required<TriggerConfig>
  } {
    const lastTriggered: Record<string, Date> = {}
    for (const [key, timestamp] of this.lastTriggered) {
      lastTriggered[key] = new Date(timestamp)
    }

    return {
      totalTriggers: this.lastTriggered.size,
      lastTriggered,
      config: this.config
    }
  }
}

/**
 * Substation status change trigger
 */
export class SubstationStatusTrigger extends BaseTrigger {
  private lastStatus = new Map<string, EntityStatus>()

  /**
   * Check for substation status changes
   */
  checkSubstation(substation: SubstationModel): void {
    const lastStatus = this.lastStatus.get(substation.id)
    
    if (lastStatus && lastStatus !== substation.status) {
      if (this.canTrigger(substation.id)) {
        this.triggerStatusChange(substation, lastStatus, substation.status)
        this.markTriggered(substation.id)
      }
    }

    this.lastStatus.set(substation.id, substation.status)
  }

  /**
   * Trigger status change event
   */
  private async triggerStatusChange(
    substation: SubstationModel, 
    previousStatus: EntityStatus, 
    currentStatus: EntityStatus
  ): Promise<void> {
    const eventBus = getEventBus()

    // General status change event
    await eventBus.emit(RedundancyEventType.SUBSTATION_STATUS_CHANGE, {
      substation,
      previousStatus,
      currentStatus,
      timestamp: new Date().toISOString()
    }, {
      source: 'status-trigger',
      entityId: substation.id,
      entityType: 'substation',
      severity: this.getStatusChangeSeverity(previousStatus, currentStatus)
    })

    // Specific fault event
    if (currentStatus === EntityStatus.FAULT) {
      await eventBus.emit(RedundancyEventType.SUBSTATION_FAULT, substation, {
        source: 'status-trigger',
        entityId: substation.id,
        entityType: 'substation',
        severity: Priority.CRITICAL
      })
    }

    // Recovery event
    if (previousStatus === EntityStatus.FAULT && currentStatus === EntityStatus.ACTIVE) {
      await eventBus.emit(RedundancyEventType.SUBSTATION_RECOVERY, substation, {
        source: 'status-trigger',
        entityId: substation.id,
        entityType: 'substation',
        severity: Priority.MEDIUM
      })
    }
  }

  /**
   * Determine severity based on status change
   */
  private getStatusChangeSeverity(previous: EntityStatus, current: EntityStatus): Priority {
    // Fault conditions
    if (current === EntityStatus.FAULT || current === EntityStatus.OFFLINE) {
      return Priority.CRITICAL
    }

    // Recovery conditions
    if (previous === EntityStatus.FAULT && current === EntityStatus.ACTIVE) {
      return Priority.MEDIUM
    }

    // Maintenance conditions
    if (current === EntityStatus.MAINTENANCE) {
      return Priority.LOW
    }

    return Priority.MEDIUM
  }
}

/**
 * Substation load monitoring trigger
 */
export class SubstationLoadTrigger extends BaseTrigger {
  private lastLoad = new Map<string, number>()

  constructor(config: Partial<TriggerConfig> = {}) {
    super({
      threshold: 0.9, // 90% load threshold
      cooldownMs: 60000, // 1 minute cooldown
      ...config
    })
  }

  /**
   * Check for significant load changes
   */
  checkSubstation(substation: SubstationModel): void {
    const lastLoad = this.lastLoad.get(substation.id) || 0
    const currentLoad = substation.currentLoad
    const loadFactor = currentLoad / substation.powerRating

    // Check for overload condition
    if (loadFactor > this.config.threshold) {
      if (this.canTrigger(`${substation.id}_overload`)) {
        this.triggerOverload(substation, loadFactor)
        this.markTriggered(`${substation.id}_overload`)
      }
    }

    // Check for significant load changes (>20% change)
    const loadChange = Math.abs(currentLoad - lastLoad) / substation.powerRating
    if (loadChange > 0.2) {
      if (this.canTrigger(`${substation.id}_change`)) {
        this.triggerLoadChange(substation, lastLoad, currentLoad)
        this.markTriggered(`${substation.id}_change`)
      }
    }

    this.lastLoad.set(substation.id, currentLoad)
  }

  /**
   * Trigger overload event
   */
  private async triggerOverload(substation: SubstationModel, loadFactor: number): Promise<void> {
    await getEventBus().emit(RedundancyEventType.SUBSTATION_LOAD_CHANGE, {
      substation,
      loadFactor,
      currentLoad: substation.currentLoad,
      capacity: substation.powerRating,
      overload: true
    }, {
      source: 'load-trigger',
      entityId: substation.id,
      entityType: 'substation',
      severity: loadFactor > 1.1 ? Priority.CRITICAL : Priority.HIGH
    })
  }

  /**
   * Trigger load change event
   */
  private async triggerLoadChange(
    substation: SubstationModel, 
    previousLoad: number, 
    currentLoad: number
  ): Promise<void> {
    await getEventBus().emit(RedundancyEventType.SUBSTATION_LOAD_CHANGE, {
      substation,
      previousLoad,
      currentLoad,
      loadFactor: currentLoad / substation.powerRating,
      changePercent: ((currentLoad - previousLoad) / substation.powerRating) * 100
    }, {
      source: 'load-trigger',
      entityId: substation.id,
      entityType: 'substation',
      severity: Priority.LOW
    })
  }
}

/**
 * Line status monitoring trigger
 */
export class LineStatusTrigger extends BaseTrigger {
  private lastStatus = new Map<string, EntityStatus>()
  private lastLoadFactor = new Map<string, number>()

  constructor(config: Partial<TriggerConfig> = {}) {
    super({
      threshold: 0.9, // 90% load factor threshold
      cooldownMs: 30000, // 30 seconds cooldown
      ...config
    })
  }

  /**
   * Check line for status and load changes
   */
  checkLine(line: LineModel): void {
    this.checkStatusChange(line)
    this.checkLoadFactor(line)
  }

  /**
   * Check for line status changes
   */
  private checkStatusChange(line: LineModel): void {
    const lastStatus = this.lastStatus.get(line.id)
    
    if (lastStatus && lastStatus !== line.status) {
      if (this.canTrigger(`${line.id}_status`)) {
        this.triggerStatusChange(line, lastStatus, line.status)
        this.markTriggered(`${line.id}_status`)
      }
    }

    this.lastStatus.set(line.id, line.status)
  }

  /**
   * Check for line overload conditions
   */
  private checkLoadFactor(line: LineModel): void {
    const lastLoadFactor = this.lastLoadFactor.get(line.id) || 0
    const currentLoadFactor = line.loadFactor

    // Check for overload
    if (currentLoadFactor > this.config.threshold) {
      if (this.canTrigger(`${line.id}_overload`)) {
        this.triggerOverload(line)
        this.markTriggered(`${line.id}_overload`)
      }
    }

    // Check for significant load factor changes
    const change = Math.abs(currentLoadFactor - lastLoadFactor)
    if (change > 0.2) { // 20% change
      if (this.canTrigger(`${line.id}_load_change`)) {
        this.triggerLoadChange(line, lastLoadFactor, currentLoadFactor)
        this.markTriggered(`${line.id}_load_change`)
      }
    }

    this.lastLoadFactor.set(line.id, currentLoadFactor)
  }

  /**
   * Trigger line status change event
   */
  private async triggerStatusChange(
    line: LineModel, 
    previousStatus: EntityStatus, 
    currentStatus: EntityStatus
  ): Promise<void> {
    const eventBus = getEventBus()

    await eventBus.emit(RedundancyEventType.LINE_STATUS_CHANGE, {
      line,
      previousStatus,
      currentStatus
    }, {
      source: 'line-trigger',
      entityId: line.id,
      entityType: 'line',
      severity: this.getStatusChangeSeverity(previousStatus, currentStatus)
    })

    // Specific events
    if (currentStatus === EntityStatus.FAULT) {
      await eventBus.emit(RedundancyEventType.LINE_FAULT, line, {
        source: 'line-trigger',
        entityId: line.id,
        entityType: 'line',
        severity: Priority.CRITICAL
      })
    }

    if (previousStatus === EntityStatus.FAULT && currentStatus === EntityStatus.ACTIVE) {
      await eventBus.emit(RedundancyEventType.LINE_RECOVERY, line, {
        source: 'line-trigger',
        entityId: line.id,
        entityType: 'line',
        severity: Priority.MEDIUM
      })
    }
  }

  /**
   * Trigger line overload event
   */
  private async triggerOverload(line: LineModel): Promise<void> {
    await getEventBus().emit(RedundancyEventType.LINE_OVERLOAD, line, {
      source: 'line-trigger',
      entityId: line.id,
      entityType: 'line',
      severity: line.loadFactor > 1.1 ? Priority.CRITICAL : Priority.HIGH
    })
  }

  /**
   * Trigger load change event
   */
  private async triggerLoadChange(
    line: LineModel, 
    previousLoadFactor: number, 
    currentLoadFactor: number
  ): Promise<void> {
    await getEventBus().emit(RedundancyEventType.LINE_STATUS_CHANGE, {
      line,
      previousLoadFactor,
      currentLoadFactor,
      changePercent: (currentLoadFactor - previousLoadFactor) * 100
    }, {
      source: 'line-trigger',
      entityId: line.id,
      entityType: 'line',
      severity: Priority.LOW
    })
  }

  /**
   * Get severity for status change
   */
  private getStatusChangeSeverity(previous: EntityStatus, current: EntityStatus): Priority {
    if (current === EntityStatus.FAULT || current === EntityStatus.OFFLINE) {
      return Priority.CRITICAL
    }
    if (previous === EntityStatus.FAULT && current === EntityStatus.ACTIVE) {
      return Priority.MEDIUM
    }
    if (current === EntityStatus.MAINTENANCE) {
      return Priority.LOW
    }
    return Priority.MEDIUM
  }
}

/**
 * System health monitoring trigger
 */
export class SystemHealthTrigger extends BaseTrigger {
  private lastHealth: SystemHealthModel | null = null

  constructor(config: Partial<TriggerConfig> = {}) {
    super({
      threshold: 0.8, // 80% health threshold
      cooldownMs: 60000, // 1 minute cooldown
      ...config
    })
  }

  /**
   * Check system health changes
   */
  checkSystemHealth(health: SystemHealthModel): void {
    if (!this.lastHealth) {
      this.lastHealth = health
      return
    }

    // Check overall health status change
    if (this.lastHealth.overall !== health.overall) {
      if (this.canTrigger('health_status')) {
        this.triggerHealthStatusChange(this.lastHealth, health)
        this.markTriggered('health_status')
      }
    }

    // Check redundancy level changes
    const redundancyChange = Math.abs(health.redundancyLevel - this.lastHealth.redundancyLevel)
    if (redundancyChange > 0.1) { // 10% change
      if (this.canTrigger('redundancy_level')) {
        this.triggerRedundancyLevelChange(this.lastHealth, health)
        this.markTriggered('redundancy_level')
      }
    }

    // Check for critical conditions
    if (health.redundancyLevel < 0.5 && this.lastHealth.redundancyLevel >= 0.5) {
      if (this.canTrigger('redundancy_lost')) {
        this.triggerRedundancyLost(health)
        this.markTriggered('redundancy_lost')
      }
    }

    // Check for recovery
    if (health.redundancyLevel >= 0.8 && this.lastHealth.redundancyLevel < 0.8) {
      if (this.canTrigger('redundancy_restored')) {
        this.triggerRedundancyRestored(health)
        this.markTriggered('redundancy_restored')
      }
    }

    this.lastHealth = health
  }

  /**
   * Trigger health status change
   */
  private async triggerHealthStatusChange(
    previousHealth: SystemHealthModel, 
    currentHealth: SystemHealthModel
  ): Promise<void> {
    await getEventBus().emit(RedundancyEventType.SYSTEM_HEALTH_CHANGE, {
      previousHealth,
      currentHealth,
      degraded: this.isHealthDegraded(previousHealth.overall, currentHealth.overall)
    }, {
      source: 'health-trigger',
      severity: this.getHealthChangeSeverity(previousHealth.overall, currentHealth.overall)
    })
  }

  /**
   * Trigger redundancy level change
   */
  private async triggerRedundancyLevelChange(
    previousHealth: SystemHealthModel, 
    currentHealth: SystemHealthModel
  ): Promise<void> {
    await getEventBus().emit(RedundancyEventType.REDUNDANCY_LEVEL_CHANGE, {
      previousLevel: previousHealth.redundancyLevel,
      currentLevel: currentHealth.redundancyLevel,
      change: currentHealth.redundancyLevel - previousHealth.redundancyLevel
    }, {
      source: 'health-trigger',
      severity: currentHealth.redundancyLevel < previousHealth.redundancyLevel 
        ? Priority.HIGH 
        : Priority.MEDIUM
    })
  }

  /**
   * Trigger redundancy lost event
   */
  private async triggerRedundancyLost(health: SystemHealthModel): Promise<void> {
    await getEventBus().emit(RedundancyEventType.REDUNDANCY_LOST, {
      currentLevel: health.redundancyLevel,
      minimumRequired: 0.5,
      systemHealth: health
    }, {
      source: 'health-trigger',
      severity: Priority.CRITICAL
    })
  }

  /**
   * Trigger redundancy restored event
   */
  private async triggerRedundancyRestored(health: SystemHealthModel): Promise<void> {
    await getEventBus().emit(RedundancyEventType.REDUNDANCY_RESTORED, {
      currentLevel: health.redundancyLevel,
      systemHealth: health
    }, {
      source: 'health-trigger',
      severity: Priority.MEDIUM
    })
  }

  /**
   * Check if health is degraded
   */
  private isHealthDegraded(previous: string, current: string): boolean {
    const healthOrder = ['HEALTHY', 'DEGRADED', 'CRITICAL', 'FAILED']
    return healthOrder.indexOf(current) > healthOrder.indexOf(previous)
  }

  /**
   * Get severity for health change
   */
  private getHealthChangeSeverity(previous: string, current: string): Priority {
    if (current === 'FAILED') return Priority.CRITICAL
    if (current === 'CRITICAL') return Priority.CRITICAL
    if (current === 'DEGRADED' && previous === 'HEALTHY') return Priority.HIGH
    if (current === 'HEALTHY' && previous !== 'HEALTHY') return Priority.MEDIUM
    return Priority.MEDIUM
  }
}

/**
 * Threshold monitoring trigger
 */
export class ThresholdTrigger extends BaseTrigger {
  private thresholds = new Map<string, number>()
  private lastValues = new Map<string, number>()

  constructor(config: Partial<TriggerConfig> = {}) {
    super(config)
  }

  /**
   * Add threshold monitoring
   */
  addThreshold(
    key: string, 
    threshold: number, 
    config: Partial<TriggerConfig> = {}
  ): void {
    this.thresholds.set(key, threshold)
    
    // Update config for this specific threshold
    if (config.cooldownMs !== undefined || config.priority !== undefined) {
      this.config = { ...this.config, ...config }
    }
  }

  /**
   * Check value against threshold
   */
  checkValue(key: string, value: number, metadata: any = {}): void {
    const threshold = this.thresholds.get(key)
    if (threshold === undefined) return

    const lastValue = this.lastValues.get(key)
    
    // Check for threshold crossing
    if (value > threshold && (lastValue === undefined || lastValue <= threshold)) {
      if (this.canTrigger(key)) {
        this.triggerThresholdExceeded(key, value, threshold, metadata)
        this.markTriggered(key)
      }
    }

    this.lastValues.set(key, value)
  }

  /**
   * Trigger threshold exceeded event
   */
  private async triggerThresholdExceeded(
    key: string, 
    value: number, 
    threshold: number, 
    metadata: any
  ): Promise<void> {
    await getEventBus().emit(RedundancyEventType.THRESHOLD_EXCEEDED, {
      key,
      value,
      threshold,
      exceedancePercent: ((value - threshold) / threshold) * 100,
      metadata
    }, {
      source: 'threshold-trigger',
      severity: value > threshold * 1.2 ? Priority.CRITICAL : Priority.HIGH
    })
  }
}

/**
 * Trigger manager for coordinating all triggers
 */
export class TriggerManager {
  private triggers = new Map<string, BaseTrigger>()
  private isEnabled = true

  constructor() {
    this.setupDefaultTriggers()
  }

  /**
   * Setup default triggers
   */
  private setupDefaultTriggers(): void {
    this.addTrigger('substation-status', new SubstationStatusTrigger())
    this.addTrigger('substation-load', new SubstationLoadTrigger())
    this.addTrigger('line-status', new LineStatusTrigger())
    this.addTrigger('system-health', new SystemHealthTrigger())
    this.addTrigger('threshold', new ThresholdTrigger())
  }

  /**
   * Add trigger
   */
  addTrigger(name: string, trigger: BaseTrigger): void {
    this.triggers.set(name, trigger)
  }

  /**
   * Remove trigger
   */
  removeTrigger(name: string): boolean {
    return this.triggers.delete(name)
  }

  /**
   * Get trigger
   */
  getTrigger<T extends BaseTrigger>(name: string): T | undefined {
    return this.triggers.get(name) as T
  }

  /**
   * Enable/disable all triggers
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  /**
   * Check substation data
   */
  checkSubstation(substation: SubstationModel): void {
    if (!this.isEnabled) return

    const statusTrigger = this.getTrigger<SubstationStatusTrigger>('substation-status')
    const loadTrigger = this.getTrigger<SubstationLoadTrigger>('substation-load')

    statusTrigger?.checkSubstation(substation)
    loadTrigger?.checkSubstation(substation)
  }

  /**
   * Check line data
   */
  checkLine(line: LineModel): void {
    if (!this.isEnabled) return

    const lineTrigger = this.getTrigger<LineStatusTrigger>('line-status')
    lineTrigger?.checkLine(line)
  }

  /**
   * Check system health
   */
  checkSystemHealth(health: SystemHealthModel): void {
    if (!this.isEnabled) return

    const healthTrigger = this.getTrigger<SystemHealthTrigger>('system-health')
    healthTrigger?.checkSystemHealth(health)
  }

  /**
   * Check threshold
   */
  checkThreshold(key: string, value: number, metadata: any = {}): void {
    if (!this.isEnabled) return

    const thresholdTrigger = this.getTrigger<ThresholdTrigger>('threshold')
    thresholdTrigger?.checkValue(key, value, metadata)
  }

  /**
   * Get trigger statistics
   */
  getStats(): Record<string, any> {
    const stats: Record<string, any> = {}
    
    for (const [name, trigger] of this.triggers) {
      stats[name] = trigger.getTriggerStats()
    }

    return stats
  }
}

/**
 * Default trigger manager instance
 */
export const defaultTriggerManager = new TriggerManager()