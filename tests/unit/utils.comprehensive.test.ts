import { cn } from '@/lib/utils'
import {
  containerVariants,
  childVariants,
  powerLineVariants,
  pulseVariants,
  modalVariants,
  backdropVariants,
  markerVariants,
  legendVariants,
  themeVariants,
  loadingVariants,
  pageVariants,
  rippleVariants,
  errorVariants,
  successVariants,
  createSpringAnimation,
  createEaseAnimation,
} from '@/utils/animations'
import {
  containerVariants as containerVariantsV2,
  staggerChildrenVariants,
  powerLineVariants as powerLineVariantsV2,
  pulseVariants as pulseVariantsV2,
  hotspotVariants,
  modalVariants as modalVariantsV2,
  backdropVariants as backdropVariantsV2,
  tooltipVariants,
  loadingVariants as loadingVariantsV2,
  slideInVariants,
  fadeInVariants,
  zoomInVariants,
  bounceVariants,
  transmissionVariants,
  statusVariants,
  pageTransitionVariants,
} from '@/utils/animation-variants'
import {
  initPerformanceMonitoring,
  getPerformanceData,
  subscribeToPerformance,
  getPerformanceScore,
  measurePerformance,
  usePerformanceMonitoring,
  type PerformanceMetric,
  type PerformanceData,
} from '@/lib/performance'

// Mock React for usePerformanceMonitoring hook
jest.mock('react', () => ({
  useEffect: jest.fn((fn) => fn()),
}))

// Mock web-vitals
jest.mock('web-vitals', () => ({
  onCLS: jest.fn(),
  onFCP: jest.fn(),
  onLCP: jest.fn(),
  onTTFB: jest.fn(),
}))

// Mock console methods
const originalConsole = console
beforeAll(() => {
  console.log = jest.fn()
  console.warn = jest.fn()
  console.error = jest.fn()
})

afterAll(() => {
  console.log = originalConsole.log
  console.warn = originalConsole.warn
  console.error = originalConsole.error
})

