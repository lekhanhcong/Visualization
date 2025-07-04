'use client'

import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals'

export interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: string
}

export interface PerformanceData {
  CLS: PerformanceMetric | null
  FID: PerformanceMetric | null
  FCP: PerformanceMetric | null
  LCP: PerformanceMetric | null
  TTFB: PerformanceMetric | null
}

// Performance thresholds based on Google's Core Web Vitals
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
}

// Get rating based on thresholds
function getRating(
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Store for performance data
const performanceData: PerformanceData = {
  CLS: null,
  FID: null,
  FCP: null,
  LCP: null,
  TTFB: null,
}

// Callbacks for performance updates
const performanceCallbacks: Array<(data: PerformanceData) => void> = []

// Log performance metric to console (development only)
function logMetric(metric: PerformanceMetric) {
  if (process.env.NODE_ENV === 'development') {
    const color =
      metric.rating === 'good'
        ? 'green'
        : metric.rating === 'needs-improvement'
          ? 'orange'
          : 'red'
    console.log(
      `%c[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`,
      `color: ${color}; font-weight: bold;`,
      { metric }
    )
  }
}

// Send metric to analytics (placeholder for your analytics service)
function sendToAnalytics(metric: PerformanceMetric) {
  // Replace with your analytics service
  if (process.env.NODE_ENV === 'production') {
    // Example: send to Google Analytics, DataDog, etc.
    console.log('Sending metric to analytics:', metric)
  }
}

// Handle metric update
function handleMetric(metric: unknown) {
  const metricObj = metric as {
    name: string
    value: number
    delta: number
    id: string
    navigationType?: string
  }

  const performanceMetric: PerformanceMetric = {
    name: metricObj.name,
    value: metricObj.value,
    rating: getRating(metricObj.name, metricObj.value),
    delta: metricObj.delta,
    id: metricObj.id,
    navigationType: metricObj.navigationType || 'unknown',
  }

  // Update stored data
  performanceData[metricObj.name as keyof PerformanceData] = performanceMetric

  // Log metric
  logMetric(performanceMetric)

  // Send to analytics
  sendToAnalytics(performanceMetric)

  // Notify callbacks
  performanceCallbacks.forEach((callback) => callback(performanceData))
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Register Web Vitals observers
  onCLS(handleMetric)
  onFCP(handleMetric)
  onLCP(handleMetric)
  onTTFB(handleMetric)

  // Log initialization
  if (process.env.NODE_ENV === 'development') {
    console.log('[Performance] Web Vitals monitoring initialized')
  }
}

// Get current performance data
export function getPerformanceData(): PerformanceData {
  return { ...performanceData }
}

// Subscribe to performance updates
export function subscribeToPerformance(
  callback: (data: PerformanceData) => void
) {
  performanceCallbacks.push(callback)

  // Return unsubscribe function
  return () => {
    const index = performanceCallbacks.indexOf(callback)
    if (index > -1) {
      performanceCallbacks.splice(index, 1)
    }
  }
}

// Get performance score (0-100)
export function getPerformanceScore(): number {
  const metrics = Object.values(performanceData).filter(Boolean)
  if (metrics.length === 0) return 0

  const scores = metrics.map((metric) => {
    if (!metric) return 0
    switch (metric.rating) {
      case 'good':
        return 100
      case 'needs-improvement':
        return 50
      case 'poor':
        return 0
      default:
        return 0
    }
  })

  const total = scores.reduce((sum: number, score: number) => sum + score, 0)
  return Math.round(total / scores.length)
}

// Measure custom performance timing
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  if (typeof performance === 'undefined') {
    return fn()
  }

  const start = performance.now()
  const result = fn()

  if (result instanceof Promise) {
    return result.finally(() => {
      const end = performance.now()
      const duration = end - start

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
      }
    })
  } else {
    const end = performance.now()
    const duration = end - start

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
    }

    return result
  }
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      initPerformanceMonitoring()
    }
  }, [])

  return {
    getPerformanceData,
    getPerformanceScore,
    subscribeToPerformance,
    measurePerformance,
  }
}

// React import for useEffect
import React from 'react'
