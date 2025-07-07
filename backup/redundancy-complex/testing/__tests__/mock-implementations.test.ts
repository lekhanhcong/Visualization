/**
 * Mock Implementations Test Suite
 * Tests for the mock implementations and fixtures
 */

import { jest } from '@jest/globals'
import { 
  createMockRedundancyStore,
  mockApiResponses,
  mockDOMAPIs,
  mockDataGenerators,
  setupAllMocks
} from '../mock-implementations'

import { testScenarios, substationFixtures, lineFixtures } from '../test-fixtures'

describe('Mock Implementations', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createMockRedundancyStore', () => {
    test('should create store with default state', () => {
      const store = createMockRedundancyStore()
      const state = store.getState()

      expect(state.isEnabled).toBe(true)
      expect(state.isVisible).toBe(false)
      expect(state.selectedSubstation).toBe(null)
      expect(state.redundancyData).toHaveProperty('substations')
      expect(state.uiState).toHaveProperty('showInfoPanel')
      expect(state.errorState).toHaveProperty('hasError')
    })

    test('should merge custom initial state', () => {
      const customState = { isVisible: true, selectedSubstation: 'sub-1' }
      const store = createMockRedundancyStore(customState)
      const state = store.getState()

      expect(state.isVisible).toBe(true)
      expect(state.selectedSubstation).toBe('sub-1')
    })

    test('should handle dispatch actions', () => {
      const store = createMockRedundancyStore()
      
      store.dispatch({ type: 'SET_VISIBILITY', payload: true })
      expect(store.getState().isVisible).toBe(true)

      store.dispatch({ type: 'SELECT_SUBSTATION', payload: 'sub-1' })
      expect(store.getState().selectedSubstation).toBe('sub-1')
    })
  })

  describe('mockApiResponses', () => {
    test('should return mock redundancy data', async () => {
      const data = await mockApiResponses.getRedundancyData()
      
      expect(data).toHaveProperty('substations')
      expect(data).toHaveProperty('lines')
      expect(data).toHaveProperty('redundancyPairs')
      expect(data.substations).toHaveLength(2)
      expect(data.lines).toHaveLength(2)
    })

    test('should handle substation status update', async () => {
      const result = await mockApiResponses.updateSubstationStatus('sub-1', 'MAINTENANCE')
      
      expect(result).toHaveProperty('id', 'sub-1')
      expect(result).toHaveProperty('status', 'MAINTENANCE')
      expect(result).toHaveProperty('updatedAt')
    })

    test('should handle failover trigger', async () => {
      const result = await mockApiResponses.triggerFailover('sub-1', 'sub-2')
      
      expect(result).toHaveProperty('success', true)
      expect(result).toHaveProperty('failoverTime')
      expect(result).toHaveProperty('fromSubstation', 'sub-1')
      expect(result).toHaveProperty('toSubstation', 'sub-2')
    })

    test('should return system health data', async () => {
      const health = await mockApiResponses.getSystemHealth()
      
      expect(health).toHaveProperty('overall', 'HEALTHY')
      expect(health).toHaveProperty('redundancyLevel')
      expect(health).toHaveProperty('criticalAlerts')
      expect(health.redundancyLevel).toBeGreaterThan(0)
      expect(health.redundancyLevel).toBeLessThanOrEqual(1)
    })
  })

  describe('mockDOMAPIs', () => {
    test('should create mock SVG element', () => {
      const element = mockDOMAPIs.createSVGElement('rect')
      
      expect(element).toHaveProperty('getBBox')
      expect(element.getAttribute('data-mock-svg-element')).toBe('rect')
      
      const bbox = element.getBBox()
      expect(bbox).toEqual({ x: 0, y: 0, width: 100, height: 100 })
    })

    test('should create mock canvas context', () => {
      const context = mockDOMAPIs.createCanvasContext()
      
      expect(context).toHaveProperty('fillRect')
      expect(context).toHaveProperty('strokeRect')
      expect(context).toHaveProperty('beginPath')
      expect(context).toHaveProperty('measureText')
      
      const textMetrics = context.measureText('test')
      expect(textMetrics).toHaveProperty('width', 100)
    })

    test('should create mock intersection observer', () => {
      const callback = jest.fn()
      const observer = mockDOMAPIs.createIntersectionObserver(callback)
      
      expect(observer).toHaveProperty('observe')
      expect(observer).toHaveProperty('unobserve')
      expect(observer).toHaveProperty('disconnect')
      expect(observer.root).toBe(null)
    })
  })

  describe('mockDataGenerators', () => {
    test('should generate valid substation data', () => {
      const substation = mockDataGenerators.generateSubstation()
      
      expect(substation).toHaveProperty('id')
      expect(substation).toHaveProperty('name')
      expect(substation).toHaveProperty('status', 'ACTIVE')
      expect(substation).toHaveProperty('position')
      expect(substation.position).toHaveProperty('x')
      expect(substation.position).toHaveProperty('y')
      expect(substation.powerRating).toBe(500)
    })

    test('should generate substation with overrides', () => {
      const overrides = { name: 'Custom Station', powerRating: 750 }
      const substation = mockDataGenerators.generateSubstation(overrides)
      
      expect(substation.name).toBe('Custom Station')
      expect(substation.powerRating).toBe(750)
    })

    test('should generate valid line data', () => {
      const line = mockDataGenerators.generateLine()
      
      expect(line).toHaveProperty('id')
      expect(line).toHaveProperty('name')
      expect(line).toHaveProperty('status', 'ACTIVE')
      expect(line).toHaveProperty('path')
      expect(line.path).toHaveLength(2)
      expect(line.capacity).toBe(500)
    })

    test('should generate redundancy data set', () => {
      const dataset = mockDataGenerators.generateRedundancyDataSet(3, 5)
      
      expect(dataset.substations).toHaveLength(3)
      expect(dataset.lines).toHaveLength(5)
      expect(dataset.redundancyPairs).toHaveLength(2) // n-1 pairs
      
      // Check naming convention
      expect(dataset.substations[0].name).toBe('Substation A')
      expect(dataset.substations[1].name).toBe('Substation B')
      expect(dataset.lines[0].name).toBe('Line 1')
    })
  })

  describe('setupAllMocks', () => {
    test('should setup all mock APIs', () => {
      const cleanup = setupAllMocks()
      
      expect(global.IntersectionObserver).toBeDefined()
      expect(global.ResizeObserver).toBeDefined()
      expect(global.requestAnimationFrame).toBeDefined()
      expect(global.fetch).toBeDefined()
      
      // Cleanup
      cleanup()
    })
  })
})

