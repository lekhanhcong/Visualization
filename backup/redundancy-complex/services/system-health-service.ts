/**
 * System Health Service
 * Data service for system health monitoring and metrics
 */

import { BaseService, ServiceConfig } from './base-service'
import { 
  SystemHealthModel, 
  SystemEventModel,
  AlertModel,
  ApiResponse, 
  TimeRange
} from '../models/interfaces'
import { validators } from '../models/validators'

/**
 * Health metrics query options
 */
export interface HealthMetricsQuery {
  timeRange?: TimeRange
  granularity?: 'minute' | 'hour' | 'day' | 'week' | 'month'
  metrics?: string[]
  includeSubsystems?: boolean
  includeEvents?: boolean
  includeAlerts?: boolean
}

/**
 * Health trend data
 */
export interface HealthTrend {
  timestamp: string
  overall: string
  redundancyLevel: number
  systemAvailability: number
  alertCounts: {
    critical: number
    warning: number
    info: number
  }
  subsystemHealth: {
    power: number
    communication: number
    control: number
    protection: number
    cooling: number
    monitoring: number
  }
}

/**
 * System performance metrics
 */
export interface SystemPerformance {
  timestamp: string
  capacityUtilization: number
  loadDistribution: number
  efficiency: number
  reliability: number
  mtbf: number
  mttr: number
  incidents: number
  maintenanceEvents: number
}

/**
 * Health summary report
 */
export interface HealthSummaryReport {
  period: TimeRange
  overview: {
    overallHealth: string
    averageRedundancyLevel: number
    totalUptime: number
    totalDowntime: number
    availabilityPercent: number
  }
  subsystems: {
    [key: string]: {
      averageHealth: number
      incidents: number
      maintenanceEvents: number
      uptime: number
    }
  }
  alerts: {
    total: number
    critical: number
    warning: number
    info: number
    resolved: number
    averageResolutionTime: number
  }
  events: {
    total: number
    faults: number
    maintenance: number
    switching: number
    recovery: number
  }
  recommendations: string[]
}

/**
 * System health service class
 */
export class SystemHealthService extends BaseService {
  private readonly endpoint = '/api/system-health'

  constructor(config: ServiceConfig = {}) {
    super({
      baseUrl: config.baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || '',
      ...config
    })
  }

  /**
   * Get current system health status
   */
  async getCurrentHealth(): Promise<ApiResponse<SystemHealthModel>> {
    try {
      this.log('info', 'Fetching current system health')
      
      const response = await this.get<ApiResponse<SystemHealthModel>>(`${this.endpoint}/current`)
      
      if (response.data) {
        this.validateData(response.data, validators.systemHealth.validate.bind(validators.systemHealth))
      }
      
      this.log('info', `Current system health: ${response.data?.overall}`)
      return response
      
    } catch (error) {
      this.log('error', 'Failed to fetch current system health', error)
      throw error
    }
  }

  /**
   * Get health metrics history
   */
  async getHealthHistory(query?: HealthMetricsQuery): Promise<ApiResponse<HealthTrend[]>> {
    try {
      this.log('info', 'Fetching health history', query)
      
      const params = new URLSearchParams()
      
      if (query?.timeRange) {
        params.append('startTime', query.timeRange.start.toString())
        params.append('endTime', query.timeRange.end.toString())
      }
      
      if (query?.granularity) {
        params.append('granularity', query.granularity)
      }
      
      if (query?.metrics) {
        params.append('metrics', query.metrics.join(','))
      }
      
      if (query?.includeSubsystems) {
        params.append('includeSubsystems', 'true')
      }
      
      if (query?.includeEvents) {
        params.append('includeEvents', 'true')
      }
      
      if (query?.includeAlerts) {
        params.append('includeAlerts', 'true')
      }
      
      const url = params.toString() ? `${this.endpoint}/history?${params.toString()}` : `${this.endpoint}/history`
      const response = await this.get<ApiResponse<HealthTrend[]>>(url)
      
      this.log('info', `Fetched ${response.data?.length || 0} health trend records`)
      return response
      
    } catch (error) {
      this.log('error', 'Failed to fetch health history', error)
      throw error
    }
  }

