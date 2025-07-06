'use client'

import { useEffect } from 'react'
import { initializePerformanceMonitoring } from '../utils/performance'

export default function PerformanceMonitorWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        initializePerformanceMonitoring()
      } catch (error) {
        console.warn('Failed to initialize performance monitoring:', error)
      }
    }
  }, [])

  return <>{children}</>
}