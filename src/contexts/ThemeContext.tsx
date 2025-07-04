'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Theme } from '@/types'
import { useThemeStore } from '@/stores/useVisualizationStore'

interface ThemeContextValue {
  theme: Theme
  isDarkMode: boolean
  setTheme: (theme: Theme) => void
  toggleDarkMode: () => void
  systemTheme: 'light' | 'dark'
  isSystemTheme: boolean
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps) {
  const { theme, isDarkMode, setTheme, toggleDarkMode } = useThemeStore()
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Get system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
      // System theme change will trigger re-render automatically
      // No need to call setTheme again
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement

    // Remove existing theme classes
    root.classList.remove('light', 'dark')

    // Apply new theme class
    const effectiveTheme = theme === 'system' ? systemTheme : theme
    root.classList.add(effectiveTheme)

    // Set CSS custom property for theme
    root.style.setProperty('--theme', effectiveTheme)

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        effectiveTheme === 'dark' ? '#0f172a' : '#ffffff'
      )
    }
  }, [theme, systemTheme])

  // Mark as mounted after first render
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize theme from store on mount
  useEffect(() => {
    if (mounted && !theme) {
      setTheme(defaultTheme)
    }
  }, [mounted, theme, defaultTheme, setTheme])

  const value: ThemeContextValue = {
    theme,
    isDarkMode,
    setTheme,
    toggleDarkMode,
    systemTheme,
    isSystemTheme: theme === 'system',
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="animate-pulse bg-gray-100 dark:bg-gray-900 min-h-screen">
        {children}
      </div>
    )
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}

// Hook for theme-aware CSS values
export function useThemeAwareCSS() {
  const { isDarkMode } = useTheme()

  return {
    bg: isDarkMode ? 'bg-slate-900' : 'bg-white',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    border: isDarkMode ? 'border-slate-700' : 'border-slate-200',
    card: isDarkMode ? 'bg-slate-800' : 'bg-white',
    cardText: isDarkMode ? 'text-slate-200' : 'text-slate-700',
    muted: isDarkMode ? 'text-slate-400' : 'text-slate-600',
    accent: isDarkMode ? 'bg-blue-600' : 'bg-blue-500',
    hover: isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100',
  }
}

// Hook for theme-aware infrastructure colors
export function useInfrastructureColors() {
  const { isDarkMode } = useTheme()

  return {
    datacenter: isDarkMode ? '#34d399' : '#10b981', // emerald-400 : emerald-500
    '500kv': isDarkMode ? '#f87171' : '#ef4444', // red-400 : red-500
    '220kv': isDarkMode ? '#60a5fa' : '#3b82f6', // blue-400 : blue-500
    '110kv': isDarkMode ? '#f472b6' : '#ec4899', // pink-400 : pink-500
    accent: isDarkMode ? '#a78bfa' : '#8b5cf6', // violet-400 : violet-500
    boundary: isDarkMode ? '#fcd34d' : '#fbbf24', // amber-300 : amber-400
  }
}
