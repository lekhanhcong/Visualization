/**
 * Tests for Redundancy Utilities
 * Tests utility functions and helpers in isolation
 */

import {
  cssUtils,
  coordinateUtils,
  animationUtils,
  svgUtils,
  colorUtils,
  eventUtils,
  dataUtils,
  performanceUtils,
  validationUtils
} from '../../features/redundancy/utils/component-utils'

import type { Position, CoordinateSystem, LineData, SubstationData } from '../../features/redundancy/types'

// Mock data
const mockPosition: Position = { x: 100, y: 150 }
const mockCoordinateSystem: CoordinateSystem = {
  mapWidth: 400,
  mapHeight: 300,
  viewportWidth: 800,
  viewportHeight: 600,
  scale: 2,
  offset: { x: 50, y: 75 }
}

const mockLines: LineData[] = [
  {
    id: 'line-1',
    from: 'sub-a',
    to: 'datacenter',
    status: 'active',
    voltage: '345kV',
    path: 'M 100,100 L 300,200',
    color: '#28a745'
  },
  {
    id: 'line-2',
    from: 'sub-b',
    to: 'datacenter',
    status: 'standby',
    voltage: '345kV',
    path: 'M 150,80 L 300,200',
    color: '#ffc107'
  }
]

const mockSubstations: SubstationData[] = [
  {
    id: 'sub-1',
    name: 'Substation A',
    status: 'ACTIVE',
    capacity: '100MW',
    position: { x: 100, y: 100 },
    color: '#28a745',
    connections: ['line-1']
  },
  {
    id: 'sub-2',
    name: 'Substation B',
    status: 'STANDBY',
    capacity: '75MW',
    position: { x: 200, y: 150 },
    color: '#ffc107',
    connections: ['line-2']
  }
]

describe('CSS Utils', () => {
  describe('createClassName', () => {
    test('should create base class name with rdx- prefix', () => {
      expect(cssUtils.createClassName('button')).toBe('rdx-button')
    })

    test('should add modifiers for boolean true values', () => {
      const result = cssUtils.createClassName('button', {
        primary: true,
        disabled: false,
        large: true
      })
      expect(result).toBe('rdx-button rdx-button--primary rdx-button--large')
    })

    test('should add modifiers for string values', () => {
      const result = cssUtils.createClassName('button', {
        variant: 'primary',
        size: 'large',
        state: ''
      })
      expect(result).toBe('rdx-button rdx-button--primary rdx-button--large')
    })
  })

  describe('combineClasses', () => {
    test('should combine valid class names', () => {
      const result = cssUtils.combineClasses('class1', 'class2', 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    test('should filter out falsy values', () => {
      const result = cssUtils.combineClasses('class1', null, undefined, '', false, 'class2')
      expect(result).toBe('class1 class2')
    })
  })

  describe('bem', () => {
    test('should create BEM block class', () => {
      expect(cssUtils.bem('button')).toBe('rdx-button')
    })

    test('should create BEM element class', () => {
      expect(cssUtils.bem('button', 'icon')).toBe('rdx-button__icon')
    })

    test('should create BEM modifier class', () => {
      expect(cssUtils.bem('button', 'icon', 'primary')).toBe('rdx-button__icon--primary')
    })
  })
})

describe('Coordinate Utils', () => {
  describe('screenToMap', () => {
    test('should transform screen coordinates to map coordinates', () => {
      const screenPos = { x: 250, y: 225 }
      const result = coordinateUtils.screenToMap(screenPos, mockCoordinateSystem)
      expect(result).toEqual({ x: 100, y: 75 })
    })
  })

  describe('mapToScreen', () => {
    test('should transform map coordinates to screen coordinates', () => {
      const mapPos = { x: 100, y: 75 }
      const result = coordinateUtils.mapToScreen(mapPos, mockCoordinateSystem)
      expect(result).toEqual({ x: 250, y: 225 })
    })
  })

  describe('distance', () => {
    test('should calculate distance between two positions', () => {
      const pos1 = { x: 0, y: 0 }
      const pos2 = { x: 3, y: 4 }
      const result = coordinateUtils.distance(pos1, pos2)
      expect(result).toBe(5)
    })
  })

  describe('isWithinBounds', () => {
    test('should return true for position within bounds', () => {
      const pos = { x: 50, y: 75 }
      const bounds = { width: 100, height: 100 }
      expect(coordinateUtils.isWithinBounds(pos, bounds)).toBe(true)
    })

    test('should return false for position outside bounds', () => {
      const pos = { x: 150, y: 75 }
      const bounds = { width: 100, height: 100 }
      expect(coordinateUtils.isWithinBounds(pos, bounds)).toBe(false)
    })
  })

  describe('clampToBounds', () => {
    test('should clamp position to bounds', () => {
      const pos = { x: 150, y: -50 }
      const bounds = { width: 100, height: 100 }
      const result = coordinateUtils.clampToBounds(pos, bounds)
      expect(result).toEqual({ x: 100, y: 0 })
    })
  })
})

describe('Animation Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.requestAnimationFrame = jest.fn()
    global.cancelAnimationFrame = jest.fn()
    global.performance = { now: jest.fn(() => Date.now()) } as any
  })

  describe('createAnimationLoop', () => {
    test('should create animation loop controller', () => {
      const callback = jest.fn()
      const loop = animationUtils.createAnimationLoop(callback)
      
      expect(loop.start).toBeDefined()
      expect(loop.stop).toBeDefined()
      expect(loop.isRunning).toBeDefined()
    })

    test('should track running state', () => {
      const callback = jest.fn()
      const loop = animationUtils.createAnimationLoop(callback)
      
      expect(loop.isRunning()).toBe(false)
      loop.start()
      expect(loop.isRunning()).toBe(true)
      loop.stop()
      expect(loop.isRunning()).toBe(false)
    })
  })

  describe('easing functions', () => {
    test('linear should return input value', () => {
      expect(animationUtils.easing.linear(0.5)).toBe(0.5)
    })

    test('easeInQuad should apply quadratic easing', () => {
      expect(animationUtils.easing.easeInQuad(0.5)).toBe(0.25)
    })

    test('easeOutQuad should apply inverse quadratic easing', () => {
      expect(animationUtils.easing.easeOutQuad(0.5)).toBe(0.75)
    })
  })

  describe('lerp', () => {
    test('should interpolate between two values', () => {
      expect(animationUtils.lerp(0, 10, 0.5)).toBe(5)
      expect(animationUtils.lerp(100, 200, 0.25)).toBe(125)
    })
  })

  describe('lerpPosition', () => {
    test('should interpolate between two positions', () => {
      const start = { x: 0, y: 0 }
      const end = { x: 100, y: 200 }
      const result = animationUtils.lerpPosition(start, end, 0.5)
      expect(result).toEqual({ x: 50, y: 100 })
    })
  })
})

