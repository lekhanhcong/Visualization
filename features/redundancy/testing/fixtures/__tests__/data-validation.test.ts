/**
 * Data Validation Tests
 * Tests for test data fixtures validation
 */

import {
  smallDataset,
  mediumDataset,
  largeDataset,
  edgeCaseDataset,
  animationDataset,
  generateCustomDataset
} from '../mock-datasets'

import {
  validateDataset,
  isValidDataset,
  getValidationReport,
  validateSubstation,
  validateLine,
  validateRedundancyPair,
  validateSystemHealth
} from '../data-validator'

import {
  SubstationStatus,
  LineStatus,
  RedundancyLevel,
  SystemHealthStatus
} from '../data-schemas'

describe('Data Validation', () => {
  describe('Dataset Validation', () => {
    test('should validate small dataset successfully', () => {
      const result = validateDataset(smallDataset)
      
      expect(result.valid).toBe(true)
      expect(result.summary.totalErrors).toBe(0)
      expect(result.summary.criticalErrors).toBe(0)
      
      console.log('Small dataset validation:', {
        substations: smallDataset.substations.length,
        lines: smallDataset.lines.length,
        pairs: smallDataset.redundancyPairs.length
      })
    })

    test('should validate medium dataset with expected warnings', () => {
      const result = validateDataset(mediumDataset)
      
      expect(result.valid).toBe(true)
      expect(result.summary.totalErrors).toBe(0)
      
      // Should have some warnings for degraded/failed states
      expect(result.summary.totalWarnings).toBeGreaterThan(0)
      
      console.log('Medium dataset validation:', {
        substations: mediumDataset.substations.length,
        lines: mediumDataset.lines.length,
        warnings: result.summary.totalWarnings
      })
    })

    test('should validate large dataset successfully', () => {
      const result = validateDataset(largeDataset)
      
      expect(result.valid).toBe(true)
      expect(result.summary.totalErrors).toBe(0)
      
      console.log('Large dataset validation:', {
        substations: largeDataset.substations.length,
        lines: largeDataset.lines.length,
        pairs: largeDataset.redundancyPairs.length,
        warnings: result.summary.totalWarnings
      })
    })

    test('should detect issues in edge case dataset', () => {
      const result = validateDataset(edgeCaseDataset)
      
      // Edge case dataset has intentional issues
      expect(result.summary.totalWarnings).toBeGreaterThan(0)
      
      // Should flag overloaded substation
      const overloadWarnings = result.warnings.filter(w => 
        w.message.includes('exceeds power rating')
      )
      expect(overloadWarnings.length).toBeGreaterThan(0)
      
      // Should flag overloaded line
      const lineOverloadWarnings = result.warnings.filter(w => 
        w.message.includes('overloaded at')
      )
      expect(lineOverloadWarnings.length).toBeGreaterThan(0)
      
      console.log('Edge case dataset validation:', {
        warnings: result.summary.totalWarnings,
        report: getValidationReport(result)
      })
    })

    test('should validate animation dataset', () => {
      const result = validateDataset(animationDataset)
      
      if (!result.valid) {
        console.log('Animation dataset validation errors:', result.errors)
        console.log('Animation dataset validation warnings:', result.warnings)
      }
      
      // Animation dataset may have some warnings but should be valid
      expect(result.summary.criticalErrors).toBe(0)
      
      console.log('Animation dataset validation:', {
        valid: result.valid,
        errors: result.summary.totalErrors,
        warnings: result.summary.totalWarnings,
        hasAnimations: !!animationDataset.animations
      })
    })

    test('should validate generated custom dataset', () => {
      const customDataset = generateCustomDataset(10, 15, 5)
      const result = validateDataset(customDataset)
      
      expect(result.valid).toBe(true)
      expect(result.summary.totalErrors).toBe(0)
      
      expect(customDataset.substations).toHaveLength(10)
      expect(customDataset.lines).toHaveLength(15)
      expect(customDataset.redundancyPairs).toHaveLength(5)
    })
  })

  describe('Individual Component Validation', () => {
    test('should validate valid substation', () => {
      const validSubstation = {
        id: 'sub-test-001',
        name: 'Test Substation',
        status: SubstationStatus.ACTIVE,
        redundancyGroup: 'test-group',
        redundancyLevel: RedundancyLevel.N_PLUS_1,
        position: { x: 100, y: 200 },
        powerRating: 500,
        currentLoad: 300,
        voltage: 230,
        frequency: 60,
        connections: ['line-001']
      }
      
      const errors = validateSubstation(validSubstation, 0)
      expect(errors.filter(e => e.severity === 'error')).toHaveLength(0)
    })

    test('should detect invalid substation', () => {
      const invalidSubstation = {
        id: '',
        name: '',
        status: 'INVALID_STATUS' as any,
        redundancyGroup: 'test-group',
        redundancyLevel: 'INVALID_LEVEL' as any,
        position: { x: -100, y: -200 },
        powerRating: -500,
        currentLoad: 600,
        voltage: 999,
        connections: []
      }
      
      const errors = validateSubstation(invalidSubstation, 0)
      const errorMessages = errors.filter(e => e.severity === 'error')
      
      expect(errorMessages.length).toBeGreaterThan(0)
      expect(errors.some(e => e.message.includes('ID is required'))).toBe(true)
      expect(errors.some(e => e.message.includes('Invalid status'))).toBe(true)
      expect(errors.some(e => e.message.includes('must be positive'))).toBe(true)
    })

    test('should validate valid line', () => {
      const validLine = {
        id: 'line-test-001',
        name: 'Test Line',
        status: LineStatus.ACTIVE,
        redundancyType: RedundancyLevel.N_PLUS_1,
        path: [
          { x: 100, y: 100 },
          { x: 200, y: 200 }
        ],
        voltage: 230,
        capacity: 600,
        powerFlow: 400,
        impedance: { resistance: 0.05, reactance: 0.35 }
      }
      
      const errors = validateLine(validLine, 0)
      expect(errors.filter(e => e.severity === 'error')).toHaveLength(0)
    })

    test('should detect overloaded line', () => {
      const overloadedLine = {
        id: 'line-overload',
        name: 'Overloaded Line',
        status: LineStatus.ACTIVE, // Not marked as OVERLOAD
        redundancyType: RedundancyLevel.N,
        path: [
          { x: 0, y: 0 },
          { x: 100, y: 100 }
        ],
        voltage: 115,
        capacity: 300,
        powerFlow: 450, // 150% capacity
        impedance: { resistance: 0.1, reactance: 0.4 }
      }
      
      const errors = validateLine(overloadedLine, 0)
      const overloadError = errors.find(e => e.message.includes('overloaded'))
      
      expect(overloadError).toBeDefined()
      expect(overloadError?.severity).toBe('error')
    })

    test('should validate valid redundancy pair', () => {
      const validPair = {
        id: 'pair-test-001',
        primary: 'sub-001',
        backup: 'sub-002',
        redundancyLevel: RedundancyLevel.N_PLUS_1,
        status: 'READY' as const,
        switchoverTime: 50,
        switchoverCount: 5,
        healthScore: 0.95
      }
      
      const errors = validateRedundancyPair(validPair, 0)
      expect(errors.filter(e => e.severity === 'error')).toHaveLength(0)
    })

    test('should detect invalid redundancy pair', () => {
      const invalidPair = {
        id: 'pair-invalid',
        primary: 'sub-001',
        backup: 'sub-001', // Same as primary!
        redundancyLevel: RedundancyLevel.N,
        status: 'INVALID' as any,
        switchoverTime: -100,
        switchoverCount: 0,
        healthScore: 2.0 // Invalid score
      }
      
      const errors = validateRedundancyPair(invalidPair, 0)
      
      expect(errors.some(e => e.message.includes('cannot be the same'))).toBe(true)
      expect(errors.some(e => e.message.includes('Invalid status'))).toBe(true)
      expect(errors.some(e => e.message.includes('cannot be negative'))).toBe(true)
      expect(errors.some(e => e.message.includes('between 0 and 1'))).toBe(true)
    })

    test('should validate valid system health', () => {
      const validHealth = {
        overall: SystemHealthStatus.HEALTHY,
        timestamp: new Date().toISOString(),
        redundancyLevel: 0.95,
        criticalAlerts: 0,
        warningAlerts: 2,
        infoAlerts: 5,
        subsystemHealth: {
          power: 0.98,
          communication: 0.96,
          control: 0.95,
          protection: 0.99
        },
        metrics: {
          uptime: 0.9999,
          availability: 0.9995,
          efficiency: 0.94,
          loadFactor: 0.72
        },
        lastUpdate: new Date().toISOString()
      }
      
      const errors = validateSystemHealth(validHealth)
      expect(errors.filter(e => e.severity === 'error')).toHaveLength(0)
    })

    test('should detect inconsistent system health', () => {
      const inconsistentHealth = {
        overall: SystemHealthStatus.HEALTHY,
        timestamp: new Date().toISOString(),
        redundancyLevel: 0.95,
        criticalAlerts: 10, // Many critical alerts but HEALTHY?
        warningAlerts: 20,
        infoAlerts: 5,
        subsystemHealth: {
          power: 0.45, // Very low
          communication: 0.40, // Very low
          control: 0.35, // Very low
          protection: 0.50 // Low
        },
        metrics: {
          uptime: 0.9999,
          availability: 0.9995,
          efficiency: 0.94,
          loadFactor: 0.72
        },
        lastUpdate: new Date().toISOString()
      }
      
      const errors = validateSystemHealth(inconsistentHealth)
      const inconsistencyWarning = errors.find(e => 
        e.message.includes('inconsistent with low subsystem health')
      )
      
      expect(inconsistencyWarning).toBeDefined()
      expect(inconsistencyWarning?.severity).toBe('warning')
    })
  })

  describe('Cross-Reference Validation', () => {
    test('should detect missing line references', () => {
      const dataset = {
        version: '1.0.0',
        name: 'Test Dataset',
        createdAt: new Date().toISOString(),
        substations: [{
          id: 'sub-001',
          name: 'Station 1',
          status: SubstationStatus.ACTIVE,
          redundancyGroup: 'group-1',
          redundancyLevel: RedundancyLevel.N_PLUS_1,
          position: { x: 100, y: 100 },
          powerRating: 500,
          currentLoad: 300,
          voltage: 230,
          frequency: 60,
          connections: ['line-missing'] // This line doesn't exist!
        }],
        lines: [],
        redundancyPairs: [],
        systemHealth: {
          overall: SystemHealthStatus.HEALTHY,
          timestamp: new Date().toISOString(),
          redundancyLevel: 0.9,
          criticalAlerts: 0,
          warningAlerts: 0,
          infoAlerts: 0,
          subsystemHealth: {
            power: 0.95,
            communication: 0.95,
            control: 0.95,
            protection: 0.95
          },
          metrics: {
            uptime: 0.999,
            availability: 0.999,
            efficiency: 0.95,
            loadFactor: 0.6
          },
          lastUpdate: new Date().toISOString()
        }
      }
      
      const result = validateDataset(dataset)
      const missingLineError = result.errors.find(e => 
        e.message.includes('Referenced line "line-missing" not found')
      )
      
      expect(missingLineError).toBeDefined()
      expect(result.valid).toBe(false)
    })

    test('should detect missing substation references in pairs', () => {
      const dataset = {
        version: '1.0.0',
        name: 'Test Dataset',
        createdAt: new Date().toISOString(),
        substations: [{
          id: 'sub-001',
          name: 'Station 1',
          status: SubstationStatus.ACTIVE,
          redundancyGroup: 'group-1',
          redundancyLevel: RedundancyLevel.N_PLUS_1,
          position: { x: 100, y: 100 },
          powerRating: 500,
          currentLoad: 300,
          voltage: 230,
          frequency: 60,
          connections: []
        }],
        lines: [],
        redundancyPairs: [{
          id: 'pair-001',
          primary: 'sub-001',
          backup: 'sub-missing', // This substation doesn't exist!
          redundancyLevel: RedundancyLevel.N_PLUS_1,
          status: 'READY' as const,
          switchoverTime: 50,
          switchoverCount: 0,
          healthScore: 0.9
        }],
        systemHealth: {
          overall: SystemHealthStatus.HEALTHY,
          timestamp: new Date().toISOString(),
          redundancyLevel: 0.9,
          criticalAlerts: 0,
          warningAlerts: 0,
          infoAlerts: 0,
          subsystemHealth: {
            power: 0.95,
            communication: 0.95,
            control: 0.95,
            protection: 0.95
          },
          metrics: {
            uptime: 0.999,
            availability: 0.999,
            efficiency: 0.95,
            loadFactor: 0.6
          },
          lastUpdate: new Date().toISOString()
        }
      }
      
      const result = validateDataset(dataset)
      const missingSubstationError = result.errors.find(e => 
        e.message.includes('Referenced backup substation "sub-missing" not found')
      )
      
      expect(missingSubstationError).toBeDefined()
      expect(result.valid).toBe(false)
    })
  })

  describe('Validation Utilities', () => {
    test('should provide quick validation check', () => {
      expect(isValidDataset(smallDataset)).toBe(true)
      expect(isValidDataset(mediumDataset)).toBe(true)
      expect(isValidDataset(largeDataset)).toBe(true)
    })

    test('should generate readable validation report', () => {
      const result = validateDataset(edgeCaseDataset)
      const report = getValidationReport(result)
      
      expect(report).toContain('Data Validation Report')
      expect(report).toContain('Status:')
      expect(report).toContain('Total Errors:')
      expect(report).toContain('Total Warnings:')
      
      console.log('\nSample validation report:\n', report)
    })
  })
})