/**
 * PowerFlowAnimation Component
 * Animated visualization of power flow in transmission lines for 2N+1 redundancy
 */

import React, { useEffect, useRef, useCallback, useState } from 'react'
import { useRedundancy } from '../providers/RedundancyProvider'
import { redundancyEventBus } from '../events'
import { RedundancyErrorBoundary } from '../errors/ErrorBoundary'
import type { LineData, CoordinateSystem, Position } from '../types'

// Component props interface
export interface PowerFlowAnimationProps {
  /** Array of lines to animate */
  lines?: LineData[]
  /** Component visibility */
  isVisible?: boolean
  /** Animation delay in milliseconds */
  animationDelay?: number
  /** Flow speed multiplier */
  flowSpeed?: number
  /** Particle size */
  particleSize?: number
  /** Particle count per line */
  particleCount?: number
  /** Flow direction ('forward' | 'reverse' | 'bidirectional') */
  flowDirection?: 'forward' | 'reverse' | 'bidirectional'
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
  /** Enable different flow types */
  showCapacityFlow?: boolean
  /** Show power levels */
  showPowerLevels?: boolean
  /** Enable interactive flow control */
  interactive?: boolean
  /** Custom particle colors */
  particleColors?: {
    active: string
    standby: string
    overload: string
  }
  /** Animation performance mode */
  performanceMode?: 'high' | 'medium' | 'low'
  /** Enable GPU acceleration */
  useGPUAcceleration?: boolean
  /** Debug mode */
  debug?: boolean
}

