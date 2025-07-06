/**
 * Mock Datasets
 * Comprehensive test data sets for redundancy feature testing
 */

import {
  SubstationData,
  LineData,
  RedundancyPairData,
  SystemHealthData,
  TestScenarioData,
  PowerFlowAnimationData,
  TestDatasetSchema,
  SubstationStatus,
  LineStatus,
  RedundancyLevel,
  SystemHealthStatus
} from './data-schemas'

/**
 * Small dataset for unit testing (5 substations, 8 lines)
 */
export const smallDataset: TestDatasetSchema = {
  version: '1.0.0',
  name: 'Small Test Dataset',
  description: 'Minimal dataset for unit testing and quick validation',
  createdAt: '2024-03-01T00:00:00Z',
  
  substations: [
    {
      id: 'sub-small-001',
      name: 'North District Primary',
      type: 'PRIMARY',
      status: SubstationStatus.ACTIVE,
      redundancyGroup: 'north-group',
      redundancyLevel: RedundancyLevel.TWO_N_PLUS_1,
      position: { x: 200, y: 150 },
      zone: 'NORTH',
      powerRating: 500,
      currentLoad: 380,
      voltage: 230,
      frequency: 60,
      powerFactor: 0.95,
      efficiency: 0.97,
      connections: ['line-small-001', 'line-small-002'],
      backupSubstations: ['sub-small-002'],
      temperature: 65,
      operationalHours: 15420,
      reliability: 0.995,
      availability: 0.998
    },
    {
      id: 'sub-small-002',
      name: 'North District Backup',
      type: 'BACKUP',
      status: SubstationStatus.STANDBY,
      redundancyGroup: 'north-group',
      redundancyLevel: RedundancyLevel.TWO_N_PLUS_1,
      position: { x: 400, y: 150 },
      zone: 'NORTH',
      powerRating: 500,
      currentLoad: 0,
      voltage: 230,
      frequency: 60,
      powerFactor: 0.95,
      efficiency: 0.96,
      connections: ['line-small-003', 'line-small-004'],
      primarySubstation: 'sub-small-001',
      temperature: 45,
      operationalHours: 8200,
      reliability: 0.993,
      availability: 0.995
    },
    {
      id: 'sub-small-003',
      name: 'East Sector Station',
      type: 'PRIMARY',
      status: SubstationStatus.ACTIVE,
      redundancyGroup: 'east-group',
      redundancyLevel: RedundancyLevel.N_PLUS_1,
      position: { x: 600, y: 300 },
      zone: 'EAST',
      powerRating: 300,
      currentLoad: 220,
      voltage: 115,
      frequency: 60,
      powerFactor: 0.92,
      efficiency: 0.95,
      connections: ['line-small-005', 'line-small-006'],
      backupSubstations: ['sub-small-004'],
      temperature: 62,
      operationalHours: 22100,
      reliability: 0.988,
      availability: 0.992
    },
    {
      id: 'sub-small-004',
      name: 'East Sector Auxiliary',
      type: 'AUXILIARY',
      status: SubstationStatus.MAINTENANCE,
      redundancyGroup: 'east-group',
      redundancyLevel: RedundancyLevel.N_PLUS_1,
      position: { x: 800, y: 300 },
      zone: 'EAST',
      powerRating: 300,
      currentLoad: 0,
      voltage: 115,
      frequency: 60,
      powerFactor: 0.90,
      efficiency: 0.94,
      connections: ['line-small-007'],
      primarySubstation: 'sub-small-003',
      temperature: 25,
      lastMaintenance: '2024-02-15T10:00:00Z',
      nextMaintenance: '2024-03-15T10:00:00Z',
      operationalHours: 18500,
      reliability: 0.985,
      availability: 0.988
    },
    {
      id: 'sub-small-005',
      name: 'Central Hub',
      type: 'PRIMARY',
      status: SubstationStatus.ACTIVE,
      redundancyGroup: 'central-group',
      redundancyLevel: RedundancyLevel.TWO_N,
      position: { x: 500, y: 500 },
      zone: 'CENTRAL',
      powerRating: 750,
      currentLoad: 600,
      voltage: 345,
      frequency: 60,
      powerFactor: 0.98,
      efficiency: 0.98,
      connections: ['line-small-002', 'line-small-006', 'line-small-008'],
      temperature: 68,
      operationalHours: 35000,
      reliability: 0.997,
      availability: 0.999,
      metadata: {
        criticalInfrastructure: true,
        tier: 'TIER-1'
      }
    }
  ],
  
  lines: [
    {
      id: 'line-small-001',
      name: 'North Primary Feed A',
      type: 'TRANSMISSION',
      status: LineStatus.ACTIVE,
      redundancyType: RedundancyLevel.TWO_N_PLUS_1,
      path: [
        { x: 200, y: 150 },
        { x: 250, y: 120 },
        { x: 300, y: 100 }
      ],
      length: 12.5,
      voltage: 230,
      capacity: 600,
      powerFlow: 380,
      current: 952,
      impedance: { resistance: 0.05, reactance: 0.35 },
      conductorType: 'ACSR',
      thermalRating: 700,
      fromSubstation: 'sub-small-001',
      weatherConditions: {
        temperature: 25,
        windSpeed: 10,
        humidity: 60
      },
      loadFactor: 0.63,
      efficiency: 0.985
    },
    {
      id: 'line-small-002',
      name: 'North Primary Feed B',
      type: 'TRANSMISSION',
      status: LineStatus.ACTIVE,
      redundancyType: RedundancyLevel.TWO_N_PLUS_1,
      path: [
        { x: 200, y: 150 },
        { x: 300, y: 250 },
        { x: 500, y: 500 }
      ],
      length: 38.2,
      voltage: 230,
      capacity: 600,
      powerFlow: 0,
      current: 0,
      impedance: { resistance: 0.08, reactance: 0.42 },
      conductorType: 'ACSR',
      thermalRating: 700,
      fromSubstation: 'sub-small-001',
      toSubstation: 'sub-small-005',
      weatherConditions: {
        temperature: 25,
        windSpeed: 10,
        humidity: 60
      },
      loadFactor: 0,
      efficiency: 0.982
    },
    {
      id: 'line-small-003',
      name: 'North Backup Feed A',
      type: 'TRANSMISSION',
      status: LineStatus.STANDBY,
      redundancyType: RedundancyLevel.TWO_N_PLUS_1,
      path: [
        { x: 400, y: 150 },
        { x: 450, y: 120 },
        { x: 500, y: 100 }
      ],
      length: 13.8,
      voltage: 230,
      capacity: 600,
      powerFlow: 0,
      current: 0,
      impedance: { resistance: 0.06, reactance: 0.36 },
      conductorType: 'ACSR',
      thermalRating: 700,
      fromSubstation: 'sub-small-002',
      weatherConditions: {
        temperature: 25,
        windSpeed: 10,
        humidity: 60
      },
      loadFactor: 0,
      efficiency: 0.984
    },
    {
      id: 'line-small-004',
      name: 'North Backup Feed B',
      type: 'TRANSMISSION',
      status: LineStatus.STANDBY,
      redundancyType: RedundancyLevel.TWO_N_PLUS_1,
      path: [
        { x: 400, y: 150 },
        { x: 400, y: 250 },
        { x: 400, y: 350 }
      ],
      length: 20.0,
      voltage: 230,
      capacity: 600,
      powerFlow: 0,
      current: 0,
      impedance: { resistance: 0.07, reactance: 0.38 },
      conductorType: 'ACSR',
      thermalRating: 700,
      fromSubstation: 'sub-small-002',
      weatherConditions: {
        temperature: 25,
        windSpeed: 10,
        humidity: 60
      },
      loadFactor: 0,
      efficiency: 0.983
    },
    {
      id: 'line-small-005',
      name: 'East Primary Circuit',
      type: 'DISTRIBUTION',
      status: LineStatus.ACTIVE,
      redundancyType: RedundancyLevel.N_PLUS_1,
      path: [
        { x: 600, y: 300 },
        { x: 650, y: 350 },
        { x: 700, y: 400 }
      ],
      length: 15.2,
      voltage: 115,
      capacity: 350,
      powerFlow: 220,
      current: 1104,
      impedance: { resistance: 0.12, reactance: 0.45 },
      conductorType: 'ACCC',
      thermalRating: 400,
      fromSubstation: 'sub-small-003',
      weatherConditions: {
        temperature: 26,
        windSpeed: 8,
        humidity: 55
      },
      loadFactor: 0.63,
      efficiency: 0.975
    },
    {
      id: 'line-small-006',
      name: 'East-Central Interconnect',
      type: 'INTERCONNECTION',
      status: LineStatus.ACTIVE,
      redundancyType: RedundancyLevel.N_PLUS_1,
      path: [
        { x: 600, y: 300 },
        { x: 550, y: 400 },
        { x: 500, y: 500 }
      ],
      length: 22.4,
      voltage: 115,
      capacity: 350,
      powerFlow: 0,
      current: 0,
      impedance: { resistance: 0.15, reactance: 0.52 },
      conductorType: 'ACCC',
      thermalRating: 400,
      fromSubstation: 'sub-small-003',
      toSubstation: 'sub-small-005',
      weatherConditions: {
        temperature: 26,
        windSpeed: 8,
        humidity: 55
      },
      loadFactor: 0,
      efficiency: 0.972
    },
    {
      id: 'line-small-007',
      name: 'East Auxiliary Circuit',
      type: 'DISTRIBUTION',
      status: LineStatus.MAINTENANCE,
      redundancyType: RedundancyLevel.N_PLUS_1,
      path: [
        { x: 800, y: 300 },
        { x: 850, y: 350 },
        { x: 900, y: 400 }
      ],
      length: 16.0,
      voltage: 115,
      capacity: 350,
      powerFlow: 0,
      current: 0,
      impedance: { resistance: 0.13, reactance: 0.46 },
      conductorType: 'ACCC',
      thermalRating: 400,
      fromSubstation: 'sub-small-004',
      weatherConditions: {
        temperature: 26,
        windSpeed: 8,
        humidity: 55
      },
      loadFactor: 0,
      efficiency: 0.974,
      faultDetails: {
        faultType: 'PHASE_FAULT',
        faultLocation: { x: 850, y: 350 },
        faultTime: '2024-02-20T14:30:00Z',
        estimatedRepairTime: '2024-03-15T10:00:00Z'
      }
    },
    {
      id: 'line-small-008',
      name: 'Central Distribution Ring',
      type: 'DISTRIBUTION',
      status: LineStatus.ACTIVE,
      redundancyType: RedundancyLevel.TWO_N,
      path: [
        { x: 500, y: 500 },
        { x: 550, y: 550 },
        { x: 600, y: 600 },
        { x: 550, y: 650 },
        { x: 500, y: 600 },
        { x: 500, y: 500 }
      ],
      length: 28.5,
      voltage: 345,
      capacity: 800,
      powerFlow: 600,
      current: 1004,
      impedance: { resistance: 0.04, reactance: 0.32 },
      conductorType: 'ACSR',
      conductorCount: 3,
      bundleConfiguration: 'TRIPLE',
      thermalRating: 1000,
      fromSubstation: 'sub-small-005',
      toSubstation: 'sub-small-005',
      weatherConditions: {
        temperature: 28,
        windSpeed: 12,
        humidity: 50
      },
      loadFactor: 0.75,
      efficiency: 0.988
    }
  ],
  
  redundancyPairs: [
    {
      id: 'pair-small-001',
      name: 'North District Redundancy',
      type: 'AUTOMATIC',
      primary: 'sub-small-001',
      backup: 'sub-small-002',
      redundancyLevel: RedundancyLevel.TWO_N_PLUS_1,
      status: 'READY',
      switchoverTime: 45,
      targetSwitchoverTime: 50,
      lastSwitchover: '2024-01-15T03:22:00Z',
      switchoverCount: 3,
      successRate: 1.0,
      healthScore: 0.98,
      reliabilityScore: 0.995,
      readinessScore: 0.99,
      priority: 'HIGH'
    },
    {
      id: 'pair-small-002',
      name: 'East Sector Redundancy',
      type: 'SEMI_AUTOMATIC',
      primary: 'sub-small-003',
      backup: 'sub-small-004',
      redundancyLevel: RedundancyLevel.N_PLUS_1,
      status: 'DEGRADED',
      switchoverTime: 120,
      targetSwitchoverTime: 100,
      lastSwitchover: '2024-02-01T15:45:00Z',
      switchoverCount: 8,
      failureCount: 1,
      successRate: 0.875,
      healthScore: 0.72,
      reliabilityScore: 0.85,
      readinessScore: 0.60,
      degradationReason: 'Backup substation under maintenance',
      priority: 'MEDIUM'
    }
  ],
  
  systemHealth: {
    overall: SystemHealthStatus.HEALTHY,
    timestamp: '2024-03-01T12:00:00Z',
    redundancyLevel: 0.92,
    redundancyCoverage: 95,
    redundancyEffectiveness: 0.94,
    criticalAlerts: 0,
    warningAlerts: 2,
    infoAlerts: 5,
    totalAlerts: 7,
    subsystemHealth: {
      power: 0.95,
      communication: 0.98,
      control: 0.96,
      protection: 0.99,
      monitoring: 0.97,
      cooling: 0.94
    },
    metrics: {
      uptime: 0.9995,
      availability: 0.9992,
      reliability: 0.9988,
      efficiency: 0.93,
      loadFactor: 0.72,
      capacityUtilization: 0.68
    },
    capacity: {
      total: 2650,
      used: 1802,
      available: 848,
      reserved: 200,
      margin: 32
    },
    lastUpdate: '2024-03-01T12:00:00Z',
    updateFrequency: 300
  }
}

