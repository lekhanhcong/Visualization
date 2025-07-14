import '@testing-library/jest-dom'

// Mock next/router
jest.mock('next/router', () => require('next-router-mock'))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    img: ({ children, ...props }) => <img {...props}>{children}</img>,
    path: ({ children, ...props }) => <path {...props}>{children}</path>,
    g: ({ children, ...props }) => <g {...props}>{children}</g>,
    text: ({ children, ...props }) => <text {...props}>{children}</text>,
  },
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
  useOptimistic: (initial, updater) => [initial, jest.fn()],
}))

// Mock react-dom createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children) => children,
}))

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb
  }
  observe() {
    this.cb([{ contentRect: { width: 1200, height: 800 } }])
  }
  unobserve() {}
  disconnect() {}
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
})

// Mock document methods
Object.defineProperty(document, 'documentElement', {
  value: {
    requestFullscreen: jest.fn(),
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(),
      toggle: jest.fn(),
    },
    style: {
      setProperty: jest.fn(),
    },
  },
})

Object.defineProperty(document, 'exitFullscreen', {
  value: jest.fn(),
})

// Mock Image constructor
global.Image = class Image {
  constructor() {
    setTimeout(() => {
      this.onload()
    }, 100)
  }
}

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16))
global.cancelAnimationFrame = jest.fn()

// Setup environment variables
process.env.NODE_ENV = 'test'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}
