/**
 * Test Data Schemas
 * Type definitions and schemas for test data fixtures
 */

/**
 * Coordinate system types
 */
export interface Coordinates {
  x: number
  y: number
}

export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Status enums
 */
export enum SubstationStatus {
  ACTIVE = 'ACTIVE',
  STANDBY = 'STANDBY',
  MAINTENANCE = 'MAINTENANCE',
  FAULT = 'FAULT',
  OFFLINE = 'OFFLINE'
}

export enum LineStatus {
  ACTIVE = 'ACTIVE',
  STANDBY = 'STANDBY',
  OVERLOAD = 'OVERLOAD',
  FAULT = 'FAULT',
  MAINTENANCE = 'MAINTENANCE',
  OFFLINE = 'OFFLINE'
}

export enum RedundancyLevel {
  N = 'N',
  N_PLUS_1 = 'N+1',
  TWO_N = '2N',
  TWO_N_PLUS_1 = '2N+1'
}

export enum SystemHealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  CRITICAL = 'CRITICAL',
  FAILED = 'FAILED'
}

/**
 * Substation data schema
 */
export interface SubstationData {
  // Identification
  id: string
  name: string
  code?: string
  type?: 'PRIMARY' | 'BACKUP' | 'AUXILIARY'
  
  // Status and state
  status: SubstationStatus
  redundancyGroup: string
  redundancyLevel: RedundancyLevel
  isPrimary?: boolean
  
  // Location
  position: Coordinates
  zone?: string
  building?: string
  floor?: number
  
  // Electrical properties
  powerRating: number // MW
  currentLoad: number // MW
  voltage: number // kV
  frequency?: number // Hz
  powerFactor?: number
  efficiency?: number
  
  // Connections
  connections: string[] // Line IDs
  redundancyPairs?: string[] // Other substation IDs
  primarySubstation?: string
  backupSubstations?: string[]
  
  // Operational data
  temperature?: number // Celsius
  humidity?: number // Percentage
  lastMaintenance?: string // ISO date
  nextMaintenance?: string // ISO date
  operationalHours?: number
  
  // Metrics
  reliability?: number // 0-1
  availability?: number // 0-1
  mtbf?: number // Mean time between failures (hours)
  mttr?: number // Mean time to repair (hours)
  
  // Error handling
  faultDetails?: {
    faultType: string
    faultTime: string
    estimatedRepairTime?: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    errorCode?: string
    errorMessage?: string
  }
  
  // Metadata
  createdAt?: string
  updatedAt?: string
  tags?: string[]
  metadata?: Record<string, any>
}

/**
 * Transmission line data schema
 */
export interface LineData {
  // Identification
  id: string
  name: string
  code?: string
  type?: 'TRANSMISSION' | 'DISTRIBUTION' | 'INTERCONNECTION'
  
  // Status and state
  status: LineStatus
  redundancyType: RedundancyLevel
  isActive?: boolean
  
  // Route
  path: Coordinates[]
  length?: number // km
  routeType?: 'OVERHEAD' | 'UNDERGROUND' | 'SUBMARINE'
  
  // Electrical properties
  voltage: number // kV
  capacity: number // MW
  powerFlow: number // MW
  current?: number // Amperes
  resistance?: number // Ohms/km
  reactance?: number // Ohms/km
  impedance?: {
    resistance: number
    reactance: number
  }
  
  // Physical properties
  conductorType?: string // ACSR, ACCC, etc.
  conductorCount?: number
  bundleConfiguration?: string
  thermalRating?: number // MW
  sagLimit?: number // meters
  
  // Environmental conditions
  weatherConditions?: {
    temperature: number
    windSpeed: number
    humidity: number
    iceLoading?: number
    rainIntensity?: number
  }
  
  // Connections
  fromSubstation?: string
  toSubstation?: string
  connectedSubstations?: string[]
  parallelLines?: string[]
  
  // Protection
  protectionZones?: string[]
  relaySettings?: Record<string, any>
  
