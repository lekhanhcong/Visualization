/**
 * Test Fixtures
 * Pre-defined test data and scenarios for redundancy feature testing
 */

/**
 * Substation test fixtures
 */
export const substationFixtures = {
  activeSubstation: {
    id: 'sub-active-001',
    name: 'Main Power Station Alpha',
    status: 'ACTIVE' as const,
    position: { x: 150, y: 200 },
    redundancyGroup: 'group-primary',
    powerRating: 750,
    currentLoad: 600,
    connections: ['line-001', 'line-002', 'line-003'],
    lastMaintenance: '2024-01-15T10:30:00Z',
    nextMaintenance: '2024-07-15T10:30:00Z',
    operatingTemperature: 65,
    efficiency: 0.95,
    redundancyLevel: '2N+1',
    backupSubstations: ['sub-backup-001', 'sub-backup-002']
  },

  backupSubstation: {
    id: 'sub-backup-001',
    name: 'Backup Power Station Beta',
    status: 'STANDBY' as const,
    position: { x: 350, y: 200 },
    redundancyGroup: 'group-primary',
    powerRating: 750,
    currentLoad: 0,
    connections: ['line-004', 'line-005'],
    lastMaintenance: '2024-02-01T14:00:00Z',
    nextMaintenance: '2024-08-01T14:00:00Z',
    operatingTemperature: 45,
    efficiency: 0.96,
    redundancyLevel: '2N+1',
    primarySubstation: 'sub-active-001'
  },

  maintenanceSubstation: {
    id: 'sub-maintenance-001',
    name: 'Maintenance Station Gamma',
    status: 'MAINTENANCE' as const,
    position: { x: 250, y: 400 },
    redundancyGroup: 'group-secondary',
    powerRating: 500,
    currentLoad: 0,
    connections: [],
    lastMaintenance: '2024-03-01T09:00:00Z',
    nextMaintenance: '2024-03-15T09:00:00Z',
    operatingTemperature: 25,
    efficiency: 0.0,
    redundancyLevel: 'N+1',
    maintenanceReason: 'Scheduled transformer replacement'
  },

  faultedSubstation: {
    id: 'sub-fault-001',
    name: 'Faulted Station Delta',
    status: 'FAULT' as const,
    position: { x: 450, y: 300 },
    redundancyGroup: 'group-tertiary',
    powerRating: 600,
    currentLoad: 0,
    connections: ['line-006'],
    lastMaintenance: '2023-12-20T16:00:00Z',
    nextMaintenance: '2024-06-20T16:00:00Z',
    operatingTemperature: 0,
    efficiency: 0.0,
    redundancyLevel: 'N',
    faultDetails: {
      faultType: 'TRANSFORMER_FAILURE',
      faultTime: '2024-03-01T12:30:00Z',
      estimatedRepairTime: '2024-03-05T12:30:00Z'
    }
  }
}

/**
 * Line test fixtures
 */
export const lineFixtures = {
  activeLine: {
    id: 'line-001',
    name: 'Primary Transmission Line A',
    status: 'ACTIVE' as const,
    path: [
      { x: 150, y: 200 },
      { x: 250, y: 150 },
      { x: 350, y: 200 }
    ],
    redundancyType: '2N+1' as const,
    powerFlow: 550,
    capacity: 750,
    voltage: 500000, // 500kV
    length: 25.5, // km
    conductorType: 'ACSR',
    thermalRating: 1200,
    impedance: { resistance: 0.05, reactance: 0.35 },
    weatherConditions: {
      temperature: 25,
      windSpeed: 12,
      humidity: 60
    }
  },

  backupLine: {
    id: 'line-002',
    name: 'Backup Transmission Line B',
    status: 'STANDBY' as const,
    path: [
      { x: 150, y: 200 },
      { x: 200, y: 300 },
      { x: 350, y: 250 }
    ],
    redundancyType: '2N+1' as const,
    powerFlow: 0,
    capacity: 750,
    voltage: 500000,
    length: 28.2,
    conductorType: 'ACSR',
    thermalRating: 1200,
    impedance: { resistance: 0.06, reactance: 0.38 },
    weatherConditions: {
      temperature: 24,
      windSpeed: 8,
      humidity: 55
    }
  },

  overloadedLine: {
    id: 'line-003',
    name: 'Overloaded Line C',
    status: 'OVERLOAD' as const,
    path: [
      { x: 250, y: 100 },
      { x: 400, y: 150 },
      { x: 550, y: 200 }
    ],
    redundancyType: 'N+1' as const,
    powerFlow: 850,
    capacity: 800,
    voltage: 345000, // 345kV
    length: 32.1,
    conductorType: 'ACCC',
    thermalRating: 900,
    impedance: { resistance: 0.04, reactance: 0.32 },
    weatherConditions: {
      temperature: 35,
      windSpeed: 5,
      humidity: 80
    },
    overloadDetails: {
      overloadPercentage: 106.25,
      timeInOverload: 1800, // 30 minutes
      maxAllowableTime: 3600 // 1 hour
    }
  },

  faultedLine: {
    id: 'line-004',
    name: 'Faulted Line D',
    status: 'FAULT' as const,
    path: [
      { x: 100, y: 300 },
      { x: 200, y: 400 },
      { x: 300, y: 350 }
    ],
    redundancyType: 'N' as const,
    powerFlow: 0,
    capacity: 600,
    voltage: 230000, // 230kV
    length: 18.7,
    conductorType: 'ACSR',
    thermalRating: 800,
    impedance: { resistance: 0.08, reactance: 0.42 },
    weatherConditions: {
      temperature: 22,
      windSpeed: 15,
      humidity: 45
    },
    faultDetails: {
      faultType: 'GROUND_FAULT',
      faultLocation: { x: 150, y: 375 },
      faultTime: '2024-03-01T14:15:00Z',
      estimatedRepairTime: '2024-03-02T08:00:00Z'
    }
  }
}

