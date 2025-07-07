/**
 * Data Simulator
 * Simulates real-time power grid data for development and testing
 */

import { 
  SubstationModel, 
  LineModel, 
  SystemHealthModel,
  EntityStatus,
  Priority 
} from '../models/interfaces'
import { RedundancyWebSocketServer } from './websocket-server'

/**
 * Simulation configuration
 */
export interface SimulationConfig {
  interval?: number
  substationUpdateRate?: number
  lineUpdateRate?: number
  healthUpdateRate?: number
  enableRandomEvents?: boolean
  eventProbability?: number
  volatility?: number
}

/**
 * Simulation patterns
 */
export enum SimulationPattern {
  NORMAL = 'NORMAL',
  PEAK_LOAD = 'PEAK_LOAD',
  MAINTENANCE = 'MAINTENANCE',
  EMERGENCY = 'EMERGENCY',
  LOAD_SHEDDING = 'LOAD_SHEDDING'
}

/**
 * Real-time data simulator
 */
export class PowerGridDataSimulator {
  private wsServer: RedundancyWebSocketServer
  private config: Required<SimulationConfig>
  private simulationInterval: NodeJS.Timeout | null = null
  private currentPattern: SimulationPattern = SimulationPattern.NORMAL
  private isRunning = false

  // Simulation state
  private substations: Map<string, SubstationModel> = new Map()
  private lines: Map<string, LineModel> = new Map()
  private systemHealth: SystemHealthModel | null = null
  private simulationTime = 0

  constructor(wsServer: RedundancyWebSocketServer, config: SimulationConfig = {}) {
    this.wsServer = wsServer
    this.config = {
      interval: config.interval || 2000, // 2 seconds
      substationUpdateRate: config.substationUpdateRate || 0.3, // 30% chance per interval
      lineUpdateRate: config.lineUpdateRate || 0.4, // 40% chance per interval
      healthUpdateRate: config.healthUpdateRate || 0.5, // 50% chance per interval
      enableRandomEvents: config.enableRandomEvents ?? true,
      eventProbability: config.eventProbability || 0.05, // 5% chance per interval
      volatility: config.volatility || 0.1 // 10% max change per update
    }

    this.initializeData()
  }

  /**
   * Initialize sample data
   */
  private initializeData(): void {
    // Initialize substations
    this.substations.set('sub-001', {
      id: 'sub-001',
      name: 'North Primary Station',
      description: 'Primary substation for North sector',
      type: 'PRIMARY',
      status: EntityStatus.ACTIVE,
      zone: 'NORTH',
      position: { x: 200, y: 150 },
      powerRating: 500,
      currentLoad: 380,
      voltage: 230,
      frequency: 60,
      powerFactor: 0.95,
      efficiency: 0.97,
      redundancyGroup: 'north-group',
      redundancyLevel: '2N+1',
      temperature: 65,
      operationalHours: 15420,
      reliability: 0.995,
      availability: 0.998,
      connections: ['line-001', 'line-002'],
      backupSubstations: ['sub-002'],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: new Date().toISOString()
    })

    this.substations.set('sub-002', {
      id: 'sub-002',
      name: 'North Backup Station',
      description: 'Backup substation for North sector',
      type: 'BACKUP',
      status: EntityStatus.STANDBY,
      zone: 'NORTH',
      position: { x: 400, y: 150 },
      powerRating: 500,
      currentLoad: 0,
      voltage: 230,
      frequency: 60,
      powerFactor: 0.95,
      efficiency: 0.96,
      redundancyGroup: 'north-group',
      redundancyLevel: '2N+1',
      temperature: 45,
      operationalHours: 8200,
      reliability: 0.993,
      availability: 0.995,
      connections: ['line-003'],
      primarySubstation: 'sub-001',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: new Date().toISOString()
    })

    // Initialize lines
    this.lines.set('line-001', {
      id: 'line-001',
      name: 'North-East Transmission Line',
      description: 'Primary transmission line',
      type: 'TRANSMISSION',
      status: EntityStatus.ACTIVE,
      path: [
        { x: 200, y: 150 },
        { x: 600, y: 300 }
      ],
      length: 45.5,
      voltage: 230,
      capacity: 500,
      powerFlow: 380,
      current: 1652,
      impedance: { resistance: 0.05, reactance: 0.35 },
      temperature: 65,
      loadFactor: 0.76,
      efficiency: 0.97,
      fromSubstation: 'sub-001',
      toSubstation: 'sub-003',
      redundancyGroup: 'north-group',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: new Date().toISOString()
    })

    // Initialize system health
    this.systemHealth = {
      overall: 'HEALTHY',
      timestamp: new Date().toISOString(),
      redundancyLevel: 0.95,
      redundancyStatus: 'FULL',
      criticalAlerts: 0,
      warningAlerts: 1,
      infoAlerts: 3,
      subsystemHealth: {
        power: 0.97,
        communication: 0.99,
        control: 0.98,
        protection: 0.96,
        cooling: 0.94,
        monitoring: 0.99
      },
      totalCapacity: 1000,
      currentLoad: 380,
      peakLoad: 420,
      averageLoad: 350,
      systemAvailability: 0.998,
      mtbf: 8760,
      mttr: 4,
      recentEvents: []
    }
  }

