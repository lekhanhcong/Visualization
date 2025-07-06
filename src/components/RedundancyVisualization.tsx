/**
 * Modern 2N+1 Redundancy Visualization Component
 * Updated with React 19 patterns and latest best practices
 */

'use client'

import React, { useState, useEffect, useOptimistic } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface RedundancyVisualizationProps {
  isVisible: boolean
  onClose: () => void
  animationDuration?: number
  className?: string
}

interface StatData {
  dataCenterNeeds: string
  activeNow: {
    sources: string[]
    capacity: string
  }
  standbyReady: {
    sources: string[]
    capacity: string
  }
  totalCapacity: string
  redundancyRatio: string
}

const defaultStatData: StatData = {
  dataCenterNeeds: '300MW',
  activeNow: {
    sources: ['Quảng Trạch → Sub 01', 'Thanh Mỹ → Sub 01'],
    capacity: '500MW'
  },
  standbyReady: {
    sources: ['Quảng Trị → Sub 02', 'Đà Nẵng → Sub 02'],
    capacity: '600MW'
  },
  totalCapacity: '1200MW',
  redundancyRatio: '400%'
}

// Animation variants for Framer Motion
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
}

const contentVariants = {
  hidden: { scale: 0.8, opacity: 0, y: 20 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    scale: 0.8, 
    opacity: 0, 
    y: 20,
    transition: {
      duration: 0.15
    }
  }
}

const lineVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (index: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1, delay: index * 0.2 },
      opacity: { duration: 0.3, delay: index * 0.2 }
    }
  })
}

const markerVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (delay: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
      delay
    }
  })
}

