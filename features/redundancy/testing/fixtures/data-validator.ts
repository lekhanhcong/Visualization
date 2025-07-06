/**
 * Data Validator
 * Validation functions for test data fixtures
 */

import {
  SubstationData,
  LineData,
  RedundancyPairData,
  SystemHealthData,
  TestScenarioData,
  TestDatasetSchema,
  SubstationStatus,
  LineStatus,
  RedundancyLevel,
  SystemHealthStatus,
  Coordinates
} from './data-schemas'

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string
  value: any
  message: string
  severity: 'error' | 'warning' | 'info'
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  summary: {
    totalErrors: number
    totalWarnings: number
    criticalErrors: number
  }
}

/**
 * Coordinate validation
 */
export function validateCoordinates(coords: Coordinates, field: string): ValidationError[] {
  const errors: ValidationError[] = []

  if (coords === null || coords === undefined) {
    errors.push({
      field,
      value: coords,
      message: 'Coordinates are required',
      severity: 'error'
    })
    return errors
  }

  if (typeof coords.x !== 'number' || typeof coords.y !== 'number') {
    errors.push({
      field,
      value: coords,
      message: 'Coordinates x and y must be numbers',
      severity: 'error'
    })
  }

  if (coords.x < 0 || coords.y < 0) {
    errors.push({
      field,
      value: coords,
      message: 'Coordinates cannot be negative',
      severity: 'warning'
    })
  }

  if (coords.x > 10000 || coords.y > 10000) {
    errors.push({
      field,
      value: coords,
      message: 'Coordinates exceed reasonable bounds (10000)',
      severity: 'warning'
    })
  }

  return errors
}

/**
 * Substation validation
 */
export function validateSubstation(substation: SubstationData, index: number): ValidationError[] {
  const errors: ValidationError[] = []
  const prefix = `substations[${index}]`

  // Required fields
  if (!substation.id) {
    errors.push({
      field: `${prefix}.id`,
      value: substation.id,
      message: 'Substation ID is required',
      severity: 'error'
    })
  }

  if (!substation.name) {
    errors.push({
      field: `${prefix}.name`,
      value: substation.name,
      message: 'Substation name is required',
      severity: 'error'
    })
  }

  // Status validation
  if (!Object.values(SubstationStatus).includes(substation.status)) {
    errors.push({
      field: `${prefix}.status`,
      value: substation.status,
      message: `Invalid status. Must be one of: ${Object.values(SubstationStatus).join(', ')}`,
      severity: 'error'
    })
  }

  // Redundancy level validation
  if (!Object.values(RedundancyLevel).includes(substation.redundancyLevel)) {
    errors.push({
      field: `${prefix}.redundancyLevel`,
      value: substation.redundancyLevel,
      message: `Invalid redundancy level. Must be one of: ${Object.values(RedundancyLevel).join(', ')}`,
      severity: 'error'
    })
  }

  // Position validation
  errors.push(...validateCoordinates(substation.position, `${prefix}.position`))

  // Power rating validation
  if (substation.powerRating <= 0) {
    errors.push({
      field: `${prefix}.powerRating`,
      value: substation.powerRating,
      message: 'Power rating must be positive',
      severity: 'error'
    })
  }

  if (substation.powerRating > 10000) {
    errors.push({
      field: `${prefix}.powerRating`,
      value: substation.powerRating,
      message: 'Power rating exceeds reasonable limit (10000 MW)',
      severity: 'warning'
    })
  }

  // Current load validation
  if (substation.currentLoad < 0) {
    errors.push({
      field: `${prefix}.currentLoad`,
      value: substation.currentLoad,
      message: 'Current load cannot be negative',
      severity: 'error'
    })
  }

  if (substation.currentLoad > substation.powerRating) {
    errors.push({
      field: `${prefix}.currentLoad`,
      value: substation.currentLoad,
      message: `Current load (${substation.currentLoad}) exceeds power rating (${substation.powerRating})`,
      severity: 'warning'
    })
  }

  // Voltage validation
  const validVoltages = [0, 115, 230, 345, 500, 765]
  if (!validVoltages.includes(substation.voltage)) {
    errors.push({
      field: `${prefix}.voltage`,
      value: substation.voltage,
      message: `Non-standard voltage. Common values: ${validVoltages.join(', ')} kV`,
      severity: 'info'
    })
  }

  // Efficiency validation
  if (substation.efficiency !== undefined) {
    if (substation.efficiency < 0 || substation.efficiency > 1) {
      errors.push({
        field: `${prefix}.efficiency`,
        value: substation.efficiency,
        message: 'Efficiency must be between 0 and 1',
        severity: 'error'
      })
    }

    if (substation.efficiency < 0.8) {
      errors.push({
        field: `${prefix}.efficiency`,
        value: substation.efficiency,
        message: 'Efficiency below 80% is unusually low',
        severity: 'warning'
      })
    }
  }

  // Temperature validation
  if (substation.temperature !== undefined) {
    if (substation.temperature < -50 || substation.temperature > 150) {
      errors.push({
        field: `${prefix}.temperature`,
        value: substation.temperature,
        message: 'Temperature outside reasonable range (-50°C to 150°C)',
        severity: 'warning'
      })
    }

    if (substation.temperature > 80) {
      errors.push({
        field: `${prefix}.temperature`,
        value: substation.temperature,
        message: 'High temperature warning (>80°C)',
        severity: 'info'
      })
    }
  }

  // Backup validation
  if (substation.status === SubstationStatus.ACTIVE && 
      (!substation.backupSubstations || substation.backupSubstations.length === 0)) {
    errors.push({
      field: `${prefix}.backupSubstations`,
      value: substation.backupSubstations,
      message: 'Active substation should have backup substations defined',
      severity: 'warning'
    })
  }

  return errors
}

