# Test Data Fixtures

Comprehensive test data fixtures for the redundancy feature testing.

## Overview

This module provides validated test datasets for all types of testing scenarios:

- **Unit Testing** - Small, focused datasets
- **Integration Testing** - Medium complexity datasets  
- **Performance Testing** - Large datasets for load testing
- **Error Testing** - Edge cases and failure scenarios
- **Animation Testing** - Optimized datasets for visual testing

## Quick Start

```typescript
import { 
  smallDataset, 
  validateDataset, 
  fixtureHelpers 
} from './fixtures'

// Use pre-built dataset
const data = smallDataset

// Validate dataset
const validation = validateDataset(data)
console.log('Valid:', validation.valid)

// Get dataset by size
const dataset = fixtureHelpers.getDataset('medium')

// Generate custom dataset
const custom = fixtureHelpers.createValidatedDataset(10, 20, 5)
```

## Available Datasets

### Small Dataset (Unit Testing)
- **5 substations, 8 lines, 2 redundancy pairs**
- Minimal dataset for quick unit tests
- All components in normal operation
- System health: HEALTHY

```typescript
import { smallDataset } from './fixtures'
```

### Medium Dataset (Integration Testing)  
- **20 substations, 40 lines, 10 redundancy pairs**
- Standard complexity for integration tests
- Mix of operational states (active, standby, maintenance, fault)
- System health: DEGRADED

```typescript
import { mediumDataset } from './fixtures'
```

### Large Dataset (Performance Testing)
- **100 substations, 200 lines, 50 redundancy pairs**
- Extensive dataset for performance and stress testing
- High variety of states and conditions
- System health: DEGRADED

```typescript
import { largeDataset } from './fixtures'
```

### Edge Case Dataset (Error Testing)
- **3 substations, 3 lines, 1 redundancy pair**
- Intentional edge cases and error conditions
- Overloaded components, offline systems, failed redundancy
- System health: CRITICAL

```typescript
import { edgeCaseDataset } from './fixtures'
```

### Animation Dataset (Visual Testing)
- **2 substations, 3 lines, 0 redundancy pairs**
- Optimized for animation and visual testing
- Includes animation configurations
- Simple paths for smooth animations

```typescript
import { animationDataset } from './fixtures'
```

## Data Schema

### Substation Data
```typescript
interface SubstationData {
  id: string
  name: string
  status: 'ACTIVE' | 'STANDBY' | 'MAINTENANCE' | 'FAULT' | 'OFFLINE'
  redundancyLevel: 'N' | 'N+1' | '2N' | '2N+1'
  position: { x: number; y: number }
  powerRating: number // MW
  currentLoad: number // MW
  voltage: number // kV
  connections: string[] // Line IDs
  // ... additional properties
}
```

### Line Data  
```typescript
interface LineData {
  id: string
  name: string
  status: 'ACTIVE' | 'STANDBY' | 'OVERLOAD' | 'FAULT' | 'MAINTENANCE' | 'OFFLINE'
  path: { x: number; y: number }[]
  voltage: number // kV
  capacity: number // MW
  powerFlow: number // MW
  impedance: { resistance: number; reactance: number }
  // ... additional properties
}
```

### System Health Data
```typescript
interface SystemHealthData {
  overall: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'FAILED'
  redundancyLevel: number // 0-1
  criticalAlerts: number
  warningAlerts: number
  subsystemHealth: {
    power: number // 0-1
    communication: number // 0-1
    control: number // 0-1
    protection: number // 0-1
  }
  // ... additional properties
}
```

## Dataset Access

### By Size
```typescript
import { getDatasetBySize } from './fixtures'

const small = getDatasetBySize('small')
const medium = getDatasetBySize('medium')  
const large = getDatasetBySize('large')
const edge = getDatasetBySize('edge')
const animation = getDatasetBySize('animation')
```

### By Category
```typescript
import { fixtureCategories, fixtureHelpers } from './fixtures'

// Unit testing
const unitData = fixtureHelpers.getDataset(fixtureCategories.unit.small)

// Integration testing
const integrationData = fixtureHelpers.getDataset(fixtureCategories.integration.medium)

// Performance testing
const performanceData = fixtureHelpers.getDataset(fixtureCategories.performance.large)
```

### By Scenario
```typescript
import { fixtureHelpers } from './fixtures'

// Get predefined scenario
const scenario = fixtureHelpers.getScenario('normalOperation')
console.log(scenario.name) // "Normal Operation"
console.log(scenario.dataset) // Dataset object

// Available scenarios:
// - normalOperation
// - maintenanceMode  
// - emergencyResponse
// - heavyLoad
// - animationTesting
```

## Custom Dataset Generation

### Generate Custom Size
```typescript
import { generateCustomDataset } from './fixtures'

// Generate dataset with specific counts
const custom = generateCustomDataset(
  15, // substations
  25, // lines  
  7   // redundancy pairs
)
```

