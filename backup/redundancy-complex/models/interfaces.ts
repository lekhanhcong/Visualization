/**
 * Data Model Interfaces
 * Core data models and interfaces for the redundancy feature
 */

/**
 * Basic coordinate interface
 */
export interface Coordinates {
  x: number
  y: number
}

/**
 * Geographic bounds interface
 */
export interface Bounds {
  north: number
  south: number
  east: number
  west: number
}

/**
 * Time range interface
 */
export interface TimeRange {
  start: Date | string
  end: Date | string
}

/**
 * Base entity interface with common properties
 */
export interface BaseEntity {
  id: string
  name: string
  description?: string
  createdAt: Date | string
  updatedAt: Date | string
  metadata?: Record<string, any>
}

/**
 * Status enumeration for various entities
 */
export enum EntityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE', 
  MAINTENANCE = 'MAINTENANCE',
  FAULT = 'FAULT',
  OFFLINE = 'OFFLINE',
  STANDBY = 'STANDBY',
  EMERGENCY = 'EMERGENCY'
}

/**
 * Priority levels
 */
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * Substation data model
 */
export interface SubstationModel extends BaseEntity {
  // Basic properties
  type: 'PRIMARY' | 'BACKUP' | 'AUXILIARY' | 'DISTRIBUTION'
  status: EntityStatus
  zone: string
  
  // Location and positioning
  position: Coordinates
  address?: string
  region?: string
  
  // Electrical properties
  powerRating: number // MW
  currentLoad: number // MW
  voltage: number // kV
  frequency: number // Hz
  powerFactor: number // 0-1
  efficiency: number // 0-1
  
  // Redundancy configuration
  redundancyGroup: string
  redundancyLevel: 'N' | 'N+1' | '2N' | '2N+1'
  backupSubstations?: string[] // IDs
  primarySubstation?: string // ID for backup stations
  
  // Operational data
  temperature: number // Celsius
  operationalHours: number
  reliability: number // 0-1
  availability: number // 0-1
  
  // Connections
  connections: string[] // Line IDs
  
  // Alerts and monitoring
  alerts?: AlertModel[]
  lastMaintenance?: Date | string
  nextMaintenance?: Date | string
}

/**
 * Power line data model
 */
export interface LineModel extends BaseEntity {
  // Basic properties
  status: EntityStatus
  type: 'TRANSMISSION' | 'DISTRIBUTION' | 'INTERCONNECTION'
  
  // Physical properties
  path: Coordinates[]
  length: number // kilometers
  voltage: number // kV
  capacity: number // MW
  
  // Electrical properties
  powerFlow: number // MW (positive = forward, negative = reverse)
  current: number // Amperes
  impedance: {
    resistance: number // Ohms
    reactance: number // Ohms
  }
  
  // Operational data
  temperature: number // Celsius
  loadFactor: number // 0-1 (current load / capacity)
  efficiency: number // 0-1
  
  // Connection points
  fromSubstation: string // Substation ID
  toSubstation: string // Substation ID
  
  // Redundancy properties
  redundancyGroup?: string
  backupLines?: string[] // Line IDs
  
  // Monitoring
  alerts?: AlertModel[]
  lastInspection?: Date | string
  nextInspection?: Date | string
}

/**
 * Redundancy pair configuration
 */
export interface RedundancyPairModel extends BaseEntity {
  // Pair configuration
  primarySubstation: string // Substation ID
  backupSubstation: string // Substation ID
  redundancyType: 'N+1' | '2N' | '2N+1'
  
  // Current state
  status: 'NORMAL' | 'DEGRADED' | 'FAILED' | 'MAINTENANCE'
  activeStation: string // Currently active substation ID
  
  // Switching configuration
  automaticSwitching: boolean
  switchingTime: number // seconds
  lastSwitchover?: Date | string
  
  // Performance metrics
  reliability: number // 0-1
  availability: number // 0-1
  switchingSuccess: number // 0-1
  
  // Associated lines
  primaryLines: string[] // Line IDs
  backupLines: string[] // Line IDs
  
  // Rules and conditions
  switchingConditions: SwitchingCondition[]
  
  // Monitoring
  alerts?: AlertModel[]
}

/**
 * Switching condition for automatic redundancy
 */