  /**
   * Start simulation
   */
  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.simulationInterval = setInterval(() => {
      this.simulateDataUpdates()
    }, this.config.interval)

    console.log('🎲 Power grid data simulation started')
  }

  /**
   * Stop simulation
   */
  stop(): void {
    if (!this.isRunning) return

    this.isRunning = false
    
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
      this.simulationInterval = null
    }

    console.log('🛑 Power grid data simulation stopped')
  }

  /**
   * Set simulation pattern
   */
  setPattern(pattern: SimulationPattern): void {
    this.currentPattern = pattern
    console.log(`🎯 Simulation pattern changed to: ${pattern}`)
  }

  /**
   * Main simulation loop
   */
  private simulateDataUpdates(): void {
    this.simulationTime += this.config.interval

    // Simulate substation updates
    if (Math.random() < this.config.substationUpdateRate) {
      this.simulateSubstationUpdates()
    }

    // Simulate line updates
    if (Math.random() < this.config.lineUpdateRate) {
      this.simulateLineUpdates()
    }

    // Simulate system health updates
    if (Math.random() < this.config.healthUpdateRate) {
      this.simulateSystemHealthUpdate()
    }

    // Simulate random events
    if (this.config.enableRandomEvents && Math.random() < this.config.eventProbability) {
      this.simulateRandomEvent()
    }
  }

  /**
   * Simulate substation data updates
   */
  private simulateSubstationUpdates(): void {
    for (const [id, substation] of this.substations) {
      const updated = { ...substation }
      let hasChanges = false

      // Simulate load changes based on pattern
      const loadMultiplier = this.getLoadMultiplier()
      const targetLoad = substation.powerRating * loadMultiplier
      const loadChange = (targetLoad - substation.currentLoad) * 0.1 // Gradual change
      
      if (Math.abs(loadChange) > 1) {
        updated.currentLoad = Math.max(0, Math.min(substation.powerRating, substation.currentLoad + loadChange))
        hasChanges = true
      }

      // Simulate temperature changes
      const baseTemp = substation.status === EntityStatus.ACTIVE ? 45 + (updated.currentLoad / substation.powerRating) * 30 : 25
      const tempNoise = (Math.random() - 0.5) * 10
      updated.temperature = Math.max(20, Math.min(90, baseTemp + tempNoise))
      hasChanges = true

      // Simulate efficiency variations
      const efficiencyBase = substation.status === EntityStatus.ACTIVE ? 0.95 : 0.90
      const efficiencyNoise = (Math.random() - 0.5) * 0.05
      updated.efficiency = Math.max(0.85, Math.min(0.99, efficiencyBase + efficiencyNoise))
      hasChanges = true

      // Update operational hours
      if (substation.status === EntityStatus.ACTIVE) {
        updated.operationalHours += this.config.interval / 3600000 // Convert to hours
        hasChanges = true
      }

      if (hasChanges) {
        updated.updatedAt = new Date().toISOString()
        this.substations.set(id, updated)
        this.wsServer.broadcastSubstationUpdate('UPDATE', updated)
      }
    }
  }

  /**
   * Simulate line data updates
   */
  private simulateLineUpdates(): void {
    for (const [id, line] of this.lines) {
      const updated = { ...line }
      let hasChanges = false

      // Get connected substation load
      const fromSubstation = this.substations.get(line.fromSubstation)
      if (fromSubstation && line.status === EntityStatus.ACTIVE) {
        // Power flow follows load changes
        const targetFlow = fromSubstation.currentLoad * 0.9 // Some power stays local
        const flowChange = (targetFlow - line.powerFlow) * 0.15 // Gradual change
        
        if (Math.abs(flowChange) > 1) {
          updated.powerFlow = Math.max(0, Math.min(line.capacity, line.powerFlow + flowChange))
          
          // Update current and load factor
          updated.current = updated.powerFlow > 0 ? (updated.powerFlow * 1000) / (line.voltage * Math.sqrt(3)) : 0
          updated.loadFactor = line.capacity > 0 ? updated.powerFlow / line.capacity : 0
          hasChanges = true
        }
      }

      // Simulate temperature changes
      const baseTemp = line.status === EntityStatus.ACTIVE ? 25 + (updated.loadFactor * 40) : 20
      const tempNoise = (Math.random() - 0.5) * 8
      updated.temperature = Math.max(15, Math.min(85, baseTemp + tempNoise))
      hasChanges = true

      // Simulate efficiency variations
      const efficiencyBase = 0.95 - (updated.loadFactor * 0.05) // Efficiency decreases with load
      const efficiencyNoise = (Math.random() - 0.5) * 0.02
      updated.efficiency = Math.max(0.85, Math.min(0.98, efficiencyBase + efficiencyNoise))
      hasChanges = true

      if (hasChanges) {
        updated.updatedAt = new Date().toISOString()
        this.lines.set(id, updated)
        this.wsServer.broadcastLineUpdate('UPDATE', updated)
      }
    }
  }

  /**
   * Simulate system health updates
   */
  private simulateSystemHealthUpdate(): void {
    if (!this.systemHealth) return

    const updated = { ...this.systemHealth }

    // Calculate total load from all active substations
    let totalLoad = 0
    let totalCapacity = 0
    let averageTemp = 0
    let tempCount = 0

    for (const substation of this.substations.values()) {
      if (substation.status === EntityStatus.ACTIVE) {
        totalLoad += substation.currentLoad
        totalCapacity += substation.powerRating
        averageTemp += substation.temperature
        tempCount++
      }
    }

    updated.currentLoad = totalLoad
    updated.totalCapacity = totalCapacity

    // Update redundancy level based on active vs standby systems
    const activeCount = Array.from(this.substations.values()).filter(s => s.status === EntityStatus.ACTIVE).length
    const totalCount = this.substations.size
    updated.redundancyLevel = activeCount / totalCount

    // Update subsystem health with some variation
    Object.keys(updated.subsystemHealth).forEach(subsystem => {
      const current = updated.subsystemHealth[subsystem as keyof typeof updated.subsystemHealth]
      const noise = (Math.random() - 0.5) * 0.02
      updated.subsystemHealth[subsystem as keyof typeof updated.subsystemHealth] = 
        Math.max(0.8, Math.min(1.0, current + noise))
    })

    // Determine overall health based on subsystem health and redundancy
    const avgSubsystemHealth = Object.values(updated.subsystemHealth).reduce((sum, val) => sum + val, 0) / 
                               Object.values(updated.subsystemHealth).length

    if (avgSubsystemHealth > 0.95 && updated.redundancyLevel > 0.9) {
      updated.overall = 'HEALTHY'
    } else if (avgSubsystemHealth > 0.85 && updated.redundancyLevel > 0.7) {
      updated.overall = 'DEGRADED'
    } else if (avgSubsystemHealth > 0.7 && updated.redundancyLevel > 0.5) {
      updated.overall = 'CRITICAL'
    } else {
      updated.overall = 'FAILED'
    }

    // Update alert counts based on pattern
    switch (this.currentPattern) {
      case SimulationPattern.NORMAL:
        updated.criticalAlerts = Math.max(0, updated.criticalAlerts + (Math.random() > 0.95 ? 1 : 0) - (Math.random() > 0.8 ? 1 : 0))
        updated.warningAlerts = Math.max(0, updated.warningAlerts + (Math.random() > 0.9 ? 1 : 0) - (Math.random() > 0.7 ? 1 : 0))
        break
      case SimulationPattern.EMERGENCY:
        updated.criticalAlerts = Math.max(0, updated.criticalAlerts + (Math.random() > 0.7 ? 1 : 0))
        updated.warningAlerts = Math.max(0, updated.warningAlerts + (Math.random() > 0.8 ? 1 : 0))
        break
      case SimulationPattern.MAINTENANCE:
        updated.warningAlerts = Math.max(0, updated.warningAlerts + (Math.random() > 0.85 ? 1 : 0))
        break
    }

    updated.timestamp = new Date().toISOString()
    this.systemHealth = updated
    this.wsServer.broadcastSystemHealthUpdate(updated)
  }

  /**
   * Simulate random events
   */
  private simulateRandomEvent(): void {
    const eventTypes = ['fault', 'maintenance', 'overload', 'recovery']
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]

    switch (eventType) {
      case 'fault':
        this.simulateFault()
        break
      case 'maintenance':
        this.simulateMaintenance()
        break
      case 'overload':
        this.simulateOverload()
        break
      case 'recovery':
        this.simulateRecovery()
        break
    }
  }

  /**
   * Simulate equipment fault
   */
  private simulateFault(): void {
    const activeSubstations = Array.from(this.substations.values())
      .filter(s => s.status === EntityStatus.ACTIVE)
    
    if (activeSubstations.length > 0) {
      const substation = activeSubstations[Math.floor(Math.random() * activeSubstations.length)]
      const updated = { ...substation, status: EntityStatus.FAULT, updatedAt: new Date().toISOString() }
      
      this.substations.set(substation.id, updated)
      this.wsServer.broadcastSubstationUpdate('UPDATE', updated)
      
      console.log(`⚡ Simulated fault at substation: ${substation.name}`)
    }
  }

  /**
   * Simulate maintenance mode
   */
  private simulateMaintenance(): void {
    const activeSubstations = Array.from(this.substations.values())
      .filter(s => s.status === EntityStatus.ACTIVE)
    
    if (activeSubstations.length > 1) { // Keep at least one active
      const substation = activeSubstations[Math.floor(Math.random() * activeSubstations.length)]
      const updated = { ...substation, status: EntityStatus.MAINTENANCE, currentLoad: 0, updatedAt: new Date().toISOString() }
      
      this.substations.set(substation.id, updated)
      this.wsServer.broadcastSubstationUpdate('UPDATE', updated)
      
      console.log(`🔧 Simulated maintenance for substation: ${substation.name}`)
    }
  }

  /**
   * Simulate overload condition
   */
  private simulateOverload(): void {
    const activeLines = Array.from(this.lines.values())
      .filter(l => l.status === EntityStatus.ACTIVE)
    
    if (activeLines.length > 0) {
      const line = activeLines[Math.floor(Math.random() * activeLines.length)]
      const updated = { 
        ...line, 
        powerFlow: line.capacity * 1.1, // 110% of capacity
        loadFactor: 1.1,
        temperature: Math.min(90, line.temperature + 15),
        updatedAt: new Date().toISOString()
      }
      
      this.lines.set(line.id, updated)
      this.wsServer.broadcastLineUpdate('UPDATE', updated)
      
      console.log(`🚨 Simulated overload on line: ${line.name}`)
    }
  }

  /**
   * Simulate recovery from fault
   */
  private simulateRecovery(): void {
    const faultedSubstations = Array.from(this.substations.values())
      .filter(s => s.status === EntityStatus.FAULT || s.status === EntityStatus.MAINTENANCE)
    
    if (faultedSubstations.length > 0) {
      const substation = faultedSubstations[Math.floor(Math.random() * faultedSubstations.length)]
      const updated = { 
        ...substation, 
        status: substation.type === 'BACKUP' ? EntityStatus.STANDBY : EntityStatus.ACTIVE,
        updatedAt: new Date().toISOString()
      }
      
      this.substations.set(substation.id, updated)
      this.wsServer.broadcastSubstationUpdate('UPDATE', updated)
      
      console.log(`✅ Simulated recovery for substation: ${substation.name}`)
    }
  }

  /**
   * Get load multiplier based on simulation pattern
   */
  private getLoadMultiplier(): number {
    const timeOfDay = (this.simulationTime / 60000) % 1440 // Minutes in day
    let baseMultiplier = 0.6 // Base load

    // Simulate daily load curve
    if (timeOfDay >= 480 && timeOfDay <= 600) { // 8-10 AM
      baseMultiplier = 0.8
    } else if (timeOfDay >= 600 && timeOfDay <= 1020) { // 10 AM - 5 PM
      baseMultiplier = 0.9
    } else if (timeOfDay >= 1020 && timeOfDay <= 1320) { // 5-10 PM
      baseMultiplier = 0.95
    }

    // Apply pattern modifications
    switch (this.currentPattern) {
      case SimulationPattern.PEAK_LOAD:
        return Math.min(1.0, baseMultiplier * 1.3)
      case SimulationPattern.LOAD_SHEDDING:
        return baseMultiplier * 0.7
      case SimulationPattern.EMERGENCY:
        return baseMultiplier * 0.5
      case SimulationPattern.MAINTENANCE:
        return baseMultiplier * 0.8
      default:
        return baseMultiplier
    }
  }

  /**
   * Get simulation statistics
   */
  getStats(): {
    isRunning: boolean
    simulationTime: number
    pattern: SimulationPattern
    substationCount: number
    lineCount: number
    totalLoad: number
    totalCapacity: number
  } {
    const totalLoad = Array.from(this.substations.values())
      .reduce((sum, s) => sum + s.currentLoad, 0)
    
    const totalCapacity = Array.from(this.substations.values())
      .reduce((sum, s) => sum + s.powerRating, 0)

    return {
      isRunning: this.isRunning,
      simulationTime: this.simulationTime,
      pattern: this.currentPattern,
      substationCount: this.substations.size,
      lineCount: this.lines.size,
      totalLoad,
      totalCapacity
    }
  }
}