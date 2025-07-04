import { renderHook, waitFor, act } from '@testing-library/react'
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

// Test data fixtures
const mockValidHotspotsData = {
  hotspots: [
    {
      id: 'datacenter-main',
      name: 'Hue Hi Tech Park Data Center',
      type: 'datacenter',
      description: '300MW AI Data Center facility',
      position: { x: 600, y: 400 },
      metadata: { 
        capacity: '300MW',
        status: 'operational',
        commissioned: '2024'
      }
    },
    {
      id: 'substation-500kv',
      name: '500/220kV Substation',
      type: 'substation',
      description: 'High voltage transformation facility',
      position: { x: 200, y: 300 },
      metadata: { 
        voltage: '500kV/220kV',
        capacity: '2x600MVA',
        status: 'operational'
      }
    }
  ]
}

const mockValidImageConfig = {
  originalWidth: 1200,
  originalHeight: 800,
  aspectRatio: 1.5,
  legend: { position: { x: 50, y: 650 }, width: 300, height: 120 }
}

const mockValidInfrastructureData = {
  infrastructure: {
    'datacenter-main': {
      id: 'datacenter-main',
      name: 'Hue Hi Tech Park Data Center',
      overview: 'State-of-the-art 300MW AI Data Center',
      specifications: {
        power: '300MW',
        area: '100,000 sq ft',
        servers: '10,000+ units'
      },
      features: ['AI-optimized cooling', 'Renewable energy', '99.99% uptime'],
      connectivity: ['500kV grid connection', 'Fiber backbone']
    }
  }
}

