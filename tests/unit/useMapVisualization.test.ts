import { renderHook, act } from '@testing-library/react'
import { useMapVisualization } from '@/hooks/useMapVisualization'
import { ImageHotspot } from '@/types'

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 16)
  return 1
})

global.cancelAnimationFrame = jest.fn()

describe('useMapVisualization', () => {
  const mockHotspot: ImageHotspot = {
    id: 'test-hotspot',
    name: 'Test Hotspot',
    type: 'datacenter',
    position: { x: 600, y: 400 },
    description: 'Test description',
    metadata: {
      capacity: '300MW',
      status: 'operational',
    },
  }

  const mockImageConfig = {
    originalWidth: 1200,
    originalHeight: 800,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useMapVisualization())

    expect(result.current.zoomLevel).toBe(1)
    expect(result.current.panOffset).toEqual({ x: 0, y: 0 })
    expect(result.current.rotation).toBe(0)
    expect(result.current.selectedHotspot).toBeNull()
    expect(result.current.hoveredHotspot).toBeNull()
    expect(result.current.isAnimating).toBe(false)
    expect(result.current.isZoomedIn).toBe(false)
    expect(result.current.isAtMinZoom).toBe(false)
    expect(result.current.isAtMaxZoom).toBe(false)
    expect(result.current.canPan).toBe(false)
  })

  it('should handle zoom in', () => {
    const { result } = renderHook(() =>
      useMapVisualization({ smoothTransitions: false })
    )

    act(() => {
      result.current.zoom(0.5)
    })

    expect(result.current.zoomLevel).toBe(1.5)
    expect(result.current.isZoomedIn).toBe(true)
    expect(result.current.canPan).toBe(true)
  })

  it('should handle zoom out', () => {
    const { result } = renderHook(() =>
      useMapVisualization({ smoothTransitions: false })
    )

    // First zoom in
    act(() => {
      result.current.zoom(0.5)
    })

    // Then zoom out
    act(() => {
      result.current.zoom(-0.3)
    })

    expect(result.current.zoomLevel).toBe(1.2)
  })

  it('should clamp zoom within bounds', () => {
    const { result } = renderHook(() =>
      useMapVisualization({
        minZoom: 0.5,
        maxZoom: 3,
        smoothTransitions: false,
      })
    )

    // Test max zoom
    act(() => {
      result.current.zoom(5) // Attempt to zoom way beyond max
    })

    expect(result.current.zoomLevel).toBe(3)
    expect(result.current.isAtMaxZoom).toBe(true)

    // Test min zoom
    act(() => {
      result.current.zoom(-5) // Attempt to zoom way below min
    })

    expect(result.current.zoomLevel).toBe(0.5)
    expect(result.current.isAtMinZoom).toBe(true)
  })

  it('should handle zoom with center point', () => {
    const { result } = renderHook(() =>
      useMapVisualization({ smoothTransitions: false })
    )

    const centerPoint = { x: 100, y: 50 }

    act(() => {
      result.current.zoom(0.5, centerPoint)
    })

    expect(result.current.zoomLevel).toBe(1.5)
    // Pan offset should be adjusted for the center point
    expect(result.current.panOffset.x).not.toBe(0)
    expect(result.current.panOffset.y).not.toBe(0)
  })

  it('should handle pan', () => {
    const { result } = renderHook(() =>
      useMapVisualization({ smoothTransitions: false })
    )

    const newOffset = { x: 50, y: 25 }

    act(() => {
      result.current.pan(newOffset)
    })

    expect(result.current.panOffset).toEqual(newOffset)
  })

  it('should clamp pan offset when bounds enabled', () => {
    const { result } = renderHook(() =>
      useMapVisualization({ enableBounds: true })
    )

    // Zoom in first so we can pan
    act(() => {
      result.current.zoom(1) // 2x zoom
    })

    // Try to pan beyond bounds
    act(() => {
      result.current.pan({ x: 1000, y: 1000 })
    })

    // Should be clamped
    expect(result.current.panOffset.x).toBeLessThan(1000)
    expect(result.current.panOffset.y).toBeLessThan(1000)
  })

  it('should handle rotation when enabled', () => {
    const { result } = renderHook(() =>
      useMapVisualization({ enableRotation: true, smoothTransitions: false })
    )

    act(() => {
      result.current.rotate(45)
    })

    expect(result.current.rotation).toBe(45)
  })

  it('should ignore rotation when disabled', () => {
    const { result } = renderHook(() =>
      useMapVisualization({ enableRotation: false })
    )

    act(() => {
      result.current.rotate(45)
    })

    expect(result.current.rotation).toBe(0)
  })

  it('should reset view to default state', () => {
    const { result } = renderHook(() => useMapVisualization())

    // Modify state
    act(() => {
      result.current.zoom(0.5)
      result.current.pan({ x: 100, y: 50 })
    })

    // Reset
    act(() => {
      result.current.resetView()
    })

    expect(result.current.zoomLevel).toBe(1)
    expect(result.current.panOffset).toEqual({ x: 0, y: 0 })
    expect(result.current.rotation).toBe(0)
  })

  it('should zoom to hotspot', () => {
    const { result } = renderHook(() =>
      useMapVisualization({ smoothTransitions: false })
    )

    act(() => {
      result.current.zoomToHotspot(mockHotspot, mockImageConfig)
    })

    expect(result.current.zoomLevel).toBe(2)
    // Pan should center on hotspot
    expect(result.current.panOffset.x).not.toBe(0)
    expect(result.current.panOffset.y).not.toBe(0)
  })

  it('should select and hover hotspots', () => {
    const { result } = renderHook(() => useMapVisualization())

    act(() => {
      result.current.selectHotspot(mockHotspot)
    })

    expect(result.current.selectedHotspot).toBe(mockHotspot)

    act(() => {
      result.current.hoverHotspot(mockHotspot)
    })

    expect(result.current.hoveredHotspot).toBe(mockHotspot)

    act(() => {
      result.current.selectHotspot(null)
      result.current.hoverHotspot(null)
    })

    expect(result.current.selectedHotspot).toBeNull()
    expect(result.current.hoveredHotspot).toBeNull()
  })

  it('should generate transform string', () => {
    const { result } = renderHook(() =>
      useMapVisualization({ smoothTransitions: false })
    )

    // Default transform
    expect(result.current.transform).toBe(
      'scale(1) translate(0px, 0px) rotate(0deg)'
    )

    // Modify state
    act(() => {
      result.current.zoom(0.5)
      result.current.pan({ x: 50, y: 25 })
    })

    expect(result.current.transform).toBe(
      'scale(1.5) translate(50px, 25px) rotate(0deg)'
    )
  })

  it('should handle smooth transitions when enabled', () => {
    const { result } = renderHook(
      () => useMapVisualization({ smoothTransitions: false }) // Disable for testing
    )

    act(() => {
      result.current.zoom(0.5)
    })

    // Should apply immediately without animation in test
    expect(result.current.zoomLevel).toBe(1.5)
  })

  it('should skip transitions when disabled', () => {
    const { result } = renderHook(() =>
      useMapVisualization({ smoothTransitions: false })
    )

    act(() => {
      result.current.zoom(0.5)
    })

    // Should apply immediately without animation
    expect(result.current.zoomLevel).toBe(1.5)
    expect(result.current.isAnimating).toBe(false)
  })

  it('should compute derived state correctly', () => {
    const { result } = renderHook(() =>
      useMapVisualization({
        minZoom: 0.5,
        maxZoom: 3,
        smoothTransitions: false,
      })
    )

    // Default state
    expect(result.current.isZoomedIn).toBe(false)
    expect(result.current.isAtMinZoom).toBe(false)
    expect(result.current.isAtMaxZoom).toBe(false)
    expect(result.current.canPan).toBe(false)

    // Zoom to max
    act(() => {
      result.current.zoom(2) // Should be clamped to 3
    })

    expect(result.current.isZoomedIn).toBe(true)
    expect(result.current.isAtMaxZoom).toBe(true)
    expect(result.current.canPan).toBe(true)

    // Zoom to min
    act(() => {
      result.current.zoom(-3) // Should be clamped to 0.5
    })

    expect(result.current.isAtMinZoom).toBe(true)
    expect(result.current.isZoomedIn).toBe(false)
    expect(result.current.canPan).toBe(false)
  })

  it('should log actions when enabled', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

    const { result } = renderHook(() =>
      useMapVisualization({ enableLogging: true })
    )

    act(() => {
      result.current.zoom(0.5)
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[useMapVisualization] Zooming'),
      expect.anything()
    )

    consoleSpy.mockRestore()
  })

  it('should cleanup animations on unmount', () => {
    const { unmount } = renderHook(() =>
      useMapVisualization({ smoothTransitions: true })
    )

    unmount()

    expect(cancelAnimationFrame).toHaveBeenCalled()
  })

  it('should handle rapid zoom changes', () => {
    const { result } = renderHook(() => useMapVisualization())

    // Rapid zoom changes
    act(() => {
      result.current.zoom(0.1)
      result.current.zoom(0.1)
      result.current.zoom(0.1)
      result.current.zoom(0.1)
      result.current.zoom(0.1)
    })

    expect(result.current.zoomLevel).toBe(1.5)
  })

  it('should handle edge cases in zoom calculations', () => {
    const { result } = renderHook(() => useMapVisualization())

    // Zero zoom delta
    act(() => {
      result.current.zoom(0)
    })

    expect(result.current.zoomLevel).toBe(1)

    // Very small zoom delta
    act(() => {
      result.current.zoom(0.001)
    })

    expect(result.current.zoomLevel).toBe(1.001)
  })
})
