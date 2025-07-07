/**
 * Mock Implementations
 * Comprehensive mock implementations for testing redundancy feature
 */

import { jest } from '@jest/globals'

/**
 * Mock Redux/Context Store
 */
export const createMockRedundancyStore = (initialState: any = {}) => {
  const defaultState = {
    isEnabled: true,
    isVisible: false,
    selectedSubstation: null,
    selectedLine: null,
    redundancyData: {
      substations: [],
      lines: [],
      redundancyPairs: []
    },
    uiState: {
      showInfoPanel: true,
      showLineHighlights: true,
      showSubstationMarkers: true,
      animationSpeed: 1
    },
    errorState: {
      hasError: false,
      errorMessage: null,
      errorCode: null
    }
  }

  const state = { ...defaultState, ...initialState }

  return {
    getState: jest.fn(() => state),
    dispatch: jest.fn((action) => {
      // Mock state updates based on action type
      switch (action.type) {
        case 'SET_VISIBILITY':
          state.isVisible = action.payload
          break
        case 'SELECT_SUBSTATION':
          state.selectedSubstation = action.payload
          break
        case 'SELECT_LINE':
          state.selectedLine = action.payload
          break
        case 'UPDATE_UI_STATE':
          state.uiState = { ...state.uiState, ...action.payload }
          break
        case 'SET_ERROR':
          state.errorState = { ...state.errorState, ...action.payload }
          break
      }
      return action
    }),
    subscribe: jest.fn(),
    replaceReducer: jest.fn()
  }
}

/**
 * Mock API Responses
 */
export const mockApiResponses = {
  getRedundancyData: jest.fn(() => Promise.resolve({
    substations: [
      {
        id: 'sub-1',
        name: 'Main Substation',
        status: 'ACTIVE',
        position: { x: 100, y: 100 },
        redundancyGroup: 'group-1',
        powerRating: 500,
        connections: ['line-1', 'line-2']
      },
      {
        id: 'sub-2',
        name: 'Backup Substation',
        status: 'STANDBY',
        position: { x: 300, y: 150 },
        redundancyGroup: 'group-1',
        powerRating: 500,
        connections: ['line-2', 'line-3']
      }
    ],
    lines: [
      {
        id: 'line-1',
        name: 'Primary Line',
        status: 'ACTIVE',
        path: [{ x: 100, y: 100 }, { x: 200, y: 100 }],
        redundancyType: 'N+1',
        powerFlow: 450,
        capacity: 500
      },
      {
        id: 'line-2',
        name: 'Secondary Line',
        status: 'ACTIVE',
        path: [{ x: 200, y: 100 }, { x: 300, y: 150 }],
        redundancyType: '2N+1',
        powerFlow: 300,
        capacity: 500
      }
    ],
    redundancyPairs: [
      {
        primary: 'sub-1',
        backup: 'sub-2',
        redundancyLevel: '2N+1',
        switchoverTime: 50
      }
    ]
  })),

  updateSubstationStatus: jest.fn((id: string, status: string) => 
    Promise.resolve({ id, status, updatedAt: new Date().toISOString() })
  ),

  triggerFailover: jest.fn((fromId: string, toId: string) =>
    Promise.resolve({ 
      success: true, 
      failoverTime: 45,
      fromSubstation: fromId,
      toSubstation: toId
    })
  ),

  getSystemHealth: jest.fn(() => Promise.resolve({
    overall: 'HEALTHY',
    redundancyLevel: 0.95,
    criticalAlerts: 0,
    warningAlerts: 2,
    lastUpdate: new Date().toISOString()
  }))
}

/**
 * Mock DOM APIs
 */
