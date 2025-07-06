/**
 * SubstationMarker Component
 * Interactive markers for substations in the 2N+1 redundancy visualization
 */

import React, { useEffect, useRef, useCallback, useState } from 'react'
import { useRedundancy } from '../providers/RedundancyProvider'
import { redundancyEventBus } from '../events'
import { RedundancyErrorBoundary } from '../errors/ErrorBoundary'
import type { SubstationData, CoordinateSystem, Position } from '../types'

// Component props interface
export interface SubstationMarkerProps {
  /** Array of substations to display */
  substations?: SubstationData[]
  /** Component visibility */
  isVisible?: boolean
  /** Animation delay in milliseconds */
  animationDelay?: number
  /** Animation duration in milliseconds */
  animationDuration?: number
  /** Marker size */
  markerSize?: number
  /** Custom CSS class name */
  className?: string
  /** Custom inline styles */
  style?: React.CSSProperties
  /** SVG container dimensions */
  dimensions?: {
    width: number
    height: number
  }
  /** Coordinate system for positioning */
  coordinateSystem?: CoordinateSystem
  /** Interactive mode */
  interactive?: boolean
  /** Show substation labels */
  showLabels?: boolean
  /** Show capacity information */
  showCapacity?: boolean
  /** Show status indicators */
  showStatus?: boolean
  /** Enable animations */
  enableAnimations?: boolean
  /** Pulse animation for active substations */
  enablePulse?: boolean
  /** Custom substation click handler */
  onSubstationClick?: (substation: SubstationData) => void
  /** Custom substation hover handler */
  onSubstationHover?: (substation: SubstationData | null) => void
  /** Debug mode */
  debug?: boolean
}

// Default substations data
const defaultSubstations: SubstationData[] = [
  {
    id: 'sub-a',
    name: 'Substation A',
    status: 'ACTIVE',
    capacity: '100MW',
    position: { x: 100, y: 100 },
    color: '#28a745',
    connections: ['line-1']
  },
  {
    id: 'sub-b',
    name: 'Substation B',
    status: 'ACTIVE',
    capacity: '100MW',
    position: { x: 150, y: 80 },
    color: '#28a745',
    connections: ['line-2']
  },
  {
    id: 'sub-c',
    name: 'Substation C',
    status: 'STANDBY',
    capacity: '50MW',
    position: { x: 200, y: 120 },
    color: '#ffc107',
    connections: ['line-3']
  }
]

// Default coordinate system
const defaultCoordinateSystem: CoordinateSystem = {
  mapWidth: 400,
  mapHeight: 300,
  viewportWidth: 400,
  viewportHeight: 300,
  scale: 1,
  offset: { x: 0, y: 0 }
}

/**
 * SubstationMarker Component
 * Renders interactive substation markers with status indicators
 */
export function SubstationMarker({
  substations = defaultSubstations,
  isVisible = true,
  animationDelay = 0,
  animationDuration = 1000,
  markerSize = 20,
  className = '',
  style,
  dimensions = { width: 400, height: 300 },
  coordinateSystem = defaultCoordinateSystem,
  interactive = true,
  showLabels = true,
  showCapacity = true,
  showStatus = true,
  enableAnimations = true,
  enablePulse = true,
  onSubstationClick,
  onSubstationHover,
  debug = false
}: SubstationMarkerProps) {
  const {
    state,
    actions,
    isDependenciesResolved,
    hasErrors
  } = useRedundancy()

  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredSubstation, setHoveredSubstation] = useState<string | null>(null)
  const [animationPhase, setAnimationPhase] = useState<'hidden' | 'appearing' | 'visible'>('hidden')
  const animationTimeoutRef = useRef<NodeJS.Timeout>()

  // Filter substations based on current state
  const visibleSubstations = substations.filter(substation => {
    // Show all substations by default
    if (!state) return true
    
    // Hide substations with errors if system is isolated
    if (hasErrors) {
      return substation.status !== 'ERROR'
    }

    return true
  })

  // Start animation sequence
  useEffect(() => {
    if (!isVisible || !isDependenciesResolved) {
      setAnimationPhase('hidden')
      return
    }

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    // Start animation after delay
    animationTimeoutRef.current = setTimeout(() => {
      setAnimationPhase('appearing')
      
      // Complete animation
      setTimeout(() => {
        setAnimationPhase('visible')
      }, animationDuration)
    }, animationDelay)

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [isVisible, isDependenciesResolved, animationDelay, animationDuration])

  // Handle substation click
  const handleSubstationClick = useCallback((substation: SubstationData, event: React.MouseEvent) => {
    if (!interactive) return

    event.stopPropagation()

    // Update global state
    if (actions) {
      actions.selectSubstation(substation)
    }

    // Call custom handler
    if (onSubstationClick) {
      onSubstationClick(substation)
    }

    // Emit event
    redundancyEventBus.emit('redundancy:substation:clicked', {
      substation,
      timestamp: Date.now()
    })

    if (debug) {
      console.log('[SubstationMarker] Substation clicked:', substation.id)
    }
  }, [interactive, actions, onSubstationClick, debug])

  // Handle substation hover
  const handleSubstationHover = useCallback((substation: SubstationData | null, event?: React.MouseEvent) => {
    if (!interactive) return

    setHoveredSubstation(substation?.id || null)

    // Call custom handler
    if (onSubstationHover) {
      onSubstationHover(substation)
    }

    // Emit event
    redundancyEventBus.emit('redundancy:substation:hovered', {
      substation,
      timestamp: Date.now()
    })

    if (debug) {
      console.log('[SubstationMarker] Substation hovered:', substation?.id || 'none')
    }
  }, [interactive, onSubstationHover, debug])

  // Transform position based on coordinate system
  const transformPosition = useCallback((position: Position): Position => {
    const scale = coordinateSystem.scale
    const offset = coordinateSystem.offset

    return {
      x: position.x * scale + (offset.x || 0),
      y: position.y * scale + (offset.y || 0)
    }
  }, [coordinateSystem])

  // Get marker color based on status and state
  const getMarkerColor = useCallback((substation: SubstationData, isHovered: boolean, isSelected: boolean) => {
    if (isSelected) return '#007bff'
    if (isHovered) return '#17a2b8'
    
    switch (substation.status) {
      case 'ACTIVE':
        return '#28a745'
      case 'STANDBY':
        return '#ffc107'
      case 'INACTIVE':
        return '#6c757d'
      case 'ERROR':
        return '#dc3545'
      default:
        return substation.color || '#6c757d'
    }
  }, [])

  // Get status icon
  const getStatusIcon = useCallback((status: SubstationData['status']) => {
    switch (status) {
      case 'ACTIVE':
        return '●'
      case 'STANDBY':
        return '◐'
      case 'INACTIVE':
        return '○'
      case 'ERROR':
        return '⚠'
      default:
        return '●'
    }
  }, [])

  // Calculate label position
  const getLabelPosition = useCallback((position: Position, size: number): Position => {
    return {
      x: position.x,
      y: position.y + size + 15
    }
  }, [])

  // Don't render if not visible or dependencies not resolved
  if (!isVisible || !isDependenciesResolved || animationPhase === 'hidden') {
    return null
  }

  // Calculate CSS classes
  const containerClasses = [
    'rdx-substation-marker',
    `rdx-substation-marker--${animationPhase}`,
    interactive ? 'rdx-substation-marker--interactive' : '',
    hasErrors ? 'rdx-substation-marker--error' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <RedundancyErrorBoundary featureId="substation-marker">
      <div
        className={containerClasses}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: interactive ? 'auto' : 'none',
          zIndex: 110,
          ...style
        }}
        data-testid="substation-marker"
        data-phase={animationPhase}
        data-interactive={interactive}
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${coordinateSystem.mapWidth} ${coordinateSystem.mapHeight}`}
          className="rdx-substation-marker__svg"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible'
          }}
        >
          {/* Gradient definitions */}
          <defs>
            {visibleSubstations.map(substation => (
              <radialGradient
                key={`gradient-${substation.id}`}
                id={`gradient-${substation.id}`}
                cx="50%"
                cy="50%"
                r="50%"
              >
                <stop offset="0%" stopColor={substation.color} stopOpacity="0.8" />
                <stop offset="70%" stopColor={substation.color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={substation.color} stopOpacity="0.1" />
              </radialGradient>
            ))}

            {/* Glow filters */}
            {visibleSubstations.map(substation => (
              <filter
                key={`glow-${substation.id}`}
                id={`glow-${substation.id}`}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {/* Render substations */}
          {visibleSubstations.map((substation, index) => {
            const isHovered = hoveredSubstation === substation.id
            const isSelected = state?.selectedSubstation?.id === substation.id
            const position = transformPosition(substation.position)
            const color = getMarkerColor(substation, isHovered, isSelected)
            const labelPos = getLabelPosition(position, markerSize)
            const currentSize = isSelected ? markerSize * 1.3 : isHovered ? markerSize * 1.1 : markerSize

            return (
              <g key={substation.id} className="rdx-substation-marker__substation-group">
                {/* Pulse effect for active substations */}
                {enablePulse && substation.status === 'ACTIVE' && animationPhase === 'visible' && (
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={markerSize * 1.5}
                    fill={`url(#gradient-${substation.id})`}
                    opacity="0.3"
                  >
                    <animate
                      attributeName="r"
                      values={`${markerSize};${markerSize * 2};${markerSize}`}
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.3;0.1;0.3"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Background circle */}
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={currentSize + 2}
                  fill="rgba(0,0,0,0.1)"
                />

                {/* Main marker */}
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={currentSize}
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                  filter={isSelected || isHovered ? `url(#glow-${substation.id})` : undefined}
                  style={{
                    cursor: interactive ? 'pointer' : 'default',
                    transition: enableAnimations ? 'all 0.3s ease' : 'none'
                  }}
                  onClick={(e) => handleSubstationClick(substation, e)}
                  onMouseEnter={(e) => handleSubstationHover(substation, e)}
                  onMouseLeave={(e) => handleSubstationHover(null, e)}
                  data-testid={`substation-${substation.id}`}
                  data-status={substation.status}
                />

                {/* Status indicator */}
                {showStatus && (
                  <text
                    x={position.x}
                    y={position.y + 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={currentSize * 0.6}
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {getStatusIcon(substation.status)}
                  </text>
                )}

                {/* Label */}
                {showLabels && (isSelected || isHovered || animationPhase === 'visible') && (
                  <g className="rdx-substation-marker__label">
                    <rect
                      x={labelPos.x - 40}
                      y={labelPos.y - 10}
                      width="80"
                      height="20"
                      fill="rgba(0,0,0,0.8)"
                      stroke={color}
                      strokeWidth="1"
                      rx="4"
                    />
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="500"
                    >
                      {substation.name}
                    </text>
                  </g>
                )}

                {/* Capacity indicator */}
                {showCapacity && (isSelected || isHovered) && (
                  <g className="rdx-substation-marker__capacity">
                    <rect
                      x={labelPos.x - 25}
                      y={labelPos.y + 15}
                      width="50"
                      height="16"
                      fill="rgba(0,0,0,0.8)"
                      stroke={color}
                      strokeWidth="1"
                      rx="3"
                    />
                    <text
                      x={labelPos.x}
                      y={labelPos.y + 23}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="9"
                      fontWeight="400"
                    >
                      {substation.capacity}
                    </text>
                  </g>
                )}

                {/* Connection lines indicator */}
                {isSelected && substation.connections.length > 0 && (
                  <text
                    x={position.x + currentSize + 5}
                    y={position.y - currentSize - 5}
                    fill={color}
                    fontSize="8"
                    fontWeight="500"
                  >
                    {substation.connections.length} lines
                  </text>
                )}

                {/* Debug info */}
                {debug && (
                  <text
                    x={position.x}
                    y={position.y + currentSize + 30}
                    textAnchor="middle"
                    fill="#666"
                    fontSize="8"
                  >
                    {substation.id}
                  </text>
                )}

                {/* Animation entrance effect */}
                {enableAnimations && animationPhase === 'appearing' && (
                  <animateTransform
                    attributeName="transform"
                    type="scale"
                    values="0;1.2;1"
                    dur="0.6s"
                    begin={`${index * 0.1}s`}
                    additive="sum"
                  />
                )}
              </g>
            )
          })}

          {/* Legend */}
          {showStatus && animationPhase === 'visible' && (
            <g className="rdx-substation-marker__legend">
              <rect
                x="10"
                y="10"
                width="120"
                height="60"
                fill="rgba(255,255,255,0.9)"
                stroke="rgba(0,0,0,0.2)"
                strokeWidth="1"
                rx="4"
              />
              <text x="20" y="25" fontSize="10" fontWeight="600" fill="#333">
                Status Legend
              </text>
              <circle cx="25" cy="35" r="4" fill="#28a745" />
              <text x="35" y="38" fontSize="8" fill="#333">Active</text>
              <circle cx="25" cy="45" r="4" fill="#ffc107" />
              <text x="35" y="48" fontSize="8" fill="#333">Standby</text>
              <circle cx="25" cy="55" r="4" fill="#6c757d" />
              <text x="35" y="58" fontSize="8" fill="#333">Inactive</text>
            </g>
          )}
        </svg>

        {/* Debug overlay */}
        {debug && (
          <div className="rdx-substation-marker__debug">
            <div>Phase: {animationPhase}</div>
            <div>Substations: {visibleSubstations.length}</div>
            <div>Hovered: {hoveredSubstation || 'none'}</div>
            <div>Selected: {state?.selectedSubstation?.id || 'none'}</div>
          </div>
        )}
      </div>
    </RedundancyErrorBoundary>
  )
}

/**
 * HOC for adding substation markers to components
 */
export function withSubstationMarker<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  markerProps?: Partial<SubstationMarkerProps>
) {
  const WithSubstationMarker = (props: P) => (
    <>
      <WrappedComponent {...props} />
      <SubstationMarker {...markerProps} />
    </>
  )

  WithSubstationMarker.displayName = 
    `withSubstationMarker(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`

  return WithSubstationMarker
}

// Export types
export type { SubstationMarkerProps, SubstationData, CoordinateSystem, Position }