'use client'

import React from 'react'
import { motion, MotionStyle } from 'framer-motion'
import { ImageHotspot } from '@/types'

interface InfoTooltipProps {
  id: string
  hotspot: ImageHotspot
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
  style?: React.CSSProperties
}

export function InfoTooltip({
  id,
  hotspot,
  position = 'top',
  className = '',
  style,
}: InfoTooltipProps) {
  // Get tooltip arrow position
  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800 dark:border-t-slate-200'
      case 'bottom':
        return 'absolute bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-800 dark:border-b-slate-200'
      case 'left':
        return 'absolute left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-slate-800 dark:border-l-slate-200'
      case 'right':
        return 'absolute right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-slate-800 dark:border-r-slate-200'
      default:
        return 'absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800 dark:border-t-slate-200'
    }
  }

  // Get tooltip container positioning
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'mb-2'
      case 'bottom':
        return 'mt-2'
      case 'left':
        return 'mr-2'
      case 'right':
        return 'ml-2'
      default:
        return 'mb-2'
    }
  }

  // Get hotspot type display name
  const getTypeDisplayName = (type: ImageHotspot['type']) => {
    switch (type) {
      case 'datacenter':
        return 'Data Center'
      case 'substation':
        return 'Substation'
      case 'powerplant':
        return 'Power Plant'
      default:
        return 'Infrastructure'
    }
  }

  // Get metadata display
  const getMetadataDisplay = () => {
    const metadata = hotspot.metadata
    if (!metadata) return null

    return (
      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 space-y-1">
        {metadata.voltage && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Voltage:</span>
            <span className="text-blue-600 dark:text-blue-400">
              {metadata.voltage}
            </span>
          </div>
        )}
        {metadata.capacity && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Capacity:</span>
            <span className="text-green-600 dark:text-green-400">
              {metadata.capacity}
            </span>
          </div>
        )}
        {metadata.status && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Status:</span>
            <span
              className={`px-1 py-0.5 text-xs rounded ${
                metadata.status === 'operational'
                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                  : metadata.status === 'maintenance'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
              }`}
            >
              {metadata.status}
            </span>
          </div>
        )}
        {metadata.coordinates && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Coordinates:</span>
            <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">
              {metadata.coordinates}
            </span>
          </div>
        )}
      </div>
    )
  }

  // Animation variants
  const tooltipVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
      y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0,
      x: position === 'left' ? 10 : position === 'right' ? -10 : 0,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      transition: {
        type: 'spring' as const,
        damping: 20,
        stiffness: 400,
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0,
      x: position === 'left' ? 10 : position === 'right' ? -10 : 0,
      transition: {
        duration: 0.15,
        ease: 'easeInOut' as const,
      },
    },
  }

  return (
    <motion.div
      id={id}
      className={`relative ${getPositionClasses()} ${className}`}
      style={(style || {}) as MotionStyle}
      variants={tooltipVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="tooltip"
    >
      {/* Tooltip content */}
      <div className="bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 px-3 py-2 rounded-lg shadow-lg max-w-xs">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="text-sm font-semibold truncate">{hotspot.name}</div>
          <div className="text-xs bg-slate-700 dark:bg-slate-300 px-2 py-0.5 rounded-full text-slate-300 dark:text-slate-700 flex-shrink-0">
            {getTypeDisplayName(hotspot.type)}
          </div>
        </div>

        {/* Description */}
        {hotspot.description && (
          <div className="text-xs text-slate-300 dark:text-slate-600 mb-2">
            {hotspot.description}
          </div>
        )}

        {/* Metadata */}
        {getMetadataDisplay()}

        {/* Click hint */}
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-2 pt-2 border-t border-slate-700 dark:border-slate-400">
          Click for more details
        </div>
      </div>

      {/* Arrow */}
      <div className={getArrowClasses()} />
    </motion.div>
  )
}
