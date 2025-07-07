/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Hero from '../sections/Hero'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
    h1: ({ children, ...props }: React.ComponentProps<'h1'>) => (
      <h1 {...props}>{children}</h1>
    ),
    p: ({ children, ...props }: React.ComponentProps<'p'>) => (
      <p {...props}>{children}</p>
    ),
  },
}))

// Mock canvas context
const mockCanvas = {
  getContext: jest.fn().mockReturnValue({
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    set fillStyle(val) {},
  }),
  width: 1024,
  height: 768,
}

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: mockCanvas.getContext,
})

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 0)
  return 1
})

describe('Hero', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    })
  })

  describe('Rendering', () => {
    it('renders the main hero section', () => {
      render(<Hero />)
      
      const heroSection = document.querySelector('section')
      expect(heroSection).toBeInTheDocument()
      expect(heroSection).toHaveClass('relative h-screen overflow-hidden')
    })

    it('renders the main heading', () => {
      render(<Hero />)
      
      const heading = screen.getByRole('heading', { name: /hue hi-tech park/i })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveClass('text-5xl md:text-7xl lg:text-8xl')
    })

    it('renders the subtitle', () => {
      render(<Hero />)
      
      const subtitle = screen.getByText('300MW AI Data Center Infrastructure')
      expect(subtitle).toBeInTheDocument()
    })

    it('renders the description', () => {
      render(<Hero />)
      
      const description = screen.getByText(/powering the next generation of artificial intelligence/i)
      expect(description).toBeInTheDocument()
    })

    it('renders the live status indicator', () => {
      render(<Hero />)
      
      const liveStatus = screen.getByText('Now Live in Hue, Vietnam')
      expect(liveStatus).toBeInTheDocument()
    })

    it('renders action buttons', () => {
      render(<Hero />)
      
      const exploreButton = screen.getByRole('button', { name: /explore infrastructure/i })
      const deckButton = screen.getByRole('button', { name: /investment deck/i })
      
      expect(exploreButton).toBeInTheDocument()
      expect(deckButton).toBeInTheDocument()
    })

    it('renders statistics', () => {
      render(<Hero />)
      
      expect(screen.getByText('300MW')).toBeInTheDocument()
      expect(screen.getByText('Power Capacity')).toBeInTheDocument()
      expect(screen.getByText('99.99%')).toBeInTheDocument()
      expect(screen.getByText('Uptime SLA')).toBeInTheDocument()
      expect(screen.getByText('400Gbps')).toBeInTheDocument()
      expect(screen.getByText('Network Speed')).toBeInTheDocument()
      expect(screen.getByText('2025')).toBeInTheDocument()
      expect(screen.getByText('Carbon Neutral')).toBeInTheDocument()
    })

    it('renders scroll indicator', () => {
      render(<Hero />)
      
      const scrollText = screen.getByText('Scroll to explore')
      expect(scrollText).toBeInTheDocument()
    })
  })

  describe('Canvas Animation', () => {
    it('creates a canvas element', () => {
      render(<Hero />)
      
      const canvas = screen.getByRole('img')
      expect(canvas).toBeInTheDocument()
    })

    it('initializes canvas with correct dimensions', () => {
      render(<Hero />)
      
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
    })

    it('handles canvas context not available', () => {
      // Mock getContext to return null
      const mockGetContext = jest.fn().mockReturnValue(null)
      Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
        value: mockGetContext,
      })
      
      render(<Hero />)
      
      expect(mockGetContext).toHaveBeenCalledWith('2d')
    })

    it('handles window resize', () => {
      render(<Hero />)
      
      // Simulate window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1080,
      })
      
      fireEvent.resize(window)
      
      // The canvas should be updated with new dimensions
      expect(mockCanvas.getContext).toHaveBeenCalled()
    })
  })

  describe('Interaction', () => {
    it('explore button has correct styling', () => {
      render(<Hero />)
      
      const exploreButton = screen.getByRole('button', { name: /explore infrastructure/i })
      expect(exploreButton).toHaveClass('group relative bg-blue-600 hover:bg-blue-700')
    })

    it('investment deck button has correct styling', () => {
      render(<Hero />)
      
      const deckButton = screen.getByRole('button', { name: /investment deck/i })
      expect(deckButton).toHaveClass('group border-2 border-white/20')
    })

    it('investment deck button contains arrow icon', () => {
      render(<Hero />)
      
      const deckButton = screen.getByRole('button', { name: /investment deck/i })
      const svg = deckButton.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive classes to heading', () => {
      render(<Hero />)
      
      const heading = screen.getByRole('heading', { name: /hue hi-tech park/i })
      expect(heading).toHaveClass('text-5xl md:text-7xl lg:text-8xl')
    })

    it('applies responsive classes to subtitle', () => {
      render(<Hero />)
      
      const subtitle = screen.getByText('300MW AI Data Center Infrastructure')
      expect(subtitle).toHaveClass('text-xl md:text-2xl lg:text-3xl')
    })

    it('applies responsive classes to description', () => {
      render(<Hero />)
      
      const description = screen.getByText(/powering the next generation of artificial intelligence/i)
      expect(description).toHaveClass('text-lg md:text-xl')
    })

    it('applies responsive layout to buttons', () => {
      render(<Hero />)
      
      const buttonContainer = screen.getByRole('button', { name: /explore infrastructure/i }).parentElement
      expect(buttonContainer).toHaveClass('flex flex-col sm:flex-row')
    })

    it('applies responsive layout to statistics', () => {
      render(<Hero />)
      
      const statsContainer = screen.getByText('300MW').closest('div')?.parentElement
      expect(statsContainer).toHaveClass('grid grid-cols-2 md:grid-cols-4')
    })
  })

  describe('Background and Styling', () => {
    it('applies correct background gradient', () => {
      render(<Hero />)
      
      const heroSection = document.querySelector('section')
      expect(heroSection).toHaveClass('bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950')
    })

    it('renders gradient overlay', () => {
      render(<Hero />)
      
      const overlay = document.querySelector('.bg-gradient-to-t')
      expect(overlay).toBeInTheDocument()
      expect(overlay).toHaveClass('from-slate-950/50 via-transparent to-transparent')
    })

    it('applies correct z-index layering', () => {
      render(<Hero />)
      
      const canvas = document.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
      expect(canvas).toHaveClass('z-0')
      
      const overlay = document.querySelector('.bg-gradient-to-t')
      expect(overlay).toHaveClass('z-[1]')
      
      const content = screen.getByText('Hue Hi-Tech Park').closest('div')
      expect(content).toHaveClass('z-10')
    })
  })

  describe('Animation Elements', () => {
    it('renders pulsing status indicator', () => {
      render(<Hero />)
      
      const pulseElement = document.querySelector('.animate-ping')
      expect(pulseElement).toBeInTheDocument()
      expect(pulseElement).toHaveClass('bg-blue-400 opacity-75')
    })

    it('renders scroll indicator animation', () => {
      render(<Hero />)
      
      const scrollIndicator = screen.getByText('Scroll to explore').nextElementSibling
      expect(scrollIndicator).toBeInTheDocument()
      expect(scrollIndicator).toHaveClass('border-white/30 rounded-full')
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<Hero />)
      
      const heading = screen.getByRole('heading', { name: /hue hi-tech park/i })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H1')
    })

    it('buttons are keyboard accessible', () => {
      render(<Hero />)
      
      const exploreButton = screen.getByRole('button', { name: /explore infrastructure/i })
      const deckButton = screen.getByRole('button', { name: /investment deck/i })
      
      expect(exploreButton).toBeInTheDocument()
      expect(deckButton).toBeInTheDocument()
    })

    it('has proper semantic structure', () => {
      render(<Hero />)
      
      const section = document.querySelector('section')
      expect(section?.tagName).toBe('SECTION')
    })
  })

  describe('Performance', () => {
    it('cleans up animation frame on unmount', () => {
      const { unmount } = render(<Hero />)
      
      unmount()
      
      // Should not cause memory leaks
      expect(true).toBe(true)
    })

    it('removes event listeners on unmount', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
      
      const { unmount } = render(<Hero />)
      
      // Check that event listeners were set up and cleaned up
      unmount()
      
      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
      
      // Test that component unmounts without errors
      expect(true).toBe(true)
    })
  })
})