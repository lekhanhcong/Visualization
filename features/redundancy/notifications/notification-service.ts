/**
 * Notification Service
 * Handles user notifications for alerts and system events
 */

import { 
  AlertModel, 
  SystemEventModel, 
  Priority 
} from '../models/interfaces'
import { getEventBus, RedundancyEventType } from '../events/event-bus'

/**
 * Notification types
 */
export enum NotificationType {
  ALERT = 'ALERT',
  SYSTEM_EVENT = 'SYSTEM_EVENT',
  MAINTENANCE = 'MAINTENANCE',
  FAILOVER = 'FAILOVER',
  RECOVERY = 'RECOVERY',
  THRESHOLD = 'THRESHOLD',
  CUSTOM = 'CUSTOM'
}

/**
 * Notification channels
 */
export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  WEBHOOK = 'WEBHOOK',
  SLACK = 'SLACK',
  TEAMS = 'TEAMS'
}

/**
 * Notification status
 */
export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED'
}

/**
 * Notification model
 */
export interface NotificationModel {
  id: string
  type: NotificationType
  channel: NotificationChannel
  status: NotificationStatus
  priority: Priority
  title: string
  message: string
  data?: any
  userId?: string
  groupId?: string
  sourceId?: string
  sourceType?: string
  expiresAt?: string
  readAt?: string
  sentAt?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  userId: string
  channels: {
    [key in NotificationChannel]?: boolean
  }
  priorities: {
    [key in Priority]?: boolean
  }
  types: {
    [key in NotificationType]?: boolean
  }
  quietHours?: {
    start: string // HH:MM format
    end: string   // HH:MM format
    timezone: string
  }
  maxNotificationsPerHour?: number
  emailDigest?: {
    enabled: boolean
    frequency: 'IMMEDIATE' | 'HOURLY' | 'DAILY' | 'WEEKLY'
  }
}

/**
 * Notification template
 */
export interface NotificationTemplate {
  id: string
  type: NotificationType
  channel: NotificationChannel
  titleTemplate: string
  messageTemplate: string
  variables: string[]
  isActive: boolean
}

/**
 * Notification service configuration
 */
export interface NotificationServiceConfig {
  channels: {
    [key in NotificationChannel]?: {
      enabled: boolean
      config?: any
    }
  }
  defaultPreferences: Partial<NotificationPreferences>
  templates: NotificationTemplate[]
  maxRetries: number
  retryDelay: number
  batchSize: number
  rateLimiting: {
    enabled: boolean
    maxPerUser: number
    maxPerHour: number
    windowSize: number
  }
}

/**
 * Notification service
 */
export class NotificationService {
  private config: Required<NotificationServiceConfig>
  private notifications = new Map<string, NotificationModel>()
  private preferences = new Map<string, NotificationPreferences>()
  private templates = new Map<string, NotificationTemplate>()
  private notificationQueue: NotificationModel[] = []
  private isProcessing = false
  private rateLimitCounters = new Map<string, number>()
  private retryQueues = new Map<NotificationChannel, NotificationModel[]>()

  constructor(config: Partial<NotificationServiceConfig> = {}) {
    this.config = {
      channels: {
        [NotificationChannel.IN_APP]: { enabled: true },
        [NotificationChannel.EMAIL]: { enabled: false },
        [NotificationChannel.SMS]: { enabled: false },
        [NotificationChannel.PUSH]: { enabled: false },
        [NotificationChannel.WEBHOOK]: { enabled: false },
        [NotificationChannel.SLACK]: { enabled: false },
        [NotificationChannel.TEAMS]: { enabled: false },
        ...config.channels
      },
      defaultPreferences: {
        channels: {
          [NotificationChannel.IN_APP]: true,
          [NotificationChannel.EMAIL]: false,
          [NotificationChannel.SMS]: false,
          [NotificationChannel.PUSH]: false,
          [NotificationChannel.WEBHOOK]: false,
          [NotificationChannel.SLACK]: false,
          [NotificationChannel.TEAMS]: false
        },
        priorities: {
          [Priority.CRITICAL]: true,
          [Priority.HIGH]: true,
          [Priority.MEDIUM]: true,
          [Priority.LOW]: false
        },
        types: {
          [NotificationType.ALERT]: true,
          [NotificationType.SYSTEM_EVENT]: true,
          [NotificationType.MAINTENANCE]: true,
          [NotificationType.FAILOVER]: true,
          [NotificationType.RECOVERY]: true,
          [NotificationType.THRESHOLD]: true,
          [NotificationType.CUSTOM]: true
        },
        maxNotificationsPerHour: 50,
        emailDigest: {
          enabled: false,
          frequency: 'DAILY'
        },
        ...config.defaultPreferences
      },
      templates: config.templates || [],
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 5000,
      batchSize: config.batchSize || 10,
      rateLimiting: {
        enabled: true,
        maxPerUser: 100,
        maxPerHour: 1000,
        windowSize: 3600000, // 1 hour
        ...config.rateLimiting
      }
    }

    this.initializeTemplates()
    this.setupEventListeners()
  }

