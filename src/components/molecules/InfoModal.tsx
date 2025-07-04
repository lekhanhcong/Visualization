'use client'

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Building2, Zap, Factory, Server, MapPin, Info } from 'lucide-react'
import { ImageHotspot } from '@/types'

interface InfoModalProps {
  hotspot: ImageHotspot
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function InfoModal({
  hotspot,
  isOpen,
  onClose,
  className = '',
}: InfoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'

      // Focus first focusable element
      setTimeout(() => {
        firstFocusableRef.current?.focus()
      }, 100)
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Handle click outside
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  // Get icon based on type
  const getIcon = () => {
    switch (hotspot.type) {
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

  // Get color based on type
  const getColor = () => {
    switch (hotspot.type) {
      case 'datacenter':
        return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
      case 'substation':
        if (hotspot.metadata?.voltage === '500kV')
          return 'text-red-500 bg-red-50 dark:bg-red-900/20'
        if (hotspot.metadata?.voltage === '220kV')
          return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
        return 'text-pink-500 bg-pink-50 dark:bg-pink-900/20'
      case 'powerplant':
        return 'text-violet-500 bg-violet-50 dark:bg-violet-900/20'
      default:
        return 'text-violet-500 bg-violet-50 dark:bg-violet-900/20'
    }
  }

  // Get type display name
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

  // Animation variants
  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const modalVariants = {
    initial: {
      scale: 0.8,
      opacity: 0,
      y: 100,
      rotateX: -15,
    },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring' as const,
        damping: 20,
        stiffness: 300,
        duration: 0.4,
      },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      y: 100,
      rotateX: -15,
      transition: {
        duration: 0.2,
        ease: 'easeInOut' as const,
      },
    },
  }

  const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1,
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 },
    },
  }

  const Icon = getIcon()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            className={`relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden ${className}`}
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getColor()}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {hotspot.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {getTypeDisplayName(hotspot.type)}
                  </p>
                </div>
              </div>
              <button
                ref={firstFocusableRef}
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <motion.div
              className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]"
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Description */}
              {hotspot.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Info size={18} />
                    Overview
                  </h3>
                  <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
                    {hotspot.description}
                  </p>
                </div>
              )}

              {/* Metadata */}
              {hotspot.metadata && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Technical Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotspot.metadata.voltage && (
                      <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-500 dark:text-slate-400">
                          Voltage Level
                        </div>
                        <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                          {hotspot.metadata.voltage}
                        </div>
                      </div>
                    )}
                    {hotspot.metadata.capacity && (
                      <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-500 dark:text-slate-400">
                          Capacity
                        </div>
                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {hotspot.metadata.capacity}
                        </div>
                      </div>
                    )}
                    {hotspot.metadata.status && (
                      <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-500 dark:text-slate-400">
                          Status
                        </div>
                        <div
                          className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                            hotspot.metadata.status === 'operational'
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                              : hotspot.metadata.status === 'maintenance'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                          }`}
                        >
                          {hotspot.metadata.status}
                        </div>
                      </div>
                    )}
                    {hotspot.metadata.coordinates && (
                      <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-500 dark:text-slate-400">
                          Coordinates
                        </div>
                        <div className="text-sm font-mono text-gray-700 dark:text-slate-300">
                          {hotspot.metadata.coordinates}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Position Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <MapPin size={18} />
                  Location
                </h3>
                <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">
                    Map Position
                  </div>
                  <div className="text-sm font-mono text-gray-700 dark:text-slate-300">
                    X: {hotspot.position.x}px, Y: {hotspot.position.y}px
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Additional Information
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This infrastructure point is part of the Hue Hi Tech Park
                  300MW AI Data Center project. For technical specifications and
                  operational details, please refer to the project
                  documentation.
                </p>
              </div>
            </motion.div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
