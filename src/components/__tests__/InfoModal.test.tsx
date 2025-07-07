/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InfoModal } from '../molecules/InfoModal'
import { ImageHotspot } from '@/types'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  X: ({ size }: { size: number }) => <div data-testid="x-icon" data-size={size}>X</div>,
  Building2: ({ size }: { size: number }) => <div data-testid="building2-icon" data-size={size}>Building2</div>,
  Zap: ({ size }: { size: number }) => <div data-testid="zap-icon" data-size={size}>Zap</div>,
  Factory: ({ size }: { size: number }) => <div data-testid="factory-icon" data-size={size}>Factory</div>,
  Server: ({ size }: { size: number }) => <div data-testid="server-icon" data-size={size}>Server</div>,
  MapPin: ({ size }: { size: number }) => <div data-testid="map-pin-icon" data-size={size}>MapPin</div>,
  Info: ({ size }: { size: number }) => <div data-testid="info-icon" data-size={size}>Info</div>,
}))

describe('InfoModal', () => {
  const basicHotspot: ImageHotspot = {
    id: 'test-modal-hotspot',
    name: 'Test Infrastructure',
    description: 'This is a test infrastructure for modal display.',
    type: 'datacenter',
    position: { x: 150, y: 250 },
  }

  const hotspotWithMetadata: ImageHotspot = {
    ...basicHotspot,
    metadata: {
      voltage: '500kV',
      capacity: '200MW',
      status: 'operational' as const,
      coordinates: '16.4637°N 107.5908°E',
    },
  }

  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset body overflow style
    document.body.style.overflow = 'unset'
  })

  describe('Rendering', () => {
    it('does not render when closed', () => {
      render(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={false}
          onClose={mockOnClose}
        />
      )

      expect(screen.queryByText('Test Infrastructure')).not.toBeInTheDocument()
    })

    it('renders when open', () => {
      render(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Test Infrastructure')).toBeInTheDocument()
      expect(screen.getByText('Data Center')).toBeInTheDocument()
      expect(screen.getByText('This is a test infrastructure for modal display.')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={true}
          onClose={mockOnClose}
          className="custom-modal"
        />
      )

      const modal = document.querySelector('.custom-modal')
      expect(modal).toBeInTheDocument()
    })

    it('renders close button with correct aria-label', () => {
      render(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const closeButton = screen.getByLabelText('Close modal')
      expect(closeButton).toBeInTheDocument()
      expect(screen.getByTestId('x-icon')).toBeInTheDocument()
    })
  })

  describe('Hotspot Types and Icons', () => {
    it('displays correct icon and color for datacenter', () => {
      render(
        <InfoModal
          hotspot={{ ...basicHotspot, type: 'datacenter' }}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByTestId('server-icon')).toBeInTheDocument()
      expect(screen.getByText('Data Center')).toBeInTheDocument()
    })

    it('displays correct icon and color for substation', () => {
      render(
        <InfoModal
          hotspot={{ ...basicHotspot, type: 'substation' }}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByTestId('zap-icon')).toBeInTheDocument()
      expect(screen.getByText('Substation')).toBeInTheDocument()
    })

    it('displays correct icon and color for powerplant', () => {
      render(
        <InfoModal
          hotspot={{ ...basicHotspot, type: 'powerplant' }}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByTestId('factory-icon')).toBeInTheDocument()
      expect(screen.getByText('Power Plant')).toBeInTheDocument()
    })

    it('displays default icon for unknown type', () => {
      render(
        <InfoModal
          hotspot={{ ...basicHotspot, type: 'unknown' as 'datacenter' | 'substation' | 'powerplant' }}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByTestId('building2-icon')).toBeInTheDocument()
      expect(screen.getByText('Infrastructure')).toBeInTheDocument()
    })
  })

  describe('Metadata Display', () => {
    it('displays technical details when metadata is present', () => {
      render(
        <InfoModal
          hotspot={hotspotWithMetadata}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Technical Details')).toBeInTheDocument()
      expect(screen.getByText('Voltage Level')).toBeInTheDocument()
      expect(screen.getByText('500kV')).toBeInTheDocument()
      expect(screen.getByText('Capacity')).toBeInTheDocument()
      expect(screen.getByText('200MW')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('operational')).toBeInTheDocument()
      expect(screen.getByText('Coordinates')).toBeInTheDocument()
      expect(screen.getByText('16.4637°N 107.5908°E')).toBeInTheDocument()
    })

    it('does not display technical details when metadata is missing', () => {
      render(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.queryByText('Technical Details')).not.toBeInTheDocument()
      expect(screen.queryByText('Voltage Level')).not.toBeInTheDocument()
    })

    it('displays partial metadata when only some fields are present', () => {
      const partialMetadataHotspot = {
        ...basicHotspot,
        metadata: {
          voltage: '220kV',
        },
      }

      render(
        <InfoModal
          hotspot={partialMetadataHotspot}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Technical Details')).toBeInTheDocument()
      expect(screen.getByText('220kV')).toBeInTheDocument()
      expect(screen.queryByText('Capacity')).not.toBeInTheDocument()
    })

    it('displays correct status styling for different statuses', () => {
      const maintenanceHotspot = {
        ...hotspotWithMetadata,
        metadata: {
          ...hotspotWithMetadata.metadata!,
          status: 'maintenance' as const,
        },
      }

      render(
        <InfoModal
          hotspot={maintenanceHotspot}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const statusElement = screen.getByText('maintenance')
      expect(statusElement).toBeInTheDocument()
      expect(statusElement).toHaveClass('bg-yellow-100 text-yellow-800')
    })
  })

  describe('Position Information', () => {
    it('displays location section with position coordinates', () => {
      render(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Location')).toBeInTheDocument()
      expect(screen.getByText('Map Position')).toBeInTheDocument()
      expect(screen.getByText('X: 150px, Y: 250px')).toBeInTheDocument()
      expect(screen.getByTestId('map-pin-icon')).toBeInTheDocument()
    })
  })

  describe('Content Sections', () => {
    it('displays overview section when description is present', () => {
      render(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('This is a test infrastructure for modal display.')).toBeInTheDocument()
      expect(screen.getByTestId('info-icon')).toBeInTheDocument()
    })

    it('does not display overview section when description is missing', () => {
      const noDescriptionHotspot = {
        ...basicHotspot,
        description: undefined,
      }

      render(
        <InfoModal
          hotspot={noDescriptionHotspot}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.queryByText('Overview')).not.toBeInTheDocument()
    })

    it('displays additional information section', () => {
      render(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Additional Information')).toBeInTheDocument()
      expect(screen.getByText(/This infrastructure point is part of the Hue Hi Tech Park/)).toBeInTheDocument()
    })

    it('displays footer with close button', () => {
      render(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const footerCloseButton = screen.getByText('Close').closest('button')
      expect(footerCloseButton).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const closeButton = screen.getByLabelText('Close modal')
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when footer close button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const footerCloseButton = screen.getByText('Close').closest('button')
      await user.click(footerCloseButton!)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when escape key is pressed', () => {
      render(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when escape is pressed while modal is closed', () => {
      render(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={false}
          onClose={mockOnClose}
        />
      )

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('calls onClose when backdrop is clicked', async () => {
      const user = userEvent.setup()
      render(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      // Click on the backdrop (outer container)
      const backdrop = document.querySelector('.fixed.inset-0')
      if (backdrop) {
        await user.click(backdrop)
      }

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when modal content is clicked', async () => {
      const user = userEvent.setup()
      render(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const modalContent = screen.getByText('Test Infrastructure')
      await user.click(modalContent)

      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('manages body overflow when modal is opened and closed', () => {
      const { rerender } = render(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={false}
          onClose={mockOnClose}
        />
      )

      expect(document.body.style.overflow).toBe('unset')

      rerender(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(document.body.style.overflow).toBe('hidden')

      rerender(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={false}
          onClose={mockOnClose}
        />
      )

      // Should be reset after closing
      expect(document.body.style.overflow).toBe('unset')
    })

    it('has proper button roles and labels', () => {
      render(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByLabelText('Close modal')).toBeInTheDocument()
      expect(screen.getByText('Close').closest('button')).toBeInTheDocument()
    })

    it('manages focus correctly', async () => {
      render(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      // Focus should be managed when modal opens
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByLabelText('Close modal'))
      })
    })

    it('uses semantic heading structure', () => {
      render(
        <InfoModal
          hotspot={hotspotWithMetadata}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      // Check for proper heading hierarchy
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Infrastructure')
      expect(screen.getByRole('heading', { level: 3, name: /overview/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: /technical details/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: /location/i })).toBeInTheDocument()
    })
  })

  describe('Substation Voltage Colors', () => {
    it('applies correct color for 500kV substation', () => {
      const substation500kV = {
        ...basicHotspot,
        type: 'substation' as const,
        metadata: {
          voltage: '500kV',
        },
      }

      render(
        <InfoModal
          hotspot={substation500kV}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const iconContainer = screen.getByTestId('zap-icon').parentElement
      expect(iconContainer).toHaveClass('text-red-500 bg-red-50')
    })

    it('applies correct color for 220kV substation', () => {
      const substation220kV = {
        ...basicHotspot,
        type: 'substation' as const,
        metadata: {
          voltage: '220kV',
        },
      }

      render(
        <InfoModal
          hotspot={substation220kV}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const iconContainer = screen.getByTestId('zap-icon').parentElement
      expect(iconContainer).toHaveClass('text-blue-500 bg-blue-50')
    })

    it('applies default color for substation without voltage', () => {
      const substationNoVoltage = {
        ...basicHotspot,
        type: 'substation' as const,
      }

      render(
        <InfoModal
          hotspot={substationNoVoltage}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const iconContainer = screen.getByTestId('zap-icon').parentElement
      expect(iconContainer).toHaveClass('text-pink-500', 'bg-pink-50')
    })
  })

  describe('Cleanup', () => {
    it('cleans up event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')
      
      const { unmount } = render(
        <InfoModal
          hotspot={basicHotspot}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
      expect(document.body.style.overflow).toBe('unset')
    })
  })
})