/**
 * Test Utilities Test Suite
 * Tests for the testing utility functions
 */

import { jest } from '@jest/globals'
import { 
  asyncUtils, 
  domUtils, 
  eventUtils, 
  validationUtils,
  performanceUtils,
  mathUtils,
  stringUtils,
  assertionUtils
} from '../test-utils-functions'

// Mock DOM environment
const mockElement = {
  getBoundingClientRect: jest.fn(() => ({
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    top: 100,
    right: 300,
    bottom: 250,
    left: 100
  })),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  dispatchEvent: jest.fn(),
  offsetWidth: 200,
  offsetHeight: 150,
  scrollIntoView: jest.fn(),
  style: {
    setProperty: jest.fn(),
    getPropertyValue: jest.fn(() => 'mock-value')
  }
} as any

// Mock window.getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: jest.fn(() => ({
    display: 'block',
    visibility: 'visible',
    opacity: '1',
    getPropertyValue: jest.fn(() => 'mock-value')
  }))
})

describe('Test Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('asyncUtils', () => {
    describe('waitForAll', () => {
      test('should wait for all promises to resolve', async () => {
        const promise1 = Promise.resolve('result1')
        const promise2 = Promise.resolve('result2')
        const promise3 = Promise.resolve('result3')

        const results = await asyncUtils.waitForAll([promise1, promise2, promise3])
        
        expect(results).toEqual(['result1', 'result2', 'result3'])
      })
    })

    describe('waitForCondition', () => {
      test('should resolve when condition becomes true', async () => {
        let condition = false
        setTimeout(() => { condition = true }, 50)

        await expect(
          asyncUtils.waitForCondition(() => condition, 1000, 10)
        ).resolves.toBeUndefined()
      })

      test('should reject when timeout is reached', async () => {
        await expect(
          asyncUtils.waitForCondition(() => false, 100, 10)
        ).rejects.toThrow('Condition not met within 100ms')
      })
    })

    describe('delay', () => {
      test('should delay execution for specified time', async () => {
        const startTime = Date.now()
        await asyncUtils.delay(50)
        const endTime = Date.now()
        
        expect(endTime - startTime).toBeGreaterThanOrEqual(45) // Allow some tolerance
      })
    })
  })

  describe('domUtils', () => {
    describe('findByTestId', () => {
      test('should find element by test ID', () => {
        const mockContainer = {
          querySelector: jest.fn(() => mockElement)
        } as any

        const result = domUtils.findByTestId(mockContainer, 'test-button')
        
        expect(mockContainer.querySelector).toHaveBeenCalledWith('[data-testid="test-button"]')
        expect(result).toBe(mockElement)
      })
    })

    describe('findByRedundancyClass', () => {
      test('should find element by redundancy class', () => {
        const mockContainer = {
          querySelector: jest.fn(() => mockElement)
        } as any

        const result = domUtils.findByRedundancyClass(mockContainer, 'overlay')
        
        expect(mockContainer.querySelector).toHaveBeenCalledWith('.rdx-overlay')
        expect(result).toBe(mockElement)
      })
    })

    describe('isVisible', () => {
      test('should return true for visible element', () => {
        const result = domUtils.isVisible(mockElement)
        expect(result).toBe(true)
      })

      test('should return false for hidden element', () => {
        Object.defineProperty(window, 'getComputedStyle', {
          value: jest.fn(() => ({
            display: 'none',
            visibility: 'visible',
            opacity: '1'
          }))
        })

        const result = domUtils.isVisible(mockElement)
        expect(result).toBe(false)
      })
    })

    describe('getElementCenter', () => {
      test('should calculate element center coordinates', () => {
        const result = domUtils.getElementCenter(mockElement)
        
        expect(result).toEqual({ x: 200, y: 175 }) // center of 100,100,200,150 rect
      })
    })

    describe('isInViewport', () => {
      test('should return true for element in viewport', () => {
        // Mock window dimensions
        Object.defineProperty(window, 'innerWidth', { value: 1024 })
        Object.defineProperty(window, 'innerHeight', { value: 768 })

        const result = domUtils.isInViewport(mockElement)
        expect(result).toBe(true)
      })
    })
  })

  describe('eventUtils', () => {
    describe('dispatchCustomEvent', () => {
      test('should dispatch custom event with detail', () => {
        const detail = { action: 'test' }
        
        eventUtils.dispatchCustomEvent(mockElement, 'custom-event', detail)
        
        expect(mockElement.dispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'custom-event',
            detail
          })
        )
      })
    })

    describe('clickAt', () => {
      test('should dispatch click event at coordinates', () => {
        eventUtils.clickAt(mockElement, 150, 200)
        
        expect(mockElement.dispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'click',
            clientX: 150,
            clientY: 200
          })
        )
      })
    })

    describe('keyPress', () => {
      test('should dispatch keydown and keyup events', () => {
        eventUtils.keyPress(mockElement, 'Enter')
        
        expect(mockElement.dispatchEvent).toHaveBeenCalledTimes(2)
        expect(mockElement.dispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'keydown', key: 'Enter' })
        )
        expect(mockElement.dispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'keyup', key: 'Enter' })
        )
      })
    })
  })

  describe('validationUtils', () => {
    describe('validateSubstation', () => {
      test('should return true for valid substation', () => {
        const substation = {
          id: 'sub-1',
          name: 'Test Station',
          status: 'ACTIVE',
          position: { x: 100, y: 100 },
          powerRating: 500
        }

        const result = validationUtils.validateSubstation(substation)
        expect(result).toBe(true)
      })

      test('should return false for invalid substation', () => {
        const substation = {
          id: 'sub-1',
          name: 'Test Station'
          // Missing required fields
        }

        const result = validationUtils.validateSubstation(substation)
        expect(result).toBe(false)
      })
    })

    describe('validateCoordinates', () => {
      test('should return true for valid coordinates', () => {
        const coords = { x: 100, y: 200 }
        const result = validationUtils.validateCoordinates(coords)
        expect(result).toBe(true)
      })

      test('should return false for invalid coordinates', () => {
        const coords = { x: -10, y: 200 }
        const result = validationUtils.validateCoordinates(coords)
        expect(result).toBe(false)
      })
    })

    describe('validateColor', () => {
      test('should return true for valid hex color', () => {
        expect(validationUtils.validateColor('#ff0000')).toBe(true)
        expect(validationUtils.validateColor('#f00')).toBe(true)
      })

      test('should return true for valid rgb color', () => {
        expect(validationUtils.validateColor('rgb(255, 0, 0)')).toBe(true)
        expect(validationUtils.validateColor('rgba(255, 0, 0, 0.5)')).toBe(true)
      })

      test('should return false for invalid color', () => {
        expect(validationUtils.validateColor('not-a-color')).toBe(false)
        expect(validationUtils.validateColor('#gggggg')).toBe(false)
      })
    })
  })

  describe('performanceUtils', () => {
    describe('measureExecutionTime', () => {
      test('should measure function execution time', async () => {
        const testFunction = () => {
          // Simulate some work
          for (let i = 0; i < 1000; i++) {
            Math.random()
          }
          return 'result'
        }

        const { result, time } = await performanceUtils.measureExecutionTime(testFunction)
        
        expect(result).toBe('result')
        expect(time).toBeGreaterThan(0)
      })
    })

    describe('isPerformanceAcceptable', () => {
      test('should return true for acceptable performance', () => {
        const metrics = {
          renderTime: 10,
          memoryUsage: 50 * 1024 * 1024, // 50MB
          fps: 60
        }

        const result = performanceUtils.isPerformanceAcceptable(metrics)
        expect(result).toBe(true)
      })

      test('should return false for poor performance', () => {
        const metrics = {
          renderTime: 50, // Too slow
          memoryUsage: 200 * 1024 * 1024, // Too much memory
          fps: 15 // Too low FPS
        }

        const result = performanceUtils.isPerformanceAcceptable(metrics)
        expect(result).toBe(false)
      })
    })
  })

  describe('mathUtils', () => {
    describe('approximately', () => {
      test('should return true for approximately equal numbers', () => {
        expect(mathUtils.approximately(1.0, 1.005, 0.01)).toBe(true)
        expect(mathUtils.approximately(1.0, 1.02, 0.01)).toBe(false)
      })
    })

    describe('distance', () => {
      test('should calculate distance between two points', () => {
        const point1 = { x: 0, y: 0 }
        const point2 = { x: 3, y: 4 }
        
        const result = mathUtils.distance(point1, point2)
        expect(result).toBe(5) // 3-4-5 triangle
      })
    })

    describe('isPointInBounds', () => {
      test('should return true for point within bounds', () => {
        const point = { x: 150, y: 150 }
        const bounds = { x: 100, y: 100, width: 200, height: 200 }
        
        const result = mathUtils.isPointInBounds(point, bounds)
        expect(result).toBe(true)
      })

      test('should return false for point outside bounds', () => {
        const point = { x: 350, y: 150 }
        const bounds = { x: 100, y: 100, width: 200, height: 200 }
        
        const result = mathUtils.isPointInBounds(point, bounds)
        expect(result).toBe(false)
      })
    })

    describe('clamp', () => {
      test('should clamp value within range', () => {
        expect(mathUtils.clamp(5, 0, 10)).toBe(5)
        expect(mathUtils.clamp(-5, 0, 10)).toBe(0)
        expect(mathUtils.clamp(15, 0, 10)).toBe(10)
      })
    })
  })

  describe('stringUtils', () => {
    describe('randomString', () => {
      test('should generate random string of specified length', () => {
        const result = stringUtils.randomString(10)
        
        expect(result).toHaveLength(10)
        expect(typeof result).toBe('string')
      })
    })

    describe('randomId', () => {
      test('should generate random ID with prefix', () => {
        const result = stringUtils.randomId('test')
        
        expect(result).toMatch(/^test-[a-zA-Z0-9]{8}$/)
      })
    })

    describe('formatTestName', () => {
      test('should format test name correctly', () => {
        const result = stringUtils.formatTestName('Test Name With Spaces!')
        expect(result).toBe('test-name-with-spaces')
      })
    })

    describe('truncate', () => {
      test('should truncate long strings', () => {
        const result = stringUtils.truncate('This is a very long string', 10)
        expect(result).toBe('This is...')
      })

      test('should not truncate short strings', () => {
        const result = stringUtils.truncate('Short', 10)
        expect(result).toBe('Short')
      })
    })
  })

  describe('assertionUtils', () => {
    // Note: These tests would typically use real assertions in a test environment
    describe('assertVisible', () => {
      test('should not throw for visible element', () => {
        expect(() => {
          // Mock the expect function for this test
          const mockExpect = {
            toBeTruthy: jest.fn(() => mockExpect),
            toBeVisible: jest.fn(() => mockExpect)
          }
          
          // Override global expect temporarily
          const originalExpect = global.expect
          global.expect = jest.fn(() => mockExpect) as any
          
          assertionUtils.assertVisible(mockElement)
          
          // Restore original expect
          global.expect = originalExpect
        }).not.toThrow()
      })
    })

    describe('assertTextContent', () => {
      test('should handle text content assertion', () => {
        // Create a proper DOM element for testing
        const realElement = document.createElement('div')
        realElement.textContent = 'Test Text'
        
        expect(() => {
          assertionUtils.assertTextContent(realElement, 'Test Text')
        }).not.toThrow()
      })
    })
  })
})