export function RedundancyVisualization({ 
  isVisible, 
  onClose, 
  animationDuration = 4000,
  className = '' 
}: RedundancyVisualizationProps) {
  const [animationStep, setAnimationStep] = useState(0)
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [previouslyFocusedElement, setPreviouslyFocusedElement] = useState<HTMLElement | null>(null)
  
  // Use optimistic state for smooth interactions
  const [optimisticData, updateOptimisticData] = useOptimistic(
    defaultStatData,
    (state, newData: Partial<StatData>) => ({ ...state, ...newData })
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isVisible) {
      setAnimationStep(0)
      setShowInfoPanel(false)
      return
    }

    // Modern animation sequence with configurable timing
    const stepDuration = animationDuration / 4
    const timeouts = [
      setTimeout(() => setAnimationStep(1), stepDuration * 0.25),  // Lines appear
      setTimeout(() => setAnimationStep(2), stepDuration * 0.75), // Substations appear
      setTimeout(() => setAnimationStep(3), stepDuration * 1.25), // Connections appear
      setTimeout(() => setShowInfoPanel(true), stepDuration * 1.5) // Info panel appears
    ]

    return () => timeouts.forEach(clearTimeout)
  }, [isVisible, animationDuration])

  // Enhanced keyboard and accessibility handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return
      
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'Tab':
          // Allow tab navigation within modal
          const modal = document.querySelector('[role="dialog"][aria-modal="true"]')
          const focusableElements = modal?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0] as HTMLElement
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
            
            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault()
              lastElement.focus()
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault()
              firstElement.focus()
            }
          }
          break
      }
    }

    if (isVisible) {
      // Store currently focused element
      const activeElement = document.activeElement as HTMLElement
      setPreviouslyFocusedElement(activeElement)
      
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      
      // Focus the close button when modal opens
      setTimeout(() => {
        const closeButton = document.querySelector('[data-testid="close-redundancy-button"]') as HTMLElement
        if (closeButton) {
          closeButton.focus()
        }
      }, 100)
    } else {
      // Restore focus when modal closes
      if (previouslyFocusedElement) {
        setTimeout(() => {
          previouslyFocusedElement.focus()
        }, 100)
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isVisible, onClose])

  if (!mounted) return null

  const overlayContent = (
    <motion.div 
      className={`fixed inset-0 z-[9999] overflow-hidden ${className}`}
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="dialog"
      aria-modal="true"
      aria-labelledby="redundancy-title"
      aria-describedby="redundancy-description"
    >
      {/* Backdrop */}
      <motion.div 
        className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Close Button */}
      <motion.button
        onClick={onClose}
        className="absolute top-5 right-5 z-50 w-10 h-10 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full flex items-center justify-center text-xl transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        aria-label="Close redundancy visualization"
        data-testid="close-redundancy-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        ×
      </motion.button>

      {/* Transmission Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
        <defs>
          <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="glow-yellow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Line 1: Quảng Trạch to Sub 01 (Active) */}
        <AnimatePresence>
          {animationStep >= 1 && (
            <motion.g
              initial="hidden"
              animate="visible"
              exit="hidden"
              custom={0}
            >
              <motion.path
                d="M 200,150 Q 350,100 500,200"
                stroke="#ef4444"
                strokeWidth="4"
                fill="none"
                filter="url(#glow-red)"
                variants={lineVariants}
                custom={0}
              />
              <motion.text 
                x="350" 
                y="120" 
                fill="white" 
                fontSize="12" 
                fontWeight="bold" 
                textAnchor="middle"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Quảng Trạch → Sub 01
              </motion.text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Line 2: Thanh Mỹ to Sub 01 (Active) */}
        <AnimatePresence>
          {animationStep >= 1 && (
            <motion.g
              initial="hidden"
              animate="visible"
              exit="hidden"
              custom={1}
            >
              <motion.path
                d="M 150,300 Q 300,250 500,200"
                stroke="#ef4444"
                strokeWidth="4"
                fill="none"
                filter="url(#glow-red)"
                variants={lineVariants}
                custom={1}
              />
              <motion.text 
                x="300" 
                y="280" 
                fill="white" 
                fontSize="12" 
                fontWeight="bold" 
                textAnchor="middle"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Thanh Mỹ → Sub 01
              </motion.text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Line 3: Quảng Trị to Sub 02 (Standby) */}
        <AnimatePresence>
          {animationStep >= 1 && (
            <motion.g
              initial="hidden"
              animate="visible"
              exit="hidden"
              custom={2}
            >
              <motion.path
                d="M 250,100 Q 400,150 600,250"
                stroke="#fbbf24"
                strokeWidth="4"
                fill="none"
                filter="url(#glow-yellow)"
                variants={lineVariants}
                custom={2}
              />
              <motion.text 
                x="400" 
                y="140" 
                fill="white" 
                fontSize="12" 
                fontWeight="bold" 
                textAnchor="middle"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                Quảng Trị → Sub 02
              </motion.text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Line 4: Đà Nẵng to Sub 02 (Standby) */}
        <AnimatePresence>
          {animationStep >= 1 && (
            <motion.g
              initial="hidden"
              animate="visible"
              exit="hidden"
              custom={3}
            >
              <motion.path
                d="M 400,350 Q 500,300 600,250"
                stroke="#fbbf24"
                strokeWidth="4"
                fill="none"
                filter="url(#glow-yellow)"
                variants={lineVariants}
                custom={3}
              />
              <motion.text 
                x="500" 
                y="340" 
                fill="white" 
                fontSize="12" 
                fontWeight="bold" 
                textAnchor="middle"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                Đà Nẵng → Sub 02
              </motion.text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Connection line between substations */}
        <AnimatePresence>
          {animationStep >= 3 && (
            <motion.g
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.path
                d="M 500,200 L 600,250"
                stroke="#8b5cf6"
                strokeWidth="3"
                fill="none"
                strokeDasharray="5,5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              <motion.text 
                x="550" 
                y="215" 
                fill="#8b5cf6" 
                fontSize="10" 
                fontWeight="bold" 
                textAnchor="middle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                220kV Backup
              </motion.text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {/* Substation 01 Marker */}
      <AnimatePresence>
        {animationStep >= 2 && (
          <motion.div 
            className="absolute z-20"
            style={{
              left: '500px',
              top: '200px',
              transform: 'translate(-50%, -50%)'
            }}
            variants={markerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            custom={1.5}
          >
            <div className="relative">
              <motion.div 
                className="w-6 h-6 bg-red-500 border-2 border-white rounded-full shadow-lg" 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div 
                className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                SUBSTATION 01 - ACTIVE
              </motion.div>
              <motion.div 
                className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                <span className="text-white text-xs font-bold">●</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Substation 02 Marker */}
      <AnimatePresence>
        {animationStep >= 2 && (
          <motion.div 
            className="absolute z-20"
            style={{
              left: '600px',
              top: '250px',
              transform: 'translate(-50%, -50%)'
            }}
            variants={markerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            custom={1.7}
          >
            <div className="relative">
              <motion.div 
                className="w-6 h-6 bg-yellow-500 border-2 border-white rounded-full shadow-lg" 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div 
                className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                SUBSTATION 02 - 600MW STANDBY
              </motion.div>
              <motion.div 
                className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-500 border-2 border-white rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                <span className="text-white text-xs font-bold">◐</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfoPanel && (
          <motion.div 
            className="absolute top-5 right-16 z-30 bg-black bg-opacity-90 text-white p-5 rounded-xl max-w-sm backdrop-blur-sm border border-gray-600"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            id="redundancy-description"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2" id="redundancy-title">
                <span className="text-xl" role="img" aria-label="lightning">⚡</span>
                2N+1 Redundancy Status
              </h3>
              <button
                onClick={() => setShowInfoPanel(false)}
                className="text-gray-400 hover:text-white text-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Data Center Needs */}
              <div>
                <div className="text-yellow-400 font-semibold mb-1">Data Center Needs</div>
                <div className="text-2xl font-bold text-red-400">{optimisticData.dataCenterNeeds}</div>
              </div>

              {/* Active Now */}
              <div>
                <div className="text-green-400 font-semibold mb-2">Active Now</div>
                {optimisticData.activeNow.sources.map((source, index) => (
                  <motion.div 
                    key={index} 
                    className="ml-2 mb-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    • {source}
                  </motion.div>
                ))}
                <div className="font-semibold mt-1">Total: {optimisticData.activeNow.capacity}</div>
              </div>

              {/* Standby Ready */}
              <div>
                <div className="text-yellow-400 font-semibold mb-2">Standby Ready</div>
                {optimisticData.standbyReady.sources.map((source, index) => (
                  <motion.div 
                    key={index} 
                    className="ml-2 mb-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    • {source}
                  </motion.div>
                ))}
                <div className="font-semibold mt-1">Total: {optimisticData.standbyReady.capacity}</div>
              </div>

              {/* Total Capacity */}
              <div className="border-t border-gray-600 pt-4 text-center">
                <motion.div 
                  className="text-lg font-bold text-red-400"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                >
                  {optimisticData.redundancyRatio} TOTAL CAPACITY
                </motion.div>
                <div className="text-xs text-gray-400 mt-1">
                  Total Available: {optimisticData.totalCapacity}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Help */}
      <motion.div 
        className="absolute bottom-5 left-5 z-30 bg-black bg-opacity-60 text-white px-3 py-2 rounded text-xs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        Press ESC to close
      </motion.div>
    </motion.div>
  )

  return createPortal(
    <AnimatePresence mode="wait">
      {isVisible && overlayContent}
    </AnimatePresence>,
    document.body
  )
}