export const mockDOMAPIs = {
  // Mock SVG manipulation
  createSVGElement: jest.fn((tagName: string) => {
    const element = document.createElement('div')
    element.setAttribute('data-mock-svg-element', tagName)
    element.getBBox = jest.fn(() => ({
      x: 0, y: 0, width: 100, height: 100
    }))
    return element as any
  }),

  // Mock Canvas API
  createCanvasContext: jest.fn(() => ({
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    drawImage: jest.fn(),
    getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
    measureText: jest.fn(() => ({ width: 100 })),
    fillText: jest.fn(),
    strokeText: jest.fn()
  })),

  // Mock IntersectionObserver
  createIntersectionObserver: jest.fn((callback) => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    root: null,
    rootMargin: '',
    thresholds: []
  })),

  // Mock ResizeObserver
  createResizeObserver: jest.fn((callback) => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }))
}

/**
 * Mock React Hooks
 */
export const mockReactHooks = {
  // Mock useState
  useState: jest.fn((initialValue) => {
    let value = initialValue
    const setValue = jest.fn((newValue) => {
      value = typeof newValue === 'function' ? newValue(value) : newValue
    })
    return [value, setValue]
  }),

  // Mock useEffect
  useEffect: jest.fn((effect, deps) => {
    // Mock implementation that calls effect immediately
    const cleanup = effect()
    return cleanup
  }),

  // Mock useRef
  useRef: jest.fn((initialValue) => ({
    current: initialValue
  })),

  // Mock useCallback
  useCallback: jest.fn((callback, deps) => callback),

  // Mock useMemo
  useMemo: jest.fn((factory, deps) => factory()),

  // Mock useContext
  useContext: jest.fn((context) => ({
    // Default mock context values
    redundancyEnabled: true,
    redundancyData: null,
    selectedSubstation: null,
    selectedLine: null,
    setSelectedSubstation: jest.fn(),
    setSelectedLine: jest.fn()
  }))
}

/**
 * Mock Animation APIs
 */
export const mockAnimationAPIs = {
  // Mock requestAnimationFrame
  requestAnimationFrame: jest.fn((callback) => {
    const id = setTimeout(callback, 16) // ~60 FPS
    return id as any
  }),

  // Mock cancelAnimationFrame
  cancelAnimationFrame: jest.fn((id) => {
    clearTimeout(id)
  }),

  // Mock Web Animations API
  createAnimation: jest.fn((element, keyframes, options) => ({
    play: jest.fn(),
    pause: jest.fn(),
    cancel: jest.fn(),
    finish: jest.fn(),
    reverse: jest.fn(),
    currentTime: 0,
    playbackRate: 1,
    playState: 'running',
    ready: Promise.resolve(),
    finished: Promise.resolve(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  })),

  // Mock CSS transitions
  mockTransition: jest.fn((element, property, duration) => {
    element.style.transition = `${property} ${duration}ms ease`
    setTimeout(() => {
      element.dispatchEvent(new Event('transitionend'))
    }, duration)
  })
}

/**
 * Mock Network APIs
 */
export const mockNetworkAPIs = {
  // Mock fetch
  fetch: jest.fn((url, options) => {
    const mockResponses: Record<string, any> = {
      '/api/redundancy/data': mockApiResponses.getRedundancyData(),
      '/api/redundancy/health': mockApiResponses.getSystemHealth()
    }

    const response = mockResponses[url] || Promise.resolve({})
    
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => response,
      text: () => Promise.resolve(JSON.stringify(response)),
      blob: () => Promise.resolve(new Blob()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      headers: new Headers(),
      url,
      type: 'default',
      redirected: false,
      clone: jest.fn()
    })
  }),

  // Mock WebSocket
  createWebSocket: jest.fn((url) => ({
    readyState: 1, // OPEN
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    onopen: null,
    onclose: null,
    onmessage: null,
    onerror: null
  })),

  // Mock EventSource
  createEventSource: jest.fn((url) => ({
    readyState: 1, // OPEN
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    onopen: null,
    onmessage: null,
    onerror: null
  }))
}

/**
 * Mock Performance APIs
 */
