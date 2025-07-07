/**
 * Redundancy Component Testing Setup
 * Extended setup for redundancy component tests
 */

import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
  computedStyleSupportsPseudoElements: true,
})

// Mock environment variables
process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY = 'true'
process.env.NODE_ENV = 'test'

// Global mocks for browser APIs
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}))

global.MutationObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(),
}))

// Mock performance API
global.performance = {
  ...global.performance,
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
}

// Mock animation APIs
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16))
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id))

// Mock getComputedStyle
global.getComputedStyle = jest.fn(() => ({
  getPropertyValue: jest.fn(() => ''),
  setProperty: jest.fn(),
  removeProperty: jest.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  top: 0,
  right: 100,
  bottom: 100,
  left: 0,
  toJSON: jest.fn(),
}))

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn()

// Mock canvas API
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: [] })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: [] })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
}))

// Mock SVG APIs
if (!global.SVGElement) {
  global.SVGElement = class MockSVGElement {
    getBBox() {
      return {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      }
    }
  }
}

// Add getBBox method if it doesn't exist
if (global.SVGElement && !global.SVGElement.prototype.getBBox) {
  global.SVGElement.prototype.getBBox = jest.fn(() => ({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  }))
}

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url')
global.URL.revokeObjectURL = jest.fn()

// Mock File and FileReader
global.File = jest.fn(() => ({}))
global.FileReader = jest.fn(() => ({
  readAsDataURL: jest.fn(),
  readAsText: jest.fn(),
  onload: jest.fn(),
  onerror: jest.fn(),
  result: '',
}))

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => '12345678-1234-1234-1234-123456789012'),
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    }),
  },
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(() => null),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
})

// Console spy setup for clean test output
const originalError = console.error
const originalWarn = console.warn

beforeEach(() => {
  // Suppress known warnings in tests
  console.error = jest.fn((message) => {
    if (
      typeof message === 'string' &&
      (message.includes('Warning: ReactDOM.render') ||
       message.includes('Warning: componentWillMount') ||
       message.includes('Warning: componentWillReceiveProps'))
    ) {
      return
    }
    originalError(message)
  })
  
  console.warn = jest.fn((message) => {
    if (
      typeof message === 'string' &&
      message.includes('deprecated')
    ) {
      return
    }
    originalWarn(message)
  })
})

afterEach(() => {
  console.error = originalError
  console.warn = originalWarn
  jest.clearAllMocks()
  jest.clearAllTimers()
})

// Global test utilities
global.waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))

global.flushPromises = () => new Promise(resolve => setImmediate(resolve))

global.waitForAnimationFrame = () => new Promise(resolve => {
  requestAnimationFrame(resolve)
})

// Custom matchers
expect.extend({
  toBeValidRedundancyComponent(received) {
    const pass = received && 
                 typeof received === 'object' &&
                 'type' in received &&
                 'props' in received
    
    return {
      message: () => pass 
        ? `Expected ${received} not to be a valid React component`
        : `Expected ${received} to be a valid React component`,
      pass,
    }
  },
  
  toHaveRedundancyClassName(received, className) {
    const pass = received.classList.contains(`rdx-${className}`)
    
    return {
      message: () => pass
        ? `Expected element not to have redundancy class "rdx-${className}"`
        : `Expected element to have redundancy class "rdx-${className}"`,
      pass,
    }
  },
  
  toBeWithinCoordinates(received, x, y, tolerance = 1) {
    const pass = Math.abs(received.x - x) <= tolerance && 
                 Math.abs(received.y - y) <= tolerance
    
    return {
      message: () => pass
        ? `Expected position {x: ${received.x}, y: ${received.y}} not to be within tolerance ${tolerance} of {x: ${x}, y: ${y}}`
        : `Expected position {x: ${received.x}, y: ${received.y}} to be within tolerance ${tolerance} of {x: ${x}, y: ${y}}`,
      pass,
    }
  }
})

// Export test utilities for use in tests
export const testUtils = {
  waitForNextTick: global.waitForNextTick,
  flushPromises: global.flushPromises,
  waitForAnimationFrame: global.waitForAnimationFrame,
}