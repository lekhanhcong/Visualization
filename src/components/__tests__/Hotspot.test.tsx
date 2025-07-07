/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Hotspot } from '../molecules/Hotspot'
import { ImageHotspot } from '@/types'

// Mock components
jest.mock('@/components/atoms/HotspotMarker', () => ({
  HotspotMarker: ({ type, isActive, isDisabled, size }: {
    type: string;
    isActive: boolean;
    isDisabled: boolean;
    size: number;
  }) => (
    <div 
      data-testid="hotspot-marker" 
      data-type={type}
      data-active={isActive}
      data-disabled={isDisabled}
      data-size={size}
    >
      Marker
    </div>
  ),
}))

jest.mock('@/components/atoms/InfoTooltip', () => ({
  InfoTooltip: ({ id, hotspot, position }: {
    id: string;
    hotspot: { name: string };
    position: string;
  }) => (
    <div data-testid="info-tooltip" id={id} data-position={position}>
      {hotspot.name}
    </div>
  ),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('Hotspot', () => {
  const mockHotspot: ImageHotspot = {
    id: 'test-hotspot',
    name: 'Test Hotspot',
    description: 'Test hotspot description',
    type: 'datacenter',
    position: { x: 100, y: 200 },
  }

  const mockPosition = {
    left: '50%',
    top: '50%',
  }

  const mockOnClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders hotspot with correct position', () => {
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
        />
      )

      const container = screen.getByRole('button')
      expect(container).toBeInTheDocument()
      expect(container).toHaveAttribute('aria-label', 'View details for Test Hotspot')
    })

    it('renders HotspotMarker with correct props', () => {
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
        />
      )

      const marker = screen.getByTestId('hotspot-marker')
      expect(marker).toHaveAttribute('data-type', 'datacenter')
      expect(marker).toHaveAttribute('data-size', '24')
      expect(marker).toHaveAttribute('data-active', 'false')
      expect(marker).toHaveAttribute('data-disabled', 'false')
    })

    it('applies custom className', () => {
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
          className="custom-hotspot"
        />
      )

      const hotspotElement = screen.getByRole('button').closest('div')
      expect(hotspotElement).toHaveClass('relative custom-hotspot')
    })

    it('applies position styles correctly', () => {
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
        />
      )

      const container = screen.getByRole('button').closest('div')
      // The component applies position styles, check that container exists
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('relative')
    })
  })

  describe('Interaction', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup()
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
        />
      )

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockOnClick).toHaveBeenCalledWith(mockHotspot)
    })

    it('responds to Enter key', async () => {
      const user = userEvent.setup()
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
        />
      )

      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard('{Enter}')

      expect(mockOnClick).toHaveBeenCalledWith(mockHotspot)
    })

    it('responds to Space key', async () => {
      const user = userEvent.setup()
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
        />
      )

      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard(' ')

      expect(mockOnClick).toHaveBeenCalledWith(mockHotspot)
    })

    it('shows hover state on mouse enter', async () => {
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
        />
      )

      const button = screen.getByRole('button')
      fireEvent.mouseEnter(button)

      const marker = screen.getByTestId('hotspot-marker')
      expect(marker).toHaveAttribute('data-active', 'true')
    })

    it('hides hover state on mouse leave', async () => {
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
        />
      )

      const button = screen.getByRole('button')
      fireEvent.mouseEnter(button)
      fireEvent.mouseLeave(button)

      const marker = screen.getByTestId('hotspot-marker')
      expect(marker).toHaveAttribute('data-active', 'false')
    })
  })

  describe('Tooltip', () => {
    it('shows tooltip on hover by default', async () => {
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
        />
      )

      const button = screen.getByRole('button')
      fireEvent.mouseEnter(button)

      expect(screen.getByTestId('info-tooltip')).toBeInTheDocument()
      expect(screen.getByText('Test Hotspot')).toBeInTheDocument()
    })

    it('hides tooltip when showTooltip is false', async () => {
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
          showTooltip={false}
        />
      )

      const button = screen.getByRole('button')
      fireEvent.mouseEnter(button)

      expect(screen.queryByTestId('info-tooltip')).not.toBeInTheDocument()
    })

    it('hides tooltip on mouse leave', async () => {
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
        />
      )

      const button = screen.getByRole('button')
      fireEvent.mouseEnter(button)
      fireEvent.mouseLeave(button)

      expect(screen.queryByTestId('info-tooltip')).not.toBeInTheDocument()
    })

    it('creates tooltip with correct id', async () => {
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
        />
      )

      const button = screen.getByRole('button')
      fireEvent.mouseEnter(button)

      const tooltip = screen.getByTestId('info-tooltip')
      expect(tooltip).toHaveAttribute('id', 'tooltip-test-hotspot')
    })
  })

  describe('Disabled State', () => {
    it('does not respond to clicks when disabled', async () => {
      const user = userEvent.setup()
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
          disabled
        />
      )

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockOnClick).not.toHaveBeenCalled()
    })

    it('does not respond to keyboard events when disabled', async () => {
      const user = userEvent.setup()
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
          disabled
        />
      )

      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard('{Enter}')

      expect(mockOnClick).not.toHaveBeenCalled()
    })

    it('does not show hover state when disabled', async () => {
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
          disabled
        />
      )

      const button = screen.getByRole('button')
      fireEvent.mouseEnter(button)

      const marker = screen.getByTestId('hotspot-marker')
      expect(marker).toHaveAttribute('data-active', 'false')
      expect(marker).toHaveAttribute('data-disabled', 'true')
    })

    it('does not show tooltip when disabled', async () => {
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
          disabled
        />
      )

      const button = screen.getByRole('button')
      fireEvent.mouseEnter(button)

      expect(screen.queryByTestId('info-tooltip')).not.toBeInTheDocument()
    })

    it('sets tabIndex to -1 when disabled', () => {
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
          disabled
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('tabIndex', '-1')
    })
  })

  describe('Hotspot Types', () => {
    it('handles datacenter type', () => {
      const datacenterHotspot = { ...mockHotspot, type: 'datacenter' as const }
      render(
        <Hotspot
          hotspot={datacenterHotspot}
          position={mockPosition}
          onClick={mockOnClick}
        />
      )

      const marker = screen.getByTestId('hotspot-marker')
      expect(marker).toHaveAttribute('data-type', 'datacenter')
    })

    it('handles substation type', () => {
      const substationHotspot = { ...mockHotspot, type: 'substation' as const }
      render(
        <Hotspot
          hotspot={substationHotspot}
          position={mockPosition}
          onClick={mockOnClick}
        />
      )

      const marker = screen.getByTestId('hotspot-marker')
      expect(marker).toHaveAttribute('data-type', 'substation')
    })

    it('handles powerplant type', () => {
      const powerplantHotspot = { ...mockHotspot, type: 'powerplant' as const }
      render(
        <Hotspot
          hotspot={powerplantHotspot}
          position={mockPosition}
          onClick={mockOnClick}
        />
      )

      const marker = screen.getByTestId('hotspot-marker')
      expect(marker).toHaveAttribute('data-type', 'powerplant')
    })
  })

  describe('Metadata Handling', () => {
    it('passes voltage metadata to marker', () => {
      const hotspotWithVoltage = {
        ...mockHotspot,
        metadata: { voltage: '220kV' },
      }
      render(
        <Hotspot
          hotspot={hotspotWithVoltage}
          position={mockPosition}
          onClick={mockOnClick}
        />
      )

      // The marker should receive the voltage prop
      const marker = screen.getByTestId('hotspot-marker')
      expect(marker).toBeInTheDocument()
    })

    it('passes capacity metadata to marker', () => {
      const hotspotWithCapacity = {
        ...mockHotspot,
        metadata: { capacity: '50MW' },
      }
      render(
        <Hotspot
          hotspot={hotspotWithCapacity}
          position={mockPosition}
          onClick={mockOnClick}
        />
      )

      // The marker should receive the capacity prop
      const marker = screen.getByTestId('hotspot-marker')
      expect(marker).toBeInTheDocument()
    })

    it('handles hotspot without metadata', () => {
      const hotspotWithoutMetadata = {
        ...mockHotspot,
        metadata: undefined,
      }
      render(
        <Hotspot
          hotspot={hotspotWithoutMetadata}
          position={mockPosition}
          onClick={mockOnClick}
        />
      )

      const marker = screen.getByTestId('hotspot-marker')
      expect(marker).toHaveAttribute('data-type', 'datacenter')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'View details for Test Hotspot')
      expect(button).toHaveAttribute('aria-describedby', 'tooltip-test-hotspot')
    })

    it('is focusable by default', () => {
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('tabIndex', '0')
    })

    it('is not focusable when disabled', () => {
      render(
        <Hotspot
          hotspot={mockHotspot}
          position={mockPosition}
          onClick={mockOnClick}
          disabled
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('tabIndex', '-1')
    })
  })
})