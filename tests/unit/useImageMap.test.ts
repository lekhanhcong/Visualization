import { renderHook, waitFor } from '@testing-library/react'
import { useImageMap } from '@/hooks/useImageMap'

// Mock fetch
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock data
const mockHotspotsData = {
  hotspots: [
    {
      id: 'datacenter',
      name: 'Hue Hi Tech Park Data Center',
      type: 'datacenter',
      position: { x: 600, y: 400 },
      description: 'Main 300MW AI Data Center',
      metadata: {
        capacity: '300MW',
        status: 'operational',
      },
    },
    {
      id: 'substation-500kv',
      name: '500/220kV Substation',
      type: 'substation',
      position: { x: 300, y: 300 },
      description: 'Primary power transformation',
      metadata: {
        voltage: '500kV',
        capacity: '2x600MVA',
        status: 'operational',
      },
    },
  ],
}

const mockImageConfig = {
  originalWidth: 1200,
  originalHeight: 800,
  aspectRatio: 1.5,
  legend: {
    position: { x: 50, y: 650 },
    width: 300,
    height: 120,
  },
}

const mockInfrastructureDetails = {
  infrastructure: {
    datacenter: {
      id: 'datacenter',
      name: 'Hue Hi Tech Park Data Center',
      overview: 'Test overview',
      specifications: {
        capacity: '300MW',
      },
    },
  },
}

describe('useImageMap', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('should load data successfully', async () => {
    // Mock successful responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockHotspotsData,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImageConfig,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockInfrastructureDetails,
      } as Response)

    const { result } = renderHook(() => useImageMap())

    // Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.hotspots).toEqual([])
    expect(result.current.imageConfig).toBeNull()

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Check loaded data
    expect(result.current.hotspots).toEqual(mockHotspotsData.hotspots)
    expect(result.current.imageConfig).toEqual(mockImageConfig)
    expect(result.current.infrastructureDetails).toEqual(
      mockInfrastructureDetails
    )
    expect(result.current.isReady).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('should handle fetch errors', async () => {
    // Mock failed response
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useImageMap())

    // Wait for error
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Check error state
    expect(result.current.error).toBeTruthy()
    expect(result.current.isReady).toBe(false)
    expect(result.current.hasErrors).toBe(true)
  })

  it('should handle HTTP errors', async () => {
    // Mock 404 response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response)

    const { result } = renderHook(() => useImageMap())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.hotspotsError).toBeTruthy()
    expect(result.current.hotspotsError?.message).toContain('404')
  })

  it('should validate hotspots data structure', async () => {
    // Mock invalid data
    const invalidData = {
      hotspots: [
        {
          // Missing required fields
          name: 'Test',
        },
      ],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => invalidData,
    } as Response)

    const { result } = renderHook(() => useImageMap())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.hotspotsError).toBeTruthy()
    expect(result.current.hotspotsError?.message).toContain(
      'Invalid hotspot data'
    )
  })

  it('should retry failed requests', async () => {
    // Mock first failure, then success
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockHotspotsData,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImageConfig,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockInfrastructureDetails,
      } as Response)

    const { result } = renderHook(() =>
      useImageMap({ retryAttempts: 2, retryDelay: 100 })
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Should eventually succeed after retry
    expect(result.current.hotspots).toEqual(mockHotspotsData.hotspots)
    expect(result.current.error).toBeNull()
  })

  it('should allow manual refetch', async () => {
    // Initial successful load
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockHotspotsData,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImageConfig,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockInfrastructureDetails,
      } as Response)

    const { result } = renderHook(() => useImageMap())

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })

    // Mock new data for refetch
    const newHotspotsData = {
      hotspots: [
        ...mockHotspotsData.hotspots,
        {
          id: 'new-hotspot',
          name: 'New Hotspot',
          type: 'powerplant' as const,
          position: { x: 800, y: 500 },
          description: 'New power plant',
          metadata: { capacity: '50MW' },
        },
      ],
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => newHotspotsData,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImageConfig,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockInfrastructureDetails,
      } as Response)

    // Trigger refetch
    await result.current.refetch()

    await waitFor(() => {
      expect(result.current.hotspots).toHaveLength(3)
    })

    expect(result.current.hotspots[2]?.id).toBe('new-hotspot')
  })

  it('should clear errors', async () => {
    // Mock error
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useImageMap())

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })

    // Clear errors
    result.current.clearErrors()

    expect(result.current.hotspotsError).toBeNull()
    expect(result.current.configError).toBeNull()
    expect(result.current.detailsError).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should handle individual loading states', async () => {
    let resolveHotspots: (value: any) => void
    let resolveConfig: (value: any) => void
    let resolveDetails: (value: any) => void

    // Create promises we can control
    const hotspotsPromise = new Promise((resolve) => {
      resolveHotspots = resolve
    })
    const configPromise = new Promise((resolve) => {
      resolveConfig = resolve
    })
    const detailsPromise = new Promise((resolve) => {
      resolveDetails = resolve
    })

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => hotspotsPromise,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => configPromise,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => detailsPromise,
      } as Response)

    const { result } = renderHook(() => useImageMap())

    // All should be loading
    expect(result.current.isHotspotsLoading).toBe(true)
    expect(result.current.isConfigLoading).toBe(true)
    expect(result.current.isDetailsLoading).toBe(true)

    // Resolve hotspots first
    resolveHotspots!(mockHotspotsData)

    await waitFor(() => {
      expect(result.current.isHotspotsLoading).toBe(false)
    })

    expect(result.current.isConfigLoading).toBe(true)
    expect(result.current.isDetailsLoading).toBe(true)

    // Resolve config
    resolveConfig!(mockImageConfig)

    await waitFor(() => {
      expect(result.current.isConfigLoading).toBe(false)
    })

    expect(result.current.isDetailsLoading).toBe(true)

    // Resolve details
    resolveDetails!(mockInfrastructureDetails)

    await waitFor(() => {
      expect(result.current.isDetailsLoading).toBe(false)
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isReady).toBe(true)
  })

  it('should enable logging in development', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockHotspotsData,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockImageConfig,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockInfrastructureDetails,
      } as Response)

    renderHook(() => useImageMap({ enableLogging: true }))

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[useImageMap]'),
        expect.anything()
      )
    })

    consoleSpy.mockRestore()
  })
})
