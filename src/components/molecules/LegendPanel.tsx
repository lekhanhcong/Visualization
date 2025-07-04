'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, ChevronUp, Zap, Server, Factory } from 'lucide-react'

interface LegendPanelProps {
  position: { x: number; y: number }
  width: number
  className?: string
  collapsed?: boolean
}

interface LegendItem {
  id: string
  label: string
  color: string
  description: string
  icon?: React.ComponentType<{
    size?: number
    className?: string
    style?: React.CSSProperties
  }>
  voltage?: string
}

const legendItems: LegendItem[] = [
  {
    id: 'datacenter',
    label: 'Data Center',
    color: 'var(--color-datacenter)',
    description: '300MW AI Data Center',
    icon: Server,
  },
  {
    id: 'substation-500kv',
    label: '500kV Substation',
    color: 'var(--color-500kv)',
    description: '500/220kV Transformation',
    icon: Zap,
    voltage: '500kV',
  },
  {
    id: 'substation-220kv',
    label: '220kV Lines',
    color: 'var(--color-220kv)',
    description: '220kV Transmission',
    voltage: '220kV',
  },
  {
    id: 'substation-110kv',
    label: '110kV Lines',
    color: 'var(--color-110kv)',
    description: '110kV Distribution',
    voltage: '110kV',
  },
  {
    id: 'powerplant',
    label: 'Power Plant',
    color: 'var(--color-accent)',
    description: 'Tả Trạch Hydro (21MW)',
    icon: Factory,
  },
]

export function LegendPanel({
  position,
  width,
  className = '',
  collapsed: initialCollapsed = false,
}: LegendPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed)
  const [isHovered, setIsHovered] = useState(false)

  // Toggle collapse state
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Animation variants
  const panelVariants = {
    expanded: {
      height: 'auto',
      opacity: 1,
      transition: {
        height: { duration: 0.3, ease: 'easeInOut' as const },
        opacity: { duration: 0.2, delay: 0.1 },
      },
    },
    collapsed: {
      height: 48,
      opacity: 0.8,
      transition: {
        height: { duration: 0.3, ease: 'easeInOut' as const },
        opacity: { duration: 0.2 },
      },
    },
  }

  const contentVariants = {
    expanded: {
      opacity: 1,
      y: 0,
      transition: {
        opacity: { duration: 0.2, delay: 0.2 },
        y: { duration: 0.3, delay: 0.1 },
      },
    },
    collapsed: {
      opacity: 0,
      y: -10,
      transition: {
        opacity: { duration: 0.1 },
        y: { duration: 0.2 },
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    }),
  }

  return (
    <motion.div
      className={`bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden ${className}`}
      style={{
        left: position.x,
        bottom: position.y,
        minWidth: width,
        maxWidth: width * 1.5,
      }}
      variants={panelVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
        onClick={toggleCollapse}
      >
        <div className="flex items-center gap-2">
          <Info size={16} className="text-gray-600 dark:text-slate-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Infrastructure Legend
          </span>
        </div>
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronUp size={16} className="text-gray-500 dark:text-slate-400" />
        </motion.div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            className="px-3 pb-3"
            variants={contentVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
          >
            {/* Legend Items */}
            <div className="space-y-2">
              {legendItems.map((item, index) => {
                const Icon = item.icon

                return (
                  <motion.div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                  >
                    {/* Color indicator */}
                    <div className="flex items-center gap-2">
                      {Icon ? (
                        <div
                          className="p-1.5 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: `${item.color}20`,
                            border: `2px solid ${item.color}`,
                          }}
                        >
                          <Icon
                            size={12}
                            className="text-current"
                            style={{ color: item.color }}
                          />
                        </div>
                      ) : (
                        <div
                          className="w-4 h-1 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      )}

                      {/* Voltage indicator for power lines */}
                      {item.voltage && (
                        <div
                          className="px-1.5 py-0.5 text-xs font-bold rounded"
                          style={{
                            color: item.color,
                            backgroundColor: `${item.color}15`,
                          }}
                        >
                          {item.voltage}
                        </div>
                      )}
                    </div>

                    {/* Label and description */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700 dark:text-slate-300 truncate">
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-slate-400 truncate">
                        {item.description}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Divider */}
            <div className="my-3 border-t border-gray-200 dark:border-slate-700" />

            {/* Footer info */}
            <div className="text-xs text-gray-500 dark:text-slate-400 text-center">
              <div className="mb-1">Hue Hi Tech Park</div>
              <div>300MW AI Data Center Visualization</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover indicator */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  )
}
