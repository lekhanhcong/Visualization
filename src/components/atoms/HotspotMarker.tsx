'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Building2, Zap, Factory, Server } from 'lucide-react'
import { ImageHotspot } from '@/types'

interface HotspotMarkerProps {
  type: ImageHotspot['type']
  voltage?: string
  capacity?: string
  isActive?: boolean
  isDisabled?: boolean
  size?: number
  className?: string
}

export function HotspotMarker({
  type,
  voltage,
  capacity,
  isActive = false,
  isDisabled = false,
  size = 24,
  className = '',
}: HotspotMarkerProps) {
  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'datacenter':
        return Server
      case 'substation':
        return Zap
      case 'powerplant':
        return Factory
      default:
        return Building2
    }
  }

  // Get color based on type and voltage
  const getColor = () => {
    if (isDisabled) return 'var(--color-muted-foreground)'

    switch (type) {
      case 'datacenter':
        return 'var(--color-datacenter)'
      case 'substation':
        if (voltage === '500kV') return 'var(--color-500kv)'
        if (voltage === '220kV') return 'var(--color-220kv)'
        return 'var(--color-110kv)'
      case 'powerplant':
        return 'var(--color-accent)'
      default:
        return 'var(--color-accent)'
    }
  }

  // Get background color (lighter version)
  const getBackgroundColor = () => {
    if (isDisabled) return 'var(--color-muted)'

    switch (type) {
      case 'datacenter':
        return isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'
      case 'substation':
        if (voltage === '500kV')
          return isActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'
        if (voltage === '220kV')
          return isActive
            ? 'rgba(59, 130, 246, 0.2)'
            : 'rgba(59, 130, 246, 0.1)'
        return isActive ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.1)'
      case 'powerplant':
        return isActive ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'
      default:
        return isActive ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'
    }
  }

  // Get border color (darker version)
  const getBorderColor = () => {
    if (isDisabled) return 'var(--color-border)'

    switch (type) {
      case 'datacenter':
        return isActive ? 'rgba(16, 185, 129, 0.6)' : 'rgba(16, 185, 129, 0.4)'
      case 'substation':
        if (voltage === '500kV')
          return isActive ? 'rgba(239, 68, 68, 0.6)' : 'rgba(239, 68, 68, 0.4)'
        if (voltage === '220kV')
          return isActive
            ? 'rgba(59, 130, 246, 0.6)'
            : 'rgba(59, 130, 246, 0.4)'
        return isActive ? 'rgba(236, 72, 153, 0.6)' : 'rgba(236, 72, 153, 0.4)'
      case 'powerplant':
        return isActive ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.4)'
      default:
        return isActive ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.4)'
    }
  }

  const Icon = getIcon()

  // Animation variants
  const markerVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        type: 'spring' as const,
        damping: 10,
        stiffness: 300,
      },
    },
    active: {
      scale: 1.2,
      rotate: 0,
      transition: {
        type: 'spring' as const,
        damping: 8,
        stiffness: 400,
      },
    },
  }

  const iconVariants = {
    initial: { scale: 1, opacity: 0.8 },
    hover: {
      scale: 1.1,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        damping: 15,
        stiffness: 400,
      },
    },
    active: {
      scale: 1.2,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        damping: 10,
        stiffness: 500,
      },
    },
  }

  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: getBackgroundColor(),
        borderColor: getBorderColor(),
        borderWidth: 2,
        borderStyle: 'solid',
        borderRadius: '50%',
        boxShadow: isActive
          ? `0 0 20px ${getColor()}40, 0 0 40px ${getColor()}20`
          : `0 2px 8px ${getColor()}20`,
      }}
      variants={markerVariants}
      initial="initial"
      animate={isActive ? 'active' : 'initial'}
      whileHover={!isDisabled ? 'hover' : {}}
    >
      {/* Icon */}
      <motion.div
        variants={iconVariants}
        initial="initial"
        animate={isActive ? 'active' : 'initial'}
        whileHover={!isDisabled ? 'hover' : {}}
      >
        <Icon
          size={size * 0.5}
          color={getColor()}
          strokeWidth={2.5}
          className={`${isDisabled ? 'opacity-50' : ''}`}
        />
      </motion.div>

      {/* Voltage/Capacity indicator */}
      {(voltage || capacity) && !isDisabled && (
        <motion.div
          className="absolute -top-1 -right-1 bg-white dark:bg-slate-800 rounded-full border shadow-sm"
          style={{
            fontSize: size * 0.25,
            padding: size * 0.05,
            minWidth: size * 0.3,
            minHeight: size * 0.3,
            borderColor: getBorderColor(),
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: isActive ? 1.2 : 1,
            opacity: 1,
            transition: { delay: 0.1 },
          }}
        >
          <div
            className="text-center font-bold"
            style={{
              color: getColor(),
              fontSize: size * 0.2,
              lineHeight: 1,
            }}
          >
            {voltage || capacity}
          </div>
        </motion.div>
      )}

      {/* Active indicator ring */}
      {isActive && !isDisabled && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 pointer-events-none"
          style={{
            borderColor: getColor(),
            borderStyle: 'dashed',
          }}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{
            scale: [1.5, 2, 1.5],
            opacity: [0, 0.8, 0],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        />
      )}
    </motion.div>
  )
}