/**
 * Line validation
 */
export function validateLine(line: LineData, index: number): ValidationError[] {
  const errors: ValidationError[] = []
  const prefix = `lines[${index}]`

  // Required fields
  if (!line.id) {
    errors.push({
      field: `${prefix}.id`,
      value: line.id,
      message: 'Line ID is required',
      severity: 'error'
    })
  }

  if (!line.name) {
    errors.push({
      field: `${prefix}.name`,
      value: line.name,
      message: 'Line name is required',
      severity: 'error'
    })
  }

  // Status validation
  if (!Object.values(LineStatus).includes(line.status)) {
    errors.push({
      field: `${prefix}.status`,
      value: line.status,
      message: `Invalid status. Must be one of: ${Object.values(LineStatus).join(', ')}`,
      severity: 'error'
    })
  }

  // Path validation
  if (!line.path || line.path.length < 2) {
    errors.push({
      field: `${prefix}.path`,
      value: line.path,
      message: 'Line path must have at least 2 points',
      severity: 'error'
    })
  } else {
    line.path.forEach((point, i) => {
      errors.push(...validateCoordinates(point, `${prefix}.path[${i}]`))
    })
  }

  // Capacity validation
  if (line.capacity <= 0) {
    errors.push({
      field: `${prefix}.capacity`,
      value: line.capacity,
      message: 'Line capacity must be positive',
      severity: 'error'
    })
  }

  // Power flow validation
  if (line.powerFlow < 0) {
    errors.push({
      field: `${prefix}.powerFlow`,
      value: line.powerFlow,
      message: 'Power flow cannot be negative',
      severity: 'error'
    })
  }

  if (line.powerFlow > line.capacity) {
    const overloadPercent = ((line.powerFlow / line.capacity) * 100).toFixed(1)
    errors.push({
      field: `${prefix}.powerFlow`,
      value: line.powerFlow,
      message: `Line overloaded at ${overloadPercent}% capacity`,
      severity: line.status === LineStatus.OVERLOAD ? 'warning' : 'error'
    })
  }

  // Impedance validation
  if (line.impedance) {
    if (line.impedance.resistance < 0 || line.impedance.reactance < 0) {
      errors.push({
        field: `${prefix}.impedance`,
        value: line.impedance,
        message: 'Impedance values cannot be negative',
        severity: 'error'
      })
    }

    if (line.impedance.resistance > 1 || line.impedance.reactance > 1) {
      errors.push({
        field: `${prefix}.impedance`,
        value: line.impedance,
        message: 'Impedance values seem high (>1 Ω/km)',
        severity: 'warning'
      })
    }
  }

  // Thermal rating validation
  if (line.thermalRating && line.thermalRating < line.capacity) {
    errors.push({
      field: `${prefix}.thermalRating`,
      value: line.thermalRating,
      message: 'Thermal rating should not be less than capacity',
      severity: 'warning'
    })
  }

  // Fault validation
  if (line.status === LineStatus.FAULT && !line.faultDetails) {
    errors.push({
      field: `${prefix}.faultDetails`,
      value: line.faultDetails,
      message: 'Faulted line should have fault details',
      severity: 'warning'
    })
  }

  // Overload validation
  if (line.status === LineStatus.OVERLOAD && !line.overloadDetails) {
    errors.push({
      field: `${prefix}.overloadDetails`,
      value: line.overloadDetails,
      message: 'Overloaded line should have overload details',
      severity: 'warning'
    })
  }

  return errors
}