  /**
   * Initialize notification templates
   */
  private initializeTemplates(): void {
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 'alert-critical',
        type: NotificationType.ALERT,
        channel: NotificationChannel.IN_APP,
        titleTemplate: 'Critical Alert: {{title}}',
        messageTemplate: '{{message}}',
        variables: ['title', 'message'],
        isActive: true
      },
      {
        id: 'system-event',
        type: NotificationType.SYSTEM_EVENT,
        channel: NotificationChannel.IN_APP,
        titleTemplate: 'System Event: {{name}}',
        messageTemplate: '{{description}}',
        variables: ['name', 'description'],
        isActive: true
      },
      {
        id: 'failover-initiated',
        type: NotificationType.FAILOVER,
        channel: NotificationChannel.IN_APP,
        titleTemplate: 'Failover Initiated',
        messageTemplate: 'Failover initiated for {{primaryName}} to backup system',
        variables: ['primaryName'],
        isActive: true
      },
      {
        id: 'maintenance-scheduled',
        type: NotificationType.MAINTENANCE,
        channel: NotificationChannel.IN_APP,
        titleTemplate: 'Maintenance Scheduled',
        messageTemplate: 'Maintenance scheduled for {{entityId}} on {{scheduledDate}}',
        variables: ['entityId', 'scheduledDate'],
        isActive: true
      }
    ]

    // Add default templates
    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template)
    })

    // Add custom templates from config
    this.config.templates.forEach(template => {
      this.templates.set(template.id, template)
    })
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    const eventBus = getEventBus()

    // Listen for alert events
    eventBus.subscribe(RedundancyEventType.ALERT_CREATED, async (event) => {
      await this.handleAlertCreated(event.data)
    })

    // Listen for system events
    eventBus.subscribe(RedundancyEventType.SYSTEM_HEALTH_CHANGE, async (event) => {
      await this.handleSystemHealthChange(event.data)
    })

    // Listen for failover events
    eventBus.subscribe(RedundancyEventType.FAILOVER_INITIATED, async (event) => {
      await this.handleFailoverInitiated(event.data)
    })

    eventBus.subscribe(RedundancyEventType.FAILOVER_COMPLETED, async (event) => {
      await this.handleFailoverCompleted(event.data)
    })

    // Listen for maintenance events
    eventBus.subscribe(RedundancyEventType.MAINTENANCE_SCHEDULED, async (event) => {
      await this.handleMaintenanceScheduled(event.data)
    })

    // Listen for threshold events
    eventBus.subscribe(RedundancyEventType.THRESHOLD_EXCEEDED, async (event) => {
      await this.handleThresholdExceeded(event.data)
    })
  }

  /**
   * Handle alert created event
   */
  private async handleAlertCreated(alert: AlertModel): Promise<void> {
    await this.createNotification({
      type: NotificationType.ALERT,
      priority: alert.severity,
      title: alert.title,
      message: alert.message,
      data: alert,
      sourceId: alert.source,
      sourceType: 'alert'
    })
  }

  /**
   * Handle system health change event
   */
  private async handleSystemHealthChange(data: any): Promise<void> {
    if (data.degraded) {
      await this.createNotification({
        type: NotificationType.SYSTEM_EVENT,
        priority: Priority.HIGH,
        title: 'System Health Degraded',
        message: `System health changed from ${data.previousStatus} to ${data.currentStatus}`,
        data,
        sourceType: 'system'
      })
    }
  }

  /**
   * Handle failover initiated event
   */
  private async handleFailoverInitiated(data: any): Promise<void> {
    await this.createNotification({
      type: NotificationType.FAILOVER,
      priority: Priority.HIGH,
      title: 'Failover Initiated',
      message: `Failover initiated for ${data.primaryName} to backup system`,
      data,
      sourceId: data.primaryId,
      sourceType: 'failover'
    })
  }

  /**
   * Handle failover completed event
   */
  private async handleFailoverCompleted(data: any): Promise<void> {
    await this.createNotification({
      type: NotificationType.RECOVERY,
      priority: Priority.MEDIUM,
      title: 'Failover Completed',
      message: `Failover completed successfully in ${data.duration}ms`,
      data,
      sourceId: data.primaryId,
      sourceType: 'failover'
    })
  }

  /**
   * Handle maintenance scheduled event
   */
  private async handleMaintenanceScheduled(data: any): Promise<void> {
    await this.createNotification({
      type: NotificationType.MAINTENANCE,
      priority: Priority.LOW,
      title: 'Maintenance Scheduled',
      message: `Maintenance scheduled for ${data.entityId} on ${new Date(data.scheduledDate).toLocaleDateString()}`,
      data,
      sourceId: data.entityId,
      sourceType: 'maintenance'
    })
  }

  /**
   * Handle threshold exceeded event
   */
  private async handleThresholdExceeded(data: any): Promise<void> {
    await this.createNotification({
      type: NotificationType.THRESHOLD,
      priority: Priority.HIGH,
      title: 'Threshold Exceeded',
      message: `${data.key} exceeded threshold: ${data.value} > ${data.threshold}`,
      data,
      sourceType: 'threshold'
    })
  }

  /**
   * Create notification
   */
  async createNotification(params: {
    type: NotificationType
    priority: Priority
    title: string
    message: string
    data?: any
    userId?: string
    groupId?: string
    sourceId?: string
    sourceType?: string
    channels?: NotificationChannel[]
    expiresAt?: Date
  }): Promise<NotificationModel[]> {
    const notifications: NotificationModel[] = []
    const channels = params.channels || this.getDefaultChannels(params.priority)

    // Create notification for each channel
    for (const channel of channels) {
      if (!this.config.channels[channel]?.enabled) continue

      const notification: NotificationModel = {
        id: this.generateId(),
        type: params.type,
        channel,
        status: NotificationStatus.PENDING,
        priority: params.priority,
        title: params.title,
        message: params.message,
        data: params.data,
        userId: params.userId,
        groupId: params.groupId,
        sourceId: params.sourceId,
        sourceType: params.sourceType,
        expiresAt: params.expiresAt?.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Check rate limiting
      if (this.isRateLimited(notification)) {
        console.warn(`Rate limited notification: ${notification.id}`)
        continue
      }

      // Apply template if available
      this.applyTemplate(notification)

      // Store notification
      this.notifications.set(notification.id, notification)
      notifications.push(notification)

      // Queue for processing
      this.notificationQueue.push(notification)
    }

    // Process queue
    this.processQueue()

    return notifications
  }

  /**
   * Get default channels for priority
   */
  private getDefaultChannels(priority: Priority): NotificationChannel[] {
    switch (priority) {
      case Priority.CRITICAL:
        return [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.SMS]
      case Priority.HIGH:
        return [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
      case Priority.MEDIUM:
        return [NotificationChannel.IN_APP]
      case Priority.LOW:
        return [NotificationChannel.IN_APP]
      default:
        return [NotificationChannel.IN_APP]
    }
  }

  /**
   * Check if notification is rate limited
   */
  private isRateLimited(notification: NotificationModel): boolean {
    if (!this.config.rateLimiting.enabled) return false

    const key = notification.userId || 'system'
    const count = this.rateLimitCounters.get(key) || 0
    
    if (count >= this.config.rateLimiting.maxPerUser) {
      return true
    }

    this.rateLimitCounters.set(key, count + 1)
    
    // Reset counter after window
    setTimeout(() => {
      this.rateLimitCounters.set(key, Math.max(0, (this.rateLimitCounters.get(key) || 0) - 1))
    }, this.config.rateLimiting.windowSize)

    return false
  }

  /**
   * Apply template to notification
   */
  private applyTemplate(notification: NotificationModel): void {
    const templateId = `${notification.type.toLowerCase()}-${notification.channel.toLowerCase()}`
    const template = this.templates.get(templateId)
    
    if (!template || !template.isActive) return

    // Replace template variables
    notification.title = this.replaceTemplateVariables(template.titleTemplate, notification.data)
    notification.message = this.replaceTemplateVariables(template.messageTemplate, notification.data)
  }

  /**
   * Replace template variables
   */
  private replaceTemplateVariables(template: string, data: any): string {
    if (!data) return template

    let result = template
    const variables = template.match(/\{\{([^}]+)\}\}/g) || []

    variables.forEach(variable => {
      const key = variable.replace(/[{}]/g, '')
      const value = this.getNestedValue(data, key)
      if (value !== undefined) {
        result = result.replace(variable, String(value))
      }
    })

    return result
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Process notification queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.notificationQueue.length === 0) return

    this.isProcessing = true

    try {
      const batch = this.notificationQueue.splice(0, this.config.batchSize)
      
      for (const notification of batch) {
        await this.sendNotification(notification)
      }
    } finally {
      this.isProcessing = false
      
      // Continue processing if queue has items
      if (this.notificationQueue.length > 0) {
        setTimeout(() => this.processQueue(), 100)
      }
    }
  }

  /**
   * Send notification
   */
  private async sendNotification(notification: NotificationModel): Promise<void> {
    try {
      await this.deliverNotification(notification)
      
      notification.status = NotificationStatus.SENT
      notification.sentAt = new Date().toISOString()
      notification.updatedAt = new Date().toISOString()
      
      this.notifications.set(notification.id, notification)
      
    } catch (error) {
      console.error(`Failed to send notification ${notification.id}:`, error)
      
      notification.status = NotificationStatus.FAILED
      notification.updatedAt = new Date().toISOString()
      
      this.notifications.set(notification.id, notification)
      
      // Add to retry queue
      this.addToRetryQueue(notification)
    }
  }

  /**
   * Deliver notification through specific channel
   */
  private async deliverNotification(notification: NotificationModel): Promise<void> {
    switch (notification.channel) {
      case NotificationChannel.IN_APP:
        await this.deliverInApp(notification)
        break
      case NotificationChannel.EMAIL:
        await this.deliverEmail(notification)
        break
      case NotificationChannel.SMS:
        await this.deliverSMS(notification)
        break
      case NotificationChannel.PUSH:
        await this.deliverPush(notification)
        break
      case NotificationChannel.WEBHOOK:
        await this.deliverWebhook(notification)
        break
      case NotificationChannel.SLACK:
        await this.deliverSlack(notification)
        break
      case NotificationChannel.TEAMS:
        await this.deliverTeams(notification)
        break
      default:
        throw new Error(`Unsupported channel: ${notification.channel}`)
    }
  }

  /**
   * Deliver in-app notification
   */
  private async deliverInApp(notification: NotificationModel): Promise<void> {
    // In-app notifications are already stored, just mark as delivered
    notification.status = NotificationStatus.DELIVERED
    notification.deliveredAt = new Date().toISOString()
    
    console.log(`📱 In-app notification delivered: ${notification.title}`)
  }

  /**
   * Deliver email notification
   */
  private async deliverEmail(notification: NotificationModel): Promise<void> {
    // Simulate email delivery
    await new Promise(resolve => setTimeout(resolve, 100))
    console.log(`📧 Email notification sent: ${notification.title}`)
  }

  /**
   * Deliver SMS notification
   */
  private async deliverSMS(notification: NotificationModel): Promise<void> {
    // Simulate SMS delivery
    await new Promise(resolve => setTimeout(resolve, 200))
    console.log(`📱 SMS notification sent: ${notification.title}`)
  }

  /**
   * Deliver push notification
   */
  private async deliverPush(notification: NotificationModel): Promise<void> {
    // Simulate push delivery
    await new Promise(resolve => setTimeout(resolve, 150))
    console.log(`🔔 Push notification sent: ${notification.title}`)
  }

  /**
   * Deliver webhook notification
   */
  private async deliverWebhook(notification: NotificationModel): Promise<void> {
    // Simulate webhook delivery
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log(`🔗 Webhook notification sent: ${notification.title}`)
  }

  /**
   * Deliver Slack notification
   */
  private async deliverSlack(notification: NotificationModel): Promise<void> {
    // Simulate Slack delivery
    await new Promise(resolve => setTimeout(resolve, 250))
    console.log(`💬 Slack notification sent: ${notification.title}`)
  }

  /**
   * Deliver Teams notification
   */
  private async deliverTeams(notification: NotificationModel): Promise<void> {
    // Simulate Teams delivery
    await new Promise(resolve => setTimeout(resolve, 250))
    console.log(`👥 Teams notification sent: ${notification.title}`)
  }

  /**
   * Add notification to retry queue
   */
  private addToRetryQueue(notification: NotificationModel): void {
    if (!this.retryQueues.has(notification.channel)) {
      this.retryQueues.set(notification.channel, [])
    }
    
    this.retryQueues.get(notification.channel)!.push(notification)
    
    // Schedule retry
    setTimeout(() => {
      this.retryNotification(notification)
    }, this.config.retryDelay)
  }

  /**
   * Retry failed notification
   */
  private async retryNotification(notification: NotificationModel): Promise<void> {
    const retryQueue = this.retryQueues.get(notification.channel)
    if (!retryQueue) return

    const index = retryQueue.findIndex(n => n.id === notification.id)
    if (index === -1) return

    retryQueue.splice(index, 1)
    
    // Check retry count
    const retryCount = notification.data?.retryCount || 0
    if (retryCount >= this.config.maxRetries) {
      notification.status = NotificationStatus.FAILED
      notification.updatedAt = new Date().toISOString()
      this.notifications.set(notification.id, notification)
      return
    }

    // Increment retry count
    notification.data = { ...notification.data, retryCount: retryCount + 1 }
    
    // Retry sending
    await this.sendNotification(notification)
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId)
    if (!notification) return false

    notification.status = NotificationStatus.READ
    notification.readAt = new Date().toISOString()
    notification.updatedAt = new Date().toISOString()
    
    this.notifications.set(notificationId, notification)
    return true
  }

  /**
   * Get notifications for user
   */
  getUserNotifications(userId: string, options: {
    limit?: number
    offset?: number
    status?: NotificationStatus
    type?: NotificationType
    priority?: Priority
  } = {}): NotificationModel[] {
    const notifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId || (!n.userId && !n.groupId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    let filtered = notifications

    // Apply filters
    if (options.status) {
      filtered = filtered.filter(n => n.status === options.status)
    }
    if (options.type) {
      filtered = filtered.filter(n => n.type === options.type)
    }
    if (options.priority) {
      filtered = filtered.filter(n => n.priority === options.priority)
    }

    // Apply pagination
    const offset = options.offset || 0
    const limit = options.limit || 50
    
    return filtered.slice(offset, offset + limit)
  }

  /**
   * Get notification by ID
   */
  getNotification(notificationId: string): NotificationModel | undefined {
    return this.notifications.get(notificationId)
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): boolean {
    return this.notifications.delete(notificationId)
  }

  /**
   * Clear all notifications for user
   */
  clearUserNotifications(userId: string): number {
    let cleared = 0
    
    for (const [id, notification] of this.notifications) {
      if (notification.userId === userId) {
        this.notifications.delete(id)
        cleared++
      }
    }
    
    return cleared
  }

  /**
   * Set user preferences
   */
  setUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): void {
    const existing = this.preferences.get(userId) || { userId, ...this.config.defaultPreferences }
    const updated = { ...existing, ...preferences, userId }
    
    this.preferences.set(userId, updated)
  }

  /**
   * Get user preferences
   */
  getUserPreferences(userId: string): NotificationPreferences {
    return this.preferences.get(userId) || { userId, ...this.config.defaultPreferences }
  }

  /**
   * Get notification statistics
   */
  getStats(): {
    total: number
    byStatus: Record<NotificationStatus, number>
    byType: Record<NotificationType, number>
    byChannel: Record<NotificationChannel, number>
    byPriority: Record<Priority, number>
    queueSize: number
    retryQueueSize: number
  } {
    const notifications = Array.from(this.notifications.values())
    
    const stats = {
      total: notifications.length,
      byStatus: {} as Record<NotificationStatus, number>,
      byType: {} as Record<NotificationType, number>,
      byChannel: {} as Record<NotificationChannel, number>,
      byPriority: {} as Record<Priority, number>,
      queueSize: this.notificationQueue.length,
      retryQueueSize: Array.from(this.retryQueues.values()).reduce((sum, queue) => sum + queue.length, 0)
    }

    // Initialize counters
    Object.values(NotificationStatus).forEach(status => {
      stats.byStatus[status] = 0
    })
    Object.values(NotificationType).forEach(type => {
      stats.byType[type] = 0
    })
    Object.values(NotificationChannel).forEach(channel => {
      stats.byChannel[channel] = 0
    })
    Object.values(Priority).forEach(priority => {
      stats.byPriority[priority] = 0
    })

    // Count notifications
    notifications.forEach(notification => {
      stats.byStatus[notification.status]++
      stats.byType[notification.type]++
      stats.byChannel[notification.channel]++
      stats.byPriority[notification.priority]++
    })

    return stats
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * Default notification service instance
 */
let defaultService: NotificationService | null = null

/**
 * Get default notification service
 */
export function getNotificationService(config?: Partial<NotificationServiceConfig>): NotificationService {
  if (!defaultService) {
    defaultService = new NotificationService(config)
  }
  return defaultService
}