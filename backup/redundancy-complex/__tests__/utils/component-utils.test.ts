/**
 * Tests for Component Utils in __tests__ structure
 */

import { cssUtils, coordinateUtils, validationUtils } from '../../utils/component-utils'

describe('Component Utils (__tests__ structure)', () => {
  describe('CSS Utils', () => {
    test('should create class names with rdx prefix', () => {
      const className = cssUtils.createClassName('button', { primary: true })
      expect(className).toBe('rdx-button rdx-button--primary')
    })

    test('should combine class names', () => {
      const combined = cssUtils.combineClasses('class1', 'class2', null, 'class3')
      expect(combined).toBe('class1 class2 class3')
    })
  })

  describe('Coordinate Utils', () => {
    test('should calculate distance between points', () => {
      const distance = coordinateUtils.distance({ x: 0, y: 0 }, { x: 3, y: 4 })
      expect(distance).toBe(5)
    })

    test('should transform coordinates', () => {
      const coordSys = {
        mapWidth: 400,
        mapHeight: 300,
        viewportWidth: 800,
        viewportHeight: 600,
        scale: 2,
        offset: { x: 10, y: 20 }
      }
      
      const screen = coordinateUtils.mapToScreen({ x: 50, y: 75 }, coordSys)
      expect(screen).toEqual({ x: 110, y: 170 })
    })
  })

  describe('Validation Utils', () => {
    test('should validate positions', () => {
      expect(validationUtils.isValidPosition({ x: 100, y: 200 })).toBe(true)
      expect(validationUtils.isValidPosition(null)).toBe(false)
      expect(validationUtils.isValidPosition({ x: 'invalid' })).toBe(false)
    })
  })
})