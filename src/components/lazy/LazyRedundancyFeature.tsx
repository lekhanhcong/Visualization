/**
 * Lazy-loaded RedundancyFeature - Code splitting for better performance
 * Only loads when needed to reduce initial bundle size
 */

'use client'

import React, { Suspense, lazy } from 'react'
import { RedundancyErrorBoundary, RedundancyFallback } from '../ErrorBoundary'

// Lazy load the RedundancyFeature to reduce initial bundle size
const RedundancyFeature = lazy(() => 
  import('../../../features/redundancy').then(module => ({
    default: module.RedundancyFeature
  }))
)

interface LazyRedundancyFeatureProps {
  isVisible: boolean
  onClose: () => void
  animationDuration?: number
}

// Loading component for the redundancy feature
function RedundancyLoadingFallback() {
  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="animate-spin w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            Loading 2N+1 Redundancy Visualization...
          </span>
        </div>
      </div>
    </div>
  )
}

export function LazyRedundancyFeature({ 
  isVisible, 
  onClose, 
  animationDuration = 4000 
}: LazyRedundancyFeatureProps) {
  // Don't render anything if not visible to avoid unnecessary loading
  if (!isVisible) {
    return null
  }

  return (
    <RedundancyErrorBoundary fallback={<RedundancyFallback />}>
      <Suspense fallback={<RedundancyLoadingFallback />}>
        <RedundancyFeature
          isVisible={isVisible}
          onClose={onClose}
          animationDuration={animationDuration}
        />
      </Suspense>
    </RedundancyErrorBoundary>
  )
}