### Generate Validated Dataset
```typescript
import { fixtureHelpers } from './fixtures'

// Generates and validates in one step
const validated = fixtureHelpers.createValidatedDataset(10, 20, 5)
// Throws error if generated dataset is invalid
```

## Data Validation

### Validate Dataset
```typescript
import { validateDataset, getValidationReport } from './fixtures'

const result = validateDataset(dataset)

console.log('Valid:', result.valid)
console.log('Errors:', result.summary.totalErrors)
console.log('Warnings:', result.summary.totalWarnings)

// Get detailed report
const report = getValidationReport(result)
console.log(report)
```

### Quick Validation
```typescript
import { isValidDataset } from './fixtures'

if (isValidDataset(dataset)) {
  console.log('Dataset is valid!')
}
```

### Validate All Built-in Datasets
```typescript
import { fixtureHelpers } from './fixtures'

const validation = fixtureHelpers.validateAllDatasets()
console.log('All valid:', validation.summary.allValid)
console.log('Total errors:', validation.summary.totalErrors)
```

## Component Validation

### Individual Components
```typescript
import { 
  validateSubstation,
  validateLine, 
  validateRedundancyPair,
  validateSystemHealth 
} from './fixtures'

// Validate individual components
const substationErrors = validateSubstation(substation, 0)
const lineErrors = validateLine(line, 0)  
const pairErrors = validateRedundancyPair(pair, 0)
const healthErrors = validateSystemHealth(health)
```

## Testing Patterns

### Unit Tests
```typescript
import { smallDataset } from './fixtures'

test('should process substation data', () => {
  const substations = smallDataset.substations
  expect(substations).toHaveLength(5)
  
  const activeStations = substations.filter(s => s.status === 'ACTIVE')
  expect(activeStations.length).toBeGreaterThan(0)
})
```

### Integration Tests
```typescript  
import { mediumDataset } from './fixtures'

test('should handle complex scenarios', () => {
  const result = processRedundancyData(mediumDataset)
  
  expect(result.systemHealth.overall).toBe('DEGRADED')
  expect(result.redundancyPairs.length).toBe(10)
})
```

### Performance Tests
```typescript
import { largeDataset } from './fixtures'

test('should process large datasets efficiently', () => {
  const startTime = performance.now()
  
  const result = processRedundancyData(largeDataset)
  
  const endTime = performance.now()
  expect(endTime - startTime).toBeLessThan(1000) // < 1 second
})
```

### Error Handling Tests
```typescript
import { edgeCaseDataset } from './fixtures'

test('should handle edge cases gracefully', () => {
  expect(() => {
    processRedundancyData(edgeCaseDataset)
  }).not.toThrow()
  
  const result = processRedundancyData(edgeCaseDataset)
  expect(result.systemHealth.overall).toBe('CRITICAL')
})
```

## Utilities

### Dataset Summary
```typescript
import { fixtureHelpers } from './fixtures'

const summary = fixtureHelpers.getDatasetSummary(dataset)
console.log(summary)
// {
//   version: "1.0.0",
//   name: "Small Test Dataset", 
//   substations: 5,
//   lines: 8,
//   redundancyPairs: 2,
//   systemHealth: "HEALTHY",
//   redundancyLevel: 0.92,
//   alerts: 7
// }
```

### Random Dataset
```typescript
import { fixtureHelpers } from './fixtures'

// Get random dataset for testing
const randomData = fixtureHelpers.getRandomDataset()
```

## Validation Rules

The validator checks for:

### Structural Validation
- Required fields present
- Valid data types
- Valid enum values
- Coordinate validation

### Business Logic Validation  
- Power flow ≤ line capacity
- Current load ≤ power rating
- Valid references between components
- Consistency between status and data

### Cross-Reference Validation
- Substation connections reference existing lines
- Redundancy pairs reference existing substations
- Backup substations exist in dataset

### Health Validation
- Health scores between 0-1
- Alert counts are non-negative  
- System health consistency with subsystem health

## Error Types

### Errors (Invalid Data)
- Missing required fields
- Invalid enum values
- Negative power values
- Invalid references

### Warnings (Questionable Data)
- Overloaded components
- High temperatures
- Low efficiency ratings
- Inconsistent health status

### Info (Advisory)
- Non-standard voltages
- High alert counts
- Performance recommendations

## Best Practices

### Dataset Selection
- Use **small** for unit tests
- Use **medium** for integration tests  
- Use **large** for performance tests
- Use **edge** for error handling tests
- Use **animation** for visual tests

### Validation
- Always validate custom datasets
- Check validation results before using
- Handle warnings appropriately
- Use validation reports for debugging

### Testing
- Test with multiple dataset sizes
- Include edge cases in test suites
- Validate data transformations
- Test error conditions

### Performance
- Cache datasets for repeated use
- Validate once, use many times
- Use appropriate dataset size for test type
- Monitor memory usage with large datasets

## Examples

See the `__tests__` directory for comprehensive examples of:
- Dataset validation
- Component validation  
- Error detection
- Cross-reference checking
- Custom dataset generation