describe('SVG Utils', () => {
  describe('createPath', () => {
    test('should create SVG path from points', () => {
      const points = [
        { x: 100, y: 100 },
        { x: 200, y: 150 },
        { x: 300, y: 200 }
      ]
      const result = svgUtils.createPath(points)
      expect(result).toBe('M 100,100 L 200,150 L 300,200')
    })

    test('should return empty string for empty points array', () => {
      expect(svgUtils.createPath([])).toBe('')
    })
  })

  describe('parsePath', () => {
    test('should parse SVG path to points', () => {
      const path = 'M 100,100 L 200,150 L 300,200'
      const result = svgUtils.parsePath(path)
      expect(result).toEqual([
        { x: 100, y: 100 },
        { x: 200, y: 150 },
        { x: 300, y: 200 }
      ])
    })
  })

  describe('interpolateAlongPath', () => {
    test('should interpolate points along path', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 100, y: 100 }
      ]
      const result = svgUtils.interpolateAlongPath(points, 3)
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({ x: 0, y: 0 })
      expect(result[1]).toEqual({ x: 50, y: 50 })
      expect(result[2]).toEqual({ x: 100, y: 100 })
    })
  })

  describe('createViewBox', () => {
    test('should create viewBox string', () => {
      expect(svgUtils.createViewBox(100, 200)).toBe('0 0 100 200')
      expect(svgUtils.createViewBox(100, 200, 10, 20)).toBe('10 20 100 200')
    })
  })
})