export const mockPerformanceAPIs = {
  // Mock Performance Observer
  createPerformanceObserver: jest.fn((callback) => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
    takeRecords: jest.fn(() => [])
  })),

  // Mock Performance entries
  createPerformanceEntry: jest.fn((name, type) => ({
    name,
    entryType: type,
    startTime: performance.now(),
    duration: 0
  })),

  // Mock User Timing API
  mark: jest.fn((name) => {
    const entry = mockPerformanceAPIs.createPerformanceEntry(name, 'mark')
    performance.mark(name)
    return entry
  }),

  measure: jest.fn((name, startMark, endMark) => {
    const entry = mockPerformanceAPIs.createPerformanceEntry(name, 'measure')
    performance.measure(name, startMark, endMark)
    return entry
  })
}

/**
 * Mock Error Handling
 */
export const mockErrorHandling = {
  // Mock error boundary
  createErrorBoundary: jest.fn(() => ({
    componentDidCatch: jest.fn(),
    getDerivedStateFromError: jest.fn(() => ({ hasError: true })),
    state: { hasError: false },
    render: jest.fn()
  })),

  // Mock error reporting
  reportError: jest.fn((error, errorInfo) => {
    console.error('Mock Error Report:', error, errorInfo)
  }),

  // Mock error recovery
  recoverFromError: jest.fn(() => {
    return { recovered: true, strategy: 'component-reset' }
  })
}

/**
 * Mock Data Generators
 */
export const mockDataGenerators = {
  // Generate mock substation data
  generateSubstation: (overrides: any = {}) => ({
    id: `sub-${Math.random().toString(36).substr(2, 9)}`,
    name: `Substation ${Math.floor(Math.random() * 100)}`,
    status: 'ACTIVE',
    position: { 
      x: Math.floor(Math.random() * 800), 
      y: Math.floor(Math.random() * 600) 
    },
    redundancyGroup: 'group-1',
    powerRating: 500,
    connections: [],
    ...overrides
  }),

  // Generate mock line data
  generateLine: (overrides: any = {}) => ({
    id: `line-${Math.random().toString(36).substr(2, 9)}`,
    name: `Line ${Math.floor(Math.random() * 100)}`,
    status: 'ACTIVE',
    path: [
      { x: Math.floor(Math.random() * 800), y: Math.floor(Math.random() * 600) },
      { x: Math.floor(Math.random() * 800), y: Math.floor(Math.random() * 600) }
    ],
    redundancyType: 'N+1',
    powerFlow: Math.floor(Math.random() * 400) + 100,
    capacity: 500,
    ...overrides
  }),

  // Generate mock redundancy data set
  generateRedundancyDataSet: (substationCount = 5, lineCount = 8) => {
    const substations = Array.from({ length: substationCount }, (_, i) =>
      mockDataGenerators.generateSubstation({ 
        name: `Substation ${String.fromCharCode(65 + i)}` // A, B, C, etc.
      })
    )

    const lines = Array.from({ length: lineCount }, (_, i) =>
      mockDataGenerators.generateLine({
        name: `Line ${i + 1}`
      })
    )

    const redundancyPairs = substations.slice(0, -1).map((sub, i) => ({
      primary: sub.id,
      backup: substations[i + 1].id,
      redundancyLevel: '2N+1',
      switchoverTime: Math.floor(Math.random() * 100) + 20
    }))

    return { substations, lines, redundancyPairs }
  }
}

/**
 * Setup all mocks for testing environment
 */
export const setupAllMocks = () => {
  // Setup DOM API mocks
  global.IntersectionObserver = mockDOMAPIs.createIntersectionObserver
  global.ResizeObserver = mockDOMAPIs.createResizeObserver
  global.requestAnimationFrame = mockAnimationAPIs.requestAnimationFrame
  global.cancelAnimationFrame = mockAnimationAPIs.cancelAnimationFrame
  global.fetch = mockNetworkAPIs.fetch

  // Setup Performance API mocks
  global.PerformanceObserver = mockPerformanceAPIs.createPerformanceObserver

  // Return cleanup function
  return () => {
    jest.clearAllMocks()
  }
}

export default {
  createMockRedundancyStore,
  mockApiResponses,
  mockDOMAPIs,
  mockReactHooks,
  mockAnimationAPIs,
  mockNetworkAPIs,
  mockPerformanceAPIs,
  mockErrorHandling,
  mockDataGenerators,
  setupAllMocks
}