/**
 * Redundancy pair validation
 */
export function validateRedundancyPair(pair: RedundancyPairData, index: number): ValidationError[] {
  const errors: ValidationError[] = []
  const prefix = `redundancyPairs[${index}]`

  // Required fields
  if (!pair.id) {
    errors.push({
      field: `${prefix}.id`,
      value: pair.id,
      message: 'Redundancy pair ID is required',
      severity: 'error'
    })
  }

  if (!pair.primary) {
    errors.push({
      field: `${prefix}.primary`,
      value: pair.primary,
      message: 'Primary substation ID is required',
      severity: 'error'
    })
  }

  if (!pair.backup) {
    errors.push({
      field: `${prefix}.backup`,
      value: pair.backup,
      message: 'Backup substation ID is required',
      severity: 'error'
    })
  }

  if (pair.primary === pair.backup) {
    errors.push({
      field: `${prefix}`,
      value: { primary: pair.primary, backup: pair.backup },
      message: 'Primary and backup cannot be the same substation',
      severity: 'error'
    })
  }

  // Status validation
  const validStatuses = ['READY', 'ACTIVE', 'DEGRADED', 'FAILED', 'MAINTENANCE']
  if (!validStatuses.includes(pair.status)) {
    errors.push({
      field: `${prefix}.status`,
      value: pair.status,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      severity: 'error'
    })
  }

  // Switchover time validation
  if (pair.switchoverTime < 0) {
    errors.push({
      field: `${prefix}.switchoverTime`,
      value: pair.switchoverTime,
      message: 'Switchover time cannot be negative',
      severity: 'error'
    })
  }

  if (pair.switchoverTime > 10000) {
    errors.push({
      field: `${prefix}.switchoverTime`,
      value: pair.switchoverTime,
      message: 'Switchover time exceeds 10 seconds',
      severity: 'warning'
    })
  }

  // Health score validation
  if (pair.healthScore < 0 || pair.healthScore > 1) {
    errors.push({
      field: `${prefix}.healthScore`,
      value: pair.healthScore,
      message: 'Health score must be between 0 and 1',
      severity: 'error'
    })
  }

  if (pair.healthScore < 0.5 && pair.status === 'READY') {
    errors.push({
      field: `${prefix}.healthScore`,
      value: pair.healthScore,
      message: 'Low health score for READY status',
      severity: 'warning'
    })
  }

  // Success rate validation
  if (pair.successRate !== undefined) {
    if (pair.successRate < 0 || pair.successRate > 1) {
      errors.push({
        field: `${prefix}.successRate`,
        value: pair.successRate,
        message: 'Success rate must be between 0 and 1',
        severity: 'error'
      })
    }

    if (pair.successRate < 0.9 && pair.priority === 'HIGH') {
      errors.push({
        field: `${prefix}.successRate`,
        value: pair.successRate,
        message: 'Low success rate for high priority pair',
        severity: 'warning'
      })
    }
  }

  return errors
}

