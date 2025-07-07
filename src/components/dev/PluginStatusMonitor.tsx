/**
 * Plugin Status Monitor - Development component to monitor plugin health
 * Only shows in development mode
 */

'use client'

import React, { useState, useEffect } from 'react'
import { pluginManager, type PluginManagerState, type PluginStatus } from '@/lib/plugin-manager'

interface PluginStatusMonitorProps {
  className?: string
  showDetails?: boolean
}

export function PluginStatusMonitor({ 
  className = ''
}: PluginStatusMonitorProps) {
  const [state, setState] = useState<PluginManagerState | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    const unsubscribe = pluginManager.subscribe(setState)
    return unsubscribe
  }, [])

  // Don't render in production
  if (process.env.NODE_ENV !== 'development' || !state) {
    return null
  }

  const healthReport = pluginManager.getHealthReport()
  const hasIssues = !healthReport.healthy

  return (
    <div className={`fixed bottom-4 right-4 z-[9998] ${className}`}>
      {/* Status Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          px-3 py-2 rounded-lg text-xs font-mono shadow-lg transition-all
          ${hasIssues 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
          }
        `}
        title={`Plugin Status: ${healthReport.healthy ? 'Healthy' : 'Issues Found'}`}
      >
        🔌 {state.enabledPlugins}/{state.totalPlugins}
        {hasIssues && ' ⚠️'}
      </button>

      {/* Detailed Panel */}
      {isOpen && (
        <div 
          className="absolute bottom-12 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Plugin Status Monitor
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>

          {/* Summary */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total:</span>
                <span className="ml-1 font-mono">{healthReport.summary.totalPlugins}</span>
              </div>
              <div>
                <span className="text-green-600 dark:text-green-400">Enabled:</span>
                <span className="ml-1 font-mono">{healthReport.summary.enabledPlugins}</span>
              </div>
              <div>
                <span className="text-yellow-600 dark:text-yellow-400">Disabled:</span>
                <span className="ml-1 font-mono">{healthReport.summary.disabledPlugins}</span>
              </div>
              <div>
                <span className="text-red-600 dark:text-red-400">Errors:</span>
                <span className="ml-1 font-mono">{healthReport.summary.erroredPlugins}</span>
              </div>
            </div>
          </div>

          {/* Issues */}
          {healthReport.issues.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
                Issues:
              </h4>
              <ul className="text-xs space-y-1">
                {healthReport.issues.map((issue, index) => (
                  <li key={index} className="text-red-600 dark:text-red-400">
                    • {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Plugin List */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Plugins:
            </h4>
            {Object.values(state.plugins).map((plugin) => (
              <PluginStatusItem key={plugin.id} plugin={plugin} />
            ))}
          </div>

          {/* Actions */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => pluginManager.printStatus()}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Print to Console
            </button>
          </div>

          {/* Last Update */}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Last update: {new Date(state.lastUpdate).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  )
}

function PluginStatusItem({ plugin }: { plugin: PluginStatus }) {
  const statusColor = plugin.lastError 
    ? 'text-red-500' 
    : plugin.enabled 
      ? 'text-green-500' 
      : 'text-yellow-500'

  const statusIcon = plugin.lastError 
    ? '❌' 
    : plugin.enabled 
      ? '✅' 
      : '⏸️'

  return (
    <div className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded">
      <div className="flex items-center gap-2">
        <span>{statusIcon}</span>
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {plugin.name}
          </div>
          <div className="text-gray-500 dark:text-gray-400 font-mono">
            {plugin.id} v{plugin.version}
          </div>
        </div>
      </div>
      <div className={`text-xs font-mono ${statusColor}`}>
        {plugin.lastError 
          ? 'ERROR' 
          : plugin.enabled 
            ? 'ON' 
            : 'OFF'
        }
      </div>
    </div>
  )
}