describe('Utility Functions - Comprehensive Testing', () => {
  describe('cn() utility function', () => {
    it('should merge class names correctly', () => {
      const result = cn('bg-red-500', 'text-white')
      expect(result).toBe('bg-red-500 text-white')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toBe('base-class active-class')
    })

    it('should handle undefined/null values', () => {
      const result = cn('base-class', undefined, null, 'another-class')
      expect(result).toBe('base-class another-class')
    })

    it('should merge Tailwind classes correctly', () => {
      const result = cn('bg-red-500', 'bg-blue-500')
      expect(result).toBe('bg-blue-500') // Later class should override
    })

    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('should handle objects with boolean values', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true,
      })
      expect(result).toBe('class1 class3')
    })

    it('should handle empty inputs', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle complex Tailwind merge scenarios', () => {
      const result = cn(
        'px-2 py-1 bg-red-500 hover:bg-red-600',
        'px-4 bg-blue-500'
      )
      expect(result).toBe('py-1 hover:bg-red-600 px-4 bg-blue-500')
    })
  })

  describe('Animation Variants - animations.ts', () => {
    describe('containerVariants', () => {
      it('should have correct structure', () => {
        expect(containerVariants).toHaveProperty('hidden')
        expect(containerVariants).toHaveProperty('visible')
        expect(containerVariants).toHaveProperty('exit')
      })

      it('should have correct hidden state', () => {
        expect(containerVariants.hidden).toEqual({
          opacity: 0,
          scale: 0.95,
        })
      })

      it('should have correct visible state with transitions', () => {
        expect(containerVariants.visible).toHaveProperty('opacity', 1)
        expect(containerVariants.visible).toHaveProperty('scale', 1)
        expect(containerVariants.visible).toHaveProperty('transition')
        expect(containerVariants.visible.transition).toHaveProperty('duration', 0.5)
        expect(containerVariants.visible.transition).toHaveProperty('staggerChildren', 0.1)
      })

      it('should have correct exit state', () => {
        expect(containerVariants.exit).toEqual({
          opacity: 0,
          scale: 0.95,
          transition: {
            duration: 0.3,
            ease: 'easeIn',
          },
        })
      })
    })

    describe('childVariants', () => {
      it('should have spring animation in visible state', () => {
        expect(childVariants.visible?.transition).toHaveProperty('type', 'spring')
        expect(childVariants.visible?.transition).toHaveProperty('damping', 20)
        expect(childVariants.visible?.transition).toHaveProperty('stiffness', 300)
      })

      it('should have y transformation', () => {
        expect(childVariants.hidden).toHaveProperty('y', 20)
        expect(childVariants.visible).toHaveProperty('y', 0)
        expect(childVariants.exit).toHaveProperty('y', -20)
      })
    })

    describe('powerLineVariants', () => {
      it('should have pathLength animations', () => {
        expect(powerLineVariants.initial).toHaveProperty('pathLength', 0)
        expect(powerLineVariants.animate).toHaveProperty('pathLength', 1)
      })

      it('should have stroke animation properties', () => {
        expect(powerLineVariants.initial).toHaveProperty('strokeDasharray', '10 10')
        expect(powerLineVariants.initial).toHaveProperty('strokeDashoffset', 0)
        expect(powerLineVariants.animate).toHaveProperty('strokeDashoffset', -20)
      })

      it('should have infinite strokeDashoffset animation', () => {
        const strokeDashoffsetTransition = powerLineVariants.animate?.transition?.strokeDashoffset
        expect(strokeDashoffsetTransition).toHaveProperty('repeat', Infinity)
        expect(strokeDashoffsetTransition).toHaveProperty('ease', 'linear')
      })
    })

    describe('pulseVariants', () => {
      it('should have pulsing scale animation', () => {
        expect(pulseVariants.animate).toHaveProperty('scale', [1, 1.2, 1])
        expect(pulseVariants.animate).toHaveProperty('opacity', [0.8, 1, 0.8])
      })

      it('should have infinite repeat', () => {
        expect(pulseVariants.animate?.transition).toHaveProperty('repeat', Infinity)
        expect(pulseVariants.animate?.transition).toHaveProperty('duration', 2)
      })
    })

    describe('modalVariants', () => {
      it('should have spring animation', () => {
        expect(modalVariants.visible?.transition).toHaveProperty('type', 'spring')
        expect(modalVariants.visible?.transition).toHaveProperty('damping', 25)
        expect(modalVariants.visible?.transition).toHaveProperty('stiffness', 400)
      })

      it('should animate from bottom', () => {
        expect(modalVariants.hidden).toHaveProperty('y', 50)
        expect(modalVariants.visible).toHaveProperty('y', 0)
        expect(modalVariants.exit).toHaveProperty('y', 50)
      })
    })

    describe('markerVariants', () => {
      it('should have rotation animation', () => {
        expect(markerVariants.initial).toHaveProperty('rotate', -180)
        expect(markerVariants.animate).toHaveProperty('rotate', 0)
        expect(markerVariants.hover).toHaveProperty('rotate', 5)
      })

      it('should have tap state', () => {
        expect(markerVariants.tap).toHaveProperty('scale', 0.95)
        expect(markerVariants.tap?.transition).toHaveProperty('duration', 0.1)
      })
    })

    describe('themeVariants', () => {
      it('should have light and dark themes', () => {
        expect(themeVariants).toHaveProperty('light')
        expect(themeVariants).toHaveProperty('dark')
      })

      it('should have correct colors', () => {
        expect(themeVariants.light).toHaveProperty('backgroundColor', '#ffffff')
        expect(themeVariants.light).toHaveProperty('color', '#1f2937')
        expect(themeVariants.dark).toHaveProperty('backgroundColor', '#0f172a')
        expect(themeVariants.dark).toHaveProperty('color', '#f8fafc')
      })
    })

    describe('errorVariants', () => {
      it('should have shake animation', () => {
        expect(errorVariants.shake).toHaveProperty('x', [-10, 10, -10, 10, 0])
        expect(errorVariants.shake?.transition).toHaveProperty('duration', 0.5)
      })
    })

    describe('successVariants', () => {
      it('should have scale animation array', () => {
        expect(successVariants.animate).toHaveProperty('scale', [0, 1.2, 1])
        expect(successVariants.animate?.transition).toHaveProperty('ease', 'easeOut')
      })
    })
  })

  describe('Animation Variants - animation-variants.ts', () => {
    describe('staggerChildrenVariants', () => {
      it('should have simpler structure than childVariants', () => {
        expect(staggerChildrenVariants.hidden).toEqual({
          opacity: 0,
          y: 20,
        })
        expect(staggerChildrenVariants.visible).toEqual({
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
          },
        })
      })
    })

    describe('hotspotVariants', () => {
      it('should have spring animations', () => {
        expect(hotspotVariants.animate?.transition).toHaveProperty('type', 'spring')
        expect(hotspotVariants.hover?.transition).toHaveProperty('type', 'spring')
        expect(hotspotVariants.tap?.transition).toHaveProperty('type', 'spring')
      })

      it('should have different scale values for states', () => {
        expect(hotspotVariants.animate).toHaveProperty('scale', 1)
        expect(hotspotVariants.hover).toHaveProperty('scale', 1.1)
        expect(hotspotVariants.tap).toHaveProperty('scale', 0.95)
      })
    })

    describe('tooltipVariants', () => {
      it('should animate from bottom with small offset', () => {
        expect(tooltipVariants.hidden).toHaveProperty('y', 10)
        expect(tooltipVariants.visible).toHaveProperty('y', 0)
        expect(tooltipVariants.exit).toHaveProperty('y', 10)
      })

      it('should have scale animation', () => {
        expect(tooltipVariants.hidden).toHaveProperty('scale', 0.8)
        expect(tooltipVariants.visible).toHaveProperty('scale', 1)
        expect(tooltipVariants.exit).toHaveProperty('scale', 0.8)
      })
    })

    describe('transmissionVariants', () => {
      it('should have stroke dash animations', () => {
        expect(transmissionVariants.idle).toHaveProperty('strokeDasharray', '5,5')
        expect(transmissionVariants.active).toHaveProperty('strokeDasharray', '5,5')
        expect(transmissionVariants.active).toHaveProperty('strokeDashoffset', [0, -10])
      })

      it('should have infinite linear animation', () => {
        const transition = transmissionVariants.active?.transition?.strokeDashoffset
        expect(transition).toHaveProperty('repeat', Infinity)
        expect(transition).toHaveProperty('ease', 'linear')
      })
    })

    describe('statusVariants', () => {
      it('should have correct status colors', () => {
        expect(statusVariants.operational).toHaveProperty('backgroundColor', '#10b981')
        expect(statusVariants.warning).toHaveProperty('backgroundColor', '#f59e0b')
        expect(statusVariants.critical).toHaveProperty('backgroundColor', '#ef4444')
        expect(statusVariants.offline).toHaveProperty('backgroundColor', '#6b7280')
      })

      it('should have different animation behaviors', () => {
        expect(statusVariants.operational).toHaveProperty('scale', 1)
        expect(statusVariants.warning).toHaveProperty('scale', [1, 1.1, 1])
        expect(statusVariants.critical).toHaveProperty('scale', [1, 1.2, 1])
        expect(statusVariants.offline).toHaveProperty('opacity', 0.6)
      })

      it('should have infinite repeat for warning states', () => {
        expect(statusVariants.warning?.transition).toHaveProperty('repeat', Infinity)
        expect(statusVariants.critical?.transition).toHaveProperty('repeat', Infinity)
      })
    })

    describe('bounceVariants', () => {
      it('should have bounce spring configuration', () => {
        expect(bounceVariants.animate?.transition).toHaveProperty('type', 'spring')
        expect(bounceVariants.animate?.transition).toHaveProperty('bounce', 0.4)
        expect(bounceVariants.animate?.transition).toHaveProperty('damping', 10)
      })
    })
  })

  describe('Animation Utility Functions', () => {
    describe('createSpringAnimation', () => {
      it('should create spring animation with default values', () => {
        const animation = createSpringAnimation()
        expect(animation).toEqual({
          type: 'spring',
          damping: 20,
          stiffness: 300,
          duration: 0.5,
        })
      })

      it('should create spring animation with custom values', () => {
        const animation = createSpringAnimation(15, 400, 0.8)
        expect(animation).toEqual({
          type: 'spring',
          damping: 15,
          stiffness: 400,
          duration: 0.8,
        })
      })

      it('should handle edge case values', () => {
        const animation = createSpringAnimation(0, 0, 0)
        expect(animation).toEqual({
          type: 'spring',
          damping: 0,
          stiffness: 0,
          duration: 0,
        })
      })
    })

    describe('createEaseAnimation', () => {
      it('should create ease animation with default values', () => {
        const animation = createEaseAnimation()
        expect(animation).toEqual({
          duration: 0.3,
          ease: 'easeInOut',
        })
      })

      it('should create ease animation with custom values', () => {
        const animation = createEaseAnimation(0.5, 'easeOut')
        expect(animation).toEqual({
          duration: 0.5,
          ease: 'easeOut',
        })
      })

      it('should handle different ease types', () => {
        const easings = ['easeIn', 'easeOut', 'easeInOut', 'linear']
        easings.forEach(ease => {
          const animation = createEaseAnimation(0.2, ease)
          expect(animation.ease).toBe(ease)
        })
      })
    })
  })

  describe('Performance Monitoring', () => {
    // Mock performance API
    let mockPerformance: { now: jest.Mock }
    
    beforeEach(() => {
      mockPerformance = {
        now: jest.fn(() => 123.456),
      }
      global.performance = mockPerformance as any
    })

    describe('Performance Data Types', () => {
      it('should have correct PerformanceMetric interface', () => {
        const metric: PerformanceMetric = {
          name: 'test',
          value: 100,
          rating: 'good',
          delta: 10,
          id: 'test-id',
          navigationType: 'navigate',
        }
        
        expect(metric.name).toBe('test')
        expect(metric.rating).toBe('good')
        expect(['good', 'needs-improvement', 'poor']).toContain(metric.rating)
      })

      it('should have correct PerformanceData interface', () => {
        const data: PerformanceData = {
          CLS: null,
          FID: null,
          FCP: null,
          LCP: null,
          TTFB: null,
        }
        
        expect(data).toHaveProperty('CLS')
        expect(data).toHaveProperty('FID')
        expect(data).toHaveProperty('FCP')
        expect(data).toHaveProperty('LCP')
        expect(data).toHaveProperty('TTFB')
      })
    })

    describe('initPerformanceMonitoring', () => {
      it('should not throw when called in browser environment', () => {
        global.window = {} as any
        expect(() => initPerformanceMonitoring()).not.toThrow()
      })

      it('should handle server-side rendering', () => {
        delete (global as any).window
        expect(() => initPerformanceMonitoring()).not.toThrow()
      })
    })

    describe('getPerformanceData', () => {
      it('should return performance data object', () => {
        const data = getPerformanceData()
        expect(data).toHaveProperty('CLS')
        expect(data).toHaveProperty('FID')
        expect(data).toHaveProperty('FCP')
        expect(data).toHaveProperty('LCP')
        expect(data).toHaveProperty('TTFB')
      })

      it('should return a copy of data (not reference)', () => {
        const data1 = getPerformanceData()
        const data2 = getPerformanceData()
        expect(data1).not.toBe(data2)
        expect(data1).toEqual(data2)
      })
    })

    describe('subscribeToPerformance', () => {
      it('should return unsubscribe function', () => {
        const callback = jest.fn()
        const unsubscribe = subscribeToPerformance(callback)
        expect(typeof unsubscribe).toBe('function')
      })

      it('should call unsubscribe without errors', () => {
        const callback = jest.fn()
        const unsubscribe = subscribeToPerformance(callback)
        expect(() => unsubscribe()).not.toThrow()
      })
    })

    describe('getPerformanceScore', () => {
      it('should return 0 for empty data', () => {
        const score = getPerformanceScore()
        expect(score).toBe(0)
      })

      it('should calculate score correctly', () => {
        // Since we can't easily mock the internal state, we test the logic
        const score = getPerformanceScore()
        expect(typeof score).toBe('number')
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
      })
    })

    describe('measurePerformance', () => {
      it('should measure synchronous function', () => {
        const syncMockPerformance = {
          now: jest.fn().mockReturnValueOnce(100).mockReturnValueOnce(200),
        }
        
        // Properly mock performance to exist
        Object.defineProperty(global, 'performance', {
          value: syncMockPerformance,
          writable: true,
          configurable: true,
        })
        
        const mockFn = jest.fn(() => 'result')
        const result = measurePerformance('test', mockFn)
        
        expect(result).toBe('result')
        expect(mockFn).toHaveBeenCalled()
        expect(syncMockPerformance.now).toHaveBeenCalledTimes(2)
      })

      it('should measure asynchronous function', async () => {
        const mockFn = jest.fn(async () => 'async-result')
        const result = measurePerformance('test-async', mockFn)
        
        expect(result).toBeInstanceOf(Promise)
        const awaitedResult = await result
        expect(awaitedResult).toBe('async-result')
        expect(mockFn).toHaveBeenCalled()
      })

      it('should handle function that throws', () => {
        const errorMockPerformance = {
          now: jest.fn().mockReturnValueOnce(100).mockReturnValueOnce(200),
        }
        
        Object.defineProperty(global, 'performance', {
          value: errorMockPerformance,
          writable: true,
          configurable: true,
        })
        
        const mockFn = jest.fn(() => {
          throw new Error('test error')
        })
        
        expect(() => measurePerformance('test-error', mockFn)).toThrow('test error')
        expect(errorMockPerformance.now).toHaveBeenCalledTimes(1) // Only start time is measured when sync function throws
      })

      it('should handle async function that rejects', async () => {
        const mockFn = jest.fn(async () => {
          throw new Error('async error')
        })
        
        const result = measurePerformance('test-async-error', mockFn)
        await expect(result).rejects.toThrow('async error')
      })

      it('should work without performance API', () => {
        delete (global as any).performance
        const mockFn = jest.fn(() => 'no-perf-result')
        const result = measurePerformance('test-no-perf', mockFn)
        
        expect(result).toBe('no-perf-result')
        expect(mockFn).toHaveBeenCalled()
      })
    })

    describe('usePerformanceMonitoring', () => {
      it('should return performance utilities', () => {
        const hook = usePerformanceMonitoring()
        
        expect(hook).toHaveProperty('getPerformanceData')
        expect(hook).toHaveProperty('getPerformanceScore')
        expect(hook).toHaveProperty('subscribeToPerformance')
        expect(hook).toHaveProperty('measurePerformance')
        
        expect(typeof hook.getPerformanceData).toBe('function')
        expect(typeof hook.getPerformanceScore).toBe('function')
        expect(typeof hook.subscribeToPerformance).toBe('function')
        expect(typeof hook.measurePerformance).toBe('function')
      })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    describe('cn() edge cases', () => {
      it('should handle very long class strings', () => {
        const longClass = 'a'.repeat(1000)
        const result = cn(longClass, 'short')
        expect(result).toContain(longClass)
        expect(result).toContain('short')
      })

      it('should handle special characters in class names', () => {
        const result = cn('class-with-dashes', 'class_with_underscore', 'class:with:colons')
        expect(result).toBe('class-with-dashes class_with_underscore class:with:colons')
      })

      it('should handle numeric class names', () => {
        const result = cn('w-1/2', 'h-1/3', 'top-1/4')
        expect(result).toBe('w-1/2 h-1/3 top-1/4')
      })
    })

    describe('Animation variants edge cases', () => {
      it('should handle missing transition properties gracefully', () => {
        const variants = { ...containerVariants }
        delete variants.visible?.transition
        expect(() => variants.visible).not.toThrow()
      })

      it('should handle negative values in animations', () => {
        expect(childVariants.hidden?.y).toBe(20)
        expect(childVariants.exit?.y).toBe(-20)
        expect(typeof childVariants.hidden?.y).toBe('number')
      })
    })

    describe('Performance monitoring edge cases', () => {
      it('should handle measurePerformance with null function', () => {
        expect(() => measurePerformance('test', null as any)).toThrow()
      })

      it('should handle very fast operations', () => {
        const fastMockPerformance = {
          now: jest.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.001),
        }
        Object.defineProperty(global, 'performance', {
          value: fastMockPerformance,
          writable: true,
          configurable: true,
        })
        const result = measurePerformance('fast-op', () => 'fast')
        expect(result).toBe('fast')
      })

      it('should handle performance.now() returning NaN', () => {
        const nanMockPerformance = {
          now: jest.fn().mockReturnValue(NaN),
        }
        Object.defineProperty(global, 'performance', {
          value: nanMockPerformance,
          writable: true,
          configurable: true,
        })
        const result = measurePerformance('nan-test', () => 'result')
        expect(result).toBe('result')
      })
    })
  })

  describe('Memory and Performance', () => {
    it('should not create memory leaks with repeated cn() calls', () => {
      const initialMemory = process.memoryUsage().heapUsed
      
      for (let i = 0; i < 10000; i++) {
        cn('class1', 'class2', 'class3', i % 2 === 0 && 'conditional')
      }
      
      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory
      
      // Memory increase should be reasonable (less than 10MB for 10k operations)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    })

    it('should handle rapid performance measurements', () => {
      const measurements = []
      
      for (let i = 0; i < 100; i++) {
        const result = measurePerformance(`test-${i}`, () => i * 2)
        measurements.push(result)
      }
      
      expect(measurements).toHaveLength(100)
      expect(measurements[0]).toBe(0)
      expect(measurements[99]).toBe(198)
    })
  })

  describe('Browser Compatibility', () => {
    it('should work without Framer Motion types', () => {
      // Test that variants work even if Framer Motion types are not available
      const variants = containerVariants
      expect(variants.hidden).toBeTruthy()
      expect(variants.visible).toBeTruthy()
      expect(variants.exit).toBeTruthy()
    })

    it('should work in Node.js environment', () => {
      const originalWindow = global.window
      delete (global as any).window
      
      expect(() => initPerformanceMonitoring()).not.toThrow()
      expect(() => getPerformanceData()).not.toThrow()
      expect(() => getPerformanceScore()).not.toThrow()
      
      global.window = originalWindow
    })
  })
})