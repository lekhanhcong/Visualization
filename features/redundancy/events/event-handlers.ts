/**
 * Event Handlers
 * Predefined event handlers for common redundancy system events
 */

import { 
  RedundancyEvent, 
  RedundancyEventType, 
  EventHandler 
} from './event-bus'
import { 
  SubstationModel, 
  LineModel, 
  SystemHealthModel,
  AlertModel,
  Priority,
  EntityStatus 
} from '../models/interfaces'
import { getEventBus } from './event-bus'

/**
 * Alert generation handler
 */
export class AlertHandler {
  private alertCount = 0

  /**
   * Handle substation fault events
   */
  handleSubstationFault: EventHandler<SubstationModel> = async (event) => {
    const substation = event.data
    
    // Create critical alert
    const alert: Partial<AlertModel> = {
      id: this.generateAlertId(),
      name: `Substation Fault Alert`,
      type: 'FAULT',
      severity: Priority.CRITICAL,
      status: 'ACTIVE',
      title: `Substation Fault: ${substation.name}`,
      message: `Critical fault detected in substation ${substation.name} (${substation.id}). Immediate attention required.`,
      source: substation.id,
      category: 'EQUIPMENT_FAULT',
      condition: 'status == FAULT',
      triggeredAt: event.timestamp.toISOString(),
      escalationLevel: 1,
      recommendedActions: [
        'Dispatch maintenance team immediately',
        'Activate backup substation if available',
        'Notify operations center',
        'Begin fault isolation procedures'
      ],
      createdAt: event.timestamp.toISOString(),
      updatedAt: event.timestamp.toISOString()
    }

    // Emit alert created event
    await getEventBus().emit(RedundancyEventType.ALERT_CREATED, alert, {
      source: 'alert-handler',
      severity: Priority.CRITICAL,
      correlationId: event.correlationId,
      causedBy: [event.id]
    })

    console.log(`🚨 Critical alert created for substation fault: ${substation.name}`)
  }

  /**
   * Handle line overload events
   */
  handleLineOverload: EventHandler<LineModel> = async (event) => {
    const line = event.data
    
    const alert: Partial<AlertModel> = {
      id: this.generateAlertId(),
      name: `Line Overload Alert`,
      type: 'WARNING',
      severity: line.loadFactor > 1.1 ? Priority.CRITICAL : Priority.HIGH,
      status: 'ACTIVE',
      title: `Line Overload: ${line.name}`,
      message: `Line ${line.name} is operating at ${(line.loadFactor * 100).toFixed(1)}% capacity. Load factor: ${line.loadFactor.toFixed(2)}`,
      source: line.id,
      category: 'OVERLOAD',
      condition: 'loadFactor > 0.9',
      currentValue: line.loadFactor,
      threshold: 0.9,
      triggeredAt: event.timestamp.toISOString(),
      escalationLevel: 0,
      recommendedActions: [
        'Monitor line temperature',
        'Consider load redistribution',
        'Check backup line availability',
        'Schedule capacity assessment'
      ],
      createdAt: event.timestamp.toISOString(),
      updatedAt: event.timestamp.toISOString()
    }

    await getEventBus().emit(RedundancyEventType.ALERT_CREATED, alert, {
      source: 'alert-handler',
      severity: alert.severity,
      correlationId: event.correlationId,
      causedBy: [event.id]
    })

    console.log(`⚠️ Overload alert created for line: ${line.name} (${(line.loadFactor * 100).toFixed(1)}%)`)
  }

