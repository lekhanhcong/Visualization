/**
 * Performance monitoring utilities for 2N+1 Redundancy Visualization
 * Real-time Web Vitals collection and reporting
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

export interface PerformanceReport {
  metrics: PerformanceMetric[]
  deviceInfo: {
    userAgent: string
    connection?: string
    memory?: number
  }
  pageInfo: {
    url: string
    referrer: string
    loadTime: number
  }
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []
  private startTime: number = performance.now()

  constructor() {
    this.initializeWebVitals()
    this.initializeCustomMetrics()
  }

  private initializeWebVitals() {
    // Core Web Vitals
    getCLS(this.handleMetric.bind(this))
    getFID(this.handleMetric.bind(this))
    getFCP(this.handleMetric.bind(this))
    getLCP(this.handleMetric.bind(this))
    getTTFB(this.handleMetric.bind(this))
  }

  private initializeCustomMetrics() {
    // Time to Interactive (TTI) approximation
    this.measureTTI()
    
    // First Input Delay (FID) backup for browsers that don't support it
    this.measureFirstInputDelay()
    
    // Custom metrics for redundancy feature
    this.measureRedundancyInteraction()
    
    // Memory usage monitoring
    this.measureMemoryUsage()
    
    // Frame rate monitoring
    this.measureFrameRate()
  }

  private handleMetric(metric: any) {
    const rating = this.getMetricRating(metric.name, metric.value)
    
    this.metrics.push({
      name: metric.name,
      value: metric.value,
      rating,
      timestamp: metric.entries?.[0]?.startTime || performance.now()
    })

    // Report to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 ${metric.name}:`, {
        value: Math.round(metric.value),
        rating,
        unit: this.getMetricUnit(metric.name)
      })
    }
  }

  private getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, [number, number]> = {
      CLS: [0.1, 0.25],
      FID: [100, 300],
      FCP: [1800, 3000],
      LCP: [2500, 4000],
      TTFB: [800, 1800],
      TTI: [3800, 7300],
      TBT: [200, 600]
    }

    const [good, poor] = thresholds[name] || [0, Infinity]
    
    if (value <= good) return 'good'
    if (value <= poor) return 'needs-improvement'
    return 'poor'
  }

  private getMetricUnit(name: string): string {
    const units: Record<string, string> = {
      CLS: '',
      FID: 'ms',
      FCP: 'ms',
      LCP: 'ms',
      TTFB: 'ms',
      TTI: 'ms',
      TBT: 'ms',
      FPS: 'fps',
      Memory: 'MB'
    }
    
    return units[name] || 'ms'
  }

  private measureTTI() {
    // Simplified TTI measurement
    let isInteractive = false
    
    const checkInteractivity = () => {
      if (document.readyState === 'complete' && !isInteractive) {
        const tti = performance.now() - this.startTime
        isInteractive = true
        
        this.handleMetric({
          name: 'TTI',
          value: tti,
          entries: [{ startTime: tti }]
        })
      }
    }

    if (document.readyState === 'complete') {
      checkInteractivity()
    } else {
      window.addEventListener('load', checkInteractivity)
    }
  }

  private measureFirstInputDelay() {
    let isFirstInput = true
    
    const handleFirstInput = (event: Event) => {
      if (!isFirstInput) return
      isFirstInput = false
      
      const startTime = (event as any).timeStamp || performance.now()
      
      // Use setTimeout to measure processing delay
      setTimeout(() => {
        const processingTime = performance.now() - startTime
        
        this.handleMetric({
          name: 'FID-Custom',
          value: processingTime,
          entries: [{ startTime }]
        })
      }, 0)
    }

    ['click', 'keydown', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, handleFirstInput, { once: true, passive: true })
    })
  }

  private measureRedundancyInteraction() {
    // Measure time to open redundancy visualization
    const measureRedundancyOpen = () => {
      const button = document.querySelector('[data-testid="redundancy-toggle-button"]')
      if (!button) return

      button.addEventListener('click', () => {
        const startTime = performance.now()
        
        const checkModalOpen = () => {
          const modal = document.querySelector('[role="dialog"][aria-modal="true"]')
          if (modal) {
            const openTime = performance.now() - startTime
            
            this.handleMetric({
              name: 'RedundancyOpen',
              value: openTime,
              entries: [{ startTime }]
            })
          } else {
            // Keep checking for a reasonable time
            if (performance.now() - startTime < 2000) {
              requestAnimationFrame(checkModalOpen)
            }
          }
        }
        
        requestAnimationFrame(checkModalOpen)
      })
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', measureRedundancyOpen)
    } else {
      measureRedundancyOpen()
    }
  }

  private measureMemoryUsage() {
    if (!('memory' in performance)) return

    const measureMemory = () => {
      const memory = (performance as any).memory
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576)
      
      this.handleMetric({
        name: 'Memory',
        value: usedMB,
        entries: [{ startTime: performance.now() }]
      })
    }

    // Measure memory every 30 seconds
    measureMemory()
    setInterval(measureMemory, 30000)
  }

  private measureFrameRate() {
    let frameCount = 0
    let lastTime = performance.now()
    
    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        
        this.handleMetric({
          name: 'FPS',
          value: fps,
          entries: [{ startTime: currentTime }]
        })
        
        frameCount = 0
        lastTime = currentTime
      }
      
      requestAnimationFrame(measureFPS)
    }
    
    requestAnimationFrame(measureFPS)
  }

  public getReport(): PerformanceReport {
    const connection = (navigator as any).connection
    const memory = (performance as any).memory
    
    return {
      metrics: [...this.metrics],
      deviceInfo: {
        userAgent: navigator.userAgent,
        connection: connection?.effectiveType,
        memory: memory ? Math.round(memory.jsHeapSizeLimit / 1048576) : undefined
      },
      pageInfo: {
        url: window.location.href,
        referrer: document.referrer,
        loadTime: performance.now() - this.startTime
      }
    }
  }

  public getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name)
  }

  public getLatestMetric(name: string): PerformanceMetric | undefined {
    const metrics = this.getMetricsByName(name)
    return metrics[metrics.length - 1]
  }

  public clearMetrics() {
    this.metrics = []
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Global performance monitor instance
let performanceMonitor: PerformanceMonitor | null = null

export function initializePerformanceMonitoring(): PerformanceMonitor {
  if (typeof window === 'undefined') {
    throw new Error('Performance monitoring can only be initialized in the browser')
  }
  
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor()
  }
  
  return performanceMonitor
}

export function getPerformanceMonitor(): PerformanceMonitor | null {
  return performanceMonitor
}

export function reportPerformanceMetrics(): PerformanceReport | null {
  return performanceMonitor?.getReport() || null
}

// Utility functions for specific metrics
export function measureRedundancyPerformance(): Promise<number> {
  return new Promise((resolve) => {
    const startTime = performance.now()
    
    const button = document.querySelector('[data-testid="redundancy-toggle-button"]') as HTMLElement
    if (!button) {
      resolve(-1)
      return
    }
    
    const observer = new MutationObserver(() => {
      const modal = document.querySelector('[role="dialog"][aria-modal="true"]')
      if (modal) {
        const duration = performance.now() - startTime
        observer.disconnect()
        resolve(duration)
      }
    })
    
    observer.observe(document.body, { childList: true, subtree: true })
    button.click()
    
    // Timeout after 5 seconds
    setTimeout(() => {
      observer.disconnect()
      resolve(-1)
    }, 5000)
  })
}

export function measureAnimationPerformance(selector: string, duration: number = 1000): Promise<number> {
  return new Promise((resolve) => {
    const element = document.querySelector(selector)
    if (!element) {
      resolve(-1)
      return
    }
    
    let frameCount = 0
    let startTime: number | null = null
    
    const countFrames = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      frameCount++
      
      if (timestamp - startTime < duration) {
        requestAnimationFrame(countFrames)
      } else {
        const fps = (frameCount * 1000) / duration
        resolve(fps)
      }
    }
    
    requestAnimationFrame(countFrames)
  })
}