export interface SwitchingCondition {
  id: string
  type: 'POWER_THRESHOLD' | 'FAULT_DETECTION' | 'MANUAL_TRIGGER' | 'SCHEDULED'
  condition: string
  threshold?: number
  priority: Priority
  enabled: boolean
}

/**
 * System health and status model
 */
export interface SystemHealthModel {
  // Overall system status
  overall: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'FAILED'
  timestamp: Date | string
  
  // Redundancy metrics
  redundancyLevel: number // 0-1 (percentage of redundancy available)
  redundancyStatus: 'FULL' | 'PARTIAL' | 'MINIMAL' | 'NONE'
  
  // Alert counters
  criticalAlerts: number
  warningAlerts: number
  infoAlerts: number
  
  // Subsystem health
  subsystemHealth: {
    power: number // 0-1
    communication: number // 0-1
    control: number // 0-1
    protection: number // 0-1
    cooling: number // 0-1
    monitoring: number // 0-1
  }
  
  // Capacity metrics
  totalCapacity: number // MW
  currentLoad: number // MW
  peakLoad: number // MW
  averageLoad: number // MW
  
  // Availability metrics
  systemAvailability: number // 0-1
  mtbf: number // Mean Time Between Failures (hours)
  mttr: number // Mean Time To Repair (hours)
  
  // Recent events
  recentEvents: SystemEventModel[]
}

/**
 * System event model
 */
export interface SystemEventModel extends BaseEntity {
  // Event classification
  type: 'FAULT' | 'MAINTENANCE' | 'SWITCHING' | 'ALERT' | 'RECOVERY'
  severity: Priority
  status: 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED'
  
  // Event details
  message: string
  source: string // Entity ID that triggered the event
  category: string
  
  // Timing
  startTime: Date | string
  endTime?: Date | string
  duration?: number // seconds
  
  // Impact assessment
  affectedEntities: string[] // Entity IDs
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  
  // Response and resolution
  response?: string
  resolution?: string
  assignedTo?: string
  acknowledgedBy?: string
  acknowledgedAt?: Date | string
}

/**
 * Alert model for monitoring and notifications
 */
export interface AlertModel extends BaseEntity {
  // Alert classification
  type: 'FAULT' | 'WARNING' | 'INFO' | 'MAINTENANCE'
  severity: Priority
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
  
  // Alert content
  title: string
  message: string
  source: string // Entity ID
  category: string
  
  // Conditions
  condition: string
  threshold?: number
  currentValue?: number
  
  // Timing
  triggeredAt: Date | string
  acknowledgedAt?: Date | string
  resolvedAt?: Date | string
  
  // Response
  acknowledgedBy?: string
  resolution?: string
  escalationLevel: number
  
  // Actions
  recommendedActions?: string[]
  automatedActions?: string[]
}

/**
 * Power flow animation data
 */
export interface PowerFlowAnimationModel {
  // Animation identification
  id: string
  lineId: string
  
  // Flow properties
  direction: 'FORWARD' | 'REVERSE' | 'BIDIRECTIONAL'
  intensity: number // 0-1 (relative to line capacity)
  speed: number // Animation speed multiplier
  
  // Visual properties
  color: string
  strokeWidth: number
  dashPattern?: number[]
  
  // Animation control
  enabled: boolean
  duration: number // milliseconds
  delay: number // milliseconds
  
  // State
  currentPosition: number // 0-1 along the line
  isPlaying: boolean
}

/**
 * Configuration model for redundancy system
 */
export interface RedundancyConfigModel extends BaseEntity {
  // System configuration
  redundancyStrategy: 'N+1' | '2N' | '2N+1' | 'CUSTOM'
  automaticSwitching: boolean
  switchingDelay: number // seconds
  
  // Thresholds and limits
  thresholds: {
    powerOverload: number // percentage
    voltageDeviation: number // percentage
    frequencyDeviation: number // Hz
    temperatureLimit: number // Celsius
  }
  
  // Monitoring intervals
  monitoringIntervals: {
    realtime: number // milliseconds
    status: number // milliseconds
    health: number // milliseconds
    alerts: number // milliseconds
  }
  
