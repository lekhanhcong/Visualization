/**
 * Component Utilities
 * Shared utility functions for redundancy components
 */

import React from 'react'
import type { Position, CoordinateSystem, LineData, SubstationData } from '../types'

// CSS class utilities
export const cssUtils = {
  /**
   * Generates CSS class names with rdx- prefix
   */
  createClassName: (base: string, modifiers: Record<string, boolean | string> = {}): string => {
    const classes = [`rdx-${base}`]
    
    Object.entries(modifiers).forEach(([key, value]) => {
      if (value === true) {
        classes.push(`rdx-${base}--${key}`)
      } else if (typeof value === 'string' && value) {
        classes.push(`rdx-${base}--${value}`)
      }
    })
    
    return classes.join(' ')
  },

  /**
   * Combines class names safely
   */
  combineClasses: (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(' ')
  },

  /**
   * Generates BEM-style class names
   */
  bem: (block: string, element?: string, modifier?: string): string => {
    let className = `rdx-${block}`
    
    if (element) {
      className += `__${element}`
    }
    
    if (modifier) {
      className += `--${modifier}`
    }
    
    return className
  }
}

// Coordinate system utilities
export const coordinateUtils = {
  /**
   * Transforms screen coordinates to map coordinates
   */
  screenToMap: (
    screenPos: Position,
    coordinateSystem: CoordinateSystem
  ): Position => {
    const { scale, offset } = coordinateSystem
    return {
      x: (screenPos.x - (offset.x || 0)) / scale,
      y: (screenPos.y - (offset.y || 0)) / scale
    }
  },

  /**
   * Transforms map coordinates to screen coordinates
   */
  mapToScreen: (
    mapPos: Position,
    coordinateSystem: CoordinateSystem
  ): Position => {
    const { scale, offset } = coordinateSystem
    return {
      x: mapPos.x * scale + (offset.x || 0),
      y: mapPos.y * scale + (offset.y || 0)
    }
  },

  /**
   * Calculates distance between two positions
   */
  distance: (pos1: Position, pos2: Position): number => {
    const dx = pos2.x - pos1.x
    const dy = pos2.y - pos1.y
    return Math.sqrt(dx * dx + dy * dy)
  },

  /**
   * Checks if position is within bounds
   */
  isWithinBounds: (
    pos: Position,
    bounds: { width: number; height: number }
  ): boolean => {
    return pos.x >= 0 && pos.x <= bounds.width && 
           pos.y >= 0 && pos.y <= bounds.height
  },

  /**
   * Clamps position to bounds
   */
  clampToBounds: (
    pos: Position,
    bounds: { width: number; height: number }
  ): Position => {
    return {
      x: Math.max(0, Math.min(bounds.width, pos.x)),
      y: Math.max(0, Math.min(bounds.height, pos.y))
    }
  }
}

// Animation utilities
export const animationUtils = {
  /**
   * Creates a debounced animation frame callback
   */
  createAnimationLoop: (
    callback: (timestamp: number, deltaTime: number) => void
  ): { start: () => void; stop: () => void; isRunning: () => boolean } => {
    let animationId: number | null = null
    let lastTimestamp = 0
    let isActive = false

    const loop = (timestamp: number) => {
      if (!isActive) return

      const deltaTime = timestamp - lastTimestamp
      lastTimestamp = timestamp

      callback(timestamp, deltaTime)
      animationId = requestAnimationFrame(loop)
    }

    return {
      start: () => {
        if (isActive) return
        isActive = true
        lastTimestamp = performance.now()
        animationId = requestAnimationFrame(loop)
      },
      stop: () => {
        isActive = false
        if (animationId !== null) {
          cancelAnimationFrame(animationId)
          animationId = null
        }
      },
      isRunning: () => isActive
    }
  },

  /**
   * Easing functions
   */
  easing: {
    linear: (t: number): number => t,
    easeInQuad: (t: number): number => t * t,
    easeOutQuad: (t: number): number => t * (2 - t),
    easeInOutQuad: (t: number): number => 
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t: number): number => t * t * t,
    easeOutCubic: (t: number): number => (--t) * t * t + 1,
    easeInOutCubic: (t: number): number =>
      t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  },

  /**
   * Interpolates between two values
   */
  lerp: (start: number, end: number, t: number): number => {
    return start + (end - start) * t
  },

  /**
   * Interpolates between two positions
   */
  lerpPosition: (start: Position, end: Position, t: number): Position => {
    return {
      x: animationUtils.lerp(start.x, end.x, t),
      y: animationUtils.lerp(start.y, end.y, t)
    }
  }
}

// SVG utilities
export const svgUtils = {
  /**
   * Creates SVG path from points
   */
  createPath: (points: Position[]): string => {
    if (points.length === 0) return ''
    
    const [first, ...rest] = points
    let path = `M ${first.x},${first.y}`
    
    rest.forEach(point => {
      path += ` L ${point.x},${point.y}`
    })
    
    return path
  },

  /**
   * Parses SVG path to points
   */
  parsePath: (path: string): Position[] => {
    const points: Position[] = []
    const regex = /([ML])\s*(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)/g
    let match
    
    while ((match = regex.exec(path)) !== null) {
      points.push({
        x: parseFloat(match[2]),
        y: parseFloat(match[3])
      })
    }
    
    return points
  },

  /**
   * Calculates points along a path
   */
  interpolateAlongPath: (points: Position[], numInterpolations: number): Position[] => {
    if (points.length < 2) return points
    
    const interpolated: Position[] = []
    const totalSegments = numInterpolations - 1
    
    for (let i = 0; i <= totalSegments; i++) {
      const t = i / totalSegments
      const segmentIndex = Math.floor(t * (points.length - 1))
      const segmentT = (t * (points.length - 1)) - segmentIndex
      
      if (segmentIndex >= points.length - 1) {
        interpolated.push(points[points.length - 1])
      } else {
        interpolated.push(
          animationUtils.lerpPosition(points[segmentIndex], points[segmentIndex + 1], segmentT)
        )
      }
    }
    
    return interpolated
  },

  /**
   * Creates viewBox string
   */
  createViewBox: (width: number, height: number, x = 0, y = 0): string => {
    return `${x} ${y} ${width} ${height}`
  }
}

