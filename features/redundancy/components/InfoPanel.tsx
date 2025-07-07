/**
 * InfoPanel Component
 * Displays 2N+1 redundancy statistics and system information
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRedundancy } from '../providers/RedundancyProvider'
import { redundancyEventBus } from '../events'
import { RedundancyErrorBoundary } from '../errors/ErrorBoundary'
import type { RedundancyStats, SubstationData, LineData } from '../types'

// Component props interface
export interface InfoPanelProps {
  /** Panel position */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** Custom CSS class name */
  className?: string
  /** Custom inline styles */
  style?: React.CSSProperties
  /** Panel visibility */
  isVisible?: boolean
  /** Close handler */
  onClose?: () => void
  /** Minimize handler */
  onMinimize?: () => void
  /** Expand handler */
  onExpand?: () => void
  /** Stats data override */
  stats?: Partial<RedundancyStats>
  /** Show/hide close button */
  showCloseButton?: boolean
  /** Show/hide minimize button */
  showMinimizeButton?: boolean
  /** Enable dragging */
  draggable?: boolean
  /** Enable resizing */
  resizable?: boolean
  /** Update interval in milliseconds */
  updateInterval?: number
  /** Compact mode */
  compact?: boolean
  /** Debug mode */
  debug?: boolean
}

// Default position styles
const positionStyles: Record<NonNullable<InfoPanelProps['position']>, React.CSSProperties> = {
  'top-left': { top: 20, left: 20 },
  'top-right': { top: 20, right: 20 },
  'bottom-left': { bottom: 20, left: 20 },
  'bottom-right': { bottom: 20, right: 20 }
}

// Default stats
const defaultStats: RedundancyStats = {
  dataCenterNeeds: '50MW',
  activeNow: {
    sources: ['Substation A', 'Substation B'],
    capacity: '100MW'
  },
  standbyReady: {
    sources: ['Substation C'],
    capacity: '50MW'
  },
  totalCapacity: '150MW',
  redundancyRatio: '3:1'
}

/**
 * InfoPanel Component
 * Displays system statistics and status information
 */
