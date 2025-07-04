'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  initPerformanceMonitoring,
  subscribeToPerformance,
  getPerformanceScore,
  PerformanceData,
} from '@/lib/performance'
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BarChart3,
} from 'lucide-react'

interface PerformanceMonitorProps {
  showDetails?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  className?: string
}

export function PerformanceMonitor({
  showDetails = false,
  position = 'bottom-left',
  className = '',
}: PerformanceMonitorProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    CLS: null,
    FID: null,
    FCP: null,
    LCP: null,
    TTFB: null,
  })
  const [score, setScore] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitoring()

    // Subscribe to performance updates
    const unsubscribe = subscribeToPerformance((data) => {
      setPerformanceData(data)
      setScore(getPerformanceScore())
    })

    return unsubscribe
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getMetricIcon = (rating: string) => {
    switch (rating) {
      case 'good':
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case 'needs-improvement':
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />
      case 'poor':
        return <XCircle className="w-3 h-3 text-red-500" />
      default:
        return <Activity className="w-3 h-3 text-gray-500" />
    }
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }

  // Only show in development or when explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showDetails) {
    return null
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 p-3 w-full hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <BarChart3 className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">Performance</span>
          <div className={`text-sm font-bold ${getScoreColor(score)}`}>
            {score}
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.div>
        </button>

        {/* Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-gray-200 dark:border-slate-700"
            >
              <div className="p-3 space-y-2">
                {/* Core Web Vitals */}
                {Object.entries(performanceData).map(([name, metric]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {metric ? (
                        getMetricIcon(metric.rating)
                      ) : (
                        <div className="w-3 h-3" />
                      )}
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="text-right">
                      {metric ? (
                        <>
                          <div
                            className={`font-bold ${getScoreColor(
                              metric.rating === 'good'
                                ? 100
                                : metric.rating === 'needs-improvement'
                                  ? 50
                                  : 0
                            )}`}
                          >
                            {metric.value.toFixed(0)}
                            {name === 'CLS' ? '' : 'ms'}
                          </div>
                          <div className="text-gray-500">{metric.rating}</div>
                        </>
                      ) : (
                        <div className="text-gray-400">-</div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Overall Score */}
                <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Overall Score</span>
                    <div
                      className={`text-lg font-bold ${getScoreColor(score)}`}
                    >
                      {score}/100
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="mt-1 h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        score >= 80
                          ? 'bg-green-500'
                          : score >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  </div>
                </div>

                {/* Performance Tips */}
                {score < 80 && (
                  <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      💡 Tips:
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        {performanceData.LCP &&
                          performanceData.LCP.rating !== 'good' && (
                            <li>Optimize images and fonts loading</li>
                          )}
                        {performanceData.FID &&
                          performanceData.FID.rating !== 'good' && (
                            <li>Reduce JavaScript execution time</li>
                          )}
                        {performanceData.CLS &&
                          performanceData.CLS.rating !== 'good' && (
                            <li>Set explicit sizes for images/videos</li>
                          )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
