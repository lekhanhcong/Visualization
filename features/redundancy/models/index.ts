/**
 * Data Models Index
 * Central export point for all data models and related utilities
 */

// Export all interfaces and types
export * from './interfaces'

// Export validators
export * from './validators'

// Re-export commonly used types for convenience
export type {
  SubstationModel,
  LineModel,
  RedundancyPairModel,
  SystemHealthModel,
  SystemEventModel,
  AlertModel,
  PowerFlowAnimationModel,
  RedundancyConfigModel,
  DataSourceConfig,
  UserPreferences,
  ApiResponse,
  PaginatedResponse,
  DataQuery,
  RealTimeUpdate,
  WebSocketMessage,
  RedundancyDataModels,
  Coordinates,
  Bounds,
  TimeRange,
  BaseEntity
} from './interfaces'

export {
  EntityStatus,
  Priority
} from './interfaces'

export {
  validators,
  validateMultiple,
  createValidationReport,
  SubstationValidator,
  LineValidator,
  RedundancyPairValidator,
  SystemHealthValidator,
  AlertValidator,
  PowerFlowAnimationValidator,
  RedundancyConfigValidator
} from './validators'

export type {
  ValidationResult,
  ValidationError,
  ValidationWarning
} from './validators'

/**
 * Model factory functions
 */
