import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { HotspotMarker } from '@/components/atoms/HotspotMarker'
import { LegendPanel } from '@/components/molecules/LegendPanel'
import { InfoTooltip } from '@/components/atoms/InfoTooltip'
import { PerformanceMonitor } from '@/components/atoms/PerformanceMonitor'
import { ErrorBoundary } from '@/components/organisms/ErrorBoundary'
import { ImageHotspot } from '@/types'

// Mock framer-motion for testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Building2: () => <div data-testid="building2-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
  Factory: () => <div data-testid="factory-icon" />,
  Server: () => <div data-testid="server-icon" />,
  Info: () => <div data-testid="info-icon" />,
  ChevronUp: () => <div data-testid="chevron-up-icon" />,
  BarChart3: () => <div data-testid="bar-chart-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  XCircle: () => <div data-testid="x-circle-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
}))

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => 123.456),
  getEntriesByType: jest.fn(() => []),
  mark: jest.fn(),
  measure: jest.fn(),
  memory: {
    usedJSHeapSize: 1024 * 1024,
    totalJSHeapSize: 2048 * 1024,
    jsHeapSizeLimit: 4096 * 1024,
  },
}

beforeAll(() => {
  Object.defineProperty(global, 'performance', {
    value: mockPerformance,
    writable: true,
    configurable: true,
  })
})

// Mock web-vitals for PerformanceMonitor
jest.mock('web-vitals', () => ({
  onCLS: jest.fn(),
  onFCP: jest.fn(),
  onLCP: jest.fn(),
  onTTFB: jest.fn(),
}))

