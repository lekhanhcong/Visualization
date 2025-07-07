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
            <div className="text-xs text-slate-500">v2.05.0</div>
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