describe('Color Utils', () => {
  describe('hexToRgba', () => {
    test('should convert hex to rgba', () => {
      expect(colorUtils.hexToRgba('#ff0000')).toBe('rgba(255, 0, 0, 1)')
      expect(colorUtils.hexToRgba('#00ff00', 0.5)).toBe('rgba(0, 255, 0, 0.5)')
    })
  })

  describe('lighten', () => {
    test('should lighten hex color', () => {
      const result = colorUtils.lighten('#808080', 50)
      expect(result).toMatch(/^#[0-9a-f]{6}$/)
    })
  })

  describe('getStatusColor', () => {
    test('should return correct status colors', () => {
      expect(colorUtils.getStatusColor('active')).toBe('#28a745')
      expect(colorUtils.getStatusColor('standby')).toBe('#ffc107')
      expect(colorUtils.getStatusColor('error')).toBe('#dc3545')
      expect(colorUtils.getStatusColor('unknown')).toBe('#6f42c1')
    })
  })
})

describe('Event Utils', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('throttle', () => {
    test('should throttle function calls', () => {
      const mockFn = jest.fn()
      const throttled = eventUtils.throttle(mockFn, 100)
      
      throttled()
      throttled()
      throttled()
      
      expect(mockFn).toHaveBeenCalledTimes(1)
      
      jest.advanceTimersByTime(100)
      throttled()
      
      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('debounce', () => {
    test('should debounce function calls', () => {
      const mockFn = jest.fn()
      const debounced = eventUtils.debounce(mockFn, 100)
      
      debounced()
      debounced()
      debounced()
      
      expect(mockFn).not.toHaveBeenCalled()
      
      jest.advanceTimersByTime(100)
      
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('getEventPosition', () => {
    test('should get position from mouse event', () => {
      const event = { clientX: 100, clientY: 200 } as MouseEvent
      const result = eventUtils.getEventPosition(event)
      expect(result).toEqual({ x: 100, y: 200 })
    })

    test('should get position from touch event', () => {
      const event = { 
        touches: [{ clientX: 100, clientY: 200 }] 
      } as unknown as TouchEvent
      const result = eventUtils.getEventPosition(event)
      expect(result).toEqual({ x: 100, y: 200 })
    })
  })
})

describe('Data Utils', () => {
  describe('filterLinesByStatus', () => {
    test('should filter lines by status', () => {
      const result = dataUtils.filterLinesByStatus(mockLines, ['active'])
      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('active')
    })
  })

  describe('filterSubstationsByStatus', () => {
    test('should filter substations by status', () => {
      const result = dataUtils.filterSubstationsByStatus(mockSubstations, ['ACTIVE'])
      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('ACTIVE')
    })
  })

  describe('groupBy', () => {
    test('should group items by property', () => {
      const result = dataUtils.groupBy(mockLines, 'status')
      expect(result.active).toHaveLength(1)
      expect(result.standby).toHaveLength(1)
    })
  })

  describe('sortBy', () => {
    test('should sort items by criteria', () => {
      const items = [
        { name: 'B', value: 2 },
        { name: 'A', value: 1 },
        { name: 'C', value: 3 }
      ]
      const result = dataUtils.sortBy(items, item => item.name)
      expect(result[0].name).toBe('A')
      expect(result[1].name).toBe('B')
      expect(result[2].name).toBe('C')
    })
  })
})

describe('Performance Utils', () => {
  beforeEach(() => {
    global.performance = { now: jest.fn(() => Date.now()) } as any
    global.console = { log: jest.fn(), warn: jest.fn() } as any
  })

  describe('createMonitor', () => {
    test('should create performance monitor', () => {
      const monitor = performanceUtils.createMonitor('test')
      expect(monitor.end).toBeDefined()
    })
  })

  describe('measure', () => {
    test('should measure function execution', () => {
      const testFn = jest.fn(() => 'result')
      const measured = performanceUtils.measure('test', testFn)
      
      const result = measured()
      expect(result).toBe('result')
      expect(testFn).toHaveBeenCalled()
    })
  })

  describe('createBudgetChecker', () => {
    test('should create budget checker', () => {
      const checker = performanceUtils.createBudgetChecker(100)
      
      checker.check('test', 50)
      expect(checker.getViolations()).toBe(0)
      
      checker.check('test', 150)
      expect(checker.getViolations()).toBe(1)
      
      checker.reset()
      expect(checker.getViolations()).toBe(0)
    })
  })
})

describe('Validation Utils', () => {
  describe('isValidPosition', () => {
    test('should validate valid position', () => {
      expect(validationUtils.isValidPosition({ x: 100, y: 200 })).toBe(true)
    })

    test('should reject invalid position', () => {
      expect(validationUtils.isValidPosition(null)).toBe(false)
      expect(validationUtils.isValidPosition({ x: 'invalid' })).toBe(false)
      expect(validationUtils.isValidPosition({ x: NaN, y: 100 })).toBe(false)
    })
  })

  describe('isValidCoordinateSystem', () => {
    test('should validate valid coordinate system', () => {
      expect(validationUtils.isValidCoordinateSystem(mockCoordinateSystem)).toBe(true)
    })

    test('should reject invalid coordinate system', () => {
      expect(validationUtils.isValidCoordinateSystem(null)).toBe(false)
      expect(validationUtils.isValidCoordinateSystem({ mapWidth: 'invalid' })).toBe(false)
    })
  })

  describe('isValidPositionArray', () => {
    test('should validate valid position array', () => {
      const positions = [{ x: 0, y: 0 }, { x: 100, y: 100 }]
      expect(validationUtils.isValidPositionArray(positions)).toBe(true)
    })

    test('should reject invalid position array', () => {
      expect(validationUtils.isValidPositionArray('not array' as any)).toBe(false)
      expect(validationUtils.isValidPositionArray([{ x: 'invalid' }] as any)).toBe(false)
    })
  })
})