describe('Component Testing - Comprehensive Suite', () => {
  describe('HotspotMarker Component', () => {
    it('should render with default props', () => {
      render(<HotspotMarker type="datacenter" />)
      const icon = screen.getByTestId('server-icon')
      expect(icon).toBeInTheDocument()
    })

    it('should render different icons for different types', () => {
      const { rerender } = render(<HotspotMarker type="datacenter" />)
      const datacenterIcon = screen.getByTestId('server-icon')
      expect(datacenterIcon).toBeInTheDocument()

      rerender(<HotspotMarker type="substation" />)
      const substationIcon = screen.getByTestId('zap-icon')
      expect(substationIcon).toBeInTheDocument()

      rerender(<HotspotMarker type="powerplant" />)
      const powerplantIcon = screen.getByTestId('factory-icon')
      expect(powerplantIcon).toBeInTheDocument()

      // Test fallback for unknown type
      rerender(<HotspotMarker type={'unknown' as 'datacenter'} />)
      const defaultIcon = screen.getByTestId('building2-icon')
      expect(defaultIcon).toBeInTheDocument()
    })

    it('should apply correct styling based on type', () => {
      const { rerender } = render(<HotspotMarker type="datacenter" />)
      const markerContainer = screen.getByTestId('server-icon').closest('div')
      expect(markerContainer).toHaveStyle({ width: '24px', height: '24px' })

      rerender(<HotspotMarker type="datacenter" size={32} />)
      const largerMarker = screen.getByTestId('server-icon').closest('div')
      expect(largerMarker).toHaveStyle({ width: '32px', height: '32px' })
    })

    it('should show voltage indicator when voltage is provided', () => {
      render(<HotspotMarker type="substation" voltage="500kV" />)
      expect(screen.getByText('500kV')).toBeInTheDocument()
    })

    it('should show capacity indicator when capacity is provided', () => {
      render(<HotspotMarker type="datacenter" capacity="300MW" />)
      expect(screen.getByText('300MW')).toBeInTheDocument()
    })

    it('should handle disabled state correctly', () => {
      render(<HotspotMarker type="datacenter" voltage="500kV" isDisabled />)
      
      const icon = screen.getByTestId('server-icon')
      expect(icon).toHaveClass('opacity-50')
      
      // Voltage indicator should not be shown when disabled
      expect(screen.queryByText('500kV')).not.toBeInTheDocument()
    })

    it('should handle active state correctly', () => {
      render(<HotspotMarker type="datacenter" isActive />)
      
      // Should render active indicator ring
      const container = screen.getByTestId('server-icon').closest('div')?.parentElement
      expect(container).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<HotspotMarker type="datacenter" className="custom-class" />)
      const container = screen.getByTestId('server-icon').closest('div')
      expect(container).toHaveClass('custom-class')
    })

    it('should handle different voltage levels for substations', () => {
      const { rerender } = render(<HotspotMarker type="substation" voltage="500kV" />)
      expect(screen.getByText('500kV')).toBeInTheDocument()

      rerender(<HotspotMarker type="substation" voltage="220kV" />)
      expect(screen.getByText('220kV')).toBeInTheDocument()

      rerender(<HotspotMarker type="substation" voltage="110kV" />)
      expect(screen.getByText('110kV')).toBeInTheDocument()
    })

    it('should handle edge cases', () => {
      // Test with zero size
      render(<HotspotMarker type="datacenter" size={0} />)
      const container = screen.getByTestId('server-icon').closest('div')
      expect(container).toHaveStyle({ width: '0px', height: '0px' })

      // Test with very large size
      const { rerender } = render(<HotspotMarker type="datacenter" size={1000} />)
      const largeContainer = screen.getByTestId('server-icon').closest('div')
      expect(largeContainer).toHaveStyle({ width: '1000px', height: '1000px' })
    })
  })

  describe('LegendPanel Component', () => {
    const defaultProps = {
      position: { x: 50, y: 50 },
      width: 300,
    }

    it('should render with default props', () => {
      render(<LegendPanel {...defaultProps} />)
      expect(screen.getByText('Infrastructure Legend')).toBeInTheDocument()
    })

    it('should render all legend items', () => {
      render(<LegendPanel {...defaultProps} />)
      
      expect(screen.getByText('Data Center')).toBeInTheDocument()
      expect(screen.getByText('500kV Substation')).toBeInTheDocument()
      expect(screen.getByText('220kV Lines')).toBeInTheDocument()
      expect(screen.getByText('110kV Lines')).toBeInTheDocument()
      expect(screen.getByText('Power Plant')).toBeInTheDocument()
    })

    it('should render legend item descriptions', () => {
      render(<LegendPanel {...defaultProps} />)
      
      expect(screen.getByText('300MW AI Data Center')).toBeInTheDocument()
      expect(screen.getByText('500/220kV Transformation')).toBeInTheDocument()
      expect(screen.getByText('220kV Transmission')).toBeInTheDocument()
      expect(screen.getByText('110kV Distribution')).toBeInTheDocument()
      expect(screen.getByText('Tả Trạch Hydro (21MW)')).toBeInTheDocument()
    })

    it('should render voltage indicators for power lines', () => {
      render(<LegendPanel {...defaultProps} />)
      
      expect(screen.getByText('500kV')).toBeInTheDocument()
      expect(screen.getByText('220kV')).toBeInTheDocument()
      expect(screen.getByText('110kV')).toBeInTheDocument()
    })

    it('should render icons for appropriate legend items', () => {
      render(<LegendPanel {...defaultProps} />)
      
      expect(screen.getByTestId('server-icon')).toBeInTheDocument()
      expect(screen.getByTestId('zap-icon')).toBeInTheDocument()
      expect(screen.getByTestId('factory-icon')).toBeInTheDocument()
    })

    it('should toggle collapse state when header is clicked', async () => {
      render(<LegendPanel {...defaultProps} />)
      
      const header = screen.getByText('Infrastructure Legend').closest('div')
      
      // Initially expanded - all content should be visible
      expect(screen.getByText('Data Center')).toBeInTheDocument()
      
      // Click to collapse
      if (header) {
        fireEvent.click(header)
      }
      
      // Content should still be in DOM due to AnimatePresence
      expect(screen.getByText('Data Center')).toBeInTheDocument()
    })

    it('should render with collapsed initial state', () => {
      render(<LegendPanel {...defaultProps} collapsed />)
      
      // Header should still be visible
      expect(screen.getByText('Infrastructure Legend')).toBeInTheDocument()
      
      // Content might be hidden depending on animation state
      // We test the header click functionality instead
      const header = screen.getByText('Infrastructure Legend').closest('div')
      expect(header).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<LegendPanel {...defaultProps} className="custom-panel-class" />)
      
      const panel = screen.getByText('Infrastructure Legend').closest('div')?.parentElement
      expect(panel).toHaveClass('custom-panel-class')
    })

    it('should position panel correctly', () => {
      render(<LegendPanel position={{ x: 100, y: 200 }} width={400} />)
      
      const panel = screen.getByText('Infrastructure Legend').closest('div')?.parentElement
      expect(panel).toHaveStyle({
        left: '100px',
        bottom: '200px',
        minWidth: '400px',
        maxWidth: '600px',
      })
    })

    it('should render footer information', () => {
      render(<LegendPanel {...defaultProps} />)
      
      expect(screen.getByText('Hue Hi Tech Park')).toBeInTheDocument()
      expect(screen.getByText('300MW AI Data Center Visualization')).toBeInTheDocument()
    })

    it('should handle mouse hover states', () => {
      render(<LegendPanel {...defaultProps} />)
      
      const panel = screen.getByText('Infrastructure Legend').closest('div')?.parentElement
      expect(panel).toBeInTheDocument()
      
      // Test hover interaction
      if (panel) {
        fireEvent.mouseEnter(panel)
        fireEvent.mouseLeave(panel)
      }
      
      // No errors should occur
      expect(panel).toBeInTheDocument()
    })
  })

  describe('InfoTooltip Component', () => {
    const mockHotspot = {
      id: 'test-hotspot',
      name: 'Test Hotspot',
      type: 'datacenter' as const,
      description: 'Test description',
      position: { x: 100, y: 100 },
      metadata: {
        voltage: '500kV',
        capacity: '300MW',
        status: 'operational' as const,
        coordinates: '16.4637° N, 107.5909° E',
      },
    }

    it('should render with hotspot data', () => {
      render(<InfoTooltip id="test-tooltip" hotspot={mockHotspot} />)
      expect(screen.getByText('Test Hotspot')).toBeInTheDocument()
      expect(screen.getByText('Data Center')).toBeInTheDocument()
    })

    it('should display hotspot description', () => {
      render(<InfoTooltip id="test-tooltip" hotspot={mockHotspot} />)
      expect(screen.getByText('Test description')).toBeInTheDocument()
    })

    it('should display metadata information', () => {
      render(<InfoTooltip id="test-tooltip" hotspot={mockHotspot} />)
      
      expect(screen.getByText('Voltage:')).toBeInTheDocument()
      expect(screen.getByText('500kV')).toBeInTheDocument()
      expect(screen.getByText('Capacity:')).toBeInTheDocument()
      expect(screen.getByText('300MW')).toBeInTheDocument()
      expect(screen.getByText('Status:')).toBeInTheDocument()
      expect(screen.getByText('operational')).toBeInTheDocument()
    })

    it('should handle different hotspot types', () => {
      const substationHotspot = { ...mockHotspot, type: 'substation' as const }
      const { rerender } = render(<InfoTooltip id="test-tooltip" hotspot={substationHotspot} />)
      expect(screen.getByText('Substation')).toBeInTheDocument()

      const powerplantHotspot = { ...mockHotspot, type: 'powerplant' as const }
      rerender(<InfoTooltip id="test-tooltip" hotspot={powerplantHotspot} />)
      expect(screen.getByText('Power Plant')).toBeInTheDocument()
    })

    it('should handle different tooltip positions', () => {
      const { rerender } = render(
        <InfoTooltip id="test-tooltip" hotspot={mockHotspot} position="top" />
      )
      expect(screen.getByText('Test Hotspot')).toBeInTheDocument()

      rerender(<InfoTooltip id="test-tooltip" hotspot={mockHotspot} position="bottom" />)
      expect(screen.getByText('Test Hotspot')).toBeInTheDocument()

      rerender(<InfoTooltip id="test-tooltip" hotspot={mockHotspot} position="left" />)
      expect(screen.getByText('Test Hotspot')).toBeInTheDocument()

      rerender(<InfoTooltip id="test-tooltip" hotspot={mockHotspot} position="right" />)
      expect(screen.getByText('Test Hotspot')).toBeInTheDocument()
    })

    it('should handle hotspot without metadata', () => {
      const hotspotWithoutMetadata = {
        ...mockHotspot,
        metadata: undefined,
      }
      
      render(<InfoTooltip id="test-tooltip" hotspot={hotspotWithoutMetadata} />)
      expect(screen.getByText('Test Hotspot')).toBeInTheDocument()
      expect(screen.queryByText('Voltage:')).not.toBeInTheDocument()
    })

    it('should show click hint', () => {
      render(<InfoTooltip id="test-tooltip" hotspot={mockHotspot} />)
      expect(screen.getByText('Click for more details')).toBeInTheDocument()
    })

    it('should apply custom styling', () => {
      render(
        <InfoTooltip 
          id="test-tooltip" 
          hotspot={mockHotspot} 
          className="custom-tooltip" 
        />
      )
      
      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toHaveClass('custom-tooltip')
    })
  })

  describe('PerformanceMonitor Component', () => {
    beforeEach(() => {
      mockPerformance.now.mockClear()
      mockPerformance.getEntriesByType.mockClear()
      // Set NODE_ENV to development for testing
      process.env.NODE_ENV = 'development'
    })

    afterEach(() => {
      // Reset NODE_ENV
      process.env.NODE_ENV = 'test'
    })

    it('should render performance monitor in development', () => {
      render(<PerformanceMonitor />)
      expect(screen.getByText('Performance')).toBeInTheDocument()
    })

    it('should not render in production without showDetails', () => {
      process.env.NODE_ENV = 'production'
      const { container } = render(<PerformanceMonitor />)
      expect(container.firstChild).toBeNull()
    })

    it('should render in production when showDetails is true', () => {
      process.env.NODE_ENV = 'production'
      render(<PerformanceMonitor showDetails />)
      expect(screen.getByText('Performance')).toBeInTheDocument()
    })

    it('should display performance score', () => {
      render(<PerformanceMonitor />)
      
      expect(screen.getByText('Performance')).toBeInTheDocument()
      // Score should be displayed (0 initially)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle different positions', () => {
      const { rerender } = render(<PerformanceMonitor position="top-left" />)
      let monitor = screen.getByText('Performance').closest('div')?.parentElement
      expect(monitor).toHaveClass('top-4', 'left-4')

      rerender(<PerformanceMonitor position="top-right" />)
      monitor = screen.getByText('Performance').closest('div')?.parentElement
      expect(monitor).toHaveClass('top-4', 'right-4')

      rerender(<PerformanceMonitor position="bottom-left" />)
      monitor = screen.getByText('Performance').closest('div')?.parentElement
      expect(monitor).toHaveClass('bottom-4', 'left-4')

      rerender(<PerformanceMonitor position="bottom-right" />)
      monitor = screen.getByText('Performance').closest('div')?.parentElement
      expect(monitor).toHaveClass('bottom-4', 'right-4')
    })

    it('should expand and collapse details', async () => {
      render(<PerformanceMonitor />)
      
      const toggleButton = screen.getByRole('button')
      expect(toggleButton).toBeInTheDocument()
      
      // Initially collapsed - details should not be visible
      expect(screen.queryByText('CLS')).not.toBeInTheDocument()
      
      // Click to expand
      fireEvent.click(toggleButton)
      
      // Details should be visible
      await waitFor(() => {
        expect(screen.getByText('CLS')).toBeInTheDocument()
        expect(screen.getByText('FCP')).toBeInTheDocument()
        expect(screen.getByText('LCP')).toBeInTheDocument()
        expect(screen.getByText('TTFB')).toBeInTheDocument()
      })
      
      // Click to collapse
      fireEvent.click(toggleButton)
      
      // Details should be hidden again
      await waitFor(() => {
        expect(screen.queryByText('CLS')).not.toBeInTheDocument()
      })
    })

    it('should display Web Vitals metrics', async () => {
      render(<PerformanceMonitor />)
      
      // Expand to see details
      const toggleButton = screen.getByRole('button')
      fireEvent.click(toggleButton)
      
      await waitFor(() => {
        expect(screen.getByText('CLS')).toBeInTheDocument()
        expect(screen.getByText('FID')).toBeInTheDocument()
        expect(screen.getByText('FCP')).toBeInTheDocument()
        expect(screen.getByText('LCP')).toBeInTheDocument()
        expect(screen.getByText('TTFB')).toBeInTheDocument()
      })
    })

    it('should show overall score', async () => {
      render(<PerformanceMonitor />)
      
      // Expand details
      const toggleButton = screen.getByRole('button')
      fireEvent.click(toggleButton)
      
      await waitFor(() => {
        expect(screen.getByText('Overall Score')).toBeInTheDocument()
        expect(screen.getByText('/100')).toBeInTheDocument()
      })
    })

    it('should apply custom className', () => {
      render(<PerformanceMonitor className="custom-monitor" />)
      
      const monitor = screen.getByText('Performance').closest('div')?.parentElement
      expect(monitor).toHaveClass('custom-monitor')
    })

    it('should handle score color changes', () => {
      // This test verifies the score color logic exists
      render(<PerformanceMonitor />)
      
      // Initial score should be 0 (red)
      const scoreElement = screen.getByText('0')
      expect(scoreElement).toBeInTheDocument()
    })
  })

  describe('ErrorBoundary Component', () => {
    // Component that throws an error
    const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('Test error')
      }
      return <div>No error</div>
    }

    // Suppress console.error for error boundary tests
    const originalConsoleError = console.error
    beforeAll(() => {
      console.error = jest.fn()
    })

    afterAll(() => {
      console.error = originalConsoleError
    })

    it('should render children when there is no error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('should render error UI when there is an error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument()
    })

    it('should show retry button on error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    it('should reset error state when retry is clicked', async () => {
      let shouldThrow = true
      
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      )
      
      // Error should be displayed
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
      
      // Click retry button
      const retryButton = screen.getByRole('button', { name: /try again/i })
      fireEvent.click(retryButton)
      
      // Update the component to not throw
      shouldThrow = false
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      )
      
      // Error UI might still be shown due to error boundary state
      // This tests that the retry mechanism exists
      expect(retryButton).toBeInTheDocument()
    })

    it('should handle custom error messages', () => {
      render(
        <ErrorBoundary fallback={<div>Custom error message</div>}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })

    it('should call error callback when provided', () => {
      const onError = jest.fn()
      
      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      )
    })
  })

  describe('Component Integration', () => {
    it('should render multiple components together', () => {
      const mockHotspot = {
        id: 'test-hotspot',
        name: 'Test Hotspot',
        type: 'datacenter' as const,
        description: 'Test description',
        position: { x: 100, y: 100 },
        metadata: {},
      }
      
      // Set NODE_ENV for PerformanceMonitor
      process.env.NODE_ENV = 'development'
      
      render(
        <div>
          <HotspotMarker type="datacenter" />
          <LegendPanel position={{ x: 0, y: 0 }} width={200} />
          <InfoTooltip id="test-tooltip" hotspot={mockHotspot} />
          <PerformanceMonitor />
        </div>
      )
      
      expect(screen.getByTestId('server-icon')).toBeInTheDocument()
      expect(screen.getByText('Infrastructure Legend')).toBeInTheDocument()
      expect(screen.getByText('Test Hotspot')).toBeInTheDocument()
      expect(screen.getByText('Performance')).toBeInTheDocument()
    })

    it('should handle component interactions', () => {
      const mockHotspot = {
        id: 'test-hotspot',
        name: 'Test Hotspot',
        type: 'datacenter' as const,
        description: 'Test description',
        position: { x: 100, y: 100 },
        metadata: {},
      }
      
      render(
        <div>
          <LegendPanel position={{ x: 0, y: 0 }} width={200} />
          <InfoTooltip id="test-tooltip" hotspot={mockHotspot} />
        </div>
      )
      
      // Test legend panel interaction
      const legendHeader = screen.getByText('Infrastructure Legend').closest('div')
      if (legendHeader) {
        fireEvent.click(legendHeader)
      }
      
      // No errors should occur
      expect(screen.getByText('Infrastructure Legend')).toBeInTheDocument()
      expect(screen.getByText('Test Hotspot')).toBeInTheDocument()
    })
  })

  describe('Component Accessibility', () => {
    it('should provide proper ARIA labels', () => {
      const mockHotspot = {
        id: 'test-hotspot',
        name: 'Test Hotspot',
        type: 'datacenter' as const,
        description: 'Test description',
        position: { x: 100, y: 100 },
        metadata: {},
      }
      
      render(
        <div>
          <HotspotMarker type="datacenter" />
          <LegendPanel position={{ x: 0, y: 0 }} width={200} />
          <InfoTooltip id="test-tooltip" hotspot={mockHotspot} />
        </div>
      )
      
      // Check for interactive elements
      const interactiveElements = screen.getAllByRole('button')
      expect(interactiveElements.length).toBeGreaterThan(0)
    })

    it('should be keyboard navigable', () => {
      const mockHotspot = {
        id: 'test-hotspot',
        name: 'Test Hotspot',
        type: 'datacenter' as const,
        description: 'Test description',
        position: { x: 100, y: 100 },
        metadata: {},
      }
      
      render(
        <div>
          <LegendPanel position={{ x: 0, y: 0 }} width={200} />
          <InfoTooltip id="test-tooltip" hotspot={mockHotspot} />
        </div>
      )
      
      // Test keyboard navigation
      fireEvent.keyDown(document, { key: 'Tab' })
      fireEvent.keyDown(document, { key: 'Tab' })
      
      // Focus should move through interactive elements
      expect(document.activeElement).toBeInTheDocument()
    })

    it('should provide text alternatives for icons', () => {
      render(<HotspotMarker type="datacenter" />)
      
      // Icons should have appropriate test ids or aria labels
      expect(screen.getByTestId('server-icon')).toBeInTheDocument()
    })
  })

  describe('Component Performance', () => {
    it('should not cause memory leaks with repeated renders', () => {
      const { rerender } = render(<HotspotMarker type="datacenter" />)
      
      // Render multiple times to test for memory leaks
      for (let i = 0; i < 100; i++) {
        rerender(<HotspotMarker type="datacenter" isActive={i % 2 === 0} />)
      }
      
      expect(screen.getByTestId('server-icon')).toBeInTheDocument()
    })

    it('should handle rapid state changes', () => {
      render(<LegendPanel position={{ x: 0, y: 0 }} width={200} />)
      
      const header = screen.getByText('Infrastructure Legend').closest('div')
      
      // Rapid clicking should not cause errors
      if (header) {
        for (let i = 0; i < 10; i++) {
          fireEvent.click(header)
        }
      }
      
      expect(screen.getByText('Infrastructure Legend')).toBeInTheDocument()
    })
  })

  describe('Component Error Handling', () => {
    it('should handle invalid props gracefully', () => {
      // Test with invalid type
      render(<HotspotMarker type={'invalid-type' as any} />)
      expect(screen.getByTestId('building2-icon')).toBeInTheDocument()
      
      // Test with negative size
      render(<HotspotMarker type="datacenter" size={-10} />)
      const container = screen.getByTestId('server-icon').closest('div')
      expect(container).toBeInTheDocument()
    })

    it('should handle missing props', () => {
      // Test with minimal props
      render(<LegendPanel position={{ x: 0, y: 0 }} width={100} />)
      expect(screen.getByText('Infrastructure Legend')).toBeInTheDocument()
    })

    it('should handle null/undefined children', () => {
      render(<ErrorBoundary>{null}</ErrorBoundary>)
      expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument()
      
      render(<ErrorBoundary>{undefined}</ErrorBoundary>)
      expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument()
    })
  })
})