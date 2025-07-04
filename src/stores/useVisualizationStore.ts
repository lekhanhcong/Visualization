'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Theme, UIPreferences } from '@/types'

interface VisualizationState {
  // Theme state
  theme: Theme
  isDarkMode: boolean

  // UI preferences
  uiPreferences: UIPreferences

  // Application state
  isFullscreen: boolean
  sidebarOpen: boolean
  debugMode: boolean

  // Performance settings
  enableAnimations: boolean
  enableParticles: boolean
  highPerformanceMode: boolean

  // User preferences
  lastSelectedHotspot: string | null
  favoriteHotspots: string[]
  recentlyViewed: string[]

  // Actions
  setTheme: (theme: Theme) => void
  toggleDarkMode: () => void
  setUIPreferences: (preferences: Partial<UIPreferences>) => void
  toggleFullscreen: () => void
  toggleSidebar: () => void
  toggleDebugMode: () => void
  setPerformanceSettings: (settings: {
    enableAnimations?: boolean
    enableParticles?: boolean
    highPerformanceMode?: boolean
  }) => void
  setLastSelectedHotspot: (hotspotId: string | null) => void
  addFavoriteHotspot: (hotspotId: string) => void
  removeFavoriteHotspot: (hotspotId: string) => void
  addToRecentlyViewed: (hotspotId: string) => void
  clearRecentlyViewed: () => void
  resetToDefaults: () => void
}

// Default state
const defaultState = {
  theme: 'system' as Theme,
  isDarkMode: false,
  uiPreferences: {
    showTooltips: true,
    showLegend: true,
    showZoomControls: true,
    showCoordinates: false,
    enableSoundEffects: false,
    autoHideUI: false,
    compactMode: false,
    animationSpeed: 1,
    fontSize: 'medium',
    colorScheme: 'default',
  } as UIPreferences,
  isFullscreen: false,
  sidebarOpen: true,
  debugMode: false,
  enableAnimations: true,
  enableParticles: true,
  highPerformanceMode: false,
  lastSelectedHotspot: null,
  favoriteHotspots: [],
  recentlyViewed: [],
}

export const useVisualizationStore = create<VisualizationState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // Theme actions
      setTheme: (theme: Theme) => {
        set({ theme })

        // Update dark mode based on theme and system preference
        if (theme === 'system') {
          const isDark = window.matchMedia(
            '(prefers-color-scheme: dark)'
          ).matches
          set({ isDarkMode: isDark })
        } else {
          set({ isDarkMode: theme === 'dark' })
        }
      },

      toggleDarkMode: () => {
        const { isDarkMode } = get()
        set({
          isDarkMode: !isDarkMode,
          theme: !isDarkMode ? 'dark' : 'light',
        })
      },

      // UI preferences actions
      setUIPreferences: (preferences: Partial<UIPreferences>) => {
        set((state) => ({
          uiPreferences: { ...state.uiPreferences, ...preferences },
        }))
      },

      // Application state actions
      toggleFullscreen: () => {
        const { isFullscreen } = get()
        set({ isFullscreen: !isFullscreen })

        // Handle actual fullscreen API
        if (!isFullscreen) {
          document.documentElement.requestFullscreen?.()
        } else {
          document.exitFullscreen?.()
        }
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },

      toggleDebugMode: () => {
        set((state) => ({ debugMode: !state.debugMode }))
      },

      // Performance settings actions
      setPerformanceSettings: (settings) => {
        set((state) => ({
          enableAnimations: settings.enableAnimations ?? state.enableAnimations,
          enableParticles: settings.enableParticles ?? state.enableParticles,
          highPerformanceMode:
            settings.highPerformanceMode ?? state.highPerformanceMode,
        }))

        // Auto-adjust based on high performance mode
        if (settings.highPerformanceMode) {
          set({
            enableAnimations: false,
            enableParticles: false,
          })
        }
      },

      // User preferences actions
      setLastSelectedHotspot: (hotspotId: string | null) => {
        set({ lastSelectedHotspot: hotspotId })
      },

      addFavoriteHotspot: (hotspotId: string) => {
        set((state) => {
          const favorites = [...state.favoriteHotspots]
          if (!favorites.includes(hotspotId)) {
            favorites.push(hotspotId)
          }
          return { favoriteHotspots: favorites }
        })
      },

      removeFavoriteHotspot: (hotspotId: string) => {
        set((state) => ({
          favoriteHotspots: state.favoriteHotspots.filter(
            (id) => id !== hotspotId
          ),
        }))
      },

      addToRecentlyViewed: (hotspotId: string) => {
        set((state) => {
          const recent = [
            hotspotId,
            ...state.recentlyViewed.filter((id) => id !== hotspotId),
          ]
          return {
            recentlyViewed: recent.slice(0, 10), // Keep only last 10
          }
        })
      },

      clearRecentlyViewed: () => {
        set({ recentlyViewed: [] })
      },

      // Reset to defaults
      resetToDefaults: () => {
        set(defaultState)
      },
    }),
    {
      name: 'hue-datacenter-visualization-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        theme: state.theme,
        uiPreferences: state.uiPreferences,
        enableAnimations: state.enableAnimations,
        enableParticles: state.enableParticles,
        highPerformanceMode: state.highPerformanceMode,
        favoriteHotspots: state.favoriteHotspots,
        recentlyViewed: state.recentlyViewed,
        sidebarOpen: state.sidebarOpen,
      }),
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        // Handle state migrations for future versions
        if (version === 0) {
          // Migration from version 0 to 1
          return {
            ...defaultState,
            ...(persistedState as typeof defaultState),
            // Add any new fields with defaults
          }
        }
        return persistedState
      },
    }
  )
)

// Selectors for commonly used state combinations
export const useThemeStore = () =>
  useVisualizationStore((state) => ({
    theme: state.theme,
    isDarkMode: state.isDarkMode,
    setTheme: state.setTheme,
    toggleDarkMode: state.toggleDarkMode,
  }))

export const useUIPreferencesStore = () =>
  useVisualizationStore((state) => ({
    uiPreferences: state.uiPreferences,
    setUIPreferences: state.setUIPreferences,
  }))

export const usePerformanceStore = () =>
  useVisualizationStore((state) => ({
    enableAnimations: state.enableAnimations,
    enableParticles: state.enableParticles,
    highPerformanceMode: state.highPerformanceMode,
    setPerformanceSettings: state.setPerformanceSettings,
  }))

export const useFavoritesStore = () =>
  useVisualizationStore((state) => ({
    favoriteHotspots: state.favoriteHotspots,
    addFavoriteHotspot: state.addFavoriteHotspot,
    removeFavoriteHotspot: state.removeFavoriteHotspot,
  }))

export const useRecentStore = () =>
  useVisualizationStore((state) => ({
    recentlyViewed: state.recentlyViewed,
    addToRecentlyViewed: state.addToRecentlyViewed,
    clearRecentlyViewed: state.clearRecentlyViewed,
  }))

// Theme detection and system preference handling
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  try {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleThemeChange = () => {
      const store = useVisualizationStore.getState()
      if (store.theme === 'system') {
        store.setTheme('system') // This will update isDarkMode
      }
    }

    mediaQuery.addEventListener('change', handleThemeChange)

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      const store = useVisualizationStore.getState()
      const isFullscreen = !!document.fullscreenElement
      if (store.isFullscreen !== isFullscreen) {
        useVisualizationStore.setState({ isFullscreen })
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
  } catch (error) {
    // Silently fail in environments without these APIs
    console.warn('Browser APIs not available:', error)
  }
}
