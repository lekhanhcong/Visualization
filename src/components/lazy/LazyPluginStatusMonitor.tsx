/**
 * Lazy-loaded PluginStatusMonitor - Development only component
 * Only loads in development mode to reduce production bundle size
 */

'use client'

import React, { Suspense, lazy } from 'react'

// Only load in development
const PluginStatusMonitor = process.env.NODE_ENV === 'development' 
  ? lazy(() => import('../dev/PluginStatusMonitor').then(module => ({
      default: module.PluginStatusMonitor
    })))
  : null

interface LazyPluginStatusMonitorProps {
  className?: string
  showDetails?: boolean
}

export function LazyPluginStatusMonitor(props: LazyPluginStatusMonitorProps) {
  // Don't render anything in production
  if (process.env.NODE_ENV !== 'development' || !PluginStatusMonitor) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <PluginStatusMonitor {...props} />
    </Suspense>
  )
}