/**
 * Medium dataset for integration testing (20 substations, 40 lines)
 */
export const mediumDataset: TestDatasetSchema = {
  version: '1.0.0',
  name: 'Medium Test Dataset',
  description: 'Standard dataset for integration testing and scenario validation',
  createdAt: '2024-03-01T00:00:00Z',
  
  substations: Array.from({ length: 20 }, (_, i) => ({
    id: `sub-med-${String(i + 1).padStart(3, '0')}`,
    name: `Substation ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`,
    type: i % 3 === 0 ? 'PRIMARY' : i % 3 === 1 ? 'BACKUP' : 'AUXILIARY',
    status: i === 5 ? SubstationStatus.MAINTENANCE : 
            i === 10 ? SubstationStatus.FAULT :
            i % 3 === 1 ? SubstationStatus.STANDBY : 
            SubstationStatus.ACTIVE,
    redundancyGroup: `group-${Math.floor(i / 4) + 1}`,
    redundancyLevel: i < 8 ? RedundancyLevel.TWO_N_PLUS_1 : 
                     i < 14 ? RedundancyLevel.N_PLUS_1 : 
                     RedundancyLevel.TWO_N,
    position: { 
      x: 100 + (i % 5) * 200, 
      y: 100 + Math.floor(i / 5) * 150 
    },
    zone: ['NORTH', 'SOUTH', 'EAST', 'WEST', 'CENTRAL'][i % 5],
    powerRating: [300, 500, 750][i % 3],
    currentLoad: i === 5 || i === 10 || i % 3 === 1 ? 0 : 
                 [220, 380, 600][i % 3],
    voltage: [115, 230, 345][i % 3],
    frequency: 60,
    powerFactor: 0.90 + (i % 10) * 0.01,
    efficiency: 0.94 + (i % 6) * 0.01,
    connections: [`line-med-${String(i * 2 + 1).padStart(3, '0')}`, 
                  `line-med-${String(i * 2 + 2).padStart(3, '0')}`],
    temperature: 45 + (i % 3) * 10,
    operationalHours: 10000 + i * 2000,
    reliability: 0.98 + (i % 20) * 0.001,
    availability: 0.99 + (i % 10) * 0.0005,
    ...(i === 10 ? {
      faultDetails: {
        faultType: 'TRANSFORMER_FAILURE',
        faultTime: '2024-03-01T08:15:00Z',
        estimatedRepairTime: '2024-03-02T16:00:00Z',
        severity: 'HIGH',
        errorCode: 'TRF-001',
        errorMessage: 'Main transformer winding insulation failure'
      }
    } : {})
  })),
  
  lines: Array.from({ length: 40 }, (_, i) => ({
    id: `line-med-${String(i + 1).padStart(3, '0')}`,
    name: `Line ${i + 1}`,
    type: i < 20 ? 'TRANSMISSION' : 'DISTRIBUTION',
    status: i === 15 ? LineStatus.FAULT :
            i === 25 ? LineStatus.OVERLOAD :
            i % 10 === 5 ? LineStatus.STANDBY :
            LineStatus.ACTIVE,
    redundancyType: i < 10 ? RedundancyLevel.TWO_N_PLUS_1 :
                    i < 25 ? RedundancyLevel.N_PLUS_1 :
                    RedundancyLevel.N,
    path: [
      { x: 100 + (i % 5) * 200, y: 100 + Math.floor(i / 8) * 150 },
      { x: 100 + ((i + 1) % 5) * 200, y: 100 + Math.floor((i + 1) / 8) * 150 }
    ],
    length: 10 + Math.random() * 40,
    voltage: [115, 230, 345][i % 3],
    capacity: [350, 600, 800][i % 3],
    powerFlow: i === 15 || i % 10 === 5 ? 0 :
              i === 25 ? [400, 700, 900][i % 3] : // Overloaded
              [220, 380, 600][i % 3],
    impedance: {
      resistance: 0.04 + (i % 10) * 0.01,
      reactance: 0.30 + (i % 10) * 0.02
    },
    conductorType: ['ACSR', 'ACCC', 'ACSS'][i % 3],
    thermalRating: [400, 700, 1000][i % 3],
    weatherConditions: {
      temperature: 20 + (i % 20),
      windSpeed: 5 + (i % 15),
      humidity: 40 + (i % 40)
    },
    efficiency: 0.97 + (i % 30) * 0.001,
    ...(i === 15 ? {
      faultDetails: {
        faultType: 'GROUND_FAULT',
        faultLocation: { x: 300, y: 250 },
        faultTime: '2024-03-01T10:45:00Z',
        estimatedRepairTime: '2024-03-01T18:00:00Z',
        affectedPhases: ['A']
      }
    } : {}),
    ...(i === 25 ? {
      overloadDetails: {
        overloadPercentage: 112.5,
        timeInOverload: 1800,
        maxAllowableTime: 3600,
        temperatureRise: 8
      }
    } : {})
  })),
  
  redundancyPairs: Array.from({ length: 10 }, (_, i) => ({
    id: `pair-med-${String(i + 1).padStart(3, '0')}`,
    name: `Redundancy Pair ${i + 1}`,
    type: i < 6 ? 'AUTOMATIC' : 'SEMI_AUTOMATIC',
    primary: `sub-med-${String(i * 2 + 1).padStart(3, '0')}`,
    backup: `sub-med-${String(i * 2 + 2).padStart(3, '0')}`,
    redundancyLevel: i < 4 ? RedundancyLevel.TWO_N_PLUS_1 :
                     i < 7 ? RedundancyLevel.N_PLUS_1 :
                     RedundancyLevel.N,
    status: i === 2 ? 'DEGRADED' : 
            i === 5 ? 'FAILED' : 
            'READY',
    switchoverTime: 40 + i * 10,
    targetSwitchoverTime: 50,
    switchoverCount: i * 5,
    successRate: i === 5 ? 0.60 : 0.90 + (i % 10) * 0.01,
    healthScore: i === 5 ? 0.45 : 0.85 + (i % 15) * 0.01,
    priority: i < 3 ? 'HIGH' : i < 7 ? 'MEDIUM' : 'LOW'
  })),
  
  systemHealth: {
    overall: SystemHealthStatus.DEGRADED,
    timestamp: '2024-03-01T12:00:00Z',
    redundancyLevel: 0.82,
    redundancyCoverage: 85,
    redundancyEffectiveness: 0.86,
    criticalAlerts: 2,
    warningAlerts: 8,
    infoAlerts: 15,
    totalAlerts: 25,
    subsystemHealth: {
      power: 0.88,
      communication: 0.92,
      control: 0.85,
      protection: 0.90,
      monitoring: 0.91,
      cooling: 0.87
    },
    metrics: {
      uptime: 0.9985,
      availability: 0.9920,
      reliability: 0.9850,
      efficiency: 0.89,
      loadFactor: 0.78,
      capacityUtilization: 0.75
    },
    lastUpdate: '2024-03-01T12:00:00Z'
  }
}

