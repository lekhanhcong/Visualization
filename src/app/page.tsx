'use client'

import { useState, useEffect } from 'react'
import { SimpleRedundancyFeature } from '../../features/redundancy/components/SimpleRedundancyFeature'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  
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
                  300MW AI Data Center Visualization - Simple 2N+1
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-500">v2.04.0</div>
          </div>
        </div>
      </header>

      {/* Main Content - Simple 2N+1 Feature */}
      <main className="h-[calc(100vh-4rem)] w-full">
        <div className="h-full flex items-center justify-center bg-gray-100 p-4">
          <div className="relative w-full h-full max-w-6xl max-h-[600px]">
            
            {/* Simple 2N+1 Redundancy Feature */}
            {isRedundancyEnabled ? (
              <SimpleRedundancyFeature className="w-full h-full" />
            ) : (
              // Fallback if feature disabled
              <div className="w-full h-full flex items-center justify-center bg-white rounded-lg shadow-lg">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-700 mb-4">
                    Hue Hi Tech Park - Power Infrastructure
                  </h2>
                  <p className="text-gray-500">
                    Enable NEXT_PUBLIC_ENABLE_REDUNDANCY to use 2N+1 feature
                  </p>
                </div>
              </div>
            )}


            {/* Status Badge */}
            <div className="absolute top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-sm z-10">
              ✅ Simple 2N+1 Feature Active
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-10">
              <h3 className="text-sm font-bold mb-2">Simple 2N+1 Feature</h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  <span>Default View</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>2N+1 View with Text</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <span>Click button to toggle</span>
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
              © 2024 Hue Hi Tech Park - Simple 2N+1 Redundancy Feature
            </div>
            <div className="text-xs text-slate-500">v2.04.0 - Simplified</div>
          </div>
        </div>
      </footer>
    </div>
  )
}