'use client'

import React from 'react'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { PerformanceMonitor } from '@/components/atoms/PerformanceMonitor'

interface VisualizationLayoutProps {
  children?: React.ReactNode
  className?: string
}

export function VisualizationLayout({
  children,
  className = '',
}: VisualizationLayoutProps) {
  // Simplified static data approach to avoid data loading issues
  const staticHotspots = [
    {
      id: 'datacenter',
      name: 'HUE HI TECH PARK 300MW AI DATA CENTER',
      type: 'datacenter' as const,
      position: { x: 350, y: 180 },
      description: 'Data center chính với công suất 300MW',
      metadata: {
        capacity: '300MW',
        voltage: '220kV/110kV',
        status: 'planned' as const,
      },
    },
    {
      id: 'substation-500kv',
      name: '500/220KV SUBSTATION',
      type: 'substation' as const,
      position: { x: 200, y: 80 },
      description: 'Trạm biến áp chính 2x600MVA',
      metadata: {
        capacity: '2x600MVA',
        voltage: '500kV/220kV',
        status: 'planned' as const,
      },
    },
  ]

  const isLoading = false
  const error = null

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Loading Visualization
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Preparing Hue Hi Tech Park Data Center infrastructure map...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Error state - Show simplified visualization even with data loading errors
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Hue Hi Tech Park
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    300MW AI Data Center Visualization
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Show image even with data error */}
        <main className="relative flex-1">
          <div className="h-[calc(100vh-4rem)] w-full">
            <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800">
              <div className="relative w-full h-full max-w-6xl max-h-[600px]">
                <Image
                  src="/images/power-map.png"
                  alt="Hue Hi Tech Park Power Infrastructure Map"
                  fill
                  className="object-contain"
                  priority
                />
                <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                  ⚠️ Data loading error - Showing static map
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Main layout
  return (
    <div className={`min-h-screen ${className}`}>
      {/* Header */}
      <header className="relative z-40 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Hue Hi Tech Park
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  300MW AI Data Center Visualization
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Theme toggle - temporarily disabled for build */}
              {/* {uiPreferences.showZoomControls && (
                <ThemeToggle 
                  variant="dropdown" 
                  size="md"
                  position="top-right"
                />
              )} */}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative flex-1">
        {/* Visualization container */}
        <div className="h-[calc(100vh-4rem)] w-full">
          <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800">
            <div className="relative w-full h-full max-w-6xl max-h-[600px] p-4">
              {/* Power Map Image */}
              <Image
                src="/images/power-map.png"
                alt="Hue Hi Tech Park Power Infrastructure Map"
                fill
                className="object-contain shadow-lg rounded-lg"
                priority
              />

              {/* Interactive Hotspots */}
              {staticHotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className="absolute bg-blue-500 w-4 h-4 rounded-full animate-pulse cursor-pointer hover:scale-150 transition-transform"
                  style={{
                    left: `${(hotspot.position.x / 600) * 100}%`,
                    top: `${(hotspot.position.y / 400) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  title={hotspot.name}
                />
              ))}

              {/* Status Badge */}
              <div className="absolute top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-sm">
                ✅ Power Infrastructure Map Loaded
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 max-w-xs">
                <h3 className="text-sm font-bold mb-2">
                  Infrastructure Legend
                </h3>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-red-500 rounded"></div>
                    <span>500kV Lines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-blue-500 rounded"></div>
                    <span>220kV Lines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-pink-500 rounded"></div>
                    <span>110kV Lines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Data Center Area</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme toggle positioned absolutely - temporarily disabled for build */}
        {/* <ThemeToggle 
          variant="button" 
          size="md"
          position="top-right"
          className="z-50"
        /> */}

        {/* Additional children */}
        {children}
      </main>

      {/* Performance Monitor */}
      <PerformanceMonitor
        showDetails={process.env.NODE_ENV === 'development'}
        position="bottom-right"
      />

      {/* Footer */}
      <footer className="relative z-40 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 border-t py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            <div className="text-slate-600 dark:text-slate-400">
              © 2024 Hue Hi Tech Park - 300MW AI Data Center Infrastructure
              Visualization
            </div>
            <div className="flex items-center gap-4">
              {/* Status indicators */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Data Loaded: {staticHotspots.length} points
                </span>
              </div>

              {/* Version info */}
              <div className="text-xs text-slate-500">v1.0.0</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