/**
 * Redundancy pair test fixtures
 */
export const redundancyPairFixtures = {
  activePair: {
    id: 'pair-001',
    primary: 'sub-active-001',
    backup: 'sub-backup-001',
    redundancyLevel: '2N+1' as const,
    switchoverTime: 45, // milliseconds
    lastSwitchover: '2024-02-15T11:20:00Z',
    switchoverCount: 3,
    status: 'READY' as const,
    healthScore: 0.98
  },

  degradedPair: {
    id: 'pair-002',
    primary: 'sub-active-002',
    backup: 'sub-backup-002',
    redundancyLevel: 'N+1' as const,
    switchoverTime: 75,
    lastSwitchover: '2024-01-20T09:45:00Z',
    switchoverCount: 12,
    status: 'DEGRADED' as const,
    healthScore: 0.72,
    degradationReason: 'Backup generator low fuel'
  },

  faultedPair: {
    id: 'pair-003',
    primary: 'sub-fault-001',
    backup: 'sub-backup-003',
    redundancyLevel: 'N' as const,
    switchoverTime: 120,
    lastSwitchover: '2024-03-01T12:35:00Z',
    switchoverCount: 1,
    status: 'FAILED' as const,
    healthScore: 0.15,
    failureReason: 'Primary station transformer failure'
  }
}

/**
 * System health test fixtures
 */
export const systemHealthFixtures = {
  healthy: {
    overall: 'HEALTHY' as const,
    redundancyLevel: 0.95,
    criticalAlerts: 0,
    warningAlerts: 2,
    infoAlerts: 5,
    lastUpdate: '2024-03-01T15:30:00Z',
    subsystemHealth: {
      power: 0.98,
      communication: 0.96,
      control: 0.94,
      protection: 0.99
    },
    metrics: {
      uptime: 0.9999,
      availability: 0.9995,
      efficiency: 0.94,
      loadFactor: 0.78
    }
  },

  degraded: {
    overall: 'DEGRADED' as const,
    redundancyLevel: 0.82,
    criticalAlerts: 1,
    warningAlerts: 8,
    infoAlerts: 12,
    lastUpdate: '2024-03-01T15:35:00Z',
    subsystemHealth: {
      power: 0.85,
      communication: 0.92,
      control: 0.78,
      protection: 0.88
    },
    metrics: {
      uptime: 0.9985,
      availability: 0.9920,
      efficiency: 0.89,
      loadFactor: 0.92
    }
  },

  critical: {
    overall: 'CRITICAL' as const,
    redundancyLevel: 0.45,
    criticalAlerts: 5,
    warningAlerts: 15,
    infoAlerts: 8,
    lastUpdate: '2024-03-01T15:40:00Z',
    subsystemHealth: {
      power: 0.45,
      communication: 0.67,
      control: 0.52,
      protection: 0.71
    },
    metrics: {
      uptime: 0.9892,
      availability: 0.9650,
      efficiency: 0.76,
      loadFactor: 0.65
    }
  }
}

/**
 * Test scenarios
 */
