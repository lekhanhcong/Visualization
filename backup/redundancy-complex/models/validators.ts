/**
 * Data Model Validators
 * Validation functions for redundancy data models
 */

import {
  SubstationModel,
  LineModel,
  RedundancyPairModel,
  SystemHealthModel,
  AlertModel,
  PowerFlowAnimationModel,
  RedundancyConfigModel,
  EntityStatus,
  Priority,
  Coordinates
} from './interfaces'

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string
  message: string
  code: string
  value?: any
}

/**
 * Validation warning interface
 */
export interface ValidationWarning {
  field: string
  message: string
  code: string
  value?: any
}

/**
 * Base validator class
 */
export abstract class BaseValidator<T> {
  protected errors: ValidationError[] = []
  protected warnings: ValidationWarning[] = []

  abstract validate(data: T): ValidationResult

  protected addError(field: string, message: string, code: string, value?: any): void {
    this.errors.push({ field, message, code, value })
  }

  protected addWarning(field: string, message: string, code: string, value?: any): void {
    this.warnings.push({ field, message, code, value })
  }

  protected reset(): void {
    this.errors = []
    this.warnings = []
  }

  protected getResult(): ValidationResult {
    return {
      valid: this.errors.length === 0,
      errors: [...this.errors],
      warnings: [...this.warnings]
    }
  }

  protected isRequired(value: any, field: string): boolean {
    if (value === null || value === undefined || value === '') {
      this.addError(field, `${field} is required`, 'REQUIRED', value)
      return false
    }
    return true
  }

  protected isString(value: any, field: string, required = true): boolean {
    if (!required && (value === null || value === undefined)) return true
    if (!this.isRequired(value, field) && required) return false
    
    if (typeof value !== 'string') {
      this.addError(field, `${field} must be a string`, 'TYPE_STRING', value)
      return false
    }
    return true
  }

  protected isNumber(value: any, field: string, required = true): boolean {
    if (!required && (value === null || value === undefined)) return true
    if (!this.isRequired(value, field) && required) return false
    
    if (typeof value !== 'number' || isNaN(value)) {
      this.addError(field, `${field} must be a valid number`, 'TYPE_NUMBER', value)
      return false
    }
    return true
  }

  protected isPositiveNumber(value: any, field: string, required = true): boolean {
    if (!this.isNumber(value, field, required)) return false
    if (value < 0) {
      this.addError(field, `${field} must be positive`, 'POSITIVE_NUMBER', value)
      return false
    }
    return true
  }

  protected isRange(value: number, field: string, min: number, max: number): boolean {
    if (value < min || value > max) {
      this.addError(field, `${field} must be between ${min} and ${max}`, 'RANGE', value)
      return false
    }
    return true
  }

  protected isEnum<T>(value: any, field: string, enumObject: any): boolean {
    const enumValues = Object.values(enumObject)
    if (!enumValues.includes(value)) {
      this.addError(field, `${field} must be one of: ${enumValues.join(', ')}`, 'ENUM', value)
      return false
    }
    return true
  }

  protected isArray(value: any, field: string, required = true): boolean {
    if (!required && (value === null || value === undefined)) return true
    if (!this.isRequired(value, field) && required) return false
    
    if (!Array.isArray(value)) {
      this.addError(field, `${field} must be an array`, 'TYPE_ARRAY', value)
      return false
    }
    return true
  }

  protected isDate(value: any, field: string, required = true): boolean {
    if (!required && (value === null || value === undefined)) return true
    if (!this.isRequired(value, field) && required) return false
    
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      this.addError(field, `${field} must be a valid date`, 'TYPE_DATE', value)
      return false
    }
    return true
  }

  protected isCoordinates(value: any, field: string): boolean {
    if (!this.isRequired(value, field)) return false
    
    if (typeof value !== 'object' || value === null) {
      this.addError(field, `${field} must be a coordinates object`, 'TYPE_COORDINATES', value)
      return false
    }
    
    if (!this.isNumber(value.x, `${field}.x`)) return false
    if (!this.isNumber(value.y, `${field}.y`)) return false
    
    return true
  }
}

/**
 * Substation model validator
 */