/**
 * System health validation
 */
export function validateSystemHealth(health: SystemHealthData): ValidationError[] {
  const errors: ValidationError[] = []
  const prefix = 'systemHealth'

  // Overall status validation
  if (!Object.values(SystemHealthStatus).includes(health.overall)) {
    errors.push({
      field: `${prefix}.overall`,
      value: health.overall,
      message: `Invalid status. Must be one of: ${Object.values(SystemHealthStatus).join(', ')}`,
      severity: 'error'
    })
  }

  // Redundancy level validation
  if (health.redundancyLevel < 0 || health.redundancyLevel > 1) {
    errors.push({
      field: `${prefix}.redundancyLevel`,
      value: health.redundancyLevel,
      message: 'Redundancy level must be between 0 and 1',
      severity: 'error'
    })
  }

  // Alert validation
  if (health.criticalAlerts < 0 || health.warningAlerts < 0 || health.infoAlerts < 0) {
    errors.push({
      field: `${prefix}.alerts`,
      value: { critical: health.criticalAlerts, warning: health.warningAlerts, info: health.infoAlerts },
      message: 'Alert counts cannot be negative',
      severity: 'error'
    })
  }

  // Subsystem health validation
  Object.entries(health.subsystemHealth).forEach(([system, value]) => {
    if (value < 0 || value > 1) {
      errors.push({
        field: `${prefix}.subsystemHealth.${system}`,
        value: value,
        message: `${system} health must be between 0 and 1`,
        severity: 'error'
      })
    }

    if (value < 0.5) {
      errors.push({
        field: `${prefix}.subsystemHealth.${system}`,
        value: value,
        message: `${system} health is critically low`,
        severity: 'warning'
      })
    }
  })

  // Metrics validation
  Object.entries(health.metrics).forEach(([metric, value]) => {
    if (value < 0 || value > 1) {
      errors.push({
        field: `${prefix}.metrics.${metric}`,
        value: value,
        message: `${metric} must be between 0 and 1`,
        severity: 'error'
      })
    }
  })

  // Overall health consistency check
  const avgSubsystemHealth = Object.values(health.subsystemHealth).reduce((a, b) => a + b, 0) / 
                            Object.values(health.subsystemHealth).length

  if (health.overall === SystemHealthStatus.HEALTHY && avgSubsystemHealth < 0.8) {
    errors.push({
      field: `${prefix}`,
      value: { overall: health.overall, avgSubsystem: avgSubsystemHealth },
      message: 'Overall HEALTHY status inconsistent with low subsystem health',
      severity: 'warning'
    })
  }

  if (health.overall === SystemHealthStatus.CRITICAL && avgSubsystemHealth > 0.7) {
    errors.push({
      field: `${prefix}`,
      value: { overall: health.overall, avgSubsystem: avgSubsystemHealth },
      message: 'Overall CRITICAL status inconsistent with moderate subsystem health',
      severity: 'warning'
    })
  }

  return errors
}

/**
 * Dataset validation
 */