export const modelFactory = {
  /**
   * Create a new substation model with default values
   */
  createSubstation: (overrides: Partial<import('./interfaces').SubstationModel> = {}): Partial<import('./interfaces').SubstationModel> => ({
    id: '',
    name: '',
    type: 'PRIMARY',
    status: 'ACTIVE' as import('./interfaces').EntityStatus,
    zone: '',
    position: { x: 0, y: 0 },
    powerRating: 0,
    currentLoad: 0,
    voltage: 0,
    frequency: 60,
    powerFactor: 0.95,
    efficiency: 0.95,
    redundancyGroup: '',
    redundancyLevel: 'N+1',
    temperature: 25,
    operationalHours: 0,
    reliability: 0.99,
    availability: 0.99,
    connections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),

  /**
   * Create a new line model with default values
   */
  createLine: (overrides: Partial<import('./interfaces').LineModel> = {}): Partial<import('./interfaces').LineModel> => ({
    id: '',
    name: '',
    status: 'ACTIVE' as import('./interfaces').EntityStatus,
    type: 'TRANSMISSION',
    path: [],
    length: 0,
    voltage: 0,
    capacity: 0,
    powerFlow: 0,
    current: 0,
    impedance: { resistance: 0, reactance: 0 },
    temperature: 25,
    loadFactor: 0,
    efficiency: 0.95,
    fromSubstation: '',
    toSubstation: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),

  /**
   * Create a new redundancy pair model with default values
   */
  createRedundancyPair: (overrides: Partial<import('./interfaces').RedundancyPairModel> = {}): Partial<import('./interfaces').RedundancyPairModel> => ({
    id: '',
    name: '',
    primarySubstation: '',
    backupSubstation: '',
    redundancyType: 'N+1',
    status: 'NORMAL',
    activeStation: '',
    automaticSwitching: true,
    switchingTime: 5,
    reliability: 0.99,
    availability: 0.99,
    switchingSuccess: 0.98,
    primaryLines: [],
    backupLines: [],
    switchingConditions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),

  /**
   * Create a new system health model with default values
   */
  createSystemHealth: (overrides: Partial<import('./interfaces').SystemHealthModel> = {}): Partial<import('./interfaces').SystemHealthModel> => ({
    overall: 'HEALTHY',
    timestamp: new Date().toISOString(),
    redundancyLevel: 1.0,
    redundancyStatus: 'FULL',
    criticalAlerts: 0,
    warningAlerts: 0,
    infoAlerts: 0,
    subsystemHealth: {
      power: 1.0,
      communication: 1.0,
      control: 1.0,
      protection: 1.0,
      cooling: 1.0,
      monitoring: 1.0
    },
    totalCapacity: 0,
    currentLoad: 0,
    peakLoad: 0,
    averageLoad: 0,
    systemAvailability: 0.99,
    mtbf: 8760, // 1 year in hours
    mttr: 4, // 4 hours
    recentEvents: [],
    ...overrides
  }),

  /**
   * Create a new alert model with default values
   */
  createAlert: (overrides: Partial<import('./interfaces').AlertModel> = {}): Partial<import('./interfaces').AlertModel> => ({
    id: '',
    name: '',
    type: 'INFO',
    severity: 'LOW' as import('./interfaces').Priority,
    status: 'ACTIVE',
    title: '',
    message: '',
    source: '',
    category: '',
    condition: '',
    triggeredAt: new Date().toISOString(),
    escalationLevel: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),

  /**
   * Create a new power flow animation model with default values
   */
  createPowerFlowAnimation: (overrides: Partial<import('./interfaces').PowerFlowAnimationModel> = {}): Partial<import('./interfaces').PowerFlowAnimationModel> => ({
    id: '',
    lineId: '',
    direction: 'FORWARD',
    intensity: 0.5,
    speed: 1.0,
    color: '#00ff00',
    strokeWidth: 2,
    enabled: true,
    duration: 2000,
    delay: 0,
    currentPosition: 0,
    isPlaying: false,
    ...overrides
  }),

  /**
   * Create a new redundancy config model with default values
   */
  createRedundancyConfig: (overrides: Partial<import('./interfaces').RedundancyConfigModel> = {}): Partial<import('./interfaces').RedundancyConfigModel> => ({
    id: '',
    name: 'Default Configuration',
    redundancyStrategy: 'N+1',
    automaticSwitching: true,
    switchingDelay: 5,
    thresholds: {
      powerOverload: 90,
      voltageDeviation: 5,
      frequencyDeviation: 0.5,
      temperatureLimit: 80
    },
    monitoringIntervals: {
      realtime: 1000,
      status: 5000,
      health: 10000,
      alerts: 2000
    },
    alertConfig: {
      enabled: true,
      emailNotifications: false,
      smsNotifications: false,
      dashboardAlerts: true,
      escalationTimeout: 30
    },
    performanceConfig: {
      maxConcurrentAnimations: 50,
      animationFrameRate: 60,
      dataUpdateInterval: 1000,
      cacheTimeout: 300
    },
    features: {
      realTimeMonitoring: true,
      predictiveAnalytics: false,
      automaticFailover: true,
      loadBalancing: true,
      maintenanceMode: false
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  })
}

/**
 * Utility functions for working with models
 */
export const modelUtils = {
  /**
   * Check if a substation is in a fault state
   */
  isSubstationFaulted: (substation: import('./interfaces').SubstationModel): boolean => {
    return substation.status === 'FAULT' || substation.status === 'OFFLINE'
  },

  /**
   * Check if a line is overloaded
   */
  isLineOverloaded: (line: import('./interfaces').LineModel, threshold = 0.9): boolean => {
    return line.loadFactor > threshold
  },

  /**
   * Calculate total capacity of substations
   */
  calculateTotalCapacity: (substations: import('./interfaces').SubstationModel[]): number => {
    return substations.reduce((total, substation) => {
      return total + (substation.status === 'ACTIVE' ? substation.powerRating : 0)
    }, 0)
  },

  /**
   * Calculate total current load
   */
  calculateTotalLoad: (substations: import('./interfaces').SubstationModel[]): number => {
    return substations.reduce((total, substation) => {
      return total + substation.currentLoad
    }, 0)
  },

  /**
   * Get substations by redundancy group
   */
  getSubstationsByGroup: (substations: import('./interfaces').SubstationModel[], group: string): import('./interfaces').SubstationModel[] => {
    return substations.filter(substation => substation.redundancyGroup === group)
  },

  /**
   * Get active alerts by severity
   */
  getAlertsBySeverity: (alerts: import('./interfaces').AlertModel[], severity: import('./interfaces').Priority): import('./interfaces').AlertModel[] => {
    return alerts.filter(alert => alert.severity === severity && alert.status === 'ACTIVE')
  },

  /**
   * Check if redundancy pair is healthy
   */
  isRedundancyPairHealthy: (pair: import('./interfaces').RedundancyPairModel): boolean => {
    return pair.status === 'NORMAL'
  },

  /**
   * Calculate system health score
   */
  calculateHealthScore: (health: import('./interfaces').SystemHealthModel): number => {
    const subsystemScores = Object.values(health.subsystemHealth)
    const avgSubsystemHealth = subsystemScores.reduce((sum, score) => sum + score, 0) / subsystemScores.length
    
    // Weight factors
    const weights = {
      redundancy: 0.3,
      subsystems: 0.4,
      availability: 0.2,
      alerts: 0.1
    }
    
    // Alert impact (fewer alerts = better score)
    const totalAlerts = health.criticalAlerts + health.warningAlerts + health.infoAlerts
    const alertScore = Math.max(0, 1 - (totalAlerts * 0.05))
    
    return (
      health.redundancyLevel * weights.redundancy +
      avgSubsystemHealth * weights.subsystems +
      health.systemAvailability * weights.availability +
      alertScore * weights.alerts
    )
  },

  /**
   * Format power value with appropriate units
   */
  formatPower: (power: number): string => {
    if (power >= 1000) {
      return `${(power / 1000).toFixed(1)} GW`
    } else {
      return `${power.toFixed(1)} MW`
    }
  },

  /**
   * Format voltage value with appropriate units
   */
  formatVoltage: (voltage: number): string => {
    if (voltage >= 1000) {
      return `${(voltage / 1000).toFixed(1)} MV`
    } else {
      return `${voltage.toFixed(1)} kV`
    }
  },

  /**
   * Format percentage value
   */
  formatPercentage: (value: number): string => {
    return `${(value * 100).toFixed(1)}%`
  },

  /**
   * Get status color for UI display
   */
  getStatusColor: (status: import('./interfaces').EntityStatus): string => {
    const colors = {
      'ACTIVE': '#22c55e', // green
      'STANDBY': '#3b82f6', // blue
      'MAINTENANCE': '#f59e0b', // amber
      'FAULT': '#ef4444', // red
      'OFFLINE': '#6b7280', // gray
      'INACTIVE': '#9ca3af', // light gray
      'EMERGENCY': '#dc2626' // dark red
    }
    return colors[status] || '#6b7280'
  },

  /**
   * Get priority color for UI display
   */
  getPriorityColor: (priority: import('./interfaces').Priority): string => {
    const colors = {
      'LOW': '#22c55e', // green
      'MEDIUM': '#f59e0b', // amber
      'HIGH': '#f97316', // orange
      'CRITICAL': '#ef4444' // red
    }
    return colors[priority] || '#6b7280'
  }
}

/**
 * Type guards for runtime type checking
 */
export const typeGuards = {
  isSubstation: (obj: any): obj is import('./interfaces').SubstationModel => {
    return obj && typeof obj.id === 'string' && typeof obj.powerRating === 'number'
  },

  isLine: (obj: any): obj is import('./interfaces').LineModel => {
    return obj && typeof obj.id === 'string' && typeof obj.capacity === 'number'
  },

  isRedundancyPair: (obj: any): obj is import('./interfaces').RedundancyPairModel => {
    return obj && typeof obj.id === 'string' && typeof obj.primarySubstation === 'string'
  },

  isSystemHealth: (obj: any): obj is import('./interfaces').SystemHealthModel => {
    return obj && typeof obj.overall === 'string' && typeof obj.redundancyLevel === 'number'
  },

  isAlert: (obj: any): obj is import('./interfaces').AlertModel => {
    return obj && typeof obj.id === 'string' && typeof obj.severity === 'string'
  }
}

/**
 * Default configurations
 */
export const defaults = {
  substationDefaults: modelFactory.createSubstation(),
  lineDefaults: modelFactory.createLine(),
  redundancyPairDefaults: modelFactory.createRedundancyPair(),
  systemHealthDefaults: modelFactory.createSystemHealth(),
  alertDefaults: modelFactory.createAlert(),
  powerFlowAnimationDefaults: modelFactory.createPowerFlowAnimation(),
  redundancyConfigDefaults: modelFactory.createRedundancyConfig()
}