export function InfoPanel({
  position = 'top-right',
  className = '',
  style,
  isVisible = true,
  onClose,
  onMinimize,
  onExpand,
  stats: customStats,
  showCloseButton = true,
  showMinimizeButton = true,
  draggable = false,
  resizable = false,
  updateInterval = 5000,
  compact = false,
  debug = false
}: InfoPanelProps) {
  const {
    state,
    actions,
    isDependenciesResolved,
    hasErrors,
    errorStats
  } = useRedundancy()

  const [isMinimized, setIsMinimized] = useState(false)
  const [currentStats, setCurrentStats] = useState<RedundancyStats>(defaultStats)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 })

  const panelRef = useRef<HTMLDivElement>(null)
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate live stats based on current state
  const calculateLiveStats = useCallback((): RedundancyStats => {
    // This would integrate with actual substation data in a real implementation
    const baseStats = customStats ? { ...defaultStats, ...customStats } : defaultStats

    // Add dynamic calculations based on selected elements
    if (state?.selectedSubstation || state?.selectedLine) {
      // Modify stats based on selection
      return {
        ...baseStats,
        dataCenterNeeds: state.selectedSubstation ? '75MW' : baseStats.dataCenterNeeds,
        redundancyRatio: state.selectedLine ? '2.5:1' : baseStats.redundancyRatio
      }
    }

    return baseStats
  }, [customStats, state])

  // Update stats periodically
  useEffect(() => {
    if (!isDependenciesResolved || !isVisible) return undefined

    const updateStats = () => {
      const newStats = calculateLiveStats()
      setCurrentStats(newStats)
      setLastUpdated(new Date())

      if (debug) {
        console.log('[InfoPanel] Stats updated:', newStats)
      }
    }

    // Initial update
    updateStats()

    // Set up periodic updates
    if (updateInterval > 0) {
      updateTimerRef.current = setInterval(updateStats, updateInterval)
    }

    return () => {
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current)
      }
    }
  }, [isDependenciesResolved, isVisible, updateInterval, calculateLiveStats, debug])

  // Handle minimize/expand
  const handleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized)
    
    if (onMinimize && !isMinimized) {
      onMinimize()
    }
    if (onExpand && isMinimized) {
      onExpand()
    }

    redundancyEventBus.emit('redundancy:info-panel:toggled', {
      minimized: !isMinimized,
      timestamp: Date.now()
    })

    if (debug) {
      console.log('[InfoPanel] Toggled:', !isMinimized ? 'minimized' : 'expanded')
    }
  }, [isMinimized, onMinimize, onExpand, debug])

  // Handle close
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose()
    }

    redundancyEventBus.emit('redundancy:info-panel:closed', {
      timestamp: Date.now()
    })

    if (debug) {
      console.log('[InfoPanel] Closed')
    }
  }, [onClose, debug])

  // Handle drag start
  const handleDragStart = useCallback((event: React.MouseEvent) => {
    if (!draggable) return

    setIsDragging(true)
    const rect = panelRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      })
    }

    event.preventDefault()
  }, [draggable])

  // Handle drag
  useEffect(() => {
    if (!isDragging || !draggable) return undefined

    const handleMouseMove = (event: MouseEvent) => {
      setPanelPosition({
        x: event.clientX - dragOffset.x,
        y: event.clientY - dragOffset.y
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, draggable])

  // Don't render if not visible or dependencies not resolved
  if (!isVisible || !isDependenciesResolved) {
    return null
  }

  // Calculate capacity utilization
  const utilizationPercentage = Math.round(
    (parseInt(currentStats.dataCenterNeeds.replace('MW', '')) / 
     parseInt(currentStats.totalCapacity.replace('MW', ''))) * 100
  )

  // Determine status color
  const getStatusColor = () => {
    if (hasErrors && errorStats.isIsolated) return '#dc3545' // Red
    if (utilizationPercentage > 80) return '#ffc107' // Warning
    if (utilizationPercentage > 60) return '#fd7e14' // Orange
    return '#28a745' // Green
  }

  // Compute CSS classes
  const panelClasses = [
    'rdx-info-panel',
    isMinimized ? 'rdx-info-panel--minimized' : 'rdx-info-panel--expanded',
    compact ? 'rdx-info-panel--compact' : '',
    isDragging ? 'rdx-info-panel--dragging' : '',
    hasErrors ? 'rdx-info-panel--error' : '',
    className
  ].filter(Boolean).join(' ')

  // Compute panel styles
  const panelStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 1002,
    ...positionStyles[position],
    ...(isDragging ? { 
      left: panelPosition.x, 
      top: panelPosition.y,
      ...positionStyles[position] 
    } : {}),
    ...style
  }

  return (
    <RedundancyErrorBoundary featureId="info-panel">
      <div
        ref={panelRef}
        className={panelClasses}
        style={panelStyles}
        data-testid="info-panel"
        data-minimized={isMinimized}
        data-position={position}
        data-compact={compact}
      >
        {/* Panel Header */}
        <div 
          className="rdx-info-panel__header"
          onMouseDown={handleDragStart}
          style={{ cursor: draggable ? 'move' : 'default' }}
        >
          <div className="rdx-info-panel__title">
            <span className="rdx-info-panel__icon">⚡</span>
            <span className="rdx-info-panel__title-text">
              {compact ? '2N+1' : '2N+1 Redundancy'}
            </span>
            <div 
              className="rdx-info-panel__status-indicator"
              style={{ backgroundColor: getStatusColor() }}
              title={`System Status: ${hasErrors ? 'Error' : 'Normal'}`}
            />
          </div>

          <div className="rdx-info-panel__controls">
            {showMinimizeButton && (
              <button
                className="rdx-info-panel__control-btn"
                onClick={handleMinimize}
                title={isMinimized ? 'Expand panel' : 'Minimize panel'}
                data-testid="minimize-button"
              >
                {isMinimized ? '□' : '−'}
              </button>
            )}
            
            {showCloseButton && (
              <button
                className="rdx-info-panel__control-btn"
                onClick={handleClose}
                title="Close panel"
                data-testid="close-button"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Panel Content */}
        {!isMinimized && (
          <div className="rdx-info-panel__content">
            {/* Quick Stats */}
            <div className="rdx-info-panel__quick-stats">
              <div className="rdx-info-panel__stat">
                <div className="rdx-info-panel__stat-label">Need</div>
                <div className="rdx-info-panel__stat-value">{currentStats.dataCenterNeeds}</div>
              </div>
              <div className="rdx-info-panel__stat">
                <div className="rdx-info-panel__stat-label">Total</div>
                <div className="rdx-info-panel__stat-value">{currentStats.totalCapacity}</div>
              </div>
              <div className="rdx-info-panel__stat">
                <div className="rdx-info-panel__stat-label">Ratio</div>
                <div className="rdx-info-panel__stat-value">{currentStats.redundancyRatio}</div>
              </div>
            </div>

            {/* Utilization Bar */}
            <div className="rdx-info-panel__utilization">
              <div className="rdx-info-panel__utilization-label">
                Utilization: {utilizationPercentage}%
              </div>
              <div className="rdx-info-panel__utilization-bar">
                <div 
                  className="rdx-info-panel__utilization-fill"
                  style={{ 
                    width: `${Math.min(utilizationPercentage, 100)}%`,
                    backgroundColor: getStatusColor()
                  }}
                />
              </div>
            </div>

            {/* Active Sources */}
            <div className="rdx-info-panel__section">
              <div className="rdx-info-panel__section-title">
                Active Sources ({currentStats.activeNow.capacity})
              </div>
              <div className="rdx-info-panel__sources">
                {currentStats.activeNow.sources.map((source, index) => (
                  <div 
                    key={index} 
                    className="rdx-info-panel__source rdx-info-panel__source--active"
                  >
                    <span className="rdx-info-panel__source-indicator">●</span>
                    {source}
                  </div>
                ))}
              </div>
            </div>

            {/* Standby Sources */}
            <div className="rdx-info-panel__section">
              <div className="rdx-info-panel__section-title">
                Standby Ready ({currentStats.standbyReady.capacity})
              </div>
              <div className="rdx-info-panel__sources">
                {currentStats.standbyReady.sources.map((source, index) => (
                  <div 
                    key={index} 
                    className="rdx-info-panel__source rdx-info-panel__source--standby"
                  >
                    <span className="rdx-info-panel__source-indicator">◐</span>
                    {source}
                  </div>
                ))}
              </div>
            </div>

            {/* Selection Info */}
            {(state?.selectedSubstation || state?.selectedLine) && (
              <div className="rdx-info-panel__selection">
                <div className="rdx-info-panel__section-title">Selected</div>
                {state.selectedSubstation && (
                  <div className="rdx-info-panel__selected-item">
                    <strong>Substation:</strong> {state.selectedSubstation.name}
                  </div>
                )}
                {state.selectedLine && (
                  <div className="rdx-info-panel__selected-item">
                    <strong>Line:</strong> {state.selectedLine.from} → {state.selectedLine.to}
                  </div>
                )}
              </div>
            )}

            {/* Error Info */}
            {hasErrors && (
              <div className="rdx-info-panel__errors">
                <div className="rdx-info-panel__section-title rdx-info-panel__section-title--error">
                  System Status
                </div>
                <div className="rdx-info-panel__error-stats">
                  <div>Errors: {errorStats.totalErrors}</div>
                  <div>Recent: {errorStats.recentErrors}</div>
                  {errorStats.isIsolated && (
                    <div className="rdx-info-panel__isolation-warning">
                      ⚠ System Isolated
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div className="rdx-info-panel__footer">
              <div className="rdx-info-panel__last-updated">
                Updated: {lastUpdated.toLocaleTimeString()}
              </div>
              {debug && (
                <div className="rdx-info-panel__debug">
                  DEBUG MODE
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </RedundancyErrorBoundary>
  )
}

/**
 * HOC for adding info panel to components
 */
export function withInfoPanel<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  panelProps?: Partial<InfoPanelProps>
) {
  const WithInfoPanel = (props: P) => (
    <>
      <WrappedComponent {...props} />
      <InfoPanel {...panelProps} />
    </>
  )

  WithInfoPanel.displayName = 
    `withInfoPanel(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`

  return WithInfoPanel
}

// Export types
export type { RedundancyStats }