export const testScenarios = {
  // Normal operation scenario
  normalOperation: {
    substations: [
      substationFixtures.activeSubstation,
      substationFixtures.backupSubstation
    ],
    lines: [
      lineFixtures.activeLine,
      lineFixtures.backupLine
    ],
    redundancyPairs: [
      redundancyPairFixtures.activePair
    ],
    systemHealth: systemHealthFixtures.healthy
  },

  // Maintenance scenario
  maintenanceScenario: {
    substations: [
      substationFixtures.activeSubstation,
      substationFixtures.maintenanceSubstation,
      substationFixtures.backupSubstation
    ],
    lines: [
      lineFixtures.activeLine,
      { ...lineFixtures.backupLine, status: 'ACTIVE' as const, powerFlow: 300 }
    ],
    redundancyPairs: [
      { ...redundancyPairFixtures.activePair, status: 'ACTIVE' as const }
    ],
    systemHealth: systemHealthFixtures.degraded
  },

  // Emergency scenario
  emergencyScenario: {
    substations: [
      substationFixtures.faultedSubstation,
      { ...substationFixtures.backupSubstation, status: 'ACTIVE' as const, currentLoad: 600 }
    ],
    lines: [
      lineFixtures.faultedLine,
      lineFixtures.overloadedLine,
      { ...lineFixtures.backupLine, status: 'ACTIVE' as const, powerFlow: 750 }
    ],
    redundancyPairs: [
      redundancyPairFixtures.faultedPair,
      { ...redundancyPairFixtures.activePair, status: 'ACTIVE' as const }
    ],
    systemHealth: systemHealthFixtures.critical
  },

  // Load testing scenario
  loadTestingScenario: {
    substations: Array.from({ length: 20 }, (_, i) => ({
      ...substationFixtures.activeSubstation,
      id: `sub-load-${i.toString().padStart(3, '0')}`,
      name: `Load Test Station ${i + 1}`,
      position: { 
        x: (i % 5) * 200 + 100, 
        y: Math.floor(i / 5) * 150 + 100 
      }
    })),
    lines: Array.from({ length: 40 }, (_, i) => ({
      ...lineFixtures.activeLine,
      id: `line-load-${i.toString().padStart(3, '0')}`,
      name: `Load Test Line ${i + 1}`,
      powerFlow: Math.random() * 600 + 100
    })),
    redundancyPairs: Array.from({ length: 10 }, (_, i) => ({
      ...redundancyPairFixtures.activePair,
      id: `pair-load-${i.toString().padStart(3, '0')}`,
      primary: `sub-load-${(i * 2).toString().padStart(3, '0')}`,
      backup: `sub-load-${(i * 2 + 1).toString().padStart(3, '0')}`
    })),
    systemHealth: systemHealthFixtures.healthy
  }
}

/**
 * Animation test fixtures
 */
export const animationFixtures = {
  powerFlowAnimation: {
    duration: 2000,
    particles: [
      { id: 'p1', position: { x: 0, y: 0 }, velocity: { x: 50, y: 0 }, size: 4 },
      { id: 'p2', position: { x: 0, y: 0 }, velocity: { x: 45, y: 5 }, size: 3 },
      { id: 'p3', position: { x: 0, y: 0 }, velocity: { x: 55, y: -2 }, size: 5 }
    ],
    path: lineFixtures.activeLine.path,
    flowRate: 1.0
  },

  substationPulseAnimation: {
    duration: 1000,
    pulseRadius: [10, 20, 30],
    pulseOpacity: [1.0, 0.7, 0.0],
    color: '#28a745',
    timing: 'ease-out'
  },

  lineHighlightAnimation: {
    duration: 500,
    strokeWidth: [2, 4, 2],
    strokeOpacity: [0.5, 1.0, 0.5],
    strokeDasharray: ['5,5', '10,10', '5,5'],
    color: '#ffc107'
  }
}

/**
 * Error test fixtures
 */
export const errorFixtures = {
  networkError: {
    name: 'NetworkError',
    message: 'Failed to fetch redundancy data',
    code: 'NETWORK_ERROR',
    timestamp: '2024-03-01T15:45:00Z',
    retryable: true,
    retryCount: 3
  },

  validationError: {
    name: 'ValidationError',
    message: 'Invalid substation configuration',
    code: 'VALIDATION_ERROR',
    timestamp: '2024-03-01T15:46:00Z',
    retryable: false,
    details: {
      field: 'powerRating',
      value: -500,
      constraint: 'must be positive'
    }
  },

  componentError: {
    name: 'ComponentError',
    message: 'RedundancyOverlay failed to render',
    code: 'COMPONENT_ERROR',
    timestamp: '2024-03-01T15:47:00Z',
    retryable: true,
    componentStack: 'RedundancyOverlay > InfoPanel > StatsDisplay'
  }
}

export default {
  substationFixtures,
  lineFixtures,
  redundancyPairFixtures,
  systemHealthFixtures,
  testScenarios,
  animationFixtures,
  errorFixtures
}