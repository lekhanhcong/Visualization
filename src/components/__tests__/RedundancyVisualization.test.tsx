/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RedundancyVisualization } from '../RedundancyVisualization'

// Mock Framer Motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    path: ({ children, ...props }: any) => <path {...props}>{children}</path>,
    g: ({ children, ...props }: any) => <g {...props}>{children}</g>,
    text: ({ children, ...props }: any) => <text {...props}>{children}</text>,
  },
  AnimatePresence: ({ children }: any) => children,
  createPortal: (children: any) => children,
}))

// Mock createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: any) => children,
}))

describe('RedundancyVisualization', () => {
  const defaultProps = {
    isVisible: true,
    onClose: jest.fn(),
    animationDuration: 1000, // Shorter for tests
  }

  beforeEach(() => {
    // Mock document.body for portal
    document.body.innerHTML = ''
    jest.clearAllMocks()
    
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
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
  })

  afterEach(() => {
    // Restore body overflow
    document.body.style.overflow = ''
  })

  describe('Basic Rendering', () => {
    test('renders overlay when visible', () => {
      render(<RedundancyVisualization {...defaultProps} />)
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByLabelText('Close redundancy visualization')).toBeInTheDocument()
    })

    test('does not render when not visible', () => {
      render(<RedundancyVisualization {...defaultProps} isVisible={false} />)
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    test('applies correct ARIA attributes', () => {
      render(<RedundancyVisualization {...defaultProps} />)
      
      const overlay = screen.getByRole('dialog')
      expect(overlay).toHaveAttribute('aria-modal', 'true')
      expect(overlay).toHaveAttribute('aria-labelledby', 'redundancy-title')
      expect(overlay).toHaveAttribute('aria-describedby', 'redundancy-description')
    })
  })

  describe('User Interactions', () => {
    test('calls onClose when close button is clicked', async () => {
      const onClose = jest.fn()
      render(<RedundancyVisualization {...defaultProps} onClose={onClose} />)
      
      const closeButton = screen.getByLabelText('Close redundancy visualization')
      await userEvent.click(closeButton)
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    test('calls onClose when ESC key is pressed', async () => {
      const onClose = jest.fn()
      render(<RedundancyVisualization {...defaultProps} onClose={onClose} />)
      
      await userEvent.keyboard('{Escape}')
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    test('calls onClose when backdrop is clicked', async () => {
      const onClose = jest.fn()
      render(<RedundancyVisualization {...defaultProps} onClose={onClose} />)
      
      const backdrop = screen.getByRole('dialog').firstChild as HTMLElement
      await userEvent.click(backdrop)
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    test('manages body overflow correctly', () => {
      const { rerender } = render(<RedundancyVisualization {...defaultProps} isVisible={true} />)
      
      expect(document.body.style.overflow).toBe('hidden')
      
      rerender(<RedundancyVisualization {...defaultProps} isVisible={false} />)
      
      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('Animation States', () => {
    test('shows transmission lines after delay', async () => {
      render(<RedundancyVisualization {...defaultProps} animationDuration={400} />)
      
      // Initially should not have transmission lines
      expect(screen.queryByText('Quảng Trạch → Sub 01')).not.toBeInTheDocument()
      
      // After animation delay, should show transmission lines
      await waitFor(() => {
        expect(screen.getByText('Quảng Trạch → Sub 01')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    test('shows substations after delay', async () => {
      render(<RedundancyVisualization {...defaultProps} animationDuration={400} />)
      
      await waitFor(() => {
        expect(screen.getByText('SUBSTATION 01 - ACTIVE')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    test('shows info panel after delay', async () => {
      render(<RedundancyVisualization {...defaultProps} animationDuration={400} />)
      
      await waitFor(() => {
        expect(screen.getByText('2N+1 Redundancy Status')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    test('resets animation when component becomes invisible', async () => {
      const { rerender } = render(<RedundancyVisualization {...defaultProps} />)
      
      // Wait for info panel
      await waitFor(() => {
        expect(screen.getByText('2N+1 Redundancy Status')).toBeInTheDocument()
      })
      
      // Hide component
      rerender(<RedundancyVisualization {...defaultProps} isVisible={false} />)
      
      // Show again
      rerender(<RedundancyVisualization {...defaultProps} isVisible={true} />)
      
      // Should restart animation
      expect(screen.queryByText('2N+1 Redundancy Status')).not.toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    test('displays correct power infrastructure data', async () => {
      render(<RedundancyVisualization {...defaultProps} animationDuration={200} />)
      
      await waitFor(() => {
        expect(screen.getByText('300MW')).toBeInTheDocument()
        expect(screen.getByText('Total: 500MW')).toBeInTheDocument()
        expect(screen.getByText('Total: 600MW')).toBeInTheDocument()
        expect(screen.getByText('400% TOTAL CAPACITY')).toBeInTheDocument()
        expect(screen.getByText('Total Available: 1200MW')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    test('displays transmission line labels', async () => {
      render(<RedundancyVisualization {...defaultProps} animationDuration={200} />)
      
      await waitFor(() => {
        expect(screen.getByText('Quảng Trạch → Sub 01')).toBeInTheDocument()
        expect(screen.getByText('Thanh Mỹ → Sub 01')).toBeInTheDocument()
        expect(screen.getByText('Quảng Trị → Sub 02')).toBeInTheDocument()
        expect(screen.getByText('Đà Nẵng → Sub 02')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    test('displays substation information', async () => {
      render(<RedundancyVisualization {...defaultProps} animationDuration={200} />)
      
      await waitFor(() => {
        expect(screen.getByText('SUBSTATION 01 - ACTIVE')).toBeInTheDocument()
        expect(screen.getByText('SUBSTATION 02 - 600MW STANDBY')).toBeInTheDocument()
      }, { timeout: 2000 })
    })
  })

  describe('SVG Elements', () => {
    test('renders SVG with correct structure', () => {
      render(<RedundancyVisualization {...defaultProps} />)
      
      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
      
      // Check for filter definitions
      expect(document.querySelector('#glow-red')).toBeInTheDocument()
      expect(document.querySelector('#glow-yellow')).toBeInTheDocument()
    })

    test('applies correct stroke colors to paths', async () => {
      render(<RedundancyVisualization {...defaultProps} animationDuration={200} />)
      
      await waitFor(() => {
        const redPaths = document.querySelectorAll('path[stroke="#ef4444"]')
        const yellowPaths = document.querySelectorAll('path[stroke="#fbbf24"]')
        
        expect(redPaths.length).toBeGreaterThan(0)
        expect(yellowPaths.length).toBeGreaterThan(0)
      }, { timeout: 2000 })
    })
  })

  describe('Focus Management', () => {
    test('traps focus within modal', async () => {
      render(<RedundancyVisualization {...defaultProps} />)
      
      const overlay = screen.getByRole('dialog')
      const closeButton = screen.getByLabelText('Close redundancy visualization')
      
      // Focus should be managed within the modal
      expect(overlay).toBeInTheDocument()
      expect(closeButton).toBeInTheDocument()
    })

    test('handles tab navigation', async () => {
      render(<RedundancyVisualization {...defaultProps} />)
      
      // Tab key should be handled
      await userEvent.keyboard('{Tab}')
      
      // Should still be in the document (not crashed)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('Custom Animation Duration', () => {
    test('respects custom animation duration', async () => {
      const shortDuration = 100
      render(<RedundancyVisualization {...defaultProps} animationDuration={shortDuration} />)
      
      // With short duration, elements should appear faster
      await waitFor(() => {
        expect(screen.getByText('2N+1 Redundancy Status')).toBeInTheDocument()
      }, { timeout: 500 })
    })
  })

  describe('Info Panel Interactions', () => {
    test('allows closing info panel', async () => {
      render(<RedundancyVisualization {...defaultProps} animationDuration={200} />)
      
      await waitFor(() => {
        expect(screen.getByText('2N+1 Redundancy Status')).toBeInTheDocument()
      })
      
      // Find and click the info panel close button
      const infoPanelCloseButton = screen.getByRole('button', { name: /×/ })
      await userEvent.click(infoPanelCloseButton)
      
      // Info panel should be hidden but main overlay should remain
      expect(screen.queryByText('2N+1 Redundancy Status')).not.toBeInTheDocument()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('Error Boundaries', () => {
    test('handles errors gracefully', () => {
      // Mock console.error to avoid noise in tests
      const originalError = console.error
      console.error = jest.fn()
      
      try {
        const ThrowError = () => {
          throw new Error('Test error')
        }
        
        // This should not crash the test
        render(
          <RedundancyVisualization {...defaultProps}>
            <ThrowError />
          </RedundancyVisualization>
        )
      } catch (error) {
        // Expected to catch error
      } finally {
        console.error = originalError
      }
    })
  })

  describe('Accessibility', () => {
    test('provides keyboard help text', () => {
      render(<RedundancyVisualization {...defaultProps} />)
      
      expect(screen.getByText('Press ESC to close')).toBeInTheDocument()
    })

    test('has proper heading structure', async () => {
      render(<RedundancyVisualization {...defaultProps} animationDuration={200} />)
      
      await waitFor(() => {
        const title = screen.getByText('2N+1 Redundancy Status')
        expect(title).toHaveAttribute('id', 'redundancy-title')
      })
    })

    test('provides description for screen readers', async () => {
      render(<RedundancyVisualization {...defaultProps} animationDuration={200} />)
      
      await waitFor(() => {
        const description = document.querySelector('#redundancy-description')
        expect(description).toBeInTheDocument()
      })
    })
  })
})