/**
 * Testing Utilities for Redundancy Components
 * Shared utilities and helpers for component testing
 */

import React from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { RedundancyProvider } from '../providers/RedundancyProvider'
import type { 
  LineData, 
  SubstationData, 
  CoordinateSystem, 
  Position,
  RedundancyState 
} from '../types'

// Test data factories
export const createMockLineData = (overrides: Partial<LineData> = {}): LineData => ({
  id: 'test-line-1',
  from: 'substation-a',
  to: 'datacenter',
  status: 'active',
  voltage: '345kV',
  path: 'M 100,100 L 300,200',
  color: '#28a745',
  glowIntensity: 0.8,
  ...overrides
})

export const createMockSubstationData = (overrides: Partial<SubstationData> = {}): SubstationData => ({
  id: 'test-substation-1',
  name: 'Test Substation A',
  status: 'ACTIVE',
  capacity: '100MW',
  position: { x: 100, y: 100 },
  color: '#28a745',
  connections: ['test-line-1'],
  ...overrides
})

export const createMockCoordinateSystem = (overrides: Partial<CoordinateSystem> = {}): CoordinateSystem => ({
  mapWidth: 400,
  mapHeight: 300,
  viewportWidth: 800,
  viewportHeight: 600,
  scale: 2,
  offset: { x: 50, y: 75 },
  ...overrides
})

export const createMockPosition = (overrides: Partial<Position> = {}): Position => ({
  x: 100,
  y: 150,
  ...overrides
})

export const createMockRedundancyState = (overrides: Partial<RedundancyState> = {}): RedundancyState => ({
  isEnabled: true,
  selectedLine: null,
  selectedSubstation: null,
  hoveredLine: null,
  hoveredSubstation: null,
  showOverlay: true,
  showInfoPanel: true,
  animationActive: true,
  lastUpdate: Date.now(),
  ...overrides
})

// Mock data collections
export const mockLines: LineData[] = [
  createMockLineData({
    id: 'line-1',
    from: 'sub-a',
    to: 'datacenter',
    status: 'active',
    path: 'M 100,100 L 300,200'
  }),
  createMockLineData({
    id: 'line-2', 
    from: 'sub-b',
    to: 'datacenter',
    status: 'standby',
    path: 'M 150,80 L 300,200',
    color: '#ffc107'
  }),
  createMockLineData({
    id: 'line-3',
    from: 'sub-c',
    to: 'datacenter',
    status: 'inactive',
    path: 'M 200,120 L 300,200',
    color: '#6c757d'
  })
]

export const mockSubstations: SubstationData[] = [
  createMockSubstationData({
    id: 'sub-a',
    name: 'Substation Alpha',
    status: 'ACTIVE',
    position: { x: 100, y: 100 },
    connections: ['line-1']
  }),
  createMockSubstationData({
    id: 'sub-b',
    name: 'Substation Beta',
    status: 'STANDBY',
    position: { x: 150, y: 80 },
    connections: ['line-2'],
    color: '#ffc107'
  }),
  createMockSubstationData({
    id: 'sub-c',
    name: 'Substation Gamma',
    status: 'INACTIVE',
    position: { x: 200, y: 120 },
    connections: ['line-3'],
    color: '#6c757d'
  })
]

// Test wrapper components
interface TestProviderProps {
  children: React.ReactNode
  enabled?: boolean
  initialState?: Partial<RedundancyState>
}

export const TestRedundancyProvider = ({ 
  children, 
  enabled = true, 
  initialState = {} 
}: TestProviderProps) => (
  <RedundancyProvider enabled={enabled} initialState={initialState}>
    {children}
  </RedundancyProvider>
)

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  providerProps?: Omit<TestProviderProps, 'children'>
  withProvider?: boolean
}

export const renderWithRedundancy = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  const { 
    providerProps = {}, 
    withProvider = true,
    ...renderOptions 
  } = options

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (!withProvider) {
      return <>{children}</>
    }
    return (
      <TestRedundancyProvider {...providerProps}>
        {children}
      </TestRedundancyProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Event simulation utilities
export const simulateMouseEvent = (
  element: Element,
  eventType: 'mouseenter' | 'mouseleave' | 'mousemove' | 'click',
  coordinates?: Position
) => {
  const event = new MouseEvent(eventType, {
    bubbles: true,
    cancelable: true,
    clientX: coordinates?.x || 0,
    clientY: coordinates?.y || 0,
  })
  
  element.dispatchEvent(event)
}

export const simulateTouchEvent = (
  element: Element,
  eventType: 'touchstart' | 'touchend' | 'touchmove',
  coordinates?: Position
) => {
  // Mock Touch constructor if not available
  const MockTouch = function(init: any) {
    return {
      identifier: init.identifier || 1,
      target: init.target,
      clientX: init.clientX || 0,
      clientY: init.clientY || 0,
      pageX: init.clientX || 0,
      pageY: init.clientY || 0,
      screenX: init.clientX || 0,
      screenY: init.clientY || 0,
      radiusX: init.radiusX || 5,
      radiusY: init.radiusY || 5,
      rotationAngle: init.rotationAngle || 0,
      force: init.force || 1,
    }
  }

  const TouchConstructor = typeof Touch !== 'undefined' ? Touch : MockTouch
  
  const touch = new TouchConstructor({
    identifier: 1,
    target: element,
    clientX: coordinates?.x || 0,
    clientY: coordinates?.y || 0,
    radiusX: 5,
    radiusY: 5,
    rotationAngle: 0,
    force: 1,
  })

  const event = new TouchEvent(eventType, {
    bubbles: true,
    cancelable: true,
    touches: eventType === 'touchend' ? [] : [touch],
    targetTouches: eventType === 'touchend' ? [] : [touch],
    changedTouches: [touch],
  })

  element.dispatchEvent(event)
}

export const simulateKeyboardEvent = (
  element: Element,
  key: string,
  eventType: 'keydown' | 'keyup' | 'keypress' = 'keydown'
) => {
  const event = new KeyboardEvent(eventType, {
    bubbles: true,
    cancelable: true,
    key,
    code: `Key${key.toUpperCase()}`,
  })

  element.dispatchEvent(event)
}

// Animation testing utilities
export const waitForAnimation = (duration = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, duration))
}