  // Load and capacity
  loadFactor?: number // 0-1
  utilizationRate?: number // 0-1
  peakLoad?: number // MW
  averageLoad?: number // MW
  
  // Operational data
  energyTransferred?: number // MWh
  losses?: number // MW
  efficiency?: number // 0-1
  
  // Overload handling
  overloadDetails?: {
    overloadPercentage: number
    timeInOverload: number // seconds
    maxAllowableTime: number // seconds
    temperatureRise?: number
  }
  
  // Fault handling
  faultDetails?: {
    faultType: 'GROUND_FAULT' | 'PHASE_FAULT' | 'SHORT_CIRCUIT' | 'OPEN_CIRCUIT'
    faultLocation?: Coordinates
    faultDistance?: number // km from start
    faultTime: string
    estimatedRepairTime?: string
    affectedPhases?: string[]
  }
  
  // Metadata
  installationDate?: string
  lastInspection?: string
  nextInspection?: string
  tags?: string[]
  metadata?: Record<string, any>
}

/**
 * Redundancy pair schema
 */
export interface RedundancyPairData {
  // Identification
  id: string
  name?: string
  type?: 'AUTOMATIC' | 'MANUAL' | 'SEMI_AUTOMATIC'
  
  // Configuration
  primary: string // Substation ID
  backup: string // Substation ID
  alternateBackups?: string[] // Additional backup options
  redundancyLevel: RedundancyLevel
  
  // Status
  status: 'READY' | 'ACTIVE' | 'DEGRADED' | 'FAILED' | 'MAINTENANCE'
  isActive?: boolean
  
  // Performance
  switchoverTime: number // milliseconds
  targetSwitchoverTime?: number // milliseconds
  actualSwitchoverTimes?: number[] // Historical data
  
  // History
  lastSwitchover?: string // ISO date
  switchoverCount: number
  failureCount?: number
  successRate?: number // 0-1
  
  // Health and reliability
  healthScore: number // 0-1
  reliabilityScore?: number // 0-1
  readinessScore?: number // 0-1
  
  // Conditions and constraints
  switchoverConditions?: {
    voltageThreshold?: number
    loadThreshold?: number
    temperatureThreshold?: number
    customConditions?: Record<string, any>
  }
  
  // Issues
  degradationReason?: string
  failureReason?: string
  maintenanceNotes?: string
  
  // Testing
  lastTest?: string
  nextTest?: string
  testResults?: {
    date: string
    result: 'PASS' | 'FAIL'
    switchoverTime: number
    notes?: string
  }[]
  
  // Metadata
  priority?: 'HIGH' | 'MEDIUM' | 'LOW'
  tags?: string[]
  metadata?: Record<string, any>
}

/**
 * System health data schema
 */
export interface SystemHealthData {
  // Overall status
  overall: SystemHealthStatus
  timestamp: string
  
  // Redundancy metrics
  redundancyLevel: number // 0-1
  redundancyCoverage?: number // Percentage
  redundancyEffectiveness?: number // 0-1
  
  // Alerts and issues
  criticalAlerts: number
  warningAlerts: number
  infoAlerts: number
  totalAlerts?: number
  alerts?: {
    id: string
    type: 'CRITICAL' | 'WARNING' | 'INFO'
    category: string
    message: string
    timestamp: string
    source?: string
    acknowledged?: boolean
  }[]
  
  // Subsystem health
  subsystemHealth: {
    power: number // 0-1
    communication: number // 0-1
    control: number // 0-1
    protection: number // 0-1
    monitoring?: number // 0-1
    cooling?: number // 0-1
  }
  
  // System metrics
  metrics: {
    uptime: number // 0-1
    availability: number // 0-1
    reliability?: number // 0-1
    efficiency: number // 0-1
    loadFactor: number // 0-1
    capacityUtilization?: number // 0-1
  }
  
  // Performance indicators
  performance?: {
    responseTime: number // ms
    processingLoad: number // 0-1
    memoryUsage: number // 0-1
    networkLatency?: number // ms
    dataQuality?: number // 0-1
  }
  