// Color utilities
export const colorUtils = {
  /**
   * Converts hex color to rgba
   */
  hexToRgba: (hex: string, alpha = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  },

  /**
   * Lightens a color by percentage
   */
  lighten: (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.min(255, Math.floor((num >> 16) * (1 + percent / 100)))
    const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) * (1 + percent / 100)))
    const b = Math.min(255, Math.floor((num & 0x0000FF) * (1 + percent / 100)))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  },

  /**
   * Gets status color
   */
  getStatusColor: (status: string): string => {
    const statusColors: Record<string, string> = {
      active: '#28a745',
      standby: '#ffc107',
      inactive: '#6c757d',
      error: '#dc3545',
      warning: '#fd7e14',
      unknown: '#6f42c1'
    }
    return statusColors[status.toLowerCase()] || statusColors.unknown
  }
}

// Event utilities
export const eventUtils = {
  /**
   * Creates a throttled function
   */
  throttle: <T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): T => {
    let inThrottle: boolean
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(null, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }) as T
  },

  /**
   * Creates a debounced function
   */
  debounce: <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): T => {
    let timeoutId: NodeJS.Timeout
    return ((...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }) as T
  },

  /**
   * Gets mouse/touch position from event
   */
  getEventPosition: (event: MouseEvent | TouchEvent): Position => {
    if ('touches' in event && event.touches.length > 0) {
      return {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      }
    } else {
      return {
        x: (event as MouseEvent).clientX,
        y: (event as MouseEvent).clientY
      }
    }
  }
}

// Data utilities
export const dataUtils = {
  /**
   * Filters lines by status
   */
  filterLinesByStatus: (lines: LineData[], statuses: string[]): LineData[] => {
    return lines.filter(line => statuses.includes(line.status))
  },

  /**
   * Filters substations by status
   */
  filterSubstationsByStatus: (substations: SubstationData[], statuses: string[]): SubstationData[] => {
    return substations.filter(substation => statuses.includes(substation.status))
  },

  /**
   * Groups items by property
   */
  groupBy: <T>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const group = String(item[key])
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(item)
      return groups
    }, {} as Record<string, T[]>)
  },

  /**
   * Sorts items by multiple criteria
   */
  sortBy: <T>(array: T[], ...criteria: ((item: T) => any)[]): T[] => {
    return [...array].sort((a, b) => {
      for (const criterion of criteria) {
        const aVal = criterion(a)
        const bVal = criterion(b)
        if (aVal < bVal) return -1
        if (aVal > bVal) return 1
      }
      return 0
    })
  }
}

// Performance utilities
export const performanceUtils = {
  /**
   * Creates a performance monitor
   */
  createMonitor: (name: string) => {
    const start = performance.now()
    
    return {
      end: () => {
        const end = performance.now()
        const duration = end - start
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
        return duration
      }
    }
  },

  /**
   * Measures function execution time
   */
  measure: <T extends (...args: any[]) => any>(
    name: string,
    func: T
  ): T => {
    return ((...args: any[]) => {
      const monitor = performanceUtils.createMonitor(name)
      const result = func(...args)
      monitor.end()
      return result
    }) as T
  },

  /**
   * Creates a performance budget checker
   */
  createBudgetChecker: (budgetMs: number) => {
    let violations = 0
    
    return {
      check: (name: string, duration: number) => {
        if (duration > budgetMs) {
          violations++
          console.warn(`[Performance Budget] ${name} exceeded budget: ${duration.toFixed(2)}ms > ${budgetMs}ms`)
        }
      },
      getViolations: () => violations,
      reset: () => { violations = 0 }
    }
  }
}

// Validation utilities
export const validationUtils = {
  /**
   * Validates position object
   */
  isValidPosition: (pos: any): pos is Position => {
    if (!pos || typeof pos !== 'object') return false
    return typeof pos.x === 'number' &&
           typeof pos.y === 'number' &&
           !isNaN(pos.x) &&
           !isNaN(pos.y)
  },

  /**
   * Validates coordinate system
   */
  isValidCoordinateSystem: (cs: any): cs is CoordinateSystem => {
    if (!cs || typeof cs !== 'object') return false
    return typeof cs.mapWidth === 'number' &&
           typeof cs.mapHeight === 'number' &&
           typeof cs.viewportWidth === 'number' &&
           typeof cs.viewportHeight === 'number' &&
           typeof cs.scale === 'number' &&
           validationUtils.isValidPosition(cs.offset)
  },

  /**
   * Validates array of positions
   */
  isValidPositionArray: (positions: any[]): positions is Position[] => {
    return Array.isArray(positions) &&
           positions.every(validationUtils.isValidPosition)
  }
}

// Export all utilities
export {
  cssUtils,
  coordinateUtils,
  animationUtils,
  svgUtils,
  colorUtils,
  eventUtils,
  dataUtils,
  performanceUtils,
  validationUtils
}