/**
 * Large dataset for performance testing (100 substations, 200 lines)
 */
export const largeDataset: TestDatasetSchema = {
  version: '1.0.0',
  name: 'Large Performance Test Dataset',
  description: 'Extensive dataset for performance and stress testing',
  createdAt: '2024-03-01T00:00:00Z',
  
  substations: Array.from({ length: 100 }, (_, i) => ({
    id: `sub-large-${String(i + 1).padStart(4, '0')}`,
    name: `Grid Station ${String(i + 1).padStart(3, '0')}`,
    type: i % 4 === 0 ? 'PRIMARY' : i % 4 === 1 ? 'BACKUP' : 'AUXILIARY',
    status: i % 20 === 0 ? SubstationStatus.MAINTENANCE :
            i % 30 === 0 ? SubstationStatus.FAULT :
            i % 4 === 1 ? SubstationStatus.STANDBY :
            SubstationStatus.ACTIVE,
    redundancyGroup: `mega-group-${Math.floor(i / 10) + 1}`,
    redundancyLevel: i % 3 === 0 ? RedundancyLevel.TWO_N_PLUS_1 :
                     i % 3 === 1 ? RedundancyLevel.N_PLUS_1 :
                     RedundancyLevel.TWO_N,
    position: {
      x: 50 + (i % 10) * 100,
      y: 50 + Math.floor(i / 10) * 80
    },
    zone: `ZONE-${Math.floor(i / 20) + 1}`,
    powerRating: [300, 500, 750, 1000][i % 4],
    currentLoad: (i % 4 === 1 || i % 20 === 0 || i % 30 === 0) ? 0 :
                 [200, 350, 550, 800][i % 4],
    voltage: [115, 230, 345, 500][i % 4],
    frequency: 60,
    powerFactor: 0.88 + (i % 12) * 0.01,
    efficiency: 0.92 + (i % 8) * 0.01,
    connections: Array.from({ length: 2 + (i % 3) }, (_, j) => 
      `line-large-${String(i * 2 + j + 1).padStart(4, '0')}`
    ),
    temperature: 40 + (i % 40),
    operationalHours: 5000 + i * 500,
    reliability: 0.96 + (i % 40) * 0.001,
    availability: 0.98 + (i % 20) * 0.001
  })),
  
  lines: Array.from({ length: 200 }, (_, i) => ({
    id: `line-large-${String(i + 1).padStart(4, '0')}`,
    name: `Power Line ${String(i + 1).padStart(3, '0')}`,
    type: i < 100 ? 'TRANSMISSION' : 'DISTRIBUTION',
    status: i % 40 === 0 ? LineStatus.FAULT :
            i % 25 === 0 ? LineStatus.OVERLOAD :
            i % 15 === 0 ? LineStatus.MAINTENANCE :
            i % 10 === 5 ? LineStatus.STANDBY :
            LineStatus.ACTIVE,
    redundancyType: i < 50 ? RedundancyLevel.TWO_N_PLUS_1 :
                    i < 120 ? RedundancyLevel.N_PLUS_1 :
                    RedundancyLevel.N,
    path: [
      { x: 50 + (Math.floor(i / 2) % 10) * 100, y: 50 + Math.floor(i / 20) * 80 },
      { x: 50 + ((Math.floor(i / 2) + 1) % 10) * 100, y: 50 + Math.floor((i + 10) / 20) * 80 }
    ],
    length: 5 + Math.random() * 50,
    voltage: [115, 230, 345, 500][i % 4],
    capacity: [350, 600, 800, 1200][i % 4],
    powerFlow: (i % 40 === 0 || i % 15 === 0 || i % 10 === 5) ? 0 :
              i % 25 === 0 ? [400, 700, 900, 1300][i % 4] : // Overloaded
              [200, 350, 550, 800][i % 4],
    impedance: {
      resistance: 0.03 + (i % 20) * 0.005,
      reactance: 0.25 + (i % 20) * 0.01
    },
    conductorType: ['ACSR', 'ACCC', 'ACSS', 'AAAC'][i % 4],
    thermalRating: [400, 700, 1000, 1500][i % 4],
    weatherConditions: {
      temperature: 15 + (i % 30),
      windSpeed: 3 + (i % 20),
      humidity: 30 + (i % 50)
    },
    efficiency: 0.96 + (i % 40) * 0.001
  })),
  
  redundancyPairs: Array.from({ length: 50 }, (_, i) => ({
    id: `pair-large-${String(i + 1).padStart(3, '0')}`,
    name: `Mega Redundancy ${i + 1}`,
    type: i % 3 === 0 ? 'AUTOMATIC' : i % 3 === 1 ? 'SEMI_AUTOMATIC' : 'MANUAL',
    primary: `sub-large-${String(i * 2 + 1).padStart(4, '0')}`,
    backup: `sub-large-${String(i * 2 + 2).padStart(4, '0')}`,
    redundancyLevel: i < 20 ? RedundancyLevel.TWO_N_PLUS_1 :
                     i < 35 ? RedundancyLevel.N_PLUS_1 :
                     RedundancyLevel.N,
    status: i % 15 === 0 ? 'DEGRADED' :
            i % 25 === 0 ? 'FAILED' :
            'READY',
    switchoverTime: 30 + i * 5,
    targetSwitchoverTime: 50,
    switchoverCount: i * 10,
    successRate: i % 25 === 0 ? 0.50 : 0.85 + (i % 15) * 0.01,
    healthScore: i % 25 === 0 ? 0.40 : 0.80 + (i % 20) * 0.01,
    priority: i < 10 ? 'HIGH' : i < 30 ? 'MEDIUM' : 'LOW'
  })),
  
  systemHealth: {
    overall: SystemHealthStatus.DEGRADED,
    timestamp: '2024-03-01T12:00:00Z',
    redundancyLevel: 0.78,
    redundancyCoverage: 82,
    redundancyEffectiveness: 0.80,
    criticalAlerts: 5,
    warningAlerts: 25,
    infoAlerts: 50,
    totalAlerts: 80,
    subsystemHealth: {
      power: 0.82,
      communication: 0.88,
      control: 0.79,
      protection: 0.85,
      monitoring: 0.86,
      cooling: 0.81
    },
    metrics: {
      uptime: 0.9972,
      availability: 0.9885,
      reliability: 0.9800,
      efficiency: 0.87,
      loadFactor: 0.82,
      capacityUtilization: 0.79
    },
    lastUpdate: '2024-03-01T12:00:00Z'
  }
}