export const mockAnimationFrame = () => {
  const callbacks: FrameRequestCallback[] = []
  let id = 0

  global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
    callbacks.push(callback)
    return ++id
  })

  global.cancelAnimationFrame = jest.fn((frameId: number) => {
    // Remove callback if needed
  })

  const triggerFrame = (timestamp = performance.now()) => {
    const currentCallbacks = [...callbacks]
    callbacks.length = 0
    currentCallbacks.forEach(callback => callback(timestamp))
  }

  return { triggerFrame, callbacks }
}

// Component testing utilities
export const getRedundancyClassName = (element: Element, component: string, modifier?: string): boolean => {
  const baseClass = `rdx-${component}`
  const modifierClass = modifier ? `${baseClass}--${modifier}` : baseClass
  return element.classList.contains(modifierClass)
}

export const expectRedundancyClassName = (element: Element, component: string, modifier?: string) => {
  const baseClass = `rdx-${component}`
  const expectedClass = modifier ? `${baseClass}--${modifier}` : baseClass
  expect(element).toHaveClass(expectedClass)
}

// State testing utilities
export const createStateAssertion = (expectedState: Partial<RedundancyState>) => {
  return (actualState: RedundancyState) => {
    Object.entries(expectedState).forEach(([key, value]) => {
      expect(actualState[key as keyof RedundancyState]).toEqual(value)
    })
  }
}

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now()
  renderFn()
  
  // Wait for next tick to ensure render is complete
  await new Promise(resolve => setTimeout(resolve, 0))
  
  const end = performance.now()
  return end - start
}

export const expectPerformantRender = async (renderFn: () => void, maxTime = 100) => {
  const renderTime = await measureRenderTime(renderFn)
  expect(renderTime).toBeLessThan(maxTime)
}

// Error testing utilities
export const suppressConsoleError = () => {
  const originalError = console.error
  const mockError = jest.fn()
  console.error = mockError
  return () => {
    console.error = originalError
  }
}

export const expectConsoleError = (expectedMessage?: string) => {
  expect(console.error).toHaveBeenCalled()
  if (expectedMessage) {
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(expectedMessage)
    )
  }
}

// Coordinate testing utilities
export const expectCoordinatesWithinTolerance = (
  actual: Position,
  expected: Position,
  tolerance = 1
) => {
  expect(Math.abs(actual.x - expected.x)).toBeLessThanOrEqual(tolerance)
  expect(Math.abs(actual.y - expected.y)).toBeLessThanOrEqual(tolerance)
}

// SVG testing utilities
export const getSVGElement = (container: Element, selector: string): SVGElement | null => {
  return container.querySelector(selector) as SVGElement
}

export const expectSVGAttribute = (element: SVGElement, attribute: string, value: string) => {
  expect(element.getAttribute(attribute)).toBe(value)
}

// Accessibility testing utilities
export const expectAccessibleName = (element: Element, name: string) => {
  expect(element).toHaveAccessibleName(name)
}

export const expectKeyboardNavigable = (element: Element) => {
  expect(element).toHaveAttribute('tabindex')
  expect(element.getAttribute('tabindex')).not.toBe('-1')
}

// Test data generators
export const generateRandomLines = (count: number): LineData[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockLineData({
      id: `generated-line-${index}`,
      from: `substation-${index}`,
      to: 'datacenter',
      status: ['active', 'standby', 'inactive'][index % 3] as LineData['status'],
      path: `M ${100 + index * 50},${100 + index * 20} L 300,200`
    })
  )
}

export const generateRandomSubstations = (count: number): SubstationData[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockSubstationData({
      id: `generated-substation-${index}`,
      name: `Generated Substation ${index + 1}`,
      status: ['ACTIVE', 'STANDBY', 'INACTIVE'][index % 3] as SubstationData['status'],
      position: { x: 100 + index * 50, y: 100 + index * 30 },
      connections: [`generated-line-${index}`]
    })
  )
}

// Export all utilities
export * from '@testing-library/react'
export * from '@testing-library/jest-dom'