export function validateDataset(dataset: TestDatasetSchema): ValidationResult {
  const errors: ValidationError[] = []

  // Validate metadata
  if (!dataset.version) {
    errors.push({
      field: 'version',
      value: dataset.version,
      message: 'Dataset version is required',
      severity: 'error'
    })
  }

  if (!dataset.name) {
    errors.push({
      field: 'name',
      value: dataset.name,
      message: 'Dataset name is required',
      severity: 'error'
    })
  }

  // Validate substations
  dataset.substations.forEach((substation, i) => {
    errors.push(...validateSubstation(substation, i))
  })

  // Validate lines
  dataset.lines.forEach((line, i) => {
    errors.push(...validateLine(line, i))
  })

  // Validate redundancy pairs
  dataset.redundancyPairs.forEach((pair, i) => {
    errors.push(...validateRedundancyPair(pair, i))
  })

  // Validate system health
  errors.push(...validateSystemHealth(dataset.systemHealth))

  // Cross-validation: Check references
  const substationIds = new Set(dataset.substations.map(s => s.id))
  const lineIds = new Set(dataset.lines.map(l => l.id))

  // Check substation connections reference valid lines
  dataset.substations.forEach((substation, i) => {
    substation.connections.forEach(lineId => {
      if (!lineIds.has(lineId)) {
        errors.push({
          field: `substations[${i}].connections`,
          value: lineId,
          message: `Referenced line "${lineId}" not found in dataset`,
          severity: 'error'
        })
      }
    })

    // Check backup substations reference valid substations
    if (substation.backupSubstations) {
      substation.backupSubstations.forEach(backupId => {
        if (!substationIds.has(backupId)) {
          errors.push({
            field: `substations[${i}].backupSubstations`,
            value: backupId,
            message: `Referenced backup substation "${backupId}" not found in dataset`,
            severity: 'error'
          })
        }
      })
    }
  })

  // Check redundancy pairs reference valid substations
  dataset.redundancyPairs.forEach((pair, i) => {
    if (!substationIds.has(pair.primary)) {
      errors.push({
        field: `redundancyPairs[${i}].primary`,
        value: pair.primary,
        message: `Referenced primary substation "${pair.primary}" not found in dataset`,
        severity: 'error'
      })
    }

    if (!substationIds.has(pair.backup)) {
      errors.push({
        field: `redundancyPairs[${i}].backup`,
        value: pair.backup,
        message: `Referenced backup substation "${pair.backup}" not found in dataset`,
        severity: 'error'
      })
    }
  })

  // Separate errors and warnings
  const actualErrors = errors.filter(e => e.severity === 'error')
  const warnings = errors.filter(e => e.severity === 'warning')
  const criticalErrors = actualErrors.filter(e => 
    e.field.includes('.id') || 
    e.field.includes('.status') ||
    e.field.includes('Not found')
  ).length

  return {
    valid: actualErrors.length === 0,
    errors: actualErrors,
    warnings,
    summary: {
      totalErrors: actualErrors.length,
      totalWarnings: warnings.length,
      criticalErrors
    }
  }
}

/**
 * Quick validation function
 */
export function isValidDataset(dataset: TestDatasetSchema): boolean {
  const result = validateDataset(dataset)
  return result.valid
}

/**
 * Get validation report as string
 */
export function getValidationReport(result: ValidationResult): string {
  const lines: string[] = [
    '=== Data Validation Report ===',
    `Status: ${result.valid ? 'VALID' : 'INVALID'}`,
    `Total Errors: ${result.summary.totalErrors}`,
    `Total Warnings: ${result.summary.totalWarnings}`,
    `Critical Errors: ${result.summary.criticalErrors}`,
    ''
  ]

  if (result.errors.length > 0) {
    lines.push('ERRORS:')
    result.errors.forEach(error => {
      lines.push(`  - ${error.field}: ${error.message} (value: ${JSON.stringify(error.value)})`)
    })
    lines.push('')
  }

  if (result.warnings.length > 0) {
    lines.push('WARNINGS:')
    result.warnings.forEach(warning => {
      lines.push(`  - ${warning.field}: ${warning.message} (value: ${JSON.stringify(warning.value)})`)
    })
  }

  return lines.join('\n')
}

export default {
  validateCoordinates,
  validateSubstation,
  validateLine,
  validateRedundancyPair,
  validateSystemHealth,
  validateDataset,
  isValidDataset,
  getValidationReport
}