/**
 * Edge case dataset for error testing
 */
export const edgeCaseDataset: TestDatasetSchema = {
  version: '1.0.0',
  name: 'Edge Case Test Dataset',
  description: 'Dataset with edge cases and error conditions',
  createdAt: '2024-03-01T00:00:00Z',
  
  substations: [
    // Completely offline substation
    {
      id: 'sub-edge-offline',
      name: 'Offline Station',
      status: SubstationStatus.OFFLINE,
      redundancyGroup: 'edge-group-1',
      redundancyLevel: RedundancyLevel.N,
      position: { x: 100, y: 100 },
      powerRating: 500,
      currentLoad: 0,
      voltage: 0,
      frequency: 0,
      powerFactor: 0,
      efficiency: 0,
      connections: [],
      temperature: 0,
      operationalHours: 0,
      reliability: 0,
      availability: 0
    },
    // Overloaded substation
    {
      id: 'sub-edge-overload',
      name: 'Overloaded Station',
      status: SubstationStatus.ACTIVE,
      redundancyGroup: 'edge-group-2',
      redundancyLevel: RedundancyLevel.N,
      position: { x: 300, y: 100 },
      powerRating: 300,
      currentLoad: 350, // Over capacity!
      voltage: 230,
      frequency: 60.5, // Frequency deviation
      powerFactor: 0.75, // Poor power factor
      efficiency: 0.85, // Low efficiency
      connections: ['line-edge-overload'],
      temperature: 95, // High temperature
      operationalHours: 50000,
      reliability: 0.85, // Low reliability
      availability: 0.90
    },
    // Substation with all backup failed
    {
      id: 'sub-edge-no-backup',
      name: 'No Backup Station',
      status: SubstationStatus.ACTIVE,
      redundancyGroup: 'edge-group-3',
      redundancyLevel: RedundancyLevel.N,
      position: { x: 500, y: 100 },
      powerRating: 500,
      currentLoad: 450,
      voltage: 230,
      frequency: 60,
      powerFactor: 0.95,
      efficiency: 0.96,
      connections: ['line-edge-single'],
      backupSubstations: ['sub-edge-offline'], // Backup is offline!
      temperature: 70,
      operationalHours: 30000,
      reliability: 0.98,
      availability: 0.99
    }
  ],
  
  lines: [
    // Completely faulted line
    {
      id: 'line-edge-fault',
      name: 'Faulted Line',
      status: LineStatus.FAULT,
      redundancyType: RedundancyLevel.N,
      path: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
      voltage: 0,
      capacity: 600,
      powerFlow: 0,
      impedance: { resistance: 999, reactance: 999 }, // Extreme impedance
      thermalRating: 700,
      faultDetails: {
        faultType: 'SHORT_CIRCUIT',
        faultLocation: { x: 150, y: 150 },
        faultTime: '2024-03-01T00:00:00Z',
        estimatedRepairTime: '2024-03-10T00:00:00Z', // Long repair time
        affectedPhases: ['A', 'B', 'C'] // All phases
      }
    },
    // Severely overloaded line
    {
      id: 'line-edge-overload',
      name: 'Overloaded Line',
      status: LineStatus.OVERLOAD,
      redundancyType: RedundancyLevel.N,
      path: [{ x: 300, y: 100 }, { x: 400, y: 200 }],
      voltage: 230,
      capacity: 300,
      powerFlow: 450, // 150% capacity!
      impedance: { resistance: 0.1, reactance: 0.4 },
      thermalRating: 350,
      overloadDetails: {
        overloadPercentage: 150,
        timeInOverload: 7200, // 2 hours
        maxAllowableTime: 3600, // Already exceeded!
        temperatureRise: 25 // Dangerous temperature rise
      }
    },
    // Line with no redundancy
    {
      id: 'line-edge-single',
      name: 'Single Point of Failure',
      status: LineStatus.ACTIVE,
      redundancyType: RedundancyLevel.N,
      path: [{ x: 500, y: 100 }, { x: 600, y: 200 }],
      voltage: 230,
      capacity: 600,
      powerFlow: 450,
      impedance: { resistance: 0.08, reactance: 0.35 },
      thermalRating: 700,
      parallelLines: [] // No parallel lines!
    }
  ],
  
  redundancyPairs: [
    // Failed redundancy pair
    {
      id: 'pair-edge-failed',
      type: 'AUTOMATIC',
      primary: 'sub-edge-overload',
      backup: 'sub-edge-offline',
      redundancyLevel: RedundancyLevel.N,
      status: 'FAILED',
      switchoverTime: 999999, // Effectively infinite
      targetSwitchoverTime: 50,
      switchoverCount: 50,
      failureCount: 25, // 50% failure rate
      successRate: 0.5,
      healthScore: 0.1,
      reliabilityScore: 0.2,
      readinessScore: 0.0,
      failureReason: 'Backup substation offline',
      priority: 'HIGH'
    }
  ],
  
  systemHealth: {
    overall: SystemHealthStatus.CRITICAL,
    timestamp: '2024-03-01T12:00:00Z',
    redundancyLevel: 0.25, // Very low
    redundancyCoverage: 30, // Poor coverage
    redundancyEffectiveness: 0.20,
    criticalAlerts: 15,
    warningAlerts: 30,
    infoAlerts: 20,
    totalAlerts: 65,
    subsystemHealth: {
      power: 0.45, // Critical
      communication: 0.65,
      control: 0.50,
      protection: 0.60,
      monitoring: 0.70,
      cooling: 0.40 // Critical
    },
    metrics: {
      uptime: 0.9500, // Poor uptime
      availability: 0.9200, // Poor availability
      reliability: 0.8500, // Low reliability
      efficiency: 0.75, // Poor efficiency
      loadFactor: 0.95, // Dangerously high
      capacityUtilization: 0.92 // Near limit
    },
    alerts: [
      {
        id: 'alert-001',
        type: 'CRITICAL',
        category: 'POWER',
        message: 'Multiple substations operating above rated capacity',
        timestamp: '2024-03-01T12:00:00Z',
        source: 'sub-edge-overload'
      },
      {
        id: 'alert-002',
        type: 'CRITICAL',
        category: 'REDUNDANCY',
        message: 'No backup available for critical infrastructure',
        timestamp: '2024-03-01T12:00:00Z',
        source: 'sub-edge-no-backup'
      }
    ],
    lastUpdate: '2024-03-01T12:00:00Z'
  }
}

