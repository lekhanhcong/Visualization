/**
 * Tests for Redundancy Testing Framework
 * Validates the testing utilities and framework functionality
 */

import {
  createMockLineData,
  createMockSubstationData,
  createMockCoordinateSystem,
  createMockPosition,
  createMockRedundancyState,
  mockLines,
  mockSubstations,
  simulateMouseEvent,
  simulateTouchEvent,
  simulateKeyboardEvent,
  waitForAnimation,
  mockAnimationFrame,
  getRedundancyClassName,
  expectCoordinatesWithinTolerance,
  generateRandomLines,
  generateRandomSubstations,
  measureRenderTime,
  suppressConsoleError,
  createStateAssertion
} from '../../features/redundancy/testing/utils'

import {
  mockRedundancyDependencyManager,
  mockDependencies
} from '../../features/redundancy/testing/__mocks__/redundancy-dependencies'

import {
  mockRedundancyEventBus,
  mockRedundancyEvents,
  REDUNDANCY_EVENTS
} from '../../features/redundancy/testing/__mocks__/redundancy-events'

import {
  mockRedundancyErrorIsolation,
  createMockError
} from '../../features/redundancy/testing/__mocks__/redundancy-errors'

import {
  mockRedundancyLifecycle,
  mockLifecycleCallbacks
} from '../../features/redundancy/testing/__mocks__/redundancy-lifecycle'

