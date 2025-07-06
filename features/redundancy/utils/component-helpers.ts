/**
 * Component Helpers
 * Common helper functions and React utilities for redundancy components
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { cssUtils, animationUtils, eventUtils, validationUtils } from './component-utils'
import type { Position, CoordinateSystem } from '../types'

// React component helpers

/**
 * Creates a component with default props
 */
export function withDefaults<P extends object>(
  Component: React.ComponentType<P>,
  defaultProps: Partial<P>
): React.ComponentType<P> {
  const WithDefaults = (props: P) => 
    React.createElement(Component, { ...defaultProps, ...props })
  
  WithDefaults.displayName = `withDefaults(${Component.displayName || Component.name})`
  return WithDefaults
}

/**
 * Creates a memoized component
 */
export function memo<P extends object>(
  Component: React.ComponentType<P>,
  compare?: (prevProps: P, nextProps: P) => boolean
): React.ComponentType<P> {
  return React.memo(Component, compare)
}

/**
 * Creates a component with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error }>
): React.ComponentType<P> {
  const ErrorBoundary = class extends React.Component<
    P & { children?: React.ReactNode },
    { hasError: boolean; error?: Error }
  > {
    constructor(props: P & { children?: React.ReactNode }) {
      super(props)
      this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('Component error caught:', error, errorInfo)
    }

    render() {
      if (this.state.hasError) {
        if (fallback && this.state.error) {
          const FallbackComponent = fallback
          return React.createElement(FallbackComponent, { error: this.state.error })
        }
        return React.createElement('div', null, 'Something went wrong.')
      }

      return React.createElement(Component, this.props)
    }
  }

  ErrorBoundary.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return ErrorBoundary as React.ComponentType<P>
}

// Export grouped helpers
export const componentHelpers = {
  withDefaults,
  memo,
  withErrorBoundary
}

// Custom hooks
export const useRedundancyClassName = (
  base: string,
  modifiers: Record<string, boolean | string> = {},
  additionalClasses: string = ''
) => {
  return useCallback(() => {
    const baseClass = cssUtils.createClassName(base, modifiers)
    return cssUtils.combineClasses(baseClass, additionalClasses)
  }, [base, modifiers, additionalClasses])()
}

export const useAnimationFrame = (
  callback: (timestamp: number, deltaTime: number) => void,
  enabled = true
) => {
  const callbackRef = useRef(callback)
  const animationRef = useRef<ReturnType<typeof animationUtils.createAnimationLoop>>()

  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Initialize animation loop
  useEffect(() => {
    animationRef.current = animationUtils.createAnimationLoop(
      (timestamp, deltaTime) => callbackRef.current(timestamp, deltaTime)
    )

    return () => {
      animationRef.current?.stop()
    }
  }, [])

  // Control animation based on enabled state
  useEffect(() => {
    if (enabled) {
      animationRef.current?.start()
    } else {
      animationRef.current?.stop()
    }
  }, [enabled])

  return {
    start: () => animationRef.current?.start(),
    stop: () => animationRef.current?.stop(),
    isRunning: () => animationRef.current?.isRunning() || false
  }
}

export const useMousePosition = (elementRef: React.RefObject<HTMLElement>) => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleMouseMove = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      setPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      })
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [elementRef])

  return { position, isHovering }
}

export const useThrottledCallback = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T => {
  const throttledCallback = useRef(eventUtils.throttle(callback, delay))

  useEffect(() => {
    throttledCallback.current = eventUtils.throttle(callback, delay)
  }, [callback, delay])

  return throttledCallback.current
}

export const useDebouncedCallback = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T => {
  const debouncedCallback = useRef(eventUtils.debounce(callback, delay))

  useEffect(() => {
    debouncedCallback.current = eventUtils.debounce(callback, delay)
  }, [callback, delay])

  return debouncedCallback.current
}

export const useVisibilityState = (
  initialVisible = true,
  animationDelay = 0,
  animationDuration = 300
) => {
  const [phase, setPhase] = useState<'hidden' | 'appearing' | 'visible' | 'disappearing'>('hidden')
  const [isVisible, setIsVisible] = useState(initialVisible)

  useEffect(() => {
    if (isVisible) {
      // Start appearing after delay
      const delayTimer = setTimeout(() => {
        setPhase('appearing')
        
        // Transition to visible after animation duration
        const durationTimer = setTimeout(() => {
          setPhase('visible')
        }, animationDuration)
        
        return () => clearTimeout(durationTimer)
      }, animationDelay)
      
      return () => clearTimeout(delayTimer)
    } else {
      setPhase('disappearing')
      
      // Hide after animation
      const timer = setTimeout(() => {
        setPhase('hidden')
      }, animationDuration)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, animationDelay, animationDuration])

  return {
    phase,
    isVisible,
    setIsVisible,
    show: () => setIsVisible(true),
    hide: () => setIsVisible(false),
    toggle: () => setIsVisible(prev => !prev)
  }
}

export const useElementSize = (elementRef: React.RefObject<HTMLElement>) => {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setSize({ width, height })
      }
    })

    resizeObserver.observe(element)

    return () => {
      resizeObserver.disconnect()
    }
  }, [elementRef])

  return size
}

export const useCoordinateTransform = (coordinateSystem: CoordinateSystem) => {
  const transform = useCallback((position: Position, toScreen = true) => {
    if (!validationUtils.isValidPosition(position)) {
      return { x: 0, y: 0 }
    }

    const { scale, offset } = coordinateSystem
    
    if (toScreen) {
      return {
        x: position.x * scale + (offset.x || 0),
        y: position.y * scale + (offset.y || 0)
      }
    } else {
      return {
        x: (position.x - (offset.x || 0)) / scale,
        y: (position.y - (offset.y || 0)) / scale
      }
    }
  }, [coordinateSystem])

  return { transform }
}

export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0)
  const mountTime = useRef(Date.now())

  renderCount.current++

  useEffect(() => {
    const startTime = Date.now()
    
    return () => {
      const lifespan = Date.now() - mountTime.current
      console.log(`[Performance] ${componentName} lifespan: ${lifespan}ms, renders: ${renderCount.current}`)
    }
  }, [componentName])

  const measureRender = useCallback(() => {
    const start = performance.now()
    
    return () => {
      const duration = performance.now() - start
      console.log(`[Performance] ${componentName} render ${renderCount.current}: ${duration.toFixed(2)}ms`)
    }
  }, [componentName])

  return { renderCount: renderCount.current, measureRender }
}

// Component factories
export const createAnimatedComponent = <P extends object>(
  Component: React.ComponentType<P & { animationPhase?: string }>,
  animationConfig?: {
    delay?: number
    duration?: number
    initialVisible?: boolean
  }
): React.ComponentType<P & { isVisible?: boolean }> => {
  const AnimatedComponent = ({ isVisible = true, ...props }: P & { isVisible?: boolean }) => {
    const { phase } = useVisibilityState(
      isVisible,
      animationConfig?.delay,
      animationConfig?.duration
    )

    if (phase === 'hidden') return null

    return React.createElement(Component, { ...props as P, animationPhase: phase })
  }

  AnimatedComponent.displayName = `createAnimatedComponent(${Component.displayName || Component.name})`
  return AnimatedComponent
}

export const createResponsiveComponent = <P extends object>(
  Component: React.ComponentType<P & { 
    dimensions?: { width: number; height: number }
    isMobile?: boolean
  }>
): React.ComponentType<P> => {
  const ResponsiveComponent = (props: P) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const dimensions = useElementSize(containerRef)
    const isMobile = dimensions.width < 768

    return React.createElement(
      'div',
      { 
        ref: containerRef, 
        style: { width: '100%', height: '100%' } 
      },
      React.createElement(Component, {
        ...props,
        dimensions,
        isMobile
      })
    )
  }

  ResponsiveComponent.displayName = `createResponsiveComponent(${Component.displayName || Component.name})`
  return ResponsiveComponent
}

export const createInteractiveComponent = <P extends object>(
  Component: React.ComponentType<P & { 
    isHovering?: boolean
    mousePosition?: Position
    onClick?: (event: React.MouseEvent) => void
    onHover?: (isHovering: boolean) => void
  }>
): React.ComponentType<P & {
  interactive?: boolean
  onClick?: (event: React.MouseEvent) => void
  onHover?: (isHovering: boolean) => void
}> => {
  const InteractiveComponent = ({ 
    interactive = false, 
    onClick, 
    onHover,
    ...props 
  }: P & {
    interactive?: boolean
    onClick?: (event: React.MouseEvent) => void
    onHover?: (isHovering: boolean) => void
  }) => {
    const elementRef = useRef<HTMLDivElement>(null)
    const { position: mousePosition, isHovering } = useMousePosition(elementRef)

    useEffect(() => {
      if (onHover) {
        onHover(isHovering)
      }
    }, [isHovering, onHover])

    const handleClick = useCallback((event: React.MouseEvent) => {
      if (interactive && onClick) {
        onClick(event)
      }
    }, [interactive, onClick])

    return React.createElement(
      'div',
      {
        ref: elementRef,
        onClick: handleClick,
        style: { 
          width: '100%', 
          height: '100%',
          pointerEvents: interactive ? 'auto' : 'none'
        }
      },
      React.createElement(Component, {
        ...props as P,
        isHovering: interactive ? isHovering : false,
        mousePosition: interactive ? mousePosition : { x: 0, y: 0 }
      })
    )
  }

  InteractiveComponent.displayName = `createInteractiveComponent(${Component.displayName || Component.name})`
  return InteractiveComponent
}

// Export all helpers
export {
  withDefaults,
  memo,
  withErrorBoundary,
  componentHelpers,
  useRedundancyClassName,
  useAnimationFrame,
  useMousePosition,
  useThrottledCallback,
  useDebouncedCallback,
  useVisibilityState,
  useElementSize,
  useCoordinateTransform,
  usePerformanceMonitor,
  createAnimatedComponent,
  createResponsiveComponent,
  createInteractiveComponent
}