export class SubstationValidator extends BaseValidator<SubstationModel> {
  validate(data: SubstationModel): ValidationResult {
    this.reset()

    // Basic properties
    this.isString(data.id, 'id')
    this.isString(data.name, 'name')
    this.isEnum(data.type, 'type', { PRIMARY: 'PRIMARY', BACKUP: 'BACKUP', AUXILIARY: 'AUXILIARY', DISTRIBUTION: 'DISTRIBUTION' })
    this.isEnum(data.status, 'status', EntityStatus)
    this.isString(data.zone, 'zone')

    // Position
    this.isCoordinates(data.position, 'position')

    // Electrical properties
    this.isPositiveNumber(data.powerRating, 'powerRating')
    this.isPositiveNumber(data.currentLoad, 'currentLoad')
    this.isPositiveNumber(data.voltage, 'voltage')
    this.isPositiveNumber(data.frequency, 'frequency')

    // Validate current load doesn't exceed power rating
    if (data.currentLoad && data.powerRating && data.currentLoad > data.powerRating) {
      this.addWarning('currentLoad', 'Current load exceeds power rating', 'LOAD_EXCEEDS_RATING', data.currentLoad)
    }

    // Power factor and efficiency validation
    if (this.isNumber(data.powerFactor, 'powerFactor')) {
      this.isRange(data.powerFactor, 'powerFactor', 0, 1)
    }
    if (this.isNumber(data.efficiency, 'efficiency')) {
      this.isRange(data.efficiency, 'efficiency', 0, 1)
    }

    // Redundancy configuration
    this.isString(data.redundancyGroup, 'redundancyGroup')
    this.isEnum(data.redundancyLevel, 'redundancyLevel', { N: 'N', 'N+1': 'N+1', '2N': '2N', '2N+1': '2N+1' })

    // Operational data
    this.isNumber(data.temperature, 'temperature')
    this.isPositiveNumber(data.operationalHours, 'operationalHours')

    if (this.isNumber(data.reliability, 'reliability')) {
      this.isRange(data.reliability, 'reliability', 0, 1)
    }
    if (this.isNumber(data.availability, 'availability')) {
      this.isRange(data.availability, 'availability', 0, 1)
    }

    // Temperature warnings
    if (data.temperature > 80) {
      this.addWarning('temperature', 'Temperature is above normal operating range', 'HIGH_TEMPERATURE', data.temperature)
    }

    // Connections
    this.isArray(data.connections, 'connections')

    // Date validation
    this.isDate(data.createdAt, 'createdAt')
    this.isDate(data.updatedAt, 'updatedAt')

    return this.getResult()
  }
}

/**
 * Line model validator
 */
export class LineValidator extends BaseValidator<LineModel> {
  validate(data: LineModel): ValidationResult {
    this.reset()

    // Basic properties
    this.isString(data.id, 'id')
    this.isString(data.name, 'name')
    this.isEnum(data.status, 'status', EntityStatus)
    this.isEnum(data.type, 'type', { TRANSMISSION: 'TRANSMISSION', DISTRIBUTION: 'DISTRIBUTION', INTERCONNECTION: 'INTERCONNECTION' })

    // Physical properties
    if (this.isArray(data.path, 'path')) {
      data.path.forEach((coord, index) => {
        this.isCoordinates(coord, `path[${index}]`)
      })
    }

    this.isPositiveNumber(data.length, 'length')
    this.isPositiveNumber(data.voltage, 'voltage')
    this.isPositiveNumber(data.capacity, 'capacity')

    // Electrical properties
    this.isNumber(data.powerFlow, 'powerFlow') // Can be negative for reverse flow
    this.isPositiveNumber(data.current, 'current')

    // Validate power flow doesn't exceed capacity
    if (data.powerFlow && data.capacity && Math.abs(data.powerFlow) > data.capacity) {
      this.addWarning('powerFlow', 'Power flow exceeds line capacity', 'FLOW_EXCEEDS_CAPACITY', data.powerFlow)
    }

    // Impedance validation
    if (data.impedance) {
      this.isPositiveNumber(data.impedance.resistance, 'impedance.resistance')
      this.isPositiveNumber(data.impedance.reactance, 'impedance.reactance')
    }

    // Operational data
    this.isNumber(data.temperature, 'temperature')
    if (this.isNumber(data.loadFactor, 'loadFactor')) {
      this.isRange(data.loadFactor, 'loadFactor', 0, 1)
    }
    if (this.isNumber(data.efficiency, 'efficiency')) {
      this.isRange(data.efficiency, 'efficiency', 0, 1)
    }

    // Connection points
    this.isString(data.fromSubstation, 'fromSubstation')
    this.isString(data.toSubstation, 'toSubstation')

    // Validate substations are different
    if (data.fromSubstation === data.toSubstation) {
      this.addError('toSubstation', 'From and to substations cannot be the same', 'SAME_SUBSTATIONS', data.toSubstation)
    }

    // Temperature warnings
    if (data.temperature > 85) {
      this.addWarning('temperature', 'Line temperature is above safe operating range', 'HIGH_TEMPERATURE', data.temperature)
    }

    // Date validation
    this.isDate(data.createdAt, 'createdAt')
    this.isDate(data.updatedAt, 'updatedAt')

    return this.getResult()
  }
}

