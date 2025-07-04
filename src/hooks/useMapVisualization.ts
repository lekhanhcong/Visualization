'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { ImageHotspot } from '@/types'

interface MapViewState {
  zoomLevel: number
  panOffset: { x: number; y: number }
  rotation: number
}

interface UseMapVisualizationOptions {
  minZoom?: number
  maxZoom?: number
  enableRotation?: boolean
  enableBounds?: boolean
  smoothTransitions?: boolean
  transitionDuration?: number
  enableLogging?: boolean
}

interface UseMapVisualizationReturn {
  // View state
  zoomLevel: number
  panOffset: { x: number; y: number }
  rotation: number

  // Selected hotspot
  selectedHotspot: ImageHotspot | null
  hoveredHotspot: ImageHotspot | null

  // Actions
  zoom: (delta: number, center?: { x: number; y: number }) => void
  pan: (offset: { x: number; y: number }) => void
  rotate: (angle: number) => void
  resetView: () => void
  zoomToHotspot: (
    hotspot: ImageHotspot,
    imageConfig: { originalWidth: number; originalHeight: number }
  ) => void

  // Hotspot interactions
  selectHotspot: (hotspot: ImageHotspot | null) => void
  hoverHotspot: (hotspot: ImageHotspot | null) => void

  // Computed values
  transform: string
  isZoomedIn: boolean
  isAtMinZoom: boolean
  isAtMaxZoom: boolean
  canPan: boolean

  // Animation state
  isAnimating: boolean
}

const DEFAULT_VIEW_STATE: MapViewState = {
  zoomLevel: 1,
  panOffset: { x: 0, y: 0 },
  rotation: 0,
}

