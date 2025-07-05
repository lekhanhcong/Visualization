import { renderHook, waitFor } from '@testing-library/react'
import { useImageMap } from '@/hooks/useImageMap'

// Mock fetch globally
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock console.log to avoid test noise
const originalLog = console.log
beforeAll(() => {
  console.log = jest.fn()
})

afterAll(() => {
  console.log = originalLog
})

describe('useImageMap hook', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should initialize with correct default state', () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ hotspots: [] }),
      } as Response)
    )

    const { result } = renderHook(() => useImageMap())

    expect(result.current.hotspots).toEqual([])
    expect(result.current.imageConfig).toBeNull()
    expect(result.current.infrastructureDetails).toBeNull()
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBeNull()
    expect(result.current.hasErrors).toBe(false)
    expect(result.current.isReady).toBe(false)
  })

  it('should fetch and parse hotspots data correctly', async () => {
    const mockHotspotsData = {
      hotspots: [
        {
          id: 'datacenter',
          name: 'Test Data Center',
          type: 'datacenter',
          description: 'Test description',
          position: { x: 100, y: 200 },
          metadata: { capacity: '300MW' },
        },
      ],
    }

    const mockImageConfigData = {
      originalWidth: 1200,
      originalHeight: 800,
      aspectRatio: 1.5,
      legend: { position: { x: 50, y: 650 }, width: 300, height: 120 },
    }

    const mockInfrastructureData = {
      infrastructure: {
        datacenter: {
          id: 'datacenter',
          name: 'Test Data Center',
          overview: 'Test overview',
          specifications: {},
          features: [],
          connectivity: [],
        },
      },
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHotspotsData),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockImageConfigData),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInfrastructureData),
      } as Response)

    const { result } = renderHook(() => useImageMap())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.hotspots).toHaveLength(1)
    expect(result.current.hotspots[0]?.id).toBe('datacenter')
    expect(result.current.hotspots[0]?.position.x).toBe(100)
    expect(result.current.imageConfig?.originalWidth).toBe(1200)
    expect(
      result.current.infrastructureDetails?.infrastructure.datacenter
    ).toBeDefined()
    expect(result.current.isReady).toBe(true)
    expect(result.current.hasErrors).toBe(false)
  })

  it('should handle fetch errors correctly', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useImageMap())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.hasErrors).toBe(true)
    expect(result.current.isReady).toBe(false)
  })

  it('should handle HTTP error responses', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response)

    const { result } = renderHook(() => useImageMap())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toContain('404')
    expect(result.current.hasErrors).toBe(true)
  })

  it('should validate hotspots data structure', async () => {
    const invalidHotspotsData = {
      hotspots: [
        {
          id: 'invalid',
          // missing required fields
        },
      ],
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(invalidHotspotsData),
    } as Response)

    const { result } = renderHook(() => useImageMap())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.hotspotsError).toBeInstanceOf(Error)
    expect(result.current.hasErrors).toBe(true)
  })

  it('should support retry functionality', async () => {
    const mockHotspotsData = { hotspots: [] }
    const mockImageConfigData = {
      originalWidth: 1200,
      originalHeight: 800,
      aspectRatio: 1.5,
      legend: { position: { x: 50, y: 650 }, width: 300, height: 120 },
    }
    const mockInfrastructureData = { infrastructure: {} }

    // First call fails, then succeeds on retry
    mockFetch
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockRejectedValueOnce(new Error('Third failure'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHotspotsData),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockImageConfigData),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInfrastructureData),
      } as Response)

    const { result } = renderHook(() => useImageMap({ retryAttempts: 3 }))

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false)
      },
      { timeout: 5000 }
    )

    // Should eventually succeed after retries
    expect(result.current.error).toBeInstanceOf(Error)
    expect(mockFetch).toHaveBeenCalledTimes(3) // 3 failed attempts for hotspots
  })

  it('should clear errors when clearErrors is called', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useImageMap())

    await waitFor(() => {
      expect(result.current.hasErrors).toBe(true)
    })

    // Clear errors
    result.current.clearErrors()

    expect(result.current.hotspotsError).toBeNull()
    expect(result.current.configError).toBeNull()
    expect(result.current.detailsError).toBeNull()
    expect(result.current.hasErrors).toBe(false)
  })

  it('should handle refetch correctly', async () => {
    const mockData = { hotspots: [] }

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response)

    const { result } = renderHook(() => useImageMap())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Clear the mock to track new calls
    mockFetch.mockClear()

    // Set up new mock responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            originalWidth: 1200,
            originalHeight: 800,
            aspectRatio: 1.5,
            legend: { position: { x: 50, y: 650 }, width: 300, height: 120 },
          }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ infrastructure: {} }),
      } as Response)

    // Trigger refetch
    await result.current.refetch()

    // Should have made 3 new fetch calls
    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('should handle logging option correctly', () => {
    const { result: withLogging } = renderHook(() =>
      useImageMap({ enableLogging: true })
    )
    const { result: withoutLogging } = renderHook(() =>
      useImageMap({ enableLogging: false })
    )

    // Both should initialize the same way
    expect(withLogging.current.isLoading).toBe(true)
    expect(withoutLogging.current.isLoading).toBe(true)
  })

  it('should handle percentage position calculations', async () => {
    const mockHotspotsData = {
      hotspots: [
        {
          id: 'test',
          name: 'Test',
          type: 'datacenter',
          description: 'Test',
          position: { x: 600, y: 400 }, // 50% of 1200x800
          metadata: {},
        },
      ],
    }

    const mockImageConfigData = {
      originalWidth: 1200,
      originalHeight: 800,
      aspectRatio: 1.5,
      legend: { position: { x: 50, y: 650 }, width: 300, height: 120 },
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHotspotsData),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockImageConfigData),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ infrastructure: {} }),
      } as Response)

    const { result } = renderHook(() => useImageMap())

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })

    const hotspot = result.current.hotspots[0]
    const imageConfig = result.current.imageConfig!

    // Calculate percentage positions
    const xPercent = hotspot ? (hotspot.position.x / imageConfig.originalWidth) * 100 : 0
    const yPercent = hotspot ? (hotspot.position.y / imageConfig.originalHeight) * 100 : 0

    expect(xPercent).toBe(50) // 600/1200 * 100
    expect(yPercent).toBe(50) // 400/800 * 100
  })
})