/**
 * Animation test dataset
 */
export const animationDataset: TestDatasetSchema = {
  version: '1.0.0',
  name: 'Animation Test Dataset',
  description: 'Dataset optimized for testing animations',
  createdAt: '2024-03-01T00:00:00Z',
  
  substations: [
    {
      id: 'sub-anim-001',
      name: 'Animation Station A',
      status: SubstationStatus.ACTIVE,
      redundancyGroup: 'anim-group',
      redundancyLevel: RedundancyLevel.TWO_N_PLUS_1,
      position: { x: 200, y: 300 },
      powerRating: 500,
      currentLoad: 400,
      voltage: 230,
      frequency: 60,
      powerFactor: 0.95,
      efficiency: 0.97,
      connections: ['line-anim-001', 'line-anim-002'],
      temperature: 65,
      operationalHours: 25000,
      reliability: 0.995,
      availability: 0.998
    },
    {
      id: 'sub-anim-002',
      name: 'Animation Station B',
      status: SubstationStatus.ACTIVE,
      redundancyGroup: 'anim-group',
      redundancyLevel: RedundancyLevel.TWO_N_PLUS_1,
      position: { x: 600, y: 300 },
      powerRating: 500,
      currentLoad: 350,
      voltage: 230,
      frequency: 60,
      powerFactor: 0.94,
      efficiency: 0.96,
      connections: ['line-anim-001', 'line-anim-003'],
      temperature: 62,
      operationalHours: 22000,
      reliability: 0.993,
      availability: 0.996
    }
  ],
  
  lines: [
    {
      id: 'line-anim-001',
      name: 'Animated Power Flow Line',
      status: LineStatus.ACTIVE,
      redundancyType: RedundancyLevel.TWO_N_PLUS_1,
      path: [
        { x: 200, y: 300 },
        { x: 300, y: 250 },
        { x: 400, y: 300 },
        { x: 500, y: 250 },
        { x: 600, y: 300 }
      ],
      voltage: 230,
      capacity: 600,
      powerFlow: 400,
      impedance: { resistance: 0.06, reactance: 0.35 },
      thermalRating: 700,
      efficiency: 0.985,
      loadFactor: 0.67,
      length: 35.5,
      conductorType: 'ACSR',
      weatherConditions: {
        temperature: 25,
        windSpeed: 10,
        humidity: 60
      }
    },
    {
      id: 'line-anim-002',
      name: 'Circular Animation Path',
      status: LineStatus.ACTIVE,
      redundancyType: RedundancyLevel.N_PLUS_1,
      path: Array.from({ length: 20 }, (_, i) => ({
        x: 200 + 100 * Math.cos((i * 2 * Math.PI) / 20),
        y: 300 + 100 * Math.sin((i * 2 * Math.PI) / 20)
      })),
      voltage: 115,
      capacity: 350,
      powerFlow: 200,
      impedance: { resistance: 0.1, reactance: 0.4 },
      thermalRating: 400,
      efficiency: 0.975,
      loadFactor: 0.57,
      length: 62.8,
      conductorType: 'ACCC',
      weatherConditions: {
        temperature: 24,
        windSpeed: 8,
        humidity: 55
      }
    },
    {
      id: 'line-anim-003',
      name: 'Station B Connection',
      type: 'DISTRIBUTION',
      status: LineStatus.ACTIVE,
      redundancyType: RedundancyLevel.N_PLUS_1,
      path: [
        { x: 600, y: 300 },
        { x: 700, y: 350 }
      ],
      voltage: 115,
      capacity: 300,
      powerFlow: 250,
      impedance: { resistance: 0.08, reactance: 0.38 },
      thermalRating: 350,
      efficiency: 0.978,
      loadFactor: 0.83,
      length: 11.2,
      conductorType: 'ACSR',
      weatherConditions: {
        temperature: 25,
        windSpeed: 9,
        humidity: 58
      }
    }
  ],
  
  redundancyPairs: [],
  
  systemHealth: {
    overall: SystemHealthStatus.HEALTHY,
    timestamp: '2024-03-01T12:00:00Z',
    redundancyLevel: 0.95,
    criticalAlerts: 0,
    warningAlerts: 0,
    infoAlerts: 2,
    subsystemHealth: {
      power: 0.98,
      communication: 0.99,
      control: 0.97,
      protection: 0.99
    },
    metrics: {
      uptime: 0.9999,
      availability: 0.9998,
      efficiency: 0.96,
      loadFactor: 0.75
    },
    lastUpdate: '2024-03-01T12:00:00Z'
  },
  
  animations: {
    powerFlow: [
      {
        duration: 2000,
        flowRate: 1.0,
        flowDirection: 'forward',
        particles: Array.from({ length: 5 }, (_, i) => ({
          id: `particle-${i}`,
          position: { x: 200 + i * 100, y: 300 },
          velocity: { x: 50, y: 0 },
          size: 4 + (i % 3),
          opacity: 0.8 + (i % 3) * 0.1,
          color: '#00ff00'
        })),
        path: [
          { x: 200, y: 300 },
          { x: 600, y: 300 }
        ],
        particleCount: 5,
        particleSize: 5,
        particleColor: '#00ff00',
        glowEffect: true,
        useGPU: true
      }
    ],
    substationPulse: [
      {
        duration: 1000,
        easing: 'ease-out',
        loop: true,
        autoplay: true
      }
    ],
    lineHighlight: [
      {
        duration: 500,
        delay: 100,
        easing: 'ease-in-out',
        direction: 'alternate'
      }
    ]
  }
}

