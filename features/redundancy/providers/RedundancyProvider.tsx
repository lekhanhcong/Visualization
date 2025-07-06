/**
 * Provider component for 2N+1 Redundancy Feature
 * Manages feature state and context isolation
 */

import React, { createContext, useContext, useEffect, useReducer, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import { redundancyEventBus, redundancyEvents } from '../events'
import { redundancyLifecycle } from '../lifecycle'
import { redundancyDependencyManager } from '../dependencies'
import { redundancyErrorIsolation } from '../errors'
import { isRedundancyEnabled } from '../utils/env'
import type { RedundancyState, SubstationData, LineData } from '../types'
import type { ErrorContext } from '../errors'

// Context type definition
interface RedundancyContextType {
  state: RedundancyState
  actions: {
    selectSubstation: (substation: SubstationData | null) => void
    selectLine: (line: LineData | null) => void
    togglePanel: () => void
    updateAnimationProgress: (progress: number) => void
    reset: () => void
    reportError: (error: Error, context?: Record<string, unknown>) => void
  }
  isEnabled: boolean
  isMounted: boolean
  isDependenciesResolved: boolean
  hasErrors: boolean
  errorStats: {
    totalErrors: number
    recentErrors: number
    isIsolated: boolean
  }
}

// Initial state
const initialState: RedundancyState = {
  isActive: false,
  selectedSubstation: null,
  selectedLine: null,
  isPanelOpen: false,
  animationProgress: 0,
}

// Action types
type RedundancyAction =
  | { type: 'SELECT_SUBSTATION'; payload: SubstationData | null }
  | { type: 'SELECT_LINE'; payload: LineData | null }
  | { type: 'TOGGLE_PANEL' }
  | { type: 'UPDATE_ANIMATION_PROGRESS'; payload: number }
  | { type: 'SET_ACTIVE'; payload: boolean }
  | { type: 'RESET' }

// Reducer function
function redundancyReducer(state: RedundancyState, action: RedundancyAction): RedundancyState {
  switch (action.type) {
    case 'SELECT_SUBSTATION':
      return {
        ...state,
        selectedSubstation: action.payload,
        // Clear line selection when selecting substation
        selectedLine: null,
      }
    
    case 'SELECT_LINE':
      return {
        ...state,
        selectedLine: action.payload,
        // Clear substation selection when selecting line
        selectedSubstation: null,
      }
    
    case 'TOGGLE_PANEL':
      return {
        ...state,
        isPanelOpen: !state.isPanelOpen,
      }
    
    case 'UPDATE_ANIMATION_PROGRESS':
      return {
        ...state,
        animationProgress: Math.max(0, Math.min(1, action.payload)),
      }
    
    case 'SET_ACTIVE':
      return {
        ...state,
        isActive: action.payload,
      }
    
    case 'RESET':
      return initialState
    
    default:
      return state
  }
}

// Create context
const RedundancyContext = createContext<RedundancyContextType | undefined>(undefined)

// Provider props
interface RedundancyProviderProps {
  children: ReactNode
  enabled?: boolean
}

/**
 * Redundancy Provider Component
 * Provides feature state and actions to child components
 */
export function RedundancyProvider({ 
  children, 
  enabled = isRedundancyEnabled() 
}: RedundancyProviderProps) {
  const [state, dispatch] = useReducer(redundancyReducer, initialState)
  const [isDependenciesResolved, setIsDependenciesResolved] = React.useState(false)
  const [errorStats, setErrorStats] = React.useState({ totalErrors: 0, recentErrors: 0, isIsolated: false })
  const isMountedRef = useRef(false)
  const previousStateRef = useRef(state)

  // Actions
  const selectSubstation = useCallback((substation: SubstationData | null) => {
    dispatch({ type: 'SELECT_SUBSTATION', payload: substation })
    
    // Emit event
    if (substation) {
      redundancyEvents.emitSubstationSelect(substation)
    }
  }, [])

  const selectLine = useCallback((line: LineData | null) => {
    dispatch({ type: 'SELECT_LINE', payload: line })
    
    // Emit event
    redundancyEvents.emitLineHover(line)
  }, [])

  const togglePanel = useCallback(() => {
    dispatch({ type: 'TOGGLE_PANEL' })
    
    // Emit event (will be toggled in effect)
  }, [])

  const updateAnimationProgress = useCallback((progress: number) => {
    dispatch({ type: 'UPDATE_ANIMATION_PROGRESS', payload: progress })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const reportError = useCallback((error: Error, context?: Record<string, unknown>) => {
    const errorContext: ErrorContext = {
      featureId: 'redundancy-2n1',
      componentName: 'RedundancyProvider',
      operationName: 'user-action',
      timestamp: Date.now(),
      metadata: context
    }

    redundancyErrorIsolation.reportError(error, errorContext)
    
    // Update error stats
    const stats = redundancyErrorIsolation.getErrorStats(errorContext)
    setErrorStats({
      totalErrors: stats.totalErrors,
      recentErrors: stats.recentErrors,
      isIsolated: stats.circuitState === 'open'
    })
  }, [])

  // Dependencies resolution effect
  useEffect(() => {
    if (!enabled) return

    const resolveDependencies = async () => {
      try {
        const resolved = await redundancyDependencyManager.resolveAll()
        setIsDependenciesResolved(resolved)
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[RedundancyProvider] Dependencies resolved:', resolved)
        }
      } catch (error) {
        reportError(error as Error, { operation: 'dependency-resolution' })
      }
    }

    resolveDependencies()
  }, [enabled, reportError])

  // Mount/unmount lifecycle
  useEffect(() => {
    if (!enabled || !isDependenciesResolved) return

    const mount = async () => {
      try {
        await redundancyLifecycle.onMount()
        isMountedRef.current = true
        dispatch({ type: 'SET_ACTIVE', payload: true })
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[RedundancyProvider] Mounted')
        }
      } catch (error) {
        reportError(error as Error, { operation: 'mount' })
      }
    }

    mount()

    return () => {
      const unmount = async () => {
        try {
          await redundancyLifecycle.onUnmount()
          isMountedRef.current = false
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[RedundancyProvider] Unmounted')
          }
        } catch (error) {
          reportError(error as Error, { operation: 'unmount' })
        }
      }
      
      unmount()
    }
  }, [enabled, isDependenciesResolved, reportError])

  // State change effects
  useEffect(() => {
    if (!enabled || !isMountedRef.current) return

    // Emit state change event
    redundancyEvents.emitStateChange(state)

    // Handle panel state change
    if (previousStateRef.current.isPanelOpen !== state.isPanelOpen) {
      redundancyEvents.emitPanelToggle(state.isPanelOpen)
    }

    previousStateRef.current = state
  }, [state, enabled])

  // Enable/disable lifecycle
  useEffect(() => {
    if (!enabled || !isMountedRef.current) return

    const handleEnable = async () => {
      if (state.isActive && redundancyLifecycle.isMounted() && !redundancyLifecycle.isEnabled()) {
        try {
          await redundancyLifecycle.onEnable()
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[RedundancyProvider] Feature enabled')
          }
        } catch (error) {
          console.error('[RedundancyProvider] Enable failed:', error)
        }
      }
    }

    const handleDisable = async () => {
      if (!state.isActive && redundancyLifecycle.isEnabled()) {
        try {
          await redundancyLifecycle.onDisable()
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[RedundancyProvider] Feature disabled')
          }
        } catch (error) {
          console.error('[RedundancyProvider] Disable failed:', error)
        }
      }
    }

    if (state.isActive) {
      handleEnable()
    } else {
      handleDisable()
    }
  }, [state.isActive, enabled])

  // Subscribe to external events
  useEffect(() => {
    if (!enabled) return

    const unsubscribers: Array<() => void> = []

    // Handle visibility changes
    unsubscribers.push(
      redundancyEventBus.on('redundancy:visibility:changed', ({ visible }) => {
        if (!visible && state.isPanelOpen) {
          // Close panel when tab becomes hidden
          dispatch({ type: 'TOGGLE_PANEL' })
        }
      })
    )

    // Handle animation events
    unsubscribers.push(
      redundancyEventBus.on('redundancy:animation:completed', ({ type }) => {
        if (type === 'initial' && state.animationProgress < 1) {
          dispatch({ type: 'UPDATE_ANIMATION_PROGRESS', payload: 1 })
        }
      })
    )

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe())
    }
  }, [enabled, state.isPanelOpen, state.animationProgress])

  // Context value
  const contextValue: RedundancyContextType = {
    state,
    actions: {
      selectSubstation,
      selectLine,
      togglePanel,
      updateAnimationProgress,
      reset,
      reportError,
    },
    isEnabled: enabled,
    isMounted: isMountedRef.current,
    isDependenciesResolved,
    hasErrors: errorStats.totalErrors > 0,
    errorStats,
  }

  // Don't render if not enabled
  if (!enabled) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[RedundancyProvider] Feature disabled, not rendering')
    }
    return <>{children}</>
  }

  return (
    <RedundancyContext.Provider value={contextValue}>
      {children}
    </RedundancyContext.Provider>
  )
}

/**
 * Hook to use redundancy context
 * Throws error if used outside provider
 */
export function useRedundancy() {
  const context = useContext(RedundancyContext)
  
  if (context === undefined) {
    throw new Error('useRedundancy must be used within a RedundancyProvider')
  }
  
  return context
}

/**
 * Hook to check if redundancy is available
 * Safe to use outside provider
 */
export function useRedundancyAvailable() {
  const context = useContext(RedundancyContext)
  return context !== undefined && context.isEnabled
}

// Export for testing
export { RedundancyContext }