  /**
   * Get system performance metrics
   */
  async getPerformanceMetrics(query?: HealthMetricsQuery): Promise<ApiResponse<SystemPerformance[]>> {
    try {
      this.log('info', 'Fetching performance metrics', query)
      
      const params = new URLSearchParams()
      
      if (query?.timeRange) {
        params.append('startTime', query.timeRange.start.toString())
        params.append('endTime', query.timeRange.end.toString())
      }
      
      if (query?.granularity) {
        params.append('granularity', query.granularity)
      }
      
      const url = params.toString() ? `${this.endpoint}/performance?${params.toString()}` : `${this.endpoint}/performance`
      const response = await this.get<ApiResponse<SystemPerformance[]>>(url)
      
      this.log('info', `Fetched ${response.data?.length || 0} performance metric records`)
      return response
      
    } catch (error) {
      this.log('error', 'Failed to fetch performance metrics', error)
      throw error
    }
  }

  /**
   * Get recent system events
   */
  async getRecentEvents(limit = 50, severity?: string): Promise<ApiResponse<SystemEventModel[]>> {
    try {
      this.log('info', `Fetching recent events (limit: ${limit}, severity: ${severity})`)
      
      const params = new URLSearchParams({
        limit: limit.toString()
      })
      
      if (severity) {
        params.append('severity', severity)
      }
      
      const response = await this.get<ApiResponse<SystemEventModel[]>>(
        `${this.endpoint}/events/recent?${params.toString()}`
      )
      
      this.log('info', `Fetched ${response.data?.length || 0} recent events`)
      return response
      
    } catch (error) {
      this.log('error', 'Failed to fetch recent events', error)
      throw error
    }
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(severity?: string): Promise<ApiResponse<AlertModel[]>> {
    try {
      this.log('info', `Fetching active alerts (severity: ${severity})`)
      
      const params = new URLSearchParams({
        status: 'ACTIVE'
      })
      
      if (severity) {
        params.append('severity', severity)
      }
      
      const response = await this.get<ApiResponse<AlertModel[]>>(
        `${this.endpoint}/alerts?${params.toString()}`
      )
      
      if (response.data) {
        response.data.forEach((alert, index) => {
          try {
            this.validateData(alert, validators.alert.validate.bind(validators.alert))
          } catch (error) {
            this.log('warn', `Invalid alert data at index ${index}`, { alert, error })
          }
        })
      }
      
      this.log('info', `Fetched ${response.data?.length || 0} active alerts`)
      return response
      
    } catch (error) {
      this.log('error', 'Failed to fetch active alerts', error)
      throw error
    }
  }

  /**
   * Get health summary report
   */
  async getHealthSummary(timeRange?: TimeRange): Promise<ApiResponse<HealthSummaryReport>> {
    try {
      this.log('info', 'Fetching health summary report', timeRange)
      
      const params = new URLSearchParams()
      
      if (timeRange) {
        params.append('startTime', timeRange.start.toString())
        params.append('endTime', timeRange.end.toString())
      }
      
      const url = params.toString() ? `${this.endpoint}/summary?${params.toString()}` : `${this.endpoint}/summary`
      const response = await this.get<ApiResponse<HealthSummaryReport>>(url)
      
      this.log('info', 'Fetched health summary report')
      return response
      
    } catch (error) {
      this.log('error', 'Failed to fetch health summary report', error)
      throw error
    }
  }

  /**
   * Get subsystem health details
   */
  async getSubsystemHealth(subsystem: string, timeRange?: TimeRange): Promise<ApiResponse<HealthTrend[]>> {
    try {
      this.log('info', `Fetching health for subsystem: ${subsystem}`, timeRange)
      
      const params = new URLSearchParams()
      
      if (timeRange) {
        params.append('startTime', timeRange.start.toString())
        params.append('endTime', timeRange.end.toString())
      }
      
      const url = params.toString() 
        ? `${this.endpoint}/subsystem/${subsystem}?${params.toString()}` 
        : `${this.endpoint}/subsystem/${subsystem}`
      
      const response = await this.get<ApiResponse<HealthTrend[]>>(url)
      
      this.log('info', `Fetched ${response.data?.length || 0} records for subsystem: ${subsystem}`)
      return response
      
    } catch (error) {
      this.log('error', `Failed to fetch health for subsystem: ${subsystem}`, error)
      throw error
    }
  }

  /**
   * Calculate system health score
   */
  async calculateHealthScore(): Promise<ApiResponse<{
    overallScore: number
    subscores: {
      redundancy: number
      availability: number
      performance: number
      alerts: number
    }
    factors: {
      redundancyWeight: number
      availabilityWeight: number
      performanceWeight: number
      alertWeight: number
    }
    recommendations: string[]
  }>> {
    try {
      this.log('info', 'Calculating system health score')
      
      const response = await this.get<ApiResponse<any>>(`${this.endpoint}/score`)
      
      this.log('info', `Calculated health score: ${response.data?.overallScore}`)
      return response
      
    } catch (error) {
      this.log('error', 'Failed to calculate health score', error)
      throw error
    }
  }

  /**
   * Get redundancy analysis
   */
  async getRedundancyAnalysis(): Promise<ApiResponse<{
    currentLevel: number
    targetLevel: number
    gaps: {
      zone: string
      current: number
      target: number
      risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    }[]
    recommendations: {
      priority: 'HIGH' | 'MEDIUM' | 'LOW'
      action: string
      impact: string
      cost: string
    }[]
  }>> {
    try {
      this.log('info', 'Fetching redundancy analysis')
      
      const response = await this.get<ApiResponse<any>>(`${this.endpoint}/redundancy-analysis`)
      
      this.log('info', 'Fetched redundancy analysis')
      return response
      
    } catch (error) {
      this.log('error', 'Failed to fetch redundancy analysis', error)
      throw error
    }
  }

  /**
   * Get capacity analysis
   */
  async getCapacityAnalysis(): Promise<ApiResponse<{
    totalCapacity: number
    usedCapacity: number
    availableCapacity: number
    utilizationPercent: number
    peakUtilization: number
    projectedGrowth: number
    capacityWarnings: {
      zone: string
      utilization: number
      timeToCapacity: number
      risk: string
    }[]
    recommendations: string[]
  }>> {
    try {
      this.log('info', 'Fetching capacity analysis')
      
      const response = await this.get<ApiResponse<any>>(`${this.endpoint}/capacity-analysis`)
      
      this.log('info', 'Fetched capacity analysis')
      return response
      
    } catch (error) {
      this.log('error', 'Failed to fetch capacity analysis', error)
      throw error
    }
  }

  /**
   * Update system health data
   */
  async updateSystemHealth(data: Partial<SystemHealthModel>): Promise<ApiResponse<SystemHealthModel>> {
    try {
      this.log('info', 'Updating system health data', data)
      
      const updateData = {
        ...data,
        timestamp: new Date().toISOString()
      }
      
      const response = await this.post<ApiResponse<SystemHealthModel>>(`${this.endpoint}/update`, updateData)
      
      if (response.data) {
        this.validateData(response.data, validators.systemHealth.validate.bind(validators.systemHealth))
      }
      
      // Clear cache
      this.clearCache('system-health')
      
      this.log('info', 'Updated system health data')
      return response
      
    } catch (error) {
      this.log('error', 'Failed to update system health data', error)
      throw error
    }
  }

  /**
   * Record system event
   */
  async recordEvent(event: {
    type: 'FAULT' | 'MAINTENANCE' | 'SWITCHING' | 'ALERT' | 'RECOVERY'
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    message: string
    source: string
    category: string
    affectedEntities?: string[]
    metadata?: Record<string, any>
  }): Promise<ApiResponse<SystemEventModel>> {
    try {
      this.log('info', 'Recording system event', event)
      
      const eventData = {
        ...event,
        id: '', // Will be generated by server
        name: `${event.type}_${Date.now()}`,
        status: 'ACTIVE',
        startTime: new Date().toISOString(),
        impactLevel: event.severity,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const response = await this.post<ApiResponse<SystemEventModel>>(`${this.endpoint}/events`, eventData)
      
      // Clear cache
      this.clearCache('system-health')
      
      this.log('info', `Recorded system event: ${response.data?.id}`)
      return response
      
    } catch (error) {
      this.log('error', 'Failed to record system event', error)
      throw error
    }
  }

  /**
   * Get health predictions
   */
  async getHealthPredictions(timeHorizon = 24): Promise<ApiResponse<{
    predictions: {
      timestamp: string
      predictedHealth: string
      confidence: number
      factors: string[]
    }[]
    risks: {
      type: string
      probability: number
      impact: string
      timeframe: string
      mitigation: string[]
    }[]
    recommendations: {
      action: string
      priority: 'HIGH' | 'MEDIUM' | 'LOW'
      timeframe: string
      expected_benefit: string
    }[]
  }>> {
    try {
      this.log('info', `Fetching health predictions (${timeHorizon}h horizon)`)
      
      const params = new URLSearchParams({
        timeHorizon: timeHorizon.toString()
      })
      
      const response = await this.get<ApiResponse<any>>(
        `${this.endpoint}/predictions?${params.toString()}`
      )
      
      this.log('info', `Fetched health predictions for ${timeHorizon}h horizon`)
      return response
      
    } catch (error) {
      this.log('error', 'Failed to fetch health predictions', error)
      throw error
    }
  }

  /**
   * Get maintenance recommendations
   */
  async getMaintenanceRecommendations(): Promise<ApiResponse<{
    scheduled: {
      entity: string
      type: string
      priority: 'HIGH' | 'MEDIUM' | 'LOW'
      dueDate: string
      estimatedDuration: number
      impact: string
    }[]
    predictive: {
      entity: string
      issue: string
      probability: number
      timeframe: string
      action: string
      cost: string
    }[]
    emergency: {
      entity: string
      issue: string
      severity: 'CRITICAL' | 'HIGH'
      action: string
      urgency: string
    }[]
  }>> {
    try {
      this.log('info', 'Fetching maintenance recommendations')
      
      const response = await this.get<ApiResponse<any>>(`${this.endpoint}/maintenance-recommendations`)
      
      this.log('info', 'Fetched maintenance recommendations')
      return response
      
    } catch (error) {
      this.log('error', 'Failed to fetch maintenance recommendations', error)
      throw error
    }
  }

  /**
   * Export health data
   */
  async exportHealthData(
    format: 'csv' | 'json' | 'xlsx',
    timeRange?: TimeRange,
    includeSubsystems = true
  ): Promise<ApiResponse<{
    downloadUrl: string
    filename: string
    size: number
    expiresAt: string
  }>> {
    try {
      this.log('info', `Exporting health data (format: ${format})`, timeRange)
      
      const params = new URLSearchParams({
        format,
        includeSubsystems: includeSubsystems.toString()
      })
      
      if (timeRange) {
        params.append('startTime', timeRange.start.toString())
        params.append('endTime', timeRange.end.toString())
      }
      
      const response = await this.post<ApiResponse<any>>(
        `${this.endpoint}/export?${params.toString()}`
      )
      
      this.log('info', `Health data export prepared: ${response.data?.filename}`)
      return response
      
    } catch (error) {
      this.log('error', 'Failed to export health data', error)
      throw error
    }
  }
}