export function useMapVisualization(
  options: UseMapVisualizationOptions = {}
): UseMapVisualizationReturn {
  const {
    minZoom = 0.5,
    maxZoom = 3,
    enableRotation = false,
    enableBounds = true,
    smoothTransitions = true,
    transitionDuration = 300,
    enableLogging = process.env.NODE_ENV === 'development',
  } = options

  // State
  const [viewState, setViewState] = useState<MapViewState>(DEFAULT_VIEW_STATE)
  const [selectedHotspot, setSelectedHotspot] = useState<ImageHotspot | null>(
    null
  )
  const [hoveredHotspot, setHoveredHotspot] = useState<ImageHotspot | null>(
    null
  )
  const [isAnimating, setIsAnimating] = useState(false)

  // Refs for animation
  const animationRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef<number | undefined>(undefined)
  const startStateRef = useRef<MapViewState | undefined>(undefined)
  const targetStateRef = useRef<MapViewState | undefined>(undefined)

  // Utility function for logging
  const log = useCallback(
    (message: string, data?: unknown) => {
      if (enableLogging) {
        console.log(`[useMapVisualization] ${message}`, data)
      }
    },
    [enableLogging]
  )

  // Clamp zoom level within bounds
  const clampZoom = useCallback(
    (zoom: number): number => {
      return Math.max(minZoom, Math.min(maxZoom, zoom))
    },
    [minZoom, maxZoom]
  )

  // Clamp pan offset within bounds (optional)
  const clampPan = useCallback(
    (
      offset: { x: number; y: number },
      zoom: number
    ): { x: number; y: number } => {
      if (!enableBounds) return offset

      // Calculate maximum pan distance based on zoom level
      const maxPan = (zoom - 1) * 200

      return {
        x: Math.max(-maxPan, Math.min(maxPan, offset.x)),
        y: Math.max(-maxPan, Math.min(maxPan, offset.y)),
      }
    },
    [enableBounds]
  )

  // Animation easing function
  const easeInOutCubic = useCallback((t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }, [])

  // Animate to target state
  const animateToState = useCallback(
    (targetState: MapViewState) => {
      if (!smoothTransitions) {
        setViewState(targetState)
        return
      }

      // Cancel any existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      setIsAnimating(true)
      startStateRef.current = viewState
      targetStateRef.current = targetState
      startTimeRef.current = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - (startTimeRef.current || 0)
        const progress = Math.min(elapsed / transitionDuration, 1)
        const easedProgress = easeInOutCubic(progress)

        const startState = startStateRef.current || DEFAULT_VIEW_STATE
        const targetState = targetStateRef.current || DEFAULT_VIEW_STATE

        const newState: MapViewState = {
          zoomLevel:
            startState.zoomLevel +
            (targetState.zoomLevel - startState.zoomLevel) * easedProgress,
          panOffset: {
            x:
              startState.panOffset.x +
              (targetState.panOffset.x - startState.panOffset.x) *
                easedProgress,
            y:
              startState.panOffset.y +
              (targetState.panOffset.y - startState.panOffset.y) *
                easedProgress,
          },
          rotation:
            startState.rotation +
            (targetState.rotation - startState.rotation) * easedProgress,
        }

        setViewState(newState)

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
          animationRef.current = undefined
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    },
    [viewState, smoothTransitions, transitionDuration, easeInOutCubic]
  )

  // Zoom function
  const zoom = useCallback(
    (delta: number, center: { x: number; y: number } = { x: 0, y: 0 }) => {
      const newZoomLevel = clampZoom(viewState.zoomLevel + delta)

      if (newZoomLevel === viewState.zoomLevel) return

      // Adjust pan offset to zoom towards center point
      const zoomRatio = newZoomLevel / viewState.zoomLevel
      const newPanOffset = clampPan(
        {
          x: viewState.panOffset.x + center.x * (1 - zoomRatio),
          y: viewState.panOffset.y + center.y * (1 - zoomRatio),
        },
        newZoomLevel
      )

      const newState: MapViewState = {
        ...viewState,
        zoomLevel: newZoomLevel,
        panOffset: newPanOffset,
      }

      log(
        `Zooming: ${viewState.zoomLevel.toFixed(2)} -> ${newZoomLevel.toFixed(2)}`,
        { center, newPanOffset }
      )
      animateToState(newState)
    },
    [viewState, clampZoom, clampPan, log, animateToState]
  )

  // Pan function
  const pan = useCallback(
    (offset: { x: number; y: number }) => {
      const newPanOffset = clampPan(offset, viewState.zoomLevel)

      const newState: MapViewState = {
        ...viewState,
        panOffset: newPanOffset,
      }

      log(
        `Panning: (${viewState.panOffset.x}, ${viewState.panOffset.y}) -> (${newPanOffset.x}, ${newPanOffset.y})`
      )
      animateToState(newState)
    },
    [viewState, clampPan, log, animateToState]
  )

  // Rotate function
  const rotate = useCallback(
    (angle: number) => {
      if (!enableRotation) return

      const newState: MapViewState = {
        ...viewState,
        rotation: angle,
      }

      log(`Rotating to: ${angle}°`)
      animateToState(newState)
    },
    [viewState, enableRotation, log, animateToState]
  )

  // Reset view function
  const resetView = useCallback(() => {
    log('Resetting view to default state')
    animateToState(DEFAULT_VIEW_STATE)
  }, [log, animateToState])

  // Zoom to hotspot function
  const zoomToHotspot = useCallback(
    (
      hotspot: ImageHotspot,
      imageConfig: { originalWidth: number; originalHeight: number }
    ) => {
      const targetZoom = 2
      const centerX = (hotspot.position.x - imageConfig.originalWidth / 2) * -1
      const centerY = (hotspot.position.y - imageConfig.originalHeight / 2) * -1

      const newState: MapViewState = {
        zoomLevel: targetZoom,
        panOffset: clampPan({ x: centerX, y: centerY }, targetZoom),
        rotation: viewState.rotation,
      }

      log(`Zooming to hotspot: ${hotspot.name}`, { hotspot, newState })
      animateToState(newState)
    },
    [clampPan, viewState.rotation, log, animateToState]
  )

  // Select hotspot function
  const selectHotspot = useCallback(
    (hotspot: ImageHotspot | null) => {
      log(`Selecting hotspot: ${hotspot?.name || 'none'}`)
      setSelectedHotspot(hotspot)
    },
    [log]
  )

  // Hover hotspot function
  const hoverHotspot = useCallback((hotspot: ImageHotspot | null) => {
    setHoveredHotspot(hotspot)
  }, [])

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Computed values
  const transform = useMemo(() => {
    const { zoomLevel, panOffset, rotation } = viewState
    return `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px) rotate(${rotation}deg)`
  }, [viewState])

  const isZoomedIn = useMemo(
    () => viewState.zoomLevel > 1,
    [viewState.zoomLevel]
  )
  const isAtMinZoom = useMemo(
    () => viewState.zoomLevel <= minZoom,
    [viewState.zoomLevel, minZoom]
  )
  const isAtMaxZoom = useMemo(
    () => viewState.zoomLevel >= maxZoom,
    [viewState.zoomLevel, maxZoom]
  )
  const canPan = useMemo(() => isZoomedIn, [isZoomedIn])

  return {
    // View state
    zoomLevel: viewState.zoomLevel,
    panOffset: viewState.panOffset,
    rotation: viewState.rotation,

    // Selected hotspot
    selectedHotspot,
    hoveredHotspot,

    // Actions
    zoom,
    pan,
    rotate,
    resetView,
    zoomToHotspot,

    // Hotspot interactions
    selectHotspot,
    hoverHotspot,

    // Computed values
    transform,
    isZoomedIn,
    isAtMinZoom,
    isAtMaxZoom,
    canPan,

    // Animation state
    isAnimating,
  }
}
