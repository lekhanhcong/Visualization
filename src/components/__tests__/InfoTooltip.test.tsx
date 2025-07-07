/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { InfoTooltip } from '../atoms/InfoTooltip'
import { ImageHotspot } from '@/types'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

describe('InfoTooltip', () => {
  const basicHotspot: ImageHotspot = {
    id: 'test-hotspot',
    name: 'Test Infrastructure',
    description: 'Test description',
    type: 'datacenter',
    position: { x: 100, y: 200 },
  }

  const hotspotWithMetadata: ImageHotspot = {
    ...basicHotspot,
    metadata: {
      voltage: '500kV',
      capacity: '100MW',
      status: 'operational' as const,
      coordinates: '16.4637°N 107.5908°E',
    },
  }

  describe('Basic Rendering', () => {
    it('renders tooltip with basic hotspot data', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={basicHotspot}
        />
      )

      expect(screen.getByRole('tooltip')).toBeInTheDocument()
      expect(screen.getByText('Test Infrastructure')).toBeInTheDocument()
      expect(screen.getByText('Data Center')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
      expect(screen.getByText('Click for more details')).toBeInTheDocument()
    })

    it('applies correct id', () => {
      render(
        <InfoTooltip
          id="custom-tooltip-id"
          hotspot={basicHotspot}
        />
      )

      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toHaveAttribute('id', 'custom-tooltip-id')
    })

    it('applies custom className', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={basicHotspot}
          className="custom-tooltip"
        />
      )

      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toHaveClass('custom-tooltip')
    })

    it('applies custom style', () => {
      const customStyle = { zIndex: 9999 }
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={basicHotspot}
          style={customStyle}
        />
      )

      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toHaveStyle({ zIndex: '9999' })
    })
  })

  describe('Position Variants', () => {
    it('applies top position classes by default', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={basicHotspot}
        />
      )

      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toHaveClass('mb-2')
    })

    it('applies bottom position classes', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={basicHotspot}
          position="bottom"
        />
      )

      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toHaveClass('mt-2')
    })

    it('applies left position classes', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={basicHotspot}
          position="left"
        />
      )

      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toHaveClass('mr-2')
    })

    it('applies right position classes', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={basicHotspot}
          position="right"
        />
      )

      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toHaveClass('ml-2')
    })

    it('renders correct arrow for each position', () => {
      const { rerender } = render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={basicHotspot}
          position="top"
        />
      )

      // Check that arrow element exists
      expect(document.querySelector('.absolute.top-full')).toBeInTheDocument()

      rerender(
        <InfoTooltip
          id="test-tooltip"
          hotspot={basicHotspot}
          position="bottom"
        />
      )

      expect(document.querySelector('.absolute.bottom-full')).toBeInTheDocument()
    })
  })

  describe('Hotspot Types', () => {
    it('displays correct type for datacenter', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={{ ...basicHotspot, type: 'datacenter' }}
        />
      )

      expect(screen.getByText('Data Center')).toBeInTheDocument()
    })

    it('displays correct type for substation', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={{ ...basicHotspot, type: 'substation' }}
        />
      )

      expect(screen.getByText('Substation')).toBeInTheDocument()
    })

    it('displays correct type for powerplant', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={{ ...basicHotspot, type: 'powerplant' }}
        />
      )

      expect(screen.getByText('Power Plant')).toBeInTheDocument()
    })

    it('displays default type for unknown type', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={{ ...basicHotspot, type: 'unknown' as 'datacenter' | 'substation' | 'powerplant' }}
        />
      )

      expect(screen.getByText('Infrastructure')).toBeInTheDocument()
    })
  })

  describe('Metadata Display', () => {
    it('displays voltage metadata', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={hotspotWithMetadata}
        />
      )

      expect(screen.getByText('Voltage:')).toBeInTheDocument()
      expect(screen.getByText('500kV')).toBeInTheDocument()
    })

    it('displays capacity metadata', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={hotspotWithMetadata}
        />
      )

      expect(screen.getByText('Capacity:')).toBeInTheDocument()
      expect(screen.getByText('100MW')).toBeInTheDocument()
    })

    it('displays operational status with correct styling', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={hotspotWithMetadata}
        />
      )

      expect(screen.getByText('Status:')).toBeInTheDocument()
      const statusElement = screen.getByText('operational')
      expect(statusElement).toBeInTheDocument()
      expect(statusElement).toHaveClass('bg-green-100 text-green-800')
    })

    it('displays maintenance status with correct styling', () => {
      const maintenanceHotspot = {
        ...hotspotWithMetadata,
        metadata: {
          ...hotspotWithMetadata.metadata!,
          status: 'maintenance' as const,
        },
      }

      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={maintenanceHotspot}
        />
      )

      const statusElement = screen.getByText('maintenance')
      expect(statusElement).toHaveClass('bg-yellow-100 text-yellow-800')
    })

    it('displays offline status with correct styling', () => {
      const offlineHotspot = {
        ...hotspotWithMetadata,
        metadata: {
          ...hotspotWithMetadata.metadata!,
          status: 'offline' as const,
        },
      }

      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={offlineHotspot}
        />
      )

      const statusElement = screen.getByText('offline')
      expect(statusElement).toHaveClass('bg-red-100 text-red-800')
    })

    it('displays coordinates metadata', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={hotspotWithMetadata}
        />
      )

      expect(screen.getByText('Coordinates:')).toBeInTheDocument()
      expect(screen.getByText('16.4637°N 107.5908°E')).toBeInTheDocument()
    })

    it('does not display metadata section when metadata is missing', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={basicHotspot}
        />
      )

      expect(screen.queryByText('Voltage:')).not.toBeInTheDocument()
      expect(screen.queryByText('Capacity:')).not.toBeInTheDocument()
      expect(screen.queryByText('Status:')).not.toBeInTheDocument()
      expect(screen.queryByText('Coordinates:')).not.toBeInTheDocument()
    })

    it('displays partial metadata when only some fields are present', () => {
      const partialMetadataHotspot = {
        ...basicHotspot,
        metadata: {
          voltage: '220kV',
        },
      }

      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={partialMetadataHotspot}
        />
      )

      expect(screen.getByText('Voltage:')).toBeInTheDocument()
      expect(screen.getByText('220kV')).toBeInTheDocument()
      expect(screen.queryByText('Capacity:')).not.toBeInTheDocument()
    })
  })

  describe('Content Handling', () => {
    it('handles hotspot without description', () => {
      const noDescriptionHotspot = {
        ...basicHotspot,
        description: undefined,
      }

      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={noDescriptionHotspot}
        />
      )

      expect(screen.getByText('Test Infrastructure')).toBeInTheDocument()
      expect(screen.queryByText('Test description')).not.toBeInTheDocument()
    })

    it('handles long hotspot names', () => {
      const longNameHotspot = {
        ...basicHotspot,
        name: 'Very Long Infrastructure Name That Should Be Truncated',
      }

      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={longNameHotspot}
        />
      )

      const nameElement = screen.getByText('Very Long Infrastructure Name That Should Be Truncated')
      expect(nameElement).toHaveClass('truncate')
    })

    it('applies correct tooltip content styling', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={basicHotspot}
        />
      )

      // Check main content container styling
      const contentContainer = document.querySelector('.bg-slate-800')
      expect(contentContainer).toBeInTheDocument()
      expect(contentContainer).toHaveClass('text-white px-3 py-2 rounded-lg shadow-lg max-w-xs')
    })

    it('applies correct type badge styling', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={basicHotspot}
        />
      )

      const typeBadge = screen.getByText('Data Center')
      expect(typeBadge).toHaveClass('text-xs bg-slate-700 px-2 py-0.5 rounded-full')
    })
  })

  describe('Accessibility', () => {
    it('has proper tooltip role', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={basicHotspot}
        />
      )

      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toBeInTheDocument()
    })

    it('provides accessible color contrast for status indicators', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={hotspotWithMetadata}
        />
      )

      // Operational status should have proper contrast
      const statusElement = screen.getByText('operational')
      expect(statusElement).toHaveClass('bg-green-100 text-green-800')
    })

    it('uses monospace font for coordinates', () => {
      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={hotspotWithMetadata}
        />
      )

      const coordinatesElement = screen.getByText('16.4637°N 107.5908°E')
      expect(coordinatesElement).toHaveClass('font-mono')
    })
  })

  describe('Edge Cases', () => {
    it('handles hotspot with empty metadata object', () => {
      const emptyMetadataHotspot = {
        ...basicHotspot,
        metadata: {},
      }

      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={emptyMetadataHotspot}
        />
      )

      expect(screen.getByText('Test Infrastructure')).toBeInTheDocument()
      expect(screen.queryByText('Voltage:')).not.toBeInTheDocument()
    })

    it('handles null metadata gracefully', () => {
      const nullMetadataHotspot = {
        ...basicHotspot,
        metadata: null,
      }

      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={nullMetadataHotspot}
        />
      )

      expect(screen.getByText('Test Infrastructure')).toBeInTheDocument()
      expect(screen.queryByText('Voltage:')).not.toBeInTheDocument()
    })

    it('handles undefined metadata gracefully', () => {
      const undefinedMetadataHotspot = {
        ...basicHotspot,
        metadata: undefined,
      }

      render(
        <InfoTooltip
          id="test-tooltip"
          hotspot={undefinedMetadataHotspot}
        />
      )

      expect(screen.getByText('Test Infrastructure')).toBeInTheDocument()
      expect(screen.queryByText('Voltage:')).not.toBeInTheDocument()
    })
  })
})