/**
 * Get dataset by size
 */
export function getDatasetBySize(size: 'small' | 'medium' | 'large' | 'edge' | 'animation'): TestDatasetSchema {
  switch (size) {
    case 'small':
      return smallDataset
    case 'medium':
      return mediumDataset
    case 'large':
      return largeDataset
    case 'edge':
      return edgeCaseDataset
    case 'animation':
      return animationDataset
    default:
      return smallDataset
  }
}

/**
 * Generate custom dataset
 */
export function generateCustomDataset(
  substationCount: number,
  lineCount: number,
  redundancyPairCount: number
): TestDatasetSchema {
  return {
    version: '1.0.0',
    name: `Custom Dataset (${substationCount}S/${lineCount}L/${redundancyPairCount}P)`,
    description: 'Dynamically generated dataset',
    createdAt: new Date().toISOString(),
    
    substations: Array.from({ length: substationCount }, (_, i) => ({
      id: `sub-custom-${String(i + 1).padStart(4, '0')}`,
      name: `Custom Station ${i + 1}`,
      status: i % 10 === 0 ? SubstationStatus.MAINTENANCE :
              i % 4 === 1 ? SubstationStatus.STANDBY :
              SubstationStatus.ACTIVE,
      redundancyGroup: `custom-group-${Math.floor(i / 5) + 1}`,
      redundancyLevel: RedundancyLevel.N_PLUS_1,
      position: {
        x: 50 + (i % 10) * 100,
        y: 50 + Math.floor(i / 10) * 100
      },
      powerRating: [300, 500, 750][i % 3],
      currentLoad: (i % 4 === 1 || i % 10 === 0) ? 0 : [200, 350, 550][i % 3],
      voltage: [115, 230, 345][i % 3],
      frequency: 60,
      powerFactor: 0.90 + (i % 10) * 0.01,
      efficiency: 0.94 + (i % 6) * 0.01,
      connections: [`line-custom-${String(i + 1).padStart(4, '0')}`]
    })),
    
    lines: Array.from({ length: lineCount }, (_, i) => ({
      id: `line-custom-${String(i + 1).padStart(4, '0')}`,
      name: `Custom Line ${i + 1}`,
      status: i % 20 === 0 ? LineStatus.MAINTENANCE : LineStatus.ACTIVE,
      redundancyType: RedundancyLevel.N_PLUS_1,
      path: [
        { x: 50 + (i % 10) * 100, y: 50 + Math.floor(i / 10) * 100 },
        { x: 50 + ((i + 1) % 10) * 100, y: 50 + Math.floor((i + 1) / 10) * 100 }
      ],
      voltage: [115, 230, 345][i % 3],
      capacity: [350, 600, 800][i % 3],
      powerFlow: i % 20 === 0 ? 0 : [200, 350, 550][i % 3],
      impedance: {
        resistance: 0.05 + (i % 10) * 0.01,
        reactance: 0.35 + (i % 10) * 0.02
      },
      thermalRating: [400, 700, 1000][i % 3]
    })),
    
    redundancyPairs: Array.from({ length: redundancyPairCount }, (_, i) => ({
      id: `pair-custom-${String(i + 1).padStart(3, '0')}`,
      type: 'AUTOMATIC',
      primary: `sub-custom-${String(i * 2 + 1).padStart(4, '0')}`,
      backup: `sub-custom-${String(i * 2 + 2).padStart(4, '0')}`,
      redundancyLevel: RedundancyLevel.N_PLUS_1,
      status: 'READY',
      switchoverTime: 50 + i * 5,
      switchoverCount: i * 2,
      healthScore: 0.90 + (i % 10) * 0.01,
      priority: 'MEDIUM'
    })),
    
    systemHealth: {
      overall: SystemHealthStatus.HEALTHY,
      timestamp: new Date().toISOString(),
      redundancyLevel: 0.90,
      criticalAlerts: 0,
      warningAlerts: Math.floor(substationCount / 20),
      infoAlerts: Math.floor(substationCount / 10),
      subsystemHealth: {
        power: 0.95,
        communication: 0.96,
        control: 0.94,
        protection: 0.97
      },
      metrics: {
        uptime: 0.9995,
        availability: 0.9990,
        efficiency: 0.92,
        loadFactor: 0.70
      },
      lastUpdate: new Date().toISOString()
    }
  }
}

export default {
  smallDataset,
  mediumDataset,
  largeDataset,
  edgeCaseDataset,
  animationDataset,
  getDatasetBySize,
  generateCustomDataset
}