/**
 * Redundancy pair validator
 */
export class RedundancyPairValidator extends BaseValidator<RedundancyPairModel> {
  validate(data: RedundancyPairModel): ValidationResult {
    this.reset()

    // Basic properties
    this.isString(data.id, 'id')
    this.isString(data.name, 'name')

    // Pair configuration
    this.isString(data.primarySubstation, 'primarySubstation')
    this.isString(data.backupSubstation, 'backupSubstation')
    this.isEnum(data.redundancyType, 'redundancyType', { 'N+1': 'N+1', '2N': '2N', '2N+1': '2N+1' })

    // Validate different substations
    if (data.primarySubstation === data.backupSubstation) {
      this.addError('backupSubstation', 'Primary and backup substations cannot be the same', 'SAME_SUBSTATIONS', data.backupSubstation)
    }

    // Current state
    this.isEnum(data.status, 'status', { NORMAL: 'NORMAL', DEGRADED: 'DEGRADED', FAILED: 'FAILED', MAINTENANCE: 'MAINTENANCE' })
    this.isString(data.activeStation, 'activeStation')

    // Validate active station is one of the pair
    if (data.activeStation && data.activeStation !== data.primarySubstation && data.activeStation !== data.backupSubstation) {
      this.addError('activeStation', 'Active station must be either primary or backup substation', 'INVALID_ACTIVE_STATION', data.activeStation)
    }

    // Switching configuration
    if (typeof data.automaticSwitching === 'boolean') {
      // Valid boolean
    } else {
      this.addError('automaticSwitching', 'automaticSwitching must be a boolean', 'TYPE_BOOLEAN', data.automaticSwitching)
    }

    this.isPositiveNumber(data.switchingTime, 'switchingTime')

    // Performance metrics
    if (this.isNumber(data.reliability, 'reliability')) {
      this.isRange(data.reliability, 'reliability', 0, 1)
    }
    if (this.isNumber(data.availability, 'availability')) {
      this.isRange(data.availability, 'availability', 0, 1)
    }
    if (this.isNumber(data.switchingSuccess, 'switchingSuccess')) {
      this.isRange(data.switchingSuccess, 'switchingSuccess', 0, 1)
    }

    // Associated lines
    this.isArray(data.primaryLines, 'primaryLines')
    this.isArray(data.backupLines, 'backupLines')

    // Switching conditions
    if (this.isArray(data.switchingConditions, 'switchingConditions')) {
      data.switchingConditions.forEach((condition, index) => {
        this.isString(condition.id, `switchingConditions[${index}].id`)
        this.isEnum(condition.type, `switchingConditions[${index}].type`, 
          { POWER_THRESHOLD: 'POWER_THRESHOLD', FAULT_DETECTION: 'FAULT_DETECTION', MANUAL_TRIGGER: 'MANUAL_TRIGGER', SCHEDULED: 'SCHEDULED' })
        this.isString(condition.condition, `switchingConditions[${index}].condition`)
        this.isEnum(condition.priority, `switchingConditions[${index}].priority`, Priority)
      })
    }

    // Date validation
    this.isDate(data.createdAt, 'createdAt')
    this.isDate(data.updatedAt, 'updatedAt')

    return this.getResult()
  }
}

/**
 * System health validator
 */