describe('useImageMap Hook - Comprehensive Testing', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Initialization and Default State', () => {
    it('should initialize with correct default state', () => {
      mockFetch.mockImplementation(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ hotspots: [] })
      } as Response))

      const { result } = renderHook(() => useImageMap())

      expect(result.current.hotspots).toEqual([])
      expect(result.current.imageConfig).toBeNull()
      expect(result.current.infrastructureDetails).toBeNull()
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.hasErrors).toBe(false)
      expect(result.current.isReady).toBe(false)
    })

    it('should initialize with custom options', () => {
      mockFetch.mockImplementation(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ hotspots: [] })
      } as Response))

      const { result } = renderHook(() => useImageMap({
        enableLogging: false,
        retryAttempts: 5,
        retryDelay: 2000
      }))

      expect(result.current.isLoading).toBe(true)
      // Options are internal but we can test they don't break functionality
      expect(typeof result.current.refetch).toBe('function')
      expect(typeof result.current.clearErrors).toBe('function')
    })
  })

  describe('Successful Data Loading', () => {
    it('should successfully load all data types', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidHotspotsData)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidImageConfig)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidInfrastructureData)
        } as Response)

      const { result } = renderHook(() => useImageMap({ enableLogging: true }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hotspots).toHaveLength(2)
      expect(result.current.hotspots[0].id).toBe('datacenter-main')
      expect(result.current.hotspots[1].id).toBe('substation-500kv')
      expect(result.current.imageConfig?.originalWidth).toBe(1200)
      expect(result.current.infrastructureDetails?.infrastructure['datacenter-main']).toBeDefined()
      expect(result.current.isReady).toBe(true)
      expect(result.current.hasErrors).toBe(false)
    })

    it('should handle empty but valid hotspots data', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ hotspots: [] })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidImageConfig)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ infrastructure: {} })
        } as Response)

      const { result } = renderHook(() => useImageMap())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hotspots).toEqual([])
      expect(result.current.imageConfig).toBeTruthy()
      expect(result.current.isReady).toBe(false) // Not ready because no hotspots
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors correctly', async () => {
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
        statusText: 'Not Found'
      } as Response)

      const { result } = renderHook(() => useImageMap())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toContain('404')
      expect(result.current.hasErrors).toBe(true)
    })

    it('should handle malformed JSON data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      } as Response)

      const { result } = renderHook(() => useImageMap())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasErrors).toBe(true)
    })

    it('should handle partial loading errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidHotspotsData)
        } as Response)
        .mockRejectedValueOnce(new Error('Config fetch failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidInfrastructureData)
        } as Response)

      const { result } = renderHook(() => useImageMap())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hotspots).toHaveLength(2)
      expect(result.current.configError).toBeInstanceOf(Error)
      expect(result.current.hasErrors).toBe(true)
      expect(result.current.isReady).toBe(false)
    })
  })

  describe('Data Validation', () => {
    it('should validate hotspots data structure', async () => {
      const invalidHotspotsData = {
        hotspots: [
          {
            id: 'invalid',
            // missing required fields: name, type, position
          }
        ]
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(invalidHotspotsData)
      } as Response)

      const { result } = renderHook(() => useImageMap())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hotspotsError).toBeInstanceOf(Error)
      expect(result.current.hasErrors).toBe(true)
    })

    it('should validate image config data structure', async () => {
      const invalidImageConfig = {
        // missing originalWidth and originalHeight
        aspectRatio: 1.5
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ hotspots: [] })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(invalidImageConfig)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ infrastructure: {} })
        } as Response)

      const { result } = renderHook(() => useImageMap())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.configError).toBeInstanceOf(Error)
      expect(result.current.hasErrors).toBe(true)
    })

    it('should validate hotspot position data types', async () => {
      const invalidPositionData = {
        hotspots: [
          {
            id: 'test',
            name: 'Test',
            type: 'datacenter',
            description: 'Test',
            position: { x: 'invalid', y: 'invalid' }, // Should be numbers
            metadata: {}
          }
        ]
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(invalidPositionData)
      } as Response)

      const { result } = renderHook(() => useImageMap())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hotspotsError).toBeInstanceOf(Error)
      expect(result.current.hotspotsError?.message).toContain('position')
    })
  })

  describe('Retry Logic', () => {
    it('should retry failed requests according to configuration', async () => {
      // First 2 attempts fail, 3rd succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidHotspotsData)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidImageConfig)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidInfrastructureData)
        } as Response)

      const { result } = renderHook(() => useImageMap({ 
        retryAttempts: 3,
        retryDelay: 100 // Faster for testing
      }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      }, { timeout: 10000 })

      // Should eventually succeed
      expect(result.current.hotspots).toHaveLength(2)
      expect(result.current.hasErrors).toBe(false)
      expect(mockFetch).toHaveBeenCalledTimes(5) // 3 for hotspots (2 failed + 1 success) + 2 for other data
    })

    it('should fail after exceeding retry attempts', async () => {
      mockFetch.mockRejectedValue(new Error('Persistent failure'))

      const { result } = renderHook(() => useImageMap({ 
        retryAttempts: 2,
        retryDelay: 50
      }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      }, { timeout: 5000 })

      expect(result.current.hasErrors).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(6) // 2 attempts for each of 3 endpoints
    })
  })

  describe('State Management Functions', () => {
    it('should clear errors when clearErrors is called', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useImageMap())

      await waitFor(() => {
        expect(result.current.hasErrors).toBe(true)
      })

      act(() => {
        result.current.clearErrors()
      })

      expect(result.current.hotspotsError).toBeNull()
      expect(result.current.configError).toBeNull()
      expect(result.current.detailsError).toBeNull()
      expect(result.current.hasErrors).toBe(false)
    })

    it('should refetch data when refetch is called', async () => {
      // Initial successful load
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ hotspots: [] })
      } as Response)

      const { result } = renderHook(() => useImageMap())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Clear the mock to track new calls
      mockFetch.mockClear()
      
      // Set up new mock responses for refetch
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidHotspotsData)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidImageConfig)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidInfrastructureData)
        } as Response)

      // Trigger refetch
      await act(async () => {
        await result.current.refetch()
      })

      // Should have made 3 new fetch calls
      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(result.current.hotspots).toHaveLength(2)
    })
  })

  describe('Position and Coordinate Calculations', () => {
    it('should handle percentage position calculations correctly', async () => {
      const testHotspotsData = {
        hotspots: [
          {
            id: 'center-point',
            name: 'Center Point',
            type: 'datacenter',
            description: 'Test',
            position: { x: 600, y: 400 }, // 50% of 1200x800
            metadata: {}
          },
          {
            id: 'corner-point',
            name: 'Corner Point',
            type: 'substation',
            description: 'Test',
            position: { x: 0, y: 0 }, // 0% of both dimensions
            metadata: {}
          }
        ]
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(testHotspotsData)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidImageConfig)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ infrastructure: {} })
        } as Response)

      const { result } = renderHook(() => useImageMap())

      await waitFor(() => {
        expect(result.current.isReady).toBe(true)
      })

      const centerHotspot = result.current.hotspots.find(h => h.id === 'center-point')!
      const cornerHotspot = result.current.hotspots.find(h => h.id === 'corner-point')!
      const imageConfig = result.current.imageConfig!

      // Calculate percentage positions
      const centerXPercent = (centerHotspot.position.x / imageConfig.originalWidth) * 100
      const centerYPercent = (centerHotspot.position.y / imageConfig.originalHeight) * 100
      
      expect(centerXPercent).toBe(50) // 600/1200 * 100
      expect(centerYPercent).toBe(50) // 400/800 * 100
      
      const cornerXPercent = (cornerHotspot.position.x / imageConfig.originalWidth) * 100
      const cornerYPercent = (cornerHotspot.position.y / imageConfig.originalHeight) * 100
      
      expect(cornerXPercent).toBe(0)
      expect(cornerYPercent).toBe(0)
    })
  })

  describe('Loading State Management', () => {
    it('should manage individual loading states correctly', async () => {
      let resolveHotspots: (value: any) => void
      let resolveConfig: (value: any) => void
      let resolveDetails: (value: any) => void

      const hotspotsPromise = new Promise(resolve => { resolveHotspots = resolve })
      const configPromise = new Promise(resolve => { resolveConfig = resolve })
      const detailsPromise = new Promise(resolve => { resolveDetails = resolve })

      mockFetch
        .mockImplementationOnce(() => hotspotsPromise)
        .mockImplementationOnce(() => configPromise)
        .mockImplementationOnce(() => detailsPromise)

      const { result } = renderHook(() => useImageMap())

      // Initially all should be loading
      expect(result.current.isLoading).toBe(true)

      // Resolve hotspots
      resolveHotspots!({
        ok: true,
        json: () => Promise.resolve({ hotspots: [] })
      })

      await waitFor(() => {
        expect(result.current.isHotspotsLoading).toBe(false)
      })

      // Still loading overall because other requests pending
      expect(result.current.isLoading).toBe(true)

      // Resolve config
      resolveConfig!({
        ok: true,
        json: () => Promise.resolve(mockValidImageConfig)
      })

      await waitFor(() => {
        expect(result.current.isConfigLoading).toBe(false)
      })

      // Still loading overall
      expect(result.current.isLoading).toBe(true)

      // Resolve details
      resolveDetails!({
        ok: true,
        json: () => Promise.resolve({ infrastructure: {} })
      })

      await waitFor(() => {
        expect(result.current.isDetailsLoading).toBe(false)
      })

      // Now all loading should be complete
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle very large datasets', async () => {
      const largeHotspotsData = {
        hotspots: Array.from({ length: 1000 }, (_, i) => ({
          id: `hotspot-${i}`,
          name: `Hotspot ${i}`,
          type: 'datacenter',
          description: `Test hotspot number ${i}`,
          position: { x: i % 1200, y: Math.floor(i / 1200) % 800 },
          metadata: { index: i }
        }))
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(largeHotspotsData)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidImageConfig)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ infrastructure: {} })
        } as Response)

      const { result } = renderHook(() => useImageMap())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hotspots).toHaveLength(1000)
      expect(result.current.hasErrors).toBe(false)
    })

    it('should handle unicode and special characters in data', async () => {
      const unicodeHotspotsData = {
        hotspots: [
          {
            id: 'unicode-test',
            name: 'Trạm biến áp 500kV Huế 🏭',
            type: 'substation',
            description: 'Mô tả với ký tự đặc biệt: @#$%^&*()',
            position: { x: 100, y: 200 },
            metadata: { 
              notes: 'Special chars: αβγδε 中文 العربية русский'
            }
          }
        ]
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(unicodeHotspotsData)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidImageConfig)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ infrastructure: {} })
        } as Response)

      const { result } = renderHook(() => useImageMap())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hotspots[0].name).toBe('Trạm biến áp 500kV Huế 🏭')
      expect(result.current.hotspots[0].metadata.notes).toContain('中文')
    })

    it('should handle null and undefined values gracefully', async () => {
      const nullValueData = {
        hotspots: [
          {
            id: 'null-test',
            name: 'Test',
            type: 'datacenter',
            description: null, // This should be handled
            position: { x: 100, y: 200 },
            metadata: null // This should be handled
          }
        ]
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(nullValueData)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockValidImageConfig)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ infrastructure: {} })
        } as Response)

      const { result } = renderHook(() => useImageMap())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hotspots[0].description).toBe('')
      expect(result.current.hotspots[0].metadata).toEqual({})
    })
  })
})