describe('Testing Framework', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Mock Data Factories', () => {
    test('createMockLineData should create valid line data', () => {
      const line = createMockLineData()
      
      expect(line).toHaveProperty('id')
      expect(line).toHaveProperty('from')
      expect(line).toHaveProperty('to')
      expect(line).toHaveProperty('status')
      expect(line).toHaveProperty('voltage')
      expect(line).toHaveProperty('path')
      expect(line).toHaveProperty('color')
      expect(line.status).toBeOneOf(['active', 'standby', 'inactive'])
    })

    test('createMockLineData should accept overrides', () => {
      const overrides = {
        id: 'custom-line',
        status: 'standby' as const,
        color: '#custom'
      }
      
      const line = createMockLineData(overrides)
      
      expect(line.id).toBe('custom-line')
      expect(line.status).toBe('standby')
      expect(line.color).toBe('#custom')
    })

    test('createMockSubstationData should create valid substation data', () => {
      const substation = createMockSubstationData()
      
      expect(substation).toHaveProperty('id')
      expect(substation).toHaveProperty('name')
      expect(substation).toHaveProperty('status')
      expect(substation).toHaveProperty('capacity')
      expect(substation).toHaveProperty('position')
      expect(substation).toHaveProperty('connections')
      expect(substation.status).toBeOneOf(['ACTIVE', 'STANDBY', 'INACTIVE'])
      expect(substation.position).toHaveProperty('x')
      expect(substation.position).toHaveProperty('y')
    })

    test('createMockCoordinateSystem should create valid coordinate system', () => {
      const coords = createMockCoordinateSystem()
      
      expect(coords).toHaveProperty('mapWidth')
      expect(coords).toHaveProperty('mapHeight')
      expect(coords).toHaveProperty('viewportWidth')
      expect(coords).toHaveProperty('viewportHeight')
      expect(coords).toHaveProperty('scale')
      expect(coords).toHaveProperty('offset')
      expect(typeof coords.scale).toBe('number')
      expect(coords.scale).toBeGreaterThan(0)
    })

    test('createMockPosition should create valid position', () => {
      const position = createMockPosition()
      
      expect(position).toHaveProperty('x')
      expect(position).toHaveProperty('y')
      expect(typeof position.x).toBe('number')
      expect(typeof position.y).toBe('number')
    })

    test('createMockRedundancyState should create valid state', () => {
      const state = createMockRedundancyState()
      
      expect(state).toHaveProperty('isEnabled')
      expect(state).toHaveProperty('selectedLine')
      expect(state).toHaveProperty('selectedSubstation')
      expect(state).toHaveProperty('showOverlay')
      expect(state).toHaveProperty('animationActive')
      expect(typeof state.isEnabled).toBe('boolean')
    })
  })

  describe('Mock Data Collections', () => {
    test('mockLines should contain valid line data', () => {
      expect(Array.isArray(mockLines)).toBe(true)
      expect(mockLines.length).toBeGreaterThan(0)
      
      mockLines.forEach(line => {
        expect(line).toHaveProperty('id')
        expect(line).toHaveProperty('status')
        expect(typeof line.id).toBe('string')
      })
    })

    test('mockSubstations should contain valid substation data', () => {
      expect(Array.isArray(mockSubstations)).toBe(true)
      expect(mockSubstations.length).toBeGreaterThan(0)
      
      mockSubstations.forEach(substation => {
        expect(substation).toHaveProperty('id')
        expect(substation).toHaveProperty('status')
        expect(typeof substation.id).toBe('string')
      })
    })
  })

  describe('Event Simulation Utilities', () => {
    let testElement: Element

    beforeEach(() => {
      testElement = document.createElement('div')
      document.body.appendChild(testElement)
    })

    afterEach(() => {
      document.body.removeChild(testElement)
    })

    test('simulateMouseEvent should trigger mouse events', () => {
      const handleClick = jest.fn()
      testElement.addEventListener('click', handleClick)
      
      simulateMouseEvent(testElement, 'click', { x: 100, y: 200 })
      
      expect(handleClick).toHaveBeenCalled()
      const event = handleClick.mock.calls[0][0]
      expect(event.clientX).toBe(100)
      expect(event.clientY).toBe(200)
    })

    test('simulateTouchEvent should trigger touch events', () => {
      const handleTouchStart = jest.fn()
      testElement.addEventListener('touchstart', handleTouchStart)
      
      simulateTouchEvent(testElement, 'touchstart', { x: 50, y: 75 })
      
      expect(handleTouchStart).toHaveBeenCalled()
      const event = handleTouchStart.mock.calls[0][0]
      expect(event.touches.length).toBe(1)
      expect(event.touches[0].clientX).toBe(50)
      expect(event.touches[0].clientY).toBe(75)
    })

    test('simulateKeyboardEvent should trigger keyboard events', () => {
      const handleKeyDown = jest.fn()
      testElement.addEventListener('keydown', handleKeyDown)
      
      simulateKeyboardEvent(testElement, 'Enter')
      
      expect(handleKeyDown).toHaveBeenCalled()
      const event = handleKeyDown.mock.calls[0][0]
      expect(event.key).toBe('Enter')
    })
  })

  describe('Animation Testing Utilities', () => {
    test('waitForAnimation should wait for specified duration', async () => {
      const start = Date.now()
      await waitForAnimation(100)
      const end = Date.now()
      
      expect(end - start).toBeGreaterThanOrEqual(90) // Allow some tolerance
    })

    test('mockAnimationFrame should mock requestAnimationFrame', () => {
      const { triggerFrame, callbacks } = mockAnimationFrame()
      const callback = jest.fn()
      
      requestAnimationFrame(callback)
      expect(callbacks).toContain(callback)
      
      triggerFrame(1000)
      expect(callback).toHaveBeenCalledWith(1000)
    })
  })

  describe('Component Testing Utilities', () => {
    let testElement: Element

    beforeEach(() => {
      testElement = document.createElement('div')
      testElement.className = 'rdx-button rdx-button--primary'
    })

    test('getRedundancyClassName should check for redundancy classes', () => {
      expect(getRedundancyClassName(testElement, 'button')).toBe(true)
      expect(getRedundancyClassName(testElement, 'button', 'primary')).toBe(true)
      expect(getRedundancyClassName(testElement, 'button', 'secondary')).toBe(false)
      expect(getRedundancyClassName(testElement, 'overlay')).toBe(false)
    })
  })

  describe('Coordinate Testing Utilities', () => {
    test('expectCoordinatesWithinTolerance should validate positions', () => {
      const actual = { x: 100, y: 200 }
      const expected = { x: 101, y: 199 }
      
      expect(() => {
        expectCoordinatesWithinTolerance(actual, expected, 2)
      }).not.toThrow()
      
      expect(() => {
        expectCoordinatesWithinTolerance(actual, expected, 0.5)
      }).toThrow()
    })
  })

  describe('Data Generators', () => {
    test('generateRandomLines should create specified number of lines', () => {
      const lines = generateRandomLines(5)
      
      expect(lines).toHaveLength(5)
      lines.forEach((line, index) => {
        expect(line.id).toBe(`generated-line-${index}`)
        expect(line).toHaveProperty('status')
        expect(line).toHaveProperty('path')
      })
    })

    test('generateRandomSubstations should create specified number of substations', () => {
      const substations = generateRandomSubstations(3)
      
      expect(substations).toHaveLength(3)
      substations.forEach((substation, index) => {
        expect(substation.id).toBe(`generated-substation-${index}`)
        expect(substation.name).toBe(`Generated Substation ${index + 1}`)
        expect(substation).toHaveProperty('position')
      })
    })
  })

  describe('Performance Testing Utilities', () => {
    test('measureRenderTime should measure execution time', async () => {
      const slowFunction = () => {
        // Simulate slow operation
        const start = Date.now()
        while (Date.now() - start < 10) {
          // Busy wait
        }
      }
      
      const renderTime = await measureRenderTime(slowFunction)
      expect(renderTime).toBeGreaterThan(5) // Should take at least 5ms
    })
  })

  describe('Error Testing Utilities', () => {
    test('suppressConsoleError should suppress console.error', () => {
      // Store the current console.error (which might already be mocked)
      const currentError = console.error
      
      const restore = suppressConsoleError()
      
      // console.error should now be a different function
      expect(console.error).not.toBe(currentError)
      expect(jest.isMockFunction(console.error)).toBe(true)
      
      console.error('test error')
      expect(console.error).toHaveBeenCalledWith('test error')
      
      restore()
      expect(console.error).toBe(currentError)
    })

    test('createMockError should create test errors', () => {
      const error = createMockError('Test message', 'TestError')
      
      expect(error.message).toBe('Test message')
      expect(error.name).toBe('TestError')
      expect(error instanceof Error).toBe(true)
    })
  })

  describe('State Testing Utilities', () => {
    test('createStateAssertion should validate state properties', () => {
      const expectedState = {
        isEnabled: true,
        showOverlay: false
      }
      
      const assertion = createStateAssertion(expectedState)
      
      const validState = createMockRedundancyState({
        isEnabled: true,
        showOverlay: false,
        selectedLine: null
      })
      
      expect(() => assertion(validState)).not.toThrow()
      
      const invalidState = createMockRedundancyState({
        isEnabled: false,
        showOverlay: true
      })
      
      expect(() => assertion(invalidState)).toThrow()
    })
  })
})