// Default lines data with flow information
const defaultLines: LineData[] = [
  {
    id: 'flow-line-1',
    from: 'sub-a',
    to: 'datacenter',
    status: 'active',
    voltage: '345kV',
    path: 'M 100,100 L 300,200',
    color: '#28a745',
    glowIntensity: 0.8
  },
  {
    id: 'flow-line-2',
    from: 'sub-b',
    to: 'datacenter',
    status: 'active',
    voltage: '345kV',
    path: 'M 150,80 L 300,200',
    color: '#28a745',
    glowIntensity: 0.8
  },
  {
    id: 'flow-line-3',
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

// Particle interface
interface FlowParticle {
  id: string
  x: number
  y: number
  progress: number
  speed: number
  size: number
  color: string
  opacity: number
  lineId: string
}

/**
 * PowerFlowAnimation Component
 * Renders animated power flow visualization with particles
 */
export function PowerFlowAnimation({
  lines = defaultLines,
  isVisible = true,
  animationDelay = 0,
  flowSpeed = 1,
  particleSize = 4,
  particleCount = 5,
  flowDirection = 'forward',
  className = '',
  style,
  dimensions = { width: 400, height: 300 },
  coordinateSystem = defaultCoordinateSystem,
  showCapacityFlow = true,
  showPowerLevels = true,
  interactive = false,
  particleColors = {
    active: '#28a745',
    standby: '#ffc107',
    overload: '#dc3545'
  },
  performanceMode = 'medium',
  useGPUAcceleration = true,
  debug = false
}: PowerFlowAnimationProps) {
  const {
    state,
    isDependenciesResolved,
    hasErrors
  } = useRedundancy()

  const svgRef = useRef<SVGSVGElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [particles, setParticles] = useState<FlowParticle[]>([])
  const [animationActive, setAnimationActive] = useState(false)
  const lastTimeRef = useRef<number>(0)

  // Filter lines for animation
  const activeLines = lines.filter(line => {
    if (!state) return line.status === 'active'
    
    // Show flow for active lines and selected lines
    return line.status === 'active' || 
           (state.selectedLine && state.selectedLine.id === line.id)
  })

  // Calculate particle count based on performance mode
  const getEffectiveParticleCount = useCallback(() => {
    const baseCounts = {
      high: particleCount,
      medium: Math.max(1, Math.floor(particleCount * 0.7)),
      low: Math.max(1, Math.floor(particleCount * 0.4))
    }
    return baseCounts[performanceMode]
  }, [particleCount, performanceMode])

  // Parse SVG path to get points for animation
  const parsePathToPoints = useCallback((path: string, numPoints: number = 50): Position[] => {
    const points: Position[] = []
    
    // Simple path parsing for line segments (M x,y L x,y)
    const pathRegex = /([ML])\s*(\d+),(\d+)/g
    const matches = [...path.matchAll(pathRegex)]
    
    if (matches.length >= 2) {
      const start = { x: parseInt(matches[0][2]), y: parseInt(matches[0][3]) }
      const end = { x: parseInt(matches[1][2]), y: parseInt(matches[1][3]) }
      
      // Interpolate points along the line
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints
        points.push({
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t
        })
      }
    }
    
    return points
  }, [])

  // Create particles for a line
  const createParticlesForLine = useCallback((line: LineData): FlowParticle[] => {
    const count = getEffectiveParticleCount()
    const particles: FlowParticle[] = []
    
    for (let i = 0; i < count; i++) {
      const progress = (i / count) + Math.random() * 0.2
      const color = line.status === 'active' ? particleColors.active :
                   line.status === 'standby' ? particleColors.standby :
                   particleColors.overload
      
      particles.push({
        id: `${line.id}-particle-${i}`,
        x: 0,
        y: 0,
        progress: progress % 1,
        speed: flowSpeed * (0.8 + Math.random() * 0.4),
        size: particleSize * (0.8 + Math.random() * 0.4),
        color,
        opacity: 0.7 + Math.random() * 0.3,
        lineId: line.id
      })
    }
    
    return particles
  }, [getEffectiveParticleCount, flowSpeed, particleSize, particleColors])

  // Initialize particles
  useEffect(() => {
    if (!isVisible || !isDependenciesResolved) return

    const allParticles: FlowParticle[] = []
    activeLines.forEach(line => {
      allParticles.push(...createParticlesForLine(line))
    })
    
    setParticles(allParticles)
    
    if (debug) {
      console.log('[PowerFlowAnimation] Initialized particles:', allParticles.length)
    }
  }, [isVisible, isDependenciesResolved, activeLines, createParticlesForLine, debug])

  // Start animation after delay
  useEffect(() => {
    if (!isVisible || !isDependenciesResolved || particles.length === 0) {
      setAnimationActive(false)
      return undefined
    }

    const timer = setTimeout(() => {
      setAnimationActive(true)
      if (debug) {
        console.log('[PowerFlowAnimation] Animation started')
      }
    }, animationDelay)

    return () => clearTimeout(timer)
  }, [isVisible, isDependenciesResolved, particles.length, animationDelay, debug])

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    if (!animationActive || !svgRef.current) return

    const deltaTime = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp

    setParticles(prevParticles => {
      return prevParticles.map(particle => {
        const line = activeLines.find(l => l.id === particle.lineId)
        if (!line) return particle

        // Update particle progress
        let newProgress = particle.progress + (particle.speed * deltaTime * 0.001)
        
        // Handle flow direction
        if (flowDirection === 'reverse') {
          newProgress = particle.progress - (particle.speed * deltaTime * 0.001)
        }
        
        // Wrap around
        if (newProgress > 1) newProgress = 0
        if (newProgress < 0) newProgress = 1

        // Calculate position along path
        const pathPoints = parsePathToPoints(line.path)
        const pointIndex = Math.floor(newProgress * (pathPoints.length - 1))
        const point = pathPoints[pointIndex] || pathPoints[0]

        // Transform coordinates
        const scale = coordinateSystem.scale
        const offset = coordinateSystem.offset
        
        return {
          ...particle,
          progress: newProgress,
          x: point.x * scale + (offset.x || 0),
          y: point.y * scale + (offset.y || 0),
          // Fade near ends for smooth appearance
          opacity: Math.sin(newProgress * Math.PI) * (0.7 + Math.random() * 0.3)
        }
      })
    })

    animationFrameRef.current = requestAnimationFrame(animate)
  }, [animationActive, activeLines, flowDirection, parsePathToPoints, coordinateSystem])

  // Start/stop animation
  useEffect(() => {
    if (animationActive) {
      lastTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(animate)
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [animationActive, animate])

  // Handle visibility changes
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Get power level for a line
  const getPowerLevel = useCallback((line: LineData): number => {
    // Simulate power levels based on line status
    switch (line.status) {
      case 'active':
        return 0.7 + Math.random() * 0.3 // 70-100%
      case 'standby':
        return 0.1 + Math.random() * 0.2 // 10-30%
      default:
        return 0
    }
  }, [])

  // Get capacity utilization color
  const getCapacityColor = useCallback((level: number): string => {
    if (level > 0.9) return particleColors.overload
    if (level > 0.7) return '#fd7e14' // Orange
    if (level > 0.5) return particleColors.active
    return particleColors.standby
  }, [particleColors])

  // Don't render if not visible or dependencies not resolved
  if (!isVisible || !isDependenciesResolved || !animationActive) {
    return null
  }

  // Calculate CSS classes
  const containerClasses = [
    'rdx-power-flow-animation',
    `rdx-power-flow-animation--${performanceMode}`,
    useGPUAcceleration ? 'rdx-power-flow-animation--gpu' : '',
    hasErrors ? 'rdx-power-flow-animation--error' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <RedundancyErrorBoundary featureId="power-flow-animation">
      <div
        className={containerClasses}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 120,
          ...style
        }}
        data-testid="power-flow-animation"
        data-active={animationActive}
        data-performance={performanceMode}
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${coordinateSystem.mapWidth} ${coordinateSystem.mapHeight}`}
          className="rdx-power-flow-animation__svg"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible'
          }}
        >
          {/* Gradient definitions */}
          <defs>
            <radialGradient id="particle-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
              <stop offset="70%" stopColor="currentColor" stopOpacity="0.6" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
            
            <filter id="particle-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Flow particles */}
          {particles.map(particle => (
            <circle
              key={particle.id}
              cx={particle.x}
              cy={particle.y}
              r={particle.size}
              fill={particle.color}
              opacity={particle.opacity}
              filter="url(#particle-glow)"
              style={{
                transform: useGPUAcceleration ? 'translateZ(0)' : 'none'
              }}
              data-testid={`particle-${particle.id}`}
            />
          ))}

          {/* Capacity flow indicators */}
          {showCapacityFlow && activeLines.map(line => {
            const powerLevel = getPowerLevel(line)
            const pathPoints = parsePathToPoints(line.path, 10)
            const midPoint = pathPoints[Math.floor(pathPoints.length / 2)]
            
            if (!midPoint) return null

            return (
              <g key={`capacity-${line.id}`} className="rdx-power-flow-animation__capacity">
                <rect
                  x={midPoint.x - 25}
                  y={midPoint.y - 8}
                  width="50"
                  height="16"
                  fill="rgba(0,0,0,0.8)"
                  stroke={getCapacityColor(powerLevel)}
                  strokeWidth="1"
                  rx="4"
                />
                <rect
                  x={midPoint.x - 23}
                  y={midPoint.y - 6}
                  width={46 * powerLevel}
                  height="12"
                  fill={getCapacityColor(powerLevel)}
                  rx="2"
                  opacity="0.7"
                />
                {showPowerLevels && (
                  <text
                    x={midPoint.x}
                    y={midPoint.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="8"
                    fontWeight="500"
                  >
                    {Math.round(powerLevel * 100)}%
                  </text>
                )}
              </g>
            )
          })}

          {/* Flow direction indicators */}
          {activeLines.map(line => {
            const pathPoints = parsePathToPoints(line.path, 20)
            const arrowPoints = pathPoints.filter((_, index) => index % 4 === 0)
            
            return arrowPoints.map((point, index) => (
              <polygon
                key={`arrow-${line.id}-${index}`}
                points="0,-3 6,0 0,3"
                fill={line.color}
                opacity="0.5"
                transform={`translate(${point.x}, ${point.y}) rotate(${
                  flowDirection === 'reverse' ? 180 : 0
                })`}
                style={{
                  animation: `flow-pulse 1s ease-in-out infinite`,
                  animationDelay: `${index * 0.1}s`
                }}
              />
            ))
          })}
        </svg>

        {/* Debug overlay */}
        {debug && (
          <div className="rdx-power-flow-animation__debug">
            <div>Active: {animationActive ? 'Yes' : 'No'}</div>
            <div>Particles: {particles.length}</div>
            <div>Lines: {activeLines.length}</div>
            <div>Performance: {performanceMode}</div>
            <div>GPU: {useGPUAcceleration ? 'On' : 'Off'}</div>
            <div>FPS: {Math.round(1000 / Math.max(1, performance.now() - lastTimeRef.current))}</div>
          </div>
        )}
      </div>
    </RedundancyErrorBoundary>
  )
}

/**
 * HOC for adding power flow animation to components
 */
export function withPowerFlowAnimation<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  animationProps?: Partial<PowerFlowAnimationProps>
) {
  const WithPowerFlowAnimation = (props: P) => (
    <>
      <WrappedComponent {...props} />
      <PowerFlowAnimation {...animationProps} />
    </>
  )

  WithPowerFlowAnimation.displayName = 
    `withPowerFlowAnimation(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`

  return WithPowerFlowAnimation
}

// Export types
export type { LineData, CoordinateSystem, Position }