  // Capacity and load
  capacity?: {
    total: number // MW
    used: number // MW
    available: number // MW
    reserved?: number // MW
    margin?: number // Percentage
  }
  
  // Recent events
  recentEvents?: {
    timestamp: string
    type: string
    description: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH'
    impact?: string
  }[]
  
  // Predictions
  predictions?: {
    nextMaintenanceWindow?: string
    peakLoadTime?: string
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH'
    recommendations?: string[]
  }
  
  // Update information
  lastUpdate: string
  nextUpdate?: string
  updateFrequency?: number // seconds
  dataSource?: string
}

/**
 * Animation configuration schema
 */
export interface AnimationConfig {
  // Timing
  duration: number // milliseconds
  delay?: number // milliseconds
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | string
  
  // Control
  loop?: boolean
  autoplay?: boolean
  direction?: 'normal' | 'reverse' | 'alternate'
  
  // Performance
  useGPU?: boolean
  frameRate?: number
  quality?: 'low' | 'medium' | 'high'
}

/**
 * Power flow animation schema
 */
export interface PowerFlowAnimationData extends AnimationConfig {
  // Flow properties
  flowRate: number // 0-1
  flowDirection?: 'forward' | 'reverse' | 'bidirectional'
  
  // Particles
  particles: {
    id: string
    position: Coordinates
    velocity: { x: number; y: number }
    size: number
    opacity?: number
    color?: string
  }[]
  
  // Path
  path: Coordinates[]
  pathSmoothing?: boolean
  
  // Visual properties
  particleCount?: number
  particleSize?: number
  particleColor?: string
  trailLength?: number
  glowEffect?: boolean
}

/**
 * Test scenario schema
 */
export interface TestScenarioData {
  // Identification
  id: string
  name: string
  description: string
  category?: 'NORMAL' | 'FAILURE' | 'MAINTENANCE' | 'EMERGENCY' | 'PERFORMANCE'
  
  // Test data
  substations: SubstationData[]
  lines: LineData[]
  redundancyPairs: RedundancyPairData[]
  systemHealth: SystemHealthData
  
  // Initial conditions
  initialState?: {
    activeSubstations?: string[]
    activeLines?: string[]
    faultedComponents?: string[]
    maintenanceComponents?: string[]
  }
  
  // Expected outcomes
  expectedOutcomes?: {
    finalState?: Record<string, any>
    alerts?: number
    switchovers?: number
    successCriteria?: string[]
  }
  
  // Test configuration
  testConfig?: {
    duration?: number // seconds
    checkpoints?: number[]
    validationRules?: Record<string, any>
    performanceThresholds?: Record<string, number>
  }
  
  // Metadata
  tags?: string[]
  priority?: 'HIGH' | 'MEDIUM' | 'LOW'
  automated?: boolean
  lastRun?: string
  metadata?: Record<string, any>
}

/**
 * Complete test dataset schema
 */
export interface TestDatasetSchema {
  // Metadata
  version: string
  name: string
  description?: string
  createdAt: string
  updatedAt?: string
  
  // Core data
  substations: SubstationData[]
  lines: LineData[]
  redundancyPairs: RedundancyPairData[]
  
  // System state
  systemHealth: SystemHealthData
  
  // Scenarios
  scenarios?: TestScenarioData[]
  
  // Animations
  animations?: {
    powerFlow?: PowerFlowAnimationData[]
    substationPulse?: AnimationConfig[]
    lineHighlight?: AnimationConfig[]
  }
  
  // Configuration
  config?: {
    defaultRedundancyLevel?: RedundancyLevel
    defaultSwitchoverTime?: number
    alertThresholds?: Record<string, number>
    performanceTargets?: Record<string, number>
  }
  
  // Validation rules
  validation?: {
    rules?: Record<string, any>
    constraints?: Record<string, any>
    relationships?: Record<string, any>
  }
}

export default {
  SubstationStatus,
  LineStatus,
  RedundancyLevel,
  SystemHealthStatus
}