describe('Test Fixtures', () => {
  describe('substationFixtures', () => {
    test('should have valid active substation fixture', () => {
      const substation = substationFixtures.activeSubstation
      
      expect(substation.id).toBe('sub-active-001')
      expect(substation.status).toBe('ACTIVE')
      expect(substation.powerRating).toBe(750)
      expect(substation.currentLoad).toBe(600)
      expect(substation.redundancyLevel).toBe('2N+1')
    })

    test('should have valid backup substation fixture', () => {
      const substation = substationFixtures.backupSubstation
      
      expect(substation.status).toBe('STANDBY')
      expect(substation.currentLoad).toBe(0)
      expect(substation.primarySubstation).toBe('sub-active-001')
    })

    test('should have valid faulted substation fixture', () => {
      const substation = substationFixtures.faultedSubstation
      
      expect(substation.status).toBe('FAULT')
      expect(substation.faultDetails).toBeDefined()
      expect(substation.faultDetails.faultType).toBe('TRANSFORMER_FAILURE')
    })
  })

  describe('lineFixtures', () => {
    test('should have valid active line fixture', () => {
      const line = lineFixtures.activeLine
      
      expect(line.status).toBe('ACTIVE')
      expect(line.powerFlow).toBe(550)
      expect(line.capacity).toBe(750)
      expect(line.path).toHaveLength(3)
      expect(line.redundancyType).toBe('2N+1')
    })

    test('should have valid overloaded line fixture', () => {
      const line = lineFixtures.overloadedLine
      
      expect(line.status).toBe('OVERLOAD')
      expect(line.powerFlow).toBeGreaterThan(line.capacity)
      expect(line.overloadDetails).toBeDefined()
      expect(line.overloadDetails.overloadPercentage).toBeGreaterThan(100)
    })
  })

  describe('testScenarios', () => {
    test('should have normal operation scenario', () => {
      const scenario = testScenarios.normalOperation
      
      expect(scenario.substations).toHaveLength(2)
      expect(scenario.lines).toHaveLength(2)
      expect(scenario.redundancyPairs).toHaveLength(1)
      expect(scenario.systemHealth.overall).toBe('HEALTHY')
    })

    test('should have emergency scenario', () => {
      const scenario = testScenarios.emergencyScenario
      
      expect(scenario.systemHealth.overall).toBe('CRITICAL')
      expect(scenario.systemHealth.criticalAlerts).toBeGreaterThan(0)
      
      // Should have faulted components
      const faultedSubstation = scenario.substations.find(s => s.status === 'FAULT')
      const faultedLine = scenario.lines.find(l => l.status === 'FAULT')
      
      expect(faultedSubstation).toBeDefined()
      expect(faultedLine).toBeDefined()
    })

    test('should have load testing scenario with many components', () => {
      const scenario = testScenarios.loadTestingScenario
      
      expect(scenario.substations).toHaveLength(20)
      expect(scenario.lines).toHaveLength(40)
      expect(scenario.redundancyPairs).toHaveLength(10)
      
      // Check ID patterns
      expect(scenario.substations[0].id).toBe('sub-load-000')
      expect(scenario.lines[0].id).toBe('line-load-000')
      expect(scenario.redundancyPairs[0].id).toBe('pair-load-000')
    })
  })
})