export class SystemHealthValidator extends BaseValidator<SystemHealthModel> {
  validate(data: SystemHealthModel): ValidationResult {
    this.reset()

    // Overall system status
    this.isEnum(data.overall, 'overall', { HEALTHY: 'HEALTHY', DEGRADED: 'DEGRADED', CRITICAL: 'CRITICAL', FAILED: 'FAILED' })
    this.isDate(data.timestamp, 'timestamp')

    // Redundancy metrics
    if (this.isNumber(data.redundancyLevel, 'redundancyLevel')) {
      this.isRange(data.redundancyLevel, 'redundancyLevel', 0, 1)
    }
    this.isEnum(data.redundancyStatus, 'redundancyStatus', { FULL: 'FULL', PARTIAL: 'PARTIAL', MINIMAL: 'MINIMAL', NONE: 'NONE' })

    // Alert counters
    this.isPositiveNumber(data.criticalAlerts, 'criticalAlerts')
    this.isPositiveNumber(data.warningAlerts, 'warningAlerts')
    this.isPositiveNumber(data.infoAlerts, 'infoAlerts')

    // Subsystem health
    if (data.subsystemHealth) {
      const subsystems = ['power', 'communication', 'control', 'protection', 'cooling', 'monitoring']
      subsystems.forEach(subsystem => {
        if (this.isNumber(data.subsystemHealth[subsystem], `subsystemHealth.${subsystem}`)) {
          this.isRange(data.subsystemHealth[subsystem], `subsystemHealth.${subsystem}`, 0, 1)
        }
      })
    }

    // Capacity metrics
    this.isPositiveNumber(data.totalCapacity, 'totalCapacity')
    this.isPositiveNumber(data.currentLoad, 'currentLoad')
    this.isPositiveNumber(data.peakLoad, 'peakLoad')
    this.isPositiveNumber(data.averageLoad, 'averageLoad')

    // Validate load relationships
    if (data.currentLoad && data.totalCapacity && data.currentLoad > data.totalCapacity) {
      this.addWarning('currentLoad', 'Current load exceeds total capacity', 'LOAD_EXCEEDS_CAPACITY', data.currentLoad)
    }

    // Availability metrics
    if (this.isNumber(data.systemAvailability, 'systemAvailability')) {
      this.isRange(data.systemAvailability, 'systemAvailability', 0, 1)
    }
    this.isPositiveNumber(data.mtbf, 'mtbf')
    this.isPositiveNumber(data.mttr, 'mttr')

    return this.getResult()
  }
}

/**
 * Alert validator
 */
export class AlertValidator extends BaseValidator<AlertModel> {
  validate(data: AlertModel): ValidationResult {
    this.reset()

    // Basic properties
    this.isString(data.id, 'id')
    this.isString(data.name, 'name')

    // Alert classification
    this.isEnum(data.type, 'type', { FAULT: 'FAULT', WARNING: 'WARNING', INFO: 'INFO', MAINTENANCE: 'MAINTENANCE' })
    this.isEnum(data.severity, 'severity', Priority)
    this.isEnum(data.status, 'status', { ACTIVE: 'ACTIVE', ACKNOWLEDGED: 'ACKNOWLEDGED', RESOLVED: 'RESOLVED' })

    // Alert content
    this.isString(data.title, 'title')
    this.isString(data.message, 'message')
    this.isString(data.source, 'source')
    this.isString(data.category, 'category')

    // Conditions
    this.isString(data.condition, 'condition')

    // Timing
    this.isDate(data.triggeredAt, 'triggeredAt')

    // Escalation level
    this.isPositiveNumber(data.escalationLevel, 'escalationLevel')

    // Date validation
    this.isDate(data.createdAt, 'createdAt')
    this.isDate(data.updatedAt, 'updatedAt')

    return this.getResult()
  }
}

/**
 * Power flow animation validator
 */
export class PowerFlowAnimationValidator extends BaseValidator<PowerFlowAnimationModel> {
  validate(data: PowerFlowAnimationModel): ValidationResult {
    this.reset()

    // Animation identification
    this.isString(data.id, 'id')
    this.isString(data.lineId, 'lineId')

    // Flow properties
    this.isEnum(data.direction, 'direction', { FORWARD: 'FORWARD', REVERSE: 'REVERSE', BIDIRECTIONAL: 'BIDIRECTIONAL' })
    if (this.isNumber(data.intensity, 'intensity')) {
      this.isRange(data.intensity, 'intensity', 0, 1)
    }
    this.isPositiveNumber(data.speed, 'speed')

    // Visual properties
    this.isString(data.color, 'color')
    this.isPositiveNumber(data.strokeWidth, 'strokeWidth')

    // Animation control
    if (typeof data.enabled !== 'boolean') {
      this.addError('enabled', 'enabled must be a boolean', 'TYPE_BOOLEAN', data.enabled)
    }
    this.isPositiveNumber(data.duration, 'duration')
    this.isPositiveNumber(data.delay, 'delay')

    // State
    if (this.isNumber(data.currentPosition, 'currentPosition')) {
      this.isRange(data.currentPosition, 'currentPosition', 0, 1)
    }
    if (typeof data.isPlaying !== 'boolean') {
      this.addError('isPlaying', 'isPlaying must be a boolean', 'TYPE_BOOLEAN', data.isPlaying)
    }

    return this.getResult()
  }
}

