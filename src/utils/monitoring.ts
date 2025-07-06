/**
 * Monitoring and Analytics Setup for 2N+1 Redundancy Visualization
 * Basic monitoring utilities for error tracking and user analytics
 */

interface MonitoringConfig {
  environment: string
  version: string
  userId?: string
  sessionId: string
}

interface ErrorEvent {
  message: string
  stack?: string
  timestamp: number
  userAgent: string
  url: string
  userId?: string
  sessionId: string
  redundancyActive?: boolean
}

interface AnalyticsEvent {
  event: string
  category: string
  action: string
  label?: string
  value?: number
  timestamp: number
  sessionId: string
  redundancyActive?: boolean
}

class MonitoringService {
  private config: MonitoringConfig
  private errorQueue: ErrorEvent[] = []
  private analyticsQueue: AnalyticsEvent[] = []
  private isRedundancyActive = false

  constructor() {
    this.config = {
      environment: process.env.NODE_ENV || 'development',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      sessionId: this.generateSessionId()
    }

    this.setupErrorHandling()
    this.setupPerformanceMonitoring()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private setupErrorHandling() {
    if (typeof window === 'undefined') return

    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.config.sessionId,
        redundancyActive: this.isRedundancyActive
      })
    })

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.config.sessionId,
        redundancyActive: this.isRedundancyActive
      })
    })
  }

  private setupPerformanceMonitoring() {
    if (typeof window === 'undefined') return

    // Monitor navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        this.trackAnalytics({
          event: 'page_load_complete',
          category: 'performance',
          action: 'timing',
          value: Math.round(navigation.loadEventEnd - navigation.fetchStart),
          timestamp: Date.now(),
          sessionId: this.config.sessionId,
          redundancyActive: this.isRedundancyActive
        })
      }, 0)
    })
  }

  public setRedundancyStatus(active: boolean) {
    this.isRedundancyActive = active
    
    this.trackAnalytics({
      event: 'redundancy_status_change',
      category: 'redundancy',
      action: active ? 'enable' : 'disable',
      timestamp: Date.now(),
      sessionId: this.config.sessionId,
      redundancyActive: active
    })
  }

  public trackError(error: ErrorEvent) {
    this.errorQueue.push(error)
    
    // In development, log to console
    if (this.config.environment === 'development') {
      console.error('Error tracked:', error)
    }

    // Flush queue if it gets too large
    if (this.errorQueue.length > 50) {
      this.flushErrors()
    }
  }

  public trackAnalytics(event: AnalyticsEvent) {
    this.analyticsQueue.push(event)
    
    // In development, log to console
    if (this.config.environment === 'development') {
      console.log('Analytics event:', event)
    }

    // Flush queue if it gets too large
    if (this.analyticsQueue.length > 100) {
      this.flushAnalytics()
    }
  }

  public trackRedundancyInteraction(action: string, details?: Record<string, any>) {
    this.trackAnalytics({
      event: 'redundancy_interaction',
      category: 'redundancy',
      action,
      label: details ? JSON.stringify(details) : undefined,
      timestamp: Date.now(),
      sessionId: this.config.sessionId,
      redundancyActive: this.isRedundancyActive
    })
  }

  public trackPerformanceMetric(metric: string, value: number, unit?: string) {
    this.trackAnalytics({
      event: 'performance_metric',
      category: 'performance',
      action: metric,
      label: unit,
      value,
      timestamp: Date.now(),
      sessionId: this.config.sessionId,
      redundancyActive: this.isRedundancyActive
    })
  }

  private async flushErrors() {
    if (this.errorQueue.length === 0) return

    const errors = [...this.errorQueue]
    this.errorQueue = []

    try {
      // In a real implementation, send to error tracking service like Sentry
      // await this.sendToSentry(errors)
      
      // For now, just store in localStorage for development
      if (this.config.environment === 'development') {
        const existingErrors = JSON.parse(localStorage.getItem('monitoring_errors') || '[]')
        localStorage.setItem('monitoring_errors', JSON.stringify([...existingErrors, ...errors].slice(-100)))
      }
    } catch (error) {
      console.error('Failed to flush errors:', error)
      // Re-add errors to queue
      this.errorQueue.unshift(...errors)
    }
  }

  private async flushAnalytics() {
    if (this.analyticsQueue.length === 0) return

    const events = [...this.analyticsQueue]
    this.analyticsQueue = []

    try {
      // In a real implementation, send to analytics service like Google Analytics 4
      // await this.sendToGA4(events)
      
      // For now, just store in localStorage for development
      if (this.config.environment === 'development') {
        const existingEvents = JSON.parse(localStorage.getItem('monitoring_analytics') || '[]')
        localStorage.setItem('monitoring_analytics', JSON.stringify([...existingEvents, ...events].slice(-200)))
      }
    } catch (error) {
      console.error('Failed to flush analytics:', error)
      // Re-add events to queue
      this.analyticsQueue.unshift(...events)
    }
  }

  public getSessionReport() {
    return {
      sessionId: this.config.sessionId,
      environment: this.config.environment,
      version: this.config.version,
      errors: this.errorQueue.length,
      analyticsEvents: this.analyticsQueue.length,
      redundancyActive: this.isRedundancyActive,
      timestamp: Date.now()
    }
  }

  public async flush() {
    await Promise.all([
      this.flushErrors(),
      this.flushAnalytics()
    ])
  }

  // Cleanup method
  public destroy() {
    this.flush()
  }
}

// Global monitoring instance
let monitoringService: MonitoringService | null = null

export function initializeMonitoring(): MonitoringService {
  if (typeof window === 'undefined') {
    throw new Error('Monitoring can only be initialized in the browser')
  }
  
  if (!monitoringService) {
    monitoringService = new MonitoringService()
  }
  
  return monitoringService
}

export function getMonitoringService(): MonitoringService | null {
  return monitoringService
}

// Convenience functions
export function trackError(message: string, error?: Error) {
  const service = getMonitoringService()
  if (service) {
    service.trackError({
      message,
      stack: error?.stack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: service.getSessionReport().sessionId
    })
  }
}

export function trackRedundancyEvent(action: string, details?: Record<string, any>) {
  const service = getMonitoringService()
  if (service) {
    service.trackRedundancyInteraction(action, details)
  }
}

export function trackPerformance(metric: string, value: number, unit?: string) {
  const service = getMonitoringService()
  if (service) {
    service.trackPerformanceMetric(metric, value, unit)
  }
}

export function setRedundancyStatus(active: boolean) {
  const service = getMonitoringService()
  if (service) {
    service.setRedundancyStatus(active)
  }
}