describe('Mock Implementations', () => {
  describe('Dependency Manager Mock', () => {
    test('mockRedundancyDependencyManager should have all required methods', () => {
      expect(mockRedundancyDependencyManager.resolveAll).toBeDefined()
      expect(mockRedundancyDependencyManager.resolve).toBeDefined()
      expect(mockRedundancyDependencyManager.isResolved).toBeDefined()
      expect(mockRedundancyDependencyManager.getStatus).toBeDefined()
    })

    test('should return resolved status', async () => {
      const result = await mockRedundancyDependencyManager.resolveAll()
      expect(result).toBe(true)
      
      const status = mockRedundancyDependencyManager.getStatus()
      expect(status.resolved).toBe(true)
    })
  })

  describe('Event Bus Mock', () => {
    test('mockRedundancyEventBus should have all required methods', () => {
      expect(mockRedundancyEventBus.on).toBeDefined()
      expect(mockRedundancyEventBus.off).toBeDefined()
      expect(mockRedundancyEventBus.emit).toBeDefined()
      expect(mockRedundancyEventBus.clear).toBeDefined()
    })

    test('should track event listeners', () => {
      const callback = jest.fn()
      const unsubscribe = mockRedundancyEventBus.on('test-event', callback)
      
      expect(mockRedundancyEventBus.on).toHaveBeenCalledWith('test-event', callback)
      expect(typeof unsubscribe).toBe('function')
    })

    test('should emit events', () => {
      mockRedundancyEventBus.emit('test-event', { data: 'test' })
      expect(mockRedundancyEventBus.emit).toHaveBeenCalledWith('test-event', { data: 'test' })
    })
  })

  describe('Error Isolation Mock', () => {
    test('mockRedundancyErrorIsolation should have all required methods', () => {
      expect(mockRedundancyErrorIsolation.reportError).toBeDefined()
      expect(mockRedundancyErrorIsolation.getErrorStats).toBeDefined()
      expect(mockRedundancyErrorIsolation.isCircuitOpen).toBeDefined()
      expect(mockRedundancyErrorIsolation.reset).toBeDefined()
    })

    test('should return default error stats', () => {
      const stats = mockRedundancyErrorIsolation.getErrorStats()
      
      expect(stats).toHaveProperty('totalErrors')
      expect(stats).toHaveProperty('recentErrors')
      expect(stats).toHaveProperty('circuitState')
      expect(stats.circuitState).toBe('closed')
    })
  })

  describe('Lifecycle Mock', () => {
    test('mockRedundancyLifecycle should have all required methods', () => {
      expect(mockRedundancyLifecycle.onMount).toBeDefined()
      expect(mockRedundancyLifecycle.onUnmount).toBeDefined()
      expect(mockRedundancyLifecycle.onEnable).toBeDefined()
      expect(mockRedundancyLifecycle.onDisable).toBeDefined()
      expect(mockRedundancyLifecycle.isMounted).toBeDefined()
      expect(mockRedundancyLifecycle.isEnabled).toBeDefined()
    })

    test('should return default states', () => {
      expect(mockRedundancyLifecycle.isMounted()).toBe(true)
      expect(mockRedundancyLifecycle.isEnabled()).toBe(true)
      
      const state = mockRedundancyLifecycle.getState()
      expect(state.mounted).toBe(true)
      expect(state.enabled).toBe(true)
      expect(state.initialized).toBe(true)
    })
  })

  describe('Event Constants', () => {
    test('REDUNDANCY_EVENTS should contain all event types', () => {
      expect(REDUNDANCY_EVENTS.SUBSTATION_SELECT).toBe('redundancy:substation:select')
      expect(REDUNDANCY_EVENTS.LINE_SELECT).toBe('redundancy:line:select')
      expect(REDUNDANCY_EVENTS.STATE_CHANGE).toBe('redundancy:state:change')
      expect(REDUNDANCY_EVENTS.PANEL_TOGGLE).toBe('redundancy:panel:toggle')
    })
  })
})

// Custom Jest matchers for redundancy testing
expect.extend({
  toBeOneOf(received, validOptions) {
    const pass = validOptions.includes(received)
    return {
      message: () => pass
        ? `Expected ${received} not to be one of [${validOptions.join(', ')}]`
        : `Expected ${received} to be one of [${validOptions.join(', ')}]`,
      pass,
    }
  }
})