  /**
   * Handle redundancy lost events
   */
  handleRedundancyLost: EventHandler<any> = async (event) => {
    const alert: Partial<AlertModel> = {
      id: this.generateAlertId(),
      name: `Redundancy Lost Alert`,
      type: 'FAULT',
      severity: Priority.CRITICAL,
      status: 'ACTIVE',
      title: 'System Redundancy Compromised',
      message: `Redundancy has been lost in ${event.data.zone || 'system'}. Single point of failure condition exists.`,
      source: event.source,
      category: 'REDUNDANCY',
      condition: 'redundancy_level < minimum_required',
      triggeredAt: event.timestamp.toISOString(),
      escalationLevel: 2,
      recommendedActions: [
        'Activate emergency protocols',
        'Restore failed equipment immediately',
        'Deploy temporary backup solutions',
        'Notify management and regulatory bodies'
      ],
      automatedActions: [
        'Increase monitoring frequency',
        'Disable non-critical loads',
        'Prepare for emergency shutdown'
      ],
      createdAt: event.timestamp.toISOString(),
      updatedAt: event.timestamp.toISOString()
    }

    await getEventBus().emit(RedundancyEventType.ALERT_CREATED, alert, {
      source: 'alert-handler',
      severity: Priority.CRITICAL,
      correlationId: event.correlationId,
      causedBy: [event.id]
    })

    console.log(`🔴 CRITICAL: Redundancy lost alert created`)
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${++this.alertCount}`
  }
}

/**
 * Failover handler for automatic redundancy switching
 */
export class FailoverHandler {
  private failoverHistory: Array<{
    timestamp: Date
    primary: string
    backup: string
    success: boolean
    duration: number
  }> = []

  /**
   * Handle substation fault with automatic failover
   */
  handleSubstationFailover: EventHandler<SubstationModel> = async (event) => {
    const faultedSubstation = event.data
    
    if (!faultedSubstation.backupSubstations || faultedSubstation.backupSubstations.length === 0) {
      console.warn(`⚠️ No backup substations available for ${faultedSubstation.name}`)
      return
    }

    const startTime = Date.now()
    
    try {
      // Emit failover initiated event
      await getEventBus().emit(RedundancyEventType.FAILOVER_INITIATED, {
        primaryId: faultedSubstation.id,
        primaryName: faultedSubstation.name,
        backupIds: faultedSubstation.backupSubstations,
        reason: 'Equipment fault',
        automatic: true
      }, {
        source: 'failover-handler',
        severity: Priority.HIGH,
        correlationId: event.correlationId,
        causedBy: [event.id]
      })

      // Simulate failover process (in real system, this would trigger actual switching)
      await this.performFailover(faultedSubstation.id, faultedSubstation.backupSubstations[0])

      const duration = Date.now() - startTime

      // Record successful failover
      this.failoverHistory.push({
        timestamp: new Date(),
        primary: faultedSubstation.id,
        backup: faultedSubstation.backupSubstations[0],
        success: true,
        duration
      })

      // Emit failover completed event
      await getEventBus().emit(RedundancyEventType.FAILOVER_COMPLETED, {
        primaryId: faultedSubstation.id,
        backupId: faultedSubstation.backupSubstations[0],
        duration,
        success: true
      }, {
        source: 'failover-handler',
        severity: Priority.MEDIUM,
        correlationId: event.correlationId,
        causedBy: [event.id]
      })

      console.log(`✅ Failover completed: ${faultedSubstation.name} -> backup (${duration}ms)`)

    } catch (error) {
      const duration = Date.now() - startTime

      // Record failed failover
      this.failoverHistory.push({
        timestamp: new Date(),
        primary: faultedSubstation.id,
        backup: faultedSubstation.backupSubstations[0],
        success: false,
        duration
      })

      // Emit failover failed event
      await getEventBus().emit(RedundancyEventType.FAILOVER_FAILED, {
        primaryId: faultedSubstation.id,
        backupId: faultedSubstation.backupSubstations[0],
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      }, {
        source: 'failover-handler',
        severity: Priority.CRITICAL,
        correlationId: event.correlationId,
        causedBy: [event.id]
      })

      console.error(`❌ Failover failed: ${faultedSubstation.name}`, error)
    }
  }

  /**
   * Perform the actual failover operation
   */
  private async performFailover(primaryId: string, backupId: string): Promise<void> {
    // Simulate failover time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // In a real system, this would:
    // 1. Open primary substation breakers
    // 2. Close backup substation breakers
    // 3. Transfer load
    // 4. Verify successful transfer
    // 5. Update system state

    // Simulate 95% success rate
    if (Math.random() < 0.05) {
      throw new Error('Failover mechanism failure')
    }
  }

  /**
   * Get failover statistics
   */
  getFailoverStats(): {
    totalFailovers: number
    successRate: number
    averageDuration: number
    recentFailovers: Array<{
      timestamp: Date
      primary: string
      backup: string
      success: boolean
      duration: number
    }>
  } {
    const total = this.failoverHistory.length
    const successful = this.failoverHistory.filter(f => f.success).length
    const avgDuration = total > 0 
      ? this.failoverHistory.reduce((sum, f) => sum + f.duration, 0) / total 
      : 0

    return {
      totalFailovers: total,
      successRate: total > 0 ? successful / total : 0,
      averageDuration: avgDuration,
      recentFailovers: this.failoverHistory.slice(-10) // Last 10 failovers
    }
  }
}

/**
 * Maintenance scheduler handler
 */
export class MaintenanceHandler {
  private maintenanceSchedule = new Map<string, Date>()

  /**
   * Handle maintenance scheduling events
   */
  handleMaintenanceScheduled: EventHandler<any> = async (event) => {
    const { entityId, scheduledDate, maintenanceType } = event.data

    this.maintenanceSchedule.set(entityId, new Date(scheduledDate))

    console.log(`🔧 Maintenance scheduled for ${entityId}: ${new Date(scheduledDate).toLocaleDateString()}`)

    // Check if maintenance is overdue
    if (new Date(scheduledDate) < new Date()) {
      await getEventBus().emit(RedundancyEventType.MAINTENANCE_OVERDUE, {
        entityId,
        scheduledDate,
        maintenanceType,
        daysPastDue: Math.floor((Date.now() - new Date(scheduledDate).getTime()) / (1000 * 60 * 60 * 24))
      }, {
        source: 'maintenance-handler',
        severity: Priority.HIGH,
        correlationId: event.correlationId
      })
    }
  }

  /**
   * Handle maintenance completion
   */
  handleMaintenanceCompleted: EventHandler<any> = async (event) => {
    const { entityId } = event.data

    // Remove from schedule
    this.maintenanceSchedule.delete(entityId)

    console.log(`✅ Maintenance completed for ${entityId}`)

    // Schedule next maintenance (example: 6 months from now)
    const nextMaintenance = new Date()
    nextMaintenance.setMonth(nextMaintenance.getMonth() + 6)

    await getEventBus().emit(RedundancyEventType.MAINTENANCE_SCHEDULED, {
      entityId,
      scheduledDate: nextMaintenance.toISOString(),
      maintenanceType: 'Routine',
      recurring: true
    }, {
      source: 'maintenance-handler',
      severity: Priority.LOW
    })
  }

  /**
   * Check for overdue maintenance
   */
  checkOverdueMaintenance(): void {
    const now = new Date()
    
    for (const [entityId, scheduledDate] of this.maintenanceSchedule) {
      if (scheduledDate < now) {
        getEventBus().emit(RedundancyEventType.MAINTENANCE_OVERDUE, {
          entityId,
          scheduledDate: scheduledDate.toISOString(),
          daysPastDue: Math.floor((now.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24))
        }, {
          source: 'maintenance-handler',
          severity: Priority.HIGH
        })
      }
    }
  }
}

/**
 * System health monitor handler
 */
export class SystemHealthHandler {
  private lastHealthStatus: string = 'HEALTHY'
  private healthHistory: Array<{ timestamp: Date; status: string; level: number }> = []

  /**
   * Handle system health changes
   */
  handleSystemHealthChange: EventHandler<SystemHealthModel> = async (event) => {
    const health = event.data
    
    // Record health change
    this.healthHistory.push({
      timestamp: event.timestamp,
      status: health.overall,
      level: health.redundancyLevel
    })

    // Keep only last 100 records
    if (this.healthHistory.length > 100) {
      this.healthHistory.shift()
    }

    // Check for status degradation
    if (this.lastHealthStatus !== health.overall) {
      const severity = this.getHealthSeverity(health.overall)
      
      await getEventBus().emit(RedundancyEventType.SYSTEM_HEALTH_CHANGE, {
        previousStatus: this.lastHealthStatus,
        currentStatus: health.overall,
        redundancyLevel: health.redundancyLevel,
        criticalAlerts: health.criticalAlerts,
        degradationReason: this.analyzeHealthChange(health)
      }, {
        source: 'health-handler',
        severity,
        correlationId: event.correlationId
      })

      this.lastHealthStatus = health.overall
    }

    // Check redundancy level
    if (health.redundancyLevel < 0.5) {
      await getEventBus().emit(RedundancyEventType.REDUNDANCY_LOST, {
        currentLevel: health.redundancyLevel,
        minimumRequired: 0.5,
        affectedSystems: this.getAffectedSystems(health)
      }, {
        source: 'health-handler',
        severity: Priority.CRITICAL,
        correlationId: event.correlationId
      })
    }
  }

  /**
   * Get severity based on health status
   */
  private getHealthSeverity(status: string): Priority {
    switch (status) {
      case 'FAILED': return Priority.CRITICAL
      case 'CRITICAL': return Priority.CRITICAL
      case 'DEGRADED': return Priority.HIGH
      case 'HEALTHY': return Priority.LOW
      default: return Priority.MEDIUM
    }
  }

  /**
   * Analyze health change reason
   */
  private analyzeHealthChange(health: SystemHealthModel): string {
    if (health.criticalAlerts > 0) {
      return `${health.criticalAlerts} critical alerts active`
    }
    
    if (health.redundancyLevel < 0.7) {
      return 'Redundancy level below threshold'
    }

    const poorSubsystems = Object.entries(health.subsystemHealth)
      .filter(([_, value]) => value < 0.8)
      .map(([key]) => key)

    if (poorSubsystems.length > 0) {
      return `Poor performance in: ${poorSubsystems.join(', ')}`
    }

    return 'System status improved'
  }

  /**
   * Get affected systems based on health data
   */
  private getAffectedSystems(health: SystemHealthModel): string[] {
    return Object.entries(health.subsystemHealth)
      .filter(([_, value]) => value < 0.8)
      .map(([key]) => key)
  }
}

/**
 * Logging handler for audit trails
 */
export class LoggingHandler {
  private logs: Array<{
    timestamp: Date
    level: string
    event: string
    message: string
    metadata?: any
  }> = []

  /**
   * Log all events for audit purposes
   */
  logEvent: EventHandler = async (event) => {
    const logEntry = {
      timestamp: event.timestamp,
      level: this.getLogLevel(event.severity),
      event: event.type,
      message: this.formatLogMessage(event),
      metadata: {
        eventId: event.id,
        source: event.source,
        entityId: event.entityId,
        entityType: event.entityType,
        correlationId: event.correlationId,
        causedBy: event.causedBy
      }
    }

    this.logs.push(logEntry)

    // Keep only last 1000 log entries
    if (this.logs.length > 1000) {
      this.logs.shift()
    }

    // In a real system, this would write to persistent storage
    if (event.severity === Priority.CRITICAL) {
      console.error(`🔴 CRITICAL EVENT: ${logEntry.message}`)
    } else if (event.severity === Priority.HIGH) {
      console.warn(`🟡 HIGH PRIORITY: ${logEntry.message}`)
    } else {
      console.log(`ℹ️ ${logEntry.message}`)
    }
  }

  /**
   * Get log level based on severity
   */
  private getLogLevel(severity: Priority): string {
    switch (severity) {
      case Priority.CRITICAL: return 'ERROR'
      case Priority.HIGH: return 'WARN'
      case Priority.MEDIUM: return 'INFO'
      case Priority.LOW: return 'DEBUG'
      default: return 'INFO'
    }
  }

  /**
   * Format log message
   */
  private formatLogMessage(event: RedundancyEvent): string {
    const parts = [event.type]
    
    if (event.entityId) {
      parts.push(`[${event.entityType}:${event.entityId}]`)
    }
    
    if (typeof event.data === 'string') {
      parts.push(event.data)
    } else if (event.data?.message) {
      parts.push(event.data.message)
    } else if (event.data?.name) {
      parts.push(`affecting ${event.data.name}`)
    }

    return parts.join(' ')
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit = 50): Array<{
    timestamp: Date
    level: string
    event: string
    message: string
    metadata?: any
  }> {
    return this.logs.slice(-limit)
  }
}

/**
 * Default handler instances
 */
export const defaultHandlers = {
  alert: new AlertHandler(),
  failover: new FailoverHandler(),
  maintenance: new MaintenanceHandler(),
  health: new SystemHealthHandler(),
  logging: new LoggingHandler()
}

/**
 * Setup default event handlers
 */
export function setupDefaultHandlers(): void {
  const eventBus = getEventBus()

  // Alert handlers
  eventBus.subscribe(RedundancyEventType.SUBSTATION_FAULT, defaultHandlers.alert.handleSubstationFault)
  eventBus.subscribe(RedundancyEventType.LINE_OVERLOAD, defaultHandlers.alert.handleLineOverload)
  eventBus.subscribe(RedundancyEventType.REDUNDANCY_LOST, defaultHandlers.alert.handleRedundancyLost)

  // Failover handlers
  eventBus.subscribe(RedundancyEventType.SUBSTATION_FAULT, defaultHandlers.failover.handleSubstationFailover)

  // Maintenance handlers
  eventBus.subscribe(RedundancyEventType.MAINTENANCE_SCHEDULED, defaultHandlers.maintenance.handleMaintenanceScheduled)
  eventBus.subscribe(RedundancyEventType.MAINTENANCE_COMPLETED, defaultHandlers.maintenance.handleMaintenanceCompleted)

  // Health handlers
  eventBus.subscribe(RedundancyEventType.SYSTEM_HEALTH_CHANGE, defaultHandlers.health.handleSystemHealthChange)

  // Logging handler (logs all events)
  eventBus.subscribe('*', defaultHandlers.logging.logEvent)

  console.log('✅ Default event handlers setup completed')
}