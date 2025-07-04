import { renderHook, act } from '@testing-library/react'
import {
  useVisualizationStore,
  useThemeStore,
} from '@/stores/useVisualizationStore'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: query.includes('dark'),
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock document methods
Object.defineProperty(document, 'documentElement', {
  value: {
    requestFullscreen: jest.fn(),
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
    },
  },
})

Object.defineProperty(document, 'exitFullscreen', {
  value: jest.fn(),
})

describe('useVisualizationStore', () => {
  beforeEach(() => {
    // Clear localStorage mock calls
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    localStorageMock.clear.mockClear()

    // Reset store state
    act(() => {
      useVisualizationStore.getState().resetToDefaults()
    })
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useVisualizationStore())

    expect(result.current.theme).toBe('system')
    expect(result.current.isDarkMode).toBe(false)
    expect(result.current.isFullscreen).toBe(false)
    expect(result.current.sidebarOpen).toBe(true)
    expect(result.current.debugMode).toBe(false)
    expect(result.current.enableAnimations).toBe(true)
    expect(result.current.enableParticles).toBe(true)
    expect(result.current.highPerformanceMode).toBe(false)
    expect(result.current.lastSelectedHotspot).toBeNull()
    expect(result.current.favoriteHotspots).toEqual([])
    expect(result.current.recentlyViewed).toEqual([])
  })

  it('should set theme and update dark mode', () => {
    const { result } = renderHook(() => useVisualizationStore())

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(result.current.isDarkMode).toBe(true)

    act(() => {
      result.current.setTheme('light')
    })

    expect(result.current.theme).toBe('light')
    expect(result.current.isDarkMode).toBe(false)
  })

  it('should toggle dark mode', () => {
    const { result } = renderHook(() => useVisualizationStore())

    // Start with light mode
    act(() => {
      result.current.setTheme('light')
    })

    expect(result.current.isDarkMode).toBe(false)

    act(() => {
      result.current.toggleDarkMode()
    })

    expect(result.current.isDarkMode).toBe(true)
    expect(result.current.theme).toBe('dark')

    act(() => {
      result.current.toggleDarkMode()
    })

    expect(result.current.isDarkMode).toBe(false)
    expect(result.current.theme).toBe('light')
  })

  it('should update UI preferences', () => {
    const { result } = renderHook(() => useVisualizationStore())

    const newPreferences = {
      showTooltips: false,
      showLegend: false,
      animationSpeed: 2,
      fontSize: 'large' as const,
    }

    act(() => {
      result.current.setUIPreferences(newPreferences)
    })

    expect(result.current.uiPreferences.showTooltips).toBe(false)
    expect(result.current.uiPreferences.showLegend).toBe(false)
    expect(result.current.uiPreferences.animationSpeed).toBe(2)
    expect(result.current.uiPreferences.fontSize).toBe('large')

    // Other preferences should remain unchanged
    expect(result.current.uiPreferences.showZoomControls).toBe(true)
  })

  it('should toggle fullscreen', () => {
    const { result } = renderHook(() => useVisualizationStore())

    act(() => {
      result.current.toggleFullscreen()
    })

    expect(result.current.isFullscreen).toBe(true)
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled()

    act(() => {
      result.current.toggleFullscreen()
    })

    expect(result.current.isFullscreen).toBe(false)
    expect(document.exitFullscreen).toHaveBeenCalled()
  })

  it('should toggle sidebar', () => {
    const { result } = renderHook(() => useVisualizationStore())

    expect(result.current.sidebarOpen).toBe(true)

    act(() => {
      result.current.toggleSidebar()
    })

    expect(result.current.sidebarOpen).toBe(false)

    act(() => {
      result.current.toggleSidebar()
    })

    expect(result.current.sidebarOpen).toBe(true)
  })

  it('should toggle debug mode', () => {
    const { result } = renderHook(() => useVisualizationStore())

    expect(result.current.debugMode).toBe(false)

    act(() => {
      result.current.toggleDebugMode()
    })

    expect(result.current.debugMode).toBe(true)
  })

  it('should set performance settings', () => {
    const { result } = renderHook(() => useVisualizationStore())

    act(() => {
      result.current.setPerformanceSettings({
        enableAnimations: false,
        enableParticles: false,
      })
    })

    expect(result.current.enableAnimations).toBe(false)
    expect(result.current.enableParticles).toBe(false)
    expect(result.current.highPerformanceMode).toBe(false)
  })

  it('should auto-adjust settings in high performance mode', () => {
    const { result } = renderHook(() => useVisualizationStore())

    act(() => {
      result.current.setPerformanceSettings({
        highPerformanceMode: true,
      })
    })

    expect(result.current.highPerformanceMode).toBe(true)
    expect(result.current.enableAnimations).toBe(false)
    expect(result.current.enableParticles).toBe(false)
  })

  it('should manage favorite hotspots', () => {
    const { result } = renderHook(() => useVisualizationStore())

    // Add favorite
    act(() => {
      result.current.addFavoriteHotspot('hotspot-1')
    })

    expect(result.current.favoriteHotspots).toContain('hotspot-1')

    // Add another favorite
    act(() => {
      result.current.addFavoriteHotspot('hotspot-2')
    })

    expect(result.current.favoriteHotspots).toContain('hotspot-2')
    expect(result.current.favoriteHotspots).toHaveLength(2)

    // Don't add duplicate
    act(() => {
      result.current.addFavoriteHotspot('hotspot-1')
    })

    expect(result.current.favoriteHotspots).toHaveLength(2)

    // Remove favorite
    act(() => {
      result.current.removeFavoriteHotspot('hotspot-1')
    })

    expect(result.current.favoriteHotspots).not.toContain('hotspot-1')
    expect(result.current.favoriteHotspots).toContain('hotspot-2')
  })

  it('should manage recently viewed hotspots', () => {
    const { result } = renderHook(() => useVisualizationStore())

    // Add to recently viewed
    act(() => {
      result.current.addToRecentlyViewed('hotspot-1')
    })

    expect(result.current.recentlyViewed).toEqual(['hotspot-1'])

    // Add another
    act(() => {
      result.current.addToRecentlyViewed('hotspot-2')
    })

    expect(result.current.recentlyViewed).toEqual(['hotspot-2', 'hotspot-1'])

    // Re-add existing (should move to front)
    act(() => {
      result.current.addToRecentlyViewed('hotspot-1')
    })

    expect(result.current.recentlyViewed).toEqual(['hotspot-1', 'hotspot-2'])

    // Clear recently viewed
    act(() => {
      result.current.clearRecentlyViewed()
    })

    expect(result.current.recentlyViewed).toEqual([])
  })

  it('should limit recently viewed to 10 items', () => {
    const { result } = renderHook(() => useVisualizationStore())

    // Add 12 items
    act(() => {
      for (let i = 1; i <= 12; i++) {
        result.current.addToRecentlyViewed(`hotspot-${i}`)
      }
    })

    // Should only keep last 10
    expect(result.current.recentlyViewed).toHaveLength(10)
    expect(result.current.recentlyViewed[0]).toBe('hotspot-12')
    expect(result.current.recentlyViewed[9]).toBe('hotspot-3')
  })

  it('should set last selected hotspot', () => {
    const { result } = renderHook(() => useVisualizationStore())

    act(() => {
      result.current.setLastSelectedHotspot('hotspot-1')
    })

    expect(result.current.lastSelectedHotspot).toBe('hotspot-1')

    act(() => {
      result.current.setLastSelectedHotspot(null)
    })

    expect(result.current.lastSelectedHotspot).toBeNull()
  })

  it('should reset to defaults', () => {
    const { result } = renderHook(() => useVisualizationStore())

    // Modify state
    act(() => {
      result.current.setTheme('dark')
      result.current.toggleSidebar()
      result.current.addFavoriteHotspot('hotspot-1')
      result.current.setLastSelectedHotspot('hotspot-2')
    })

    // Verify state changed
    expect(result.current.theme).toBe('dark')
    expect(result.current.sidebarOpen).toBe(false)
    expect(result.current.favoriteHotspots).toContain('hotspot-1')
    expect(result.current.lastSelectedHotspot).toBe('hotspot-2')

    // Reset
    act(() => {
      result.current.resetToDefaults()
    })

    // Verify reset
    expect(result.current.theme).toBe('system')
    expect(result.current.sidebarOpen).toBe(true)
    expect(result.current.favoriteHotspots).toEqual([])
    expect(result.current.lastSelectedHotspot).toBeNull()
  })
})

describe('useThemeStore selector', () => {
  it('should select only theme-related state', () => {
    const { result } = renderHook(() => useThemeStore())

    expect(result.current).toHaveProperty('theme')
    expect(result.current).toHaveProperty('isDarkMode')
    expect(result.current).toHaveProperty('setTheme')
    expect(result.current).toHaveProperty('toggleDarkMode')

    // Should not have other store properties
    expect(result.current).not.toHaveProperty('favoriteHotspots')
    expect(result.current).not.toHaveProperty('sidebarOpen')
  })

  it('should update when theme changes', () => {
    const { result } = renderHook(() => useThemeStore())

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(result.current.isDarkMode).toBe(true)
  })
})
