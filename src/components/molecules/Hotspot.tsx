'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ImageHotspot } from '@/types'
import { HotspotMarker } from '@/components/atoms/HotspotMarker'
import { InfoTooltip } from '@/components/atoms/InfoTooltip'

interface HotspotProps {
  hotspot: ImageHotspot
  position: {
    left: string
    top: string
  }
  onClick: (hotspot: ImageHotspot) => void
  className?: string
  disabled?: boolean
  showTooltip?: boolean
}

export function Hotspot({
  hotspot,
  position,
  onClick,
  className = '',
  disabled = false,
  showTooltip = true,
}: HotspotProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showTooltipState, setShowTooltipState] = useState(false)

  // Handle mouse enter
  const handleMouseEnter = useCallback(() => {
    if (!disabled) {
      setIsHovered(true)
      if (showTooltip) {
        setShowTooltipState(true)
      }
    }
  }, [disabled, showTooltip])

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setShowTooltipState(false)
  }, [])

  // Handle click
  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick(hotspot)
    }
  }, [disabled, onClick, hotspot])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        onClick(hotspot)
      }
    },
    [disabled, onClick, hotspot]
  )

  // Get hotspot color based on type
  const getHotspotColor = (type: ImageHotspot['type']) => {
    switch (type) {
      case 'datacenter':
        return 'var(--color-datacenter)'
      case 'substation':
        return hotspot.metadata?.voltage === '500kV'
          ? 'var(--color-500kv)'
          : hotspot.metadata?.voltage === '220kV'
            ? 'var(--color-220kv)'
            : 'var(--color-110kv)'
      case 'powerplant':
        return 'var(--color-accent)'
      default:
        return 'var(--color-accent)'
    }
  }

  // Animation variants
  const containerVariants = {
    initial: {
      scale: 0,
      opacity: 0,
      rotate: -180,
    },
    animate: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: 'spring' as const,
        damping: 15,
        stiffness: 300,
        duration: 0.6,
      },
    },
    hover: {
      scale: 1.2,
      transition: {
        type: 'spring' as const,
        damping: 10,
        stiffness: 400,
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        type: 'spring' as const,
        damping: 20,
        stiffness: 600,
        duration: 0.1,
      },
    },
  }

  const pulseVariants = {
    initial: { scale: 1, opacity: 0.8 },
    animate: {
      scale: [1, 1.3, 1],
      opacity: [0.8, 0.3, 0.8],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  }

  return (
    <div
      className={`relative ${className}`}
      style={{
        left: position.left,
        top: position.top,
      }}
    >
      {/* Hotspot container */}
      <motion.div
        className="relative cursor-pointer"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        whileHover={!disabled ? 'hover' : {}}
        whileTap={!disabled ? 'tap' : {}}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={`View details for ${hotspot.name}`}
        aria-describedby={`tooltip-${hotspot.id}`}
      >
        {/* Pulse effect background */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            backgroundColor: getHotspotColor(hotspot.type),
            filter: 'blur(2px)',
          }}
          variants={pulseVariants}
          initial="initial"
          animate="animate"
        />

        {/* Main hotspot marker */}
        <HotspotMarker
          type={hotspot.type}
          {...(hotspot.metadata?.voltage && {
            voltage: hotspot.metadata.voltage,
          })}
          {...(hotspot.metadata?.capacity && {
            capacity: hotspot.metadata.capacity,
          })}
          isActive={isHovered}
          isDisabled={disabled}
          size={24}
          className="relative z-10"
        />

        {/* Ripple effect on hover */}
        <AnimatePresence>
          {isHovered && !disabled && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                backgroundColor: getHotspotColor(hotspot.type),
                opacity: 0.3,
              }}
              initial={{ scale: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ scale: 1, opacity: 0.3 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltipState && showTooltip && !disabled && (
          <InfoTooltip
            id={`tooltip-${hotspot.id}`}
            hotspot={hotspot}
            position="top"
            className="absolute z-20"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: '100%',
              marginBottom: '8px',
            }}
          />
        )}
      </AnimatePresence>

      {/* Focus indicator */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none border-2 border-blue-500"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 0,
          scale: 1.2,
          transition: { duration: 0.2 },
        }}
        whileFocus={{ opacity: 1, scale: 1 }}
      />
    </div>
  )
}