  // Alert configuration
  alertConfig: {
    enabled: boolean
    emailNotifications: boolean
    smsNotifications: boolean
    dashboardAlerts: boolean
    escalationTimeout: number // minutes
  }
  
  // Performance settings
  performanceConfig: {
    maxConcurrentAnimations: number
    animationFrameRate: number
    dataUpdateInterval: number // milliseconds
    cacheTimeout: number // minutes
  }
  
  // Feature flags
  features: {
    realTimeMonitoring: boolean
    predictiveAnalytics: boolean
    automaticFailover: boolean
    loadBalancing: boolean
    maintenanceMode: boolean
  }
}

/**
 * Data source configuration
 */
export interface DataSourceConfig {
  // Source identification
  id: string
  name: string
  type: 'SCADA' | 'EMS' | 'SIMULATION' | 'MOCK' | 'API'
  
  // Connection details
  endpoint: string
  credentials?: {
    username?: string
    password?: string
    apiKey?: string
    token?: string
  }
  
  // Data mapping
  mapping: {
    substations: string // API endpoint or data path
    lines: string
    health: string
    events: string
    alerts: string
  }
  
  // Update configuration
  updateInterval: number // milliseconds
  retryInterval: number // milliseconds
  maxRetries: number
  timeout: number // milliseconds
  
  // Data validation
  validation: {
    enabled: boolean
    strictMode: boolean
    requiredFields: string[]
    allowedRanges: Record<string, [number, number]>
  }
  
  // Status
  status: EntityStatus
  lastUpdate?: Date | string
  lastError?: string
}

/**
 * User preferences for the redundancy feature
 */
export interface UserPreferences {
  // Display preferences
  display: {
    theme: 'LIGHT' | 'DARK' | 'AUTO'
    colorScheme: 'DEFAULT' | 'COLORBLIND' | 'HIGH_CONTRAST'
    fontSize: 'SMALL' | 'MEDIUM' | 'LARGE'
    showAnimations: boolean
    showTooltips: boolean
  }
  
  // Dashboard configuration
  dashboard: {
    layout: 'COMPACT' | 'STANDARD' | 'DETAILED'
    refreshInterval: number // seconds
    autoRefresh: boolean
    showAlerts: boolean
    showHealthMetrics: boolean
  }
  
  // Notifications
  notifications: {
    enabled: boolean
    sound: boolean
    desktop: boolean
    email: boolean
    severityFilter: Priority[]
  }
  
  // Advanced features
  advanced: {
    developerMode: boolean
    debugInfo: boolean
    performanceMetrics: boolean
    experimentalFeatures: boolean
  }
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  metadata?: {
    timestamp: string
    version: string
    requestId: string
    executionTime: number
  }
}

/**
 * Pagination interface
 */
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination
}

/**
 * Filter interface for data queries
 */
export interface DataFilter {
  field: string
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'BETWEEN' | 'IN'
  value: any
  values?: any[] // For IN and BETWEEN operators
}

/**
 * Sort interface for data queries
 */
export interface DataSort {
  field: string
  direction: 'ASC' | 'DESC'
}

/**
 * Query interface for data requests
 */
export interface DataQuery {
  filters?: DataFilter[]
  sort?: DataSort[]
  pagination?: {
    page: number
    limit: number
  }
  fields?: string[] // Field selection
  include?: string[] // Related entities to include
}

/**
 * Real-time data update
 */
export interface RealTimeUpdate<T> {
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  entity: string // Entity type
  id: string
  data: T
  timestamp: Date | string
  source: string
}

/**
 * WebSocket message for real-time updates
 */
export interface WebSocketMessage {
  type: 'SUBSCRIPTION' | 'UPDATE' | 'ERROR' | 'HEARTBEAT'
  channel?: string
  data?: any
  error?: string
  timestamp: string
}

/**
 * Export all interfaces as a collection
 */
export interface RedundancyDataModels {
  Substation: SubstationModel
  Line: LineModel
  RedundancyPair: RedundancyPairModel
  SystemHealth: SystemHealthModel
  SystemEvent: SystemEventModel
  Alert: AlertModel
  PowerFlowAnimation: PowerFlowAnimationModel
  RedundancyConfig: RedundancyConfigModel
  DataSourceConfig: DataSourceConfig
  UserPreferences: UserPreferences
}