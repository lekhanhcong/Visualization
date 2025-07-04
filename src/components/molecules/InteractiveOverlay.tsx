'use client'

import React, { useRef, useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface InteractiveOverlayProps {
  onZoom: (delta: number, center: { x: number; y: number }) => void
  onPan: (delta: { x: number; y: number }) => void
  onReset: () => void
  zoomLevel: number
  panOffset: { x: number; y: number }
  className?: string
  disabled?: boolean
}

export function InteractiveOverlay({
  onZoom,
  onPan,
  onReset,
  zoomLevel,
  panOffset,
  className = '',
  disabled = false,
}: InteractiveOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [lastPanOffset, setLastPanOffset] = useState({ x: 0, y: 0 })

  // Handle mouse wheel zoom
  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      if (disabled) return

      event.preventDefault()

      const rect = overlayRef.current?.getBoundingClientRect()
      if (!rect) return

      const centerX = event.clientX - rect.left - rect.width / 2
      const centerY = event.clientY - rect.top - rect.height / 2

      const delta = -event.deltaY * 0.001
      onZoom(delta, { x: centerX, y: centerY })
    },
    [disabled, onZoom]
  )

  // Handle mouse down (start drag)
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (disabled) return

      event.preventDefault()
      setIsDragging(true)
      setDragStart({ x: event.clientX, y: event.clientY })
      setLastPanOffset(panOffset)
    },
    [disabled, panOffset]
  )

  // Handle mouse move (drag)
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging || disabled) return

      event.preventDefault()

      const deltaX = event.clientX - dragStart.x
      const deltaY = event.clientY - dragStart.y

      onPan({
        x: lastPanOffset.x + deltaX / zoomLevel,
        y: lastPanOffset.y + deltaY / zoomLevel,
      })
    },
    [isDragging, disabled, dragStart, lastPanOffset, zoomLevel, onPan]
  )

  // Handle mouse up (end drag)
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle touch start
  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (disabled) return

      event.preventDefault()

      if (event.touches.length === 1) {
        // Single touch - pan
        const touch = event.touches[0]
        if (touch) {
          setIsDragging(true)
          setDragStart({ x: touch.clientX, y: touch.clientY })
          setLastPanOffset(panOffset)
        }
      }
    },
    [disabled, panOffset]
  )

  // Handle touch move
  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (disabled) return

      event.preventDefault()

      if (event.touches.length === 1 && isDragging) {
        // Single touch - pan
        const touch = event.touches[0]
        if (touch) {
          const deltaX = touch.clientX - dragStart.x
          const deltaY = touch.clientY - dragStart.y

          onPan({
            x: lastPanOffset.x + deltaX / zoomLevel,
            y: lastPanOffset.y + deltaY / zoomLevel,
          })
        }
      }
    },
    [disabled, isDragging, dragStart, lastPanOffset, zoomLevel, onPan]
  )

  // Handle touch end
  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (disabled) return

      event.preventDefault()
      setIsDragging(false)
    },
    [disabled]
  )

  // Handle double click/tap to reset
  const handleDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      if (disabled) return

      event.preventDefault()
      onReset()
    },
    [disabled, onReset]
  )

  // Set up global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'grabbing'
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'unset'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'unset'
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Prevent context menu
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled) return

      // Only handle shortcuts when overlay is focused or no input is focused
      const activeElement = document.activeElement
      if (
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA'
      ) {
        return
      }

      switch (event.key) {
        case '+':
        case '=':
          event.preventDefault()
          onZoom(0.2, { x: 0, y: 0 })
          break
        case '-':
          event.preventDefault()
          onZoom(-0.2, { x: 0, y: 0 })
          break
        case '0':
          event.preventDefault()
          onReset()
          break
        case 'ArrowUp':
          event.preventDefault()
          onPan({ x: panOffset.x, y: panOffset.y - 50 })
          break
        case 'ArrowDown':
          event.preventDefault()
          onPan({ x: panOffset.x, y: panOffset.y + 50 })
          break
        case 'ArrowLeft':
          event.preventDefault()
          onPan({ x: panOffset.x - 50, y: panOffset.y })
          break
        case 'ArrowRight':
          event.preventDefault()
          onPan({ x: panOffset.x + 50, y: panOffset.y })
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [disabled, onZoom, onPan, onReset, panOffset])

  const cursorStyle = disabled
    ? 'cursor-not-allowed'
    : isDragging
      ? 'cursor-grabbing'
      : 'cursor-grab'

  return (
    <motion.div
      ref={overlayRef}
      className={`absolute inset-0 z-10 ${cursorStyle} ${className}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
      role="region"
      aria-label="Interactive map overlay"
      tabIndex={disabled ? -1 : 0}
      style={{
        touchAction: 'none',
      }}
    >
      {/* Interaction hints */}
      {!disabled && (
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
          <div className="space-y-1">
            <div>🖱️ Drag to pan</div>
            <div>⚡ Scroll to zoom</div>
            <div>🔄 Double-click to reset</div>
          </div>
        </div>
      )}

      {/* Drag indicator */}
      {isDragging && (
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-full p-2 shadow-lg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          <div className="w-4 h-4 bg-white rounded-full" />
        </motion.div>
      )}

      {/* Zoom level indicator */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
        Zoom: {Math.round(zoomLevel * 100)}%
      </div>

      {/* Pan offset indicator (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-2 rounded-lg text-xs backdrop-blur-sm font-mono">
          Pan: {Math.round(panOffset.x)}, {Math.round(panOffset.y)}
        </div>
      )}
    </motion.div>
  )
}