/**
 * Redundancy configuration validator
 */
export class RedundancyConfigValidator extends BaseValidator<RedundancyConfigModel> {
  validate(data: RedundancyConfigModel): ValidationResult {
    this.reset()

    // Basic properties
    this.isString(data.id, 'id')
    this.isString(data.name, 'name')

    // System configuration
    this.isEnum(data.redundancyStrategy, 'redundancyStrategy', { 'N+1': 'N+1', '2N': '2N', '2N+1': '2N+1', CUSTOM: 'CUSTOM' })
    if (typeof data.automaticSwitching !== 'boolean') {
      this.addError('automaticSwitching', 'automaticSwitching must be a boolean', 'TYPE_BOOLEAN', data.automaticSwitching)
    }
    this.isPositiveNumber(data.switchingDelay, 'switchingDelay')

    // Thresholds validation
    if (data.thresholds) {
      this.isPositiveNumber(data.thresholds.powerOverload, 'thresholds.powerOverload')
      this.isPositiveNumber(data.thresholds.voltageDeviation, 'thresholds.voltageDeviation')
      this.isPositiveNumber(data.thresholds.frequencyDeviation, 'thresholds.frequencyDeviation')
      this.isNumber(data.thresholds.temperatureLimit, 'thresholds.temperatureLimit')
    }

    // Monitoring intervals validation
    if (data.monitoringIntervals) {
      this.isPositiveNumber(data.monitoringIntervals.realtime, 'monitoringIntervals.realtime')
      this.isPositiveNumber(data.monitoringIntervals.status, 'monitoringIntervals.status')
      this.isPositiveNumber(data.monitoringIntervals.health, 'monitoringIntervals.health')
      this.isPositiveNumber(data.monitoringIntervals.alerts, 'monitoringIntervals.alerts')
    }

    // Date validation
    this.isDate(data.createdAt, 'createdAt')
    this.isDate(data.updatedAt, 'updatedAt')

    return this.getResult()
  }
}

/**
 * Convenience functions for common validations
 */
export const validators = {
  substation: new SubstationValidator(),
  line: new LineValidator(),
  redundancyPair: new RedundancyPairValidator(),
  systemHealth: new SystemHealthValidator(),
  alert: new AlertValidator(),
  powerFlowAnimation: new PowerFlowAnimationValidator(),
  redundancyConfig: new RedundancyConfigValidator()
}

/**
 * Validate multiple models at once
 */
export function validateMultiple(validations: Array<{ validator: BaseValidator<any>, data: any }>): ValidationResult {
  const allErrors: ValidationError[] = []
  const allWarnings: ValidationWarning[] = []

  for (const { validator, data } of validations) {
    const result = validator.validate(data)
    allErrors.push(...result.errors)
    allWarnings.push(...result.warnings)
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  }
}

/**
 * Create validation report
 */
export function createValidationReport(result: ValidationResult): string {
  const lines: string[] = []
  
  lines.push(`Validation Report`)
  lines.push(`================`)
  lines.push(`Status: ${result.valid ? 'VALID' : 'INVALID'}`)
  lines.push(`Errors: ${result.errors.length}`)
  lines.push(`Warnings: ${result.warnings.length}`)
  lines.push('')

  if (result.errors.length > 0) {
    lines.push('Errors:')
    lines.push('-------')
    result.errors.forEach(error => {
      lines.push(`  ${error.field}: ${error.message} (${error.code})`)
    })
    lines.push('')
  }

  if (result.warnings.length > 0) {
    lines.push('Warnings:')
    lines.push('---------')
    result.warnings.forEach(warning => {
      lines.push(`  ${warning.field}: ${warning.message} (${warning.code})`)
    })
    lines.push('')
  }

  return lines.join('\n')
}