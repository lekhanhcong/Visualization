/**
 * LineHighlight Component
 * SVG overlay for highlighting transmission lines in the 2N+1 redundancy visualization
 */

import React, { useEffect, useRef, useCallback, useState } from 'react'
import { useRedundancy } from '../providers/RedundancyProvider'
import { redundancyEventBus } from '../events'
import { RedundancyErrorBoundary } from '../errors/ErrorBoundary'
import type { LineData, CoordinateSystem, Position } from '../types'

// Component props interface
export interface LineHighlightProps {
  /** Array of lines to highlight */
  lines?: LineData[]
  /** Component visibility */
  isVisible?: boolean
  /** Animation delay in milliseconds */
  animationDelay?: number
  /** Animation duration in milliseconds */
  animationDuration?: number
  /** Highlight glow intensity */
  glowIntensity?: number
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
  /** Show line labels */
  showLabels?: boolean
  /** Enable animations */
  enableAnimations?: boolean
  /** Flow animation speed */
  flowSpeed?: number
  /** Custom line click handler */
  onLineClick?: (line: LineData) => void
  /** Custom line hover handler */
  onLineHover?: (line: LineData | null) => void
  /** Debug mode */
  debug?: boolean
}

// Default lines data
const defaultLines: LineData[] = [
  {
    id: 'line-1',
    from: 'sub-a',
    to: 'datacenter',
    status: 'active',
    voltage: '345kV',
    path: 'M 100,100 L 300,200',
    color: '#28a745',
    glowIntensity: 0.8
  },
  {
    id: 'line-2', 
    from: 'sub-b',
    to: 'datacenter',
    status: 'active',
    voltage: '345kV',
    path: 'M 150,80 L 300,200',
    color: '#28a745',
    glowIntensity: 0.8
  },
  {
    id: 'line-3',
    from: 'sub-c',
    to: 'datacenter', 
    status: 'standby',
    voltage: '345kV',
    path: 'M 200,120 L 300,200',
    color: '#ffc107',
    glowIntensity: 0.6
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
 * LineHighlight Component
 * Renders highlighted transmission lines with animations and interactions
 */
export function LineHighlight({
  lines = defaultLines,
  isVisible = true,
  animationDelay = 0,
  animationDuration = 1000,
  glowIntensity = 0.8,
  className = '',
  style,
  dimensions = { width: 400, height: 300 },
  coordinateSystem = defaultCoordinateSystem,
  interactive = true,
  showLabels = true,
  enableAnimations = true,
  flowSpeed = 2,
  onLineClick,
  onLineHover,
  debug = false
}: LineHighlightProps) {
  const {
    state,
    actions,
    isDependenciesResolved,
    hasErrors
  } = useRedundancy()

  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredLine, setHoveredLine] = useState<string | null>(null)
  const [animationPhase, setAnimationPhase] = useState<'hidden' | 'appearing' | 'visible'>('hidden')
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Filter lines based on current state
  const visibleLines = lines.filter(line => {
    // Show all lines by default
    if (!state) return true
    
    // Hide lines with errors if system is isolated
    if (hasErrors) {
      return line.status !== 'standby'
    }

    return true
  })

  // Start animation sequence
  useEffect(() => {
    if (!isVisible || !isDependenciesResolved) {
      setAnimationPhase('hidden')
      return undefined
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

  // Handle line click
  const handleLineClick = useCallback((line: LineData, event: React.MouseEvent) => {
    if (!interactive) return

    event.stopPropagation()

    // Update global state
    if (actions) {
      actions.selectLine(line)
    }

    // Call custom handler
    if (onLineClick) {
      onLineClick(line)
    }

    // Emit event
    redundancyEventBus.emit('redundancy:line:clicked', {
      line,
      timestamp: Date.now()
    })

    if (debug) {
      console.log('[LineHighlight] Line clicked:', line.id)
    }
  }, [interactive, actions, onLineClick, debug])

  // Handle line hover
  const handleLineHover = useCallback((line: LineData | null, event?: React.MouseEvent) => {
    if (!interactive) return

    setHoveredLine(line?.id || null)

    // Call custom handler
    if (onLineHover) {
      onLineHover(line)
    }

    // Emit event
    redundancyEventBus.emit('redundancy:line:hovered', {
      line,
      timestamp: Date.now()
    })

    if (debug) {
      console.log('[LineHighlight] Line hovered:', line?.id || 'none')
    }
  }, [interactive, onLineHover, debug])

  // Calculate line coordinates
  const transformPath = useCallback((path: string): string => {
    // Apply coordinate system transformations
    const scale = coordinateSystem.scale
    const offset = coordinateSystem.offset

    // Simple transformation for demo (would be more complex in real implementation)
    return path.replace(/(\d+)/g, (match) => {
      const num = parseInt(match)
      return String(num * scale + (offset.x || 0))
    })
  }, [coordinateSystem])

  // Generate line stroke properties
  const getLineStroke = useCallback((line: LineData, isHovered: boolean, isSelected: boolean) => {
    const baseWidth = isSelected ? 6 : isHovered ? 4 : 3
    const opacity = animationPhase === 'appearing' ? 0.5 : 1
    
    return {
      stroke: line.color,
      strokeWidth: baseWidth,
      strokeOpacity: opacity,
      fill: 'none',
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const
    }
  }, [animationPhase])

  // Generate glow filter
  const getGlowFilter = useCallback((line: LineData, isSelected: boolean) => {
    const intensity = isSelected ? glowIntensity * 1.5 : line.glowIntensity * glowIntensity
    return `drop-shadow(0 0 ${intensity * 10}px ${line.color})`
  }, [glowIntensity])

  // Calculate label position
  const getLabeLPosition = useCallback((path: string): Position => {
    // Extract midpoint from path (simplified)
    const coords = path.match(/(\d+),(\d+)/g) || []
    if (coords.length >= 2) {
      const start = coords[0].split(',').map(Number)
      const end = coords[coords.length - 1].split(',').map(Number)
      return {
        x: (start[0] + end[0]) / 2,
        y: (start[1] + end[1]) / 2 - 10
      }
    }
    return { x: 150, y: 100 }
  }, [])

  // Don't render if not visible or dependencies not resolved
  if (!isVisible || !isDependenciesResolved || animationPhase === 'hidden') {
    return null
  }

  // Calculate CSS classes
  const containerClasses = [
    'rdx-line-highlight',
    `rdx-line-highlight--${animationPhase}`,
    interactive ? 'rdx-line-highlight--interactive' : '',
    hasErrors ? 'rdx-line-highlight--error' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <RedundancyErrorBoundary featureId="line-highlight">
      <div
        className={containerClasses}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: interactive ? 'auto' : 'none',
          zIndex: 100,
          ...style
        }}
        data-testid="line-highlight"
        data-phase={animationPhase}
        data-interactive={interactive}
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${coordinateSystem.mapWidth} ${coordinateSystem.mapHeight}`}
          className="rdx-line-highlight__svg"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible'
          }}
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.8" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            
            {/* Glow filters for each line */}
            {visibleLines.map(line => (
              <filter
                key={`glow-${line.id}`}
                id={`glow-${line.id}`}
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

          {/* Render lines */}
          {visibleLines.map(line => {
            const isHovered = hoveredLine === line.id
            const isSelected = state?.selectedLine?.id === line.id
            const transformedPath = transformPath(line.path)
            const strokeProps = getLineStroke(line, isHovered, isSelected)
            const labelPos = getLabeLPosition(transformedPath)

            return (
              <g key={line.id} className="rdx-line-highlight__line-group">
                {/* Background line */}
                <path
                  d={transformedPath}
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth={strokeProps.strokeWidth + 2}
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Main line */}
                <path
                  d={transformedPath}
                  {...strokeProps}
                  filter={isSelected || isHovered ? `url(#glow-${line.id})` : undefined}
                  style={{
                    cursor: interactive ? 'pointer' : 'default',
                    transition: enableAnimations ? 'all 0.3s ease' : 'none'
                  }}
                  onClick={(e) => handleLineClick(line, e)}
                  onMouseEnter={(e) => handleLineHover(line, e)}
                  onMouseLeave={(e) => handleLineHover(null, e)}
                  data-testid={`line-${line.id}`}
                  data-status={line.status}
                />

                {/* Flow animation */}
                {enableAnimations && line.status === 'active' && animationPhase === 'visible' && (
                  <path
                    d={transformedPath}
                    stroke="url(#flow-gradient)"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.6"
                    style={{
                      animation: `flow-${flowSpeed}s ${flowSpeed}s linear infinite`
                    }}
                  />
                )}

                {/* Line label */}
                {showLabels && (isSelected || isHovered) && (
                  <g className="rdx-line-highlight__label">
                    <rect
                      x={labelPos.x - 30}
                      y={labelPos.y - 12}
                      width="60"
                      height="20"
                      fill="rgba(0,0,0,0.8)"
                      stroke={line.color}
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
                      {line.voltage}
                    </text>
                  </g>
                )}

                {/* Debug info */}
                {debug && (
                  <text
                    x={labelPos.x}
                    y={labelPos.y + 20}
                    textAnchor="middle"
                    fill="#666"
                    fontSize="8"
                  >
                    {line.id}
                  </text>
                )}
              </g>
            )
          })}

          {/* Selection indicator */}
          {state?.selectedLine && (
            <circle
              cx="10"
              cy="10"
              r="6"
              fill={state.selectedLine.color}
              stroke="white"
              strokeWidth="2"
              opacity="0.8"
            >
              <animate
                attributeName="r"
                values="6;8;6"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </svg>

        {/* Debug overlay */}
        {debug && (
          <div className="rdx-line-highlight__debug">
            <div>Phase: {animationPhase}</div>
            <div>Lines: {visibleLines.length}</div>
            <div>Hovered: {hoveredLine || 'none'}</div>
            <div>Selected: {state?.selectedLine?.id || 'none'}</div>
          </div>
        )}
      </div>
    </RedundancyErrorBoundary>
  )
}

/**
 * HOC for adding line highlighting to components
 */
export function withLineHighlight<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  lineProps?: Partial<LineHighlightProps>
) {
  const WithLineHighlight = (props: P) => (
    <>
      <WrappedComponent {...props} />
      <LineHighlight {...lineProps} />
    </>
  )

  WithLineHighlight.displayName = 
    `withLineHighlight(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`

  return WithLineHighlight
}

// Export types
export type { LineData, CoordinateSystem, Position }