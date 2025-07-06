'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { RedundancyVisualization } from '../components/RedundancyVisualization'
import { RedundancyErrorBoundary, RedundancyFallback } from '../components/ErrorBoundary'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [showRedundancy, setShowRedundancy] = useState(false)
  
  // Check if redundancy feature is enabled
  const isRedundancyEnabled = process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY === 'true'

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  Hue Hi Tech Park
                </h1>
                <p className="text-xs text-slate-600">
                  300MW AI Data Center Visualization
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-4rem)] w-full">
        <div className="h-full flex items-center justify-center bg-gray-100 p-4">
          <div className="relative w-full h-full max-w-6xl max-h-[600px]">
            {/* Power Map Image */}
            <Image
              src="/images/power-map.png"
              alt="Hue Hi Tech Park Power Infrastructure Map"
              fill
              className="object-contain shadow-lg rounded-lg bg-white"
              priority
            />

            {/* Interactive Hotspots */}
            <div
              className="absolute bg-blue-500 w-4 h-4 rounded-full animate-pulse cursor-pointer hover:scale-150 transition-transform z-10"
              style={{
                left: '60%',
                top: '45%',
                transform: 'translate(-50%, -50%)',
              }}
              title="HUE HI TECH PARK 300MW AI DATA CENTER"
            />

            <div
              className="absolute bg-red-500 w-4 h-4 rounded-full animate-pulse cursor-pointer hover:scale-150 transition-transform z-10"
              style={{
                left: '35%',
                top: '20%',
                transform: 'translate(-50%, -50%)',
              }}
              title="500/220KV SUBSTATION"
            />

            {/* Status Badge */}
            <div className="absolute top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-sm z-10">
              ✅ Power Infrastructure Map Loaded
            </div>

            {/* 2N+1 Redundancy Feature Button */}
            {isRedundancyEnabled && (
              <div className="absolute top-4 left-4 z-20">
                <button
                  onClick={() => setShowRedundancy(!showRedundancy)}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
                  aria-label={showRedundancy ? 'Close redundancy visualization' : 'Show 2N+1 redundancy visualization'}
                  data-testid="redundancy-toggle-button"
                >
                  <span className="text-lg">⚡</span>
                  <span className="font-semibold">
                    {showRedundancy ? 'Close Redundancy View' : 'Show 2N+1 Redundancy'}
                  </span>
                </button>
              </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-10">
              <h3 className="text-sm font-bold mb-2">Infrastructure Legend</h3>
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
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            <div className="text-slate-600">
              © 2024 Hue Hi Tech Park - 300MW AI Data Center Infrastructure
              Visualization
            </div>
            <div className="text-xs text-slate-500">v1.0.0</div>
          </div>
        </div>
      </footer>

      {/* 2N+1 Redundancy Feature */}
      {isRedundancyEnabled && (
        <RedundancyErrorBoundary 
          fallback={<RedundancyFallback />}
          onError={(error, errorInfo) => {
            console.error('Redundancy visualization error:', error, errorInfo)
            // Could integrate with error reporting service here
          }}
        >
          <RedundancyVisualization 
            isVisible={showRedundancy}
            onClose={() => setShowRedundancy(false)}
          />
        </RedundancyErrorBoundary>
      )}
    </div>
  )
}
