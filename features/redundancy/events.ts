/**
 * Event Bus Communication System for 2N+1 Redundancy Feature
 * Provides isolated event handling without affecting core app
 */

import type { RedundancyState, SubstationData, LineData } from './types'

// Event type definitions
export interface RedundancyEventMap {
  // State events
  'redundancy:state:changed': { state: RedundancyState }
  'redundancy:state:initialized': { timestamp: number }
  'redundancy:state:error': { error: Error; context: string }
  
  // Substation events
  'redundancy:substation:selected': { substation: SubstationData }
  'redundancy:substation:hover': { substation: SubstationData | null }
  'redundancy:substation:status:changed': { id: string; status: 'active' | 'standby' }
  
  // Line events
  'redundancy:line:selected': { line: LineData }
  'redundancy:line:hover': { line: LineData | null }
  'redundancy:line:animated': { lineId: string; progress: number }
  
  // Panel events
  'redundancy:panel:opened': { timestamp: number }
  'redundancy:panel:closed': { timestamp: number }
  'redundancy:panel:position:changed': { x: number; y: number }
  
  // Animation events
  'redundancy:animation:started': { type: string }
  'redundancy:animation:completed': { type: string }
  'redundancy:animation:paused': { reason: string }
  'redundancy:animation:resumed': { reason: string }
  
  // Visibility events
  'redundancy:visibility:changed': { visible: boolean }
  'redundancy:overlay:mounted': { timestamp: number }
  'redundancy:overlay:unmounted': { timestamp: number }
}

export type RedundancyEventType = keyof RedundancyEventMap
export type RedundancyEventData<T extends RedundancyEventType> = RedundancyEventMap[T]

// Event listener type
export type RedundancyEventListener<T extends RedundancyEventType> = (
  data: RedundancyEventData<T>
) => void

/**
 * Isolated Event Bus for Redundancy Feature
 * Uses prefix isolation to prevent conflicts
 */
export class RedundancyEventBus {
  private listeners = new Map<string, Set<Function>>()
  private eventPrefix = 'redundancy:'
  private enabled = true
  private eventHistory: Array<{ type: string; data: unknown; timestamp: number }> = []
  private maxHistorySize = 100

  constructor() {
    this.setupGlobalErrorHandling()
  }

  /**
   * Subscribe to an event
   */
  on<T extends RedundancyEventType>(
    event: T,
    listener: RedundancyEventListener<T>
  ): () => void {
    if (!this.enabled) return () => {}

    const eventKey = this.getEventKey(event)
    
    if (!this.listeners.has(eventKey)) {
      this.listeners.set(eventKey, new Set())
    }
    
    this.listeners.get(eventKey)!.add(listener)
    
    // Return unsubscribe function
    return () => {
      this.off(event, listener)
    }
  }

  /**
   * Subscribe to an event (one-time)
   */
  once<T extends RedundancyEventType>(
    event: T,
    listener: RedundancyEventListener<T>
  ): () => void {
    const wrappedListener = (data: RedundancyEventData<T>) => {
      listener(data)
      this.off(event, wrappedListener as any)
    }
    
    return this.on(event, wrappedListener as any)
  }

  /**
   * Unsubscribe from an event
   */
  off<T extends RedundancyEventType>(
    event: T,
    listener: RedundancyEventListener<T>
  ): void {
    const eventKey = this.getEventKey(event)
    const listeners = this.listeners.get(eventKey)
    
    if (listeners) {
      listeners.delete(listener)
      
      if (listeners.size === 0) {
        this.listeners.delete(eventKey)
      }
    }
  }

  /**
   * Emit an event
   */
  emit<T extends RedundancyEventType>(
    event: T,
    data: RedundancyEventData<T>
  ): void {
    if (!this.enabled) return

    const eventKey = this.getEventKey(event)
    
    // Record event in history
    this.recordEvent(event, data)
    
    // Emit to direct listeners
    const listeners = this.listeners.get(eventKey)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error(`[RedundancyEventBus] Error in listener for ${event}:`, error)
        }
      })
    }
    
    // Also emit as custom DOM event for cross-component communication
    if (typeof window !== 'undefined') {
      const customEvent = new CustomEvent(eventKey, {
        detail: data,
        bubbles: false,
        cancelable: false
      })
      window.dispatchEvent(customEvent)
    }
  }

  /**
   * Clear all listeners for a specific event
   */
  clearEvent<T extends RedundancyEventType>(event: T): void {
    const eventKey = this.getEventKey(event)
    this.listeners.delete(eventKey)
  }

  /**
   * Clear all listeners
   */
  clearAll(): void {
    this.listeners.clear()
    this.eventHistory = []
  }

  /**
   * Enable/disable the event bus
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    
    if (!enabled) {
      // Clear all listeners when disabled
      this.clearAll()
    }
  }

  /**
   * Get event history
   */
  getHistory(eventType?: RedundancyEventType): Array<{
    type: string
    data: unknown
    timestamp: number
  }> {
    if (eventType) {
      return this.eventHistory.filter(entry => entry.type === eventType)
    }
    return [...this.eventHistory]
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = []
  }

  /**
   * Get listener count for an event
   */
  getListenerCount(event?: RedundancyEventType): number {
    if (event) {
      const eventKey = this.getEventKey(event)
      return this.listeners.get(eventKey)?.size || 0
    }
    
    let total = 0
    this.listeners.forEach(listeners => {
      total += listeners.size
    })
    return total
  }

  /**
   * Get all registered event types
   */
  getRegisteredEvents(): string[] {
    return Array.from(this.listeners.keys())
  }

  // Private methods
  private getEventKey(event: string): string {
    // Ensure event has proper prefix
    if (!event.startsWith(this.eventPrefix)) {
      return `${this.eventPrefix}${event}`
    }
    return event
  }

  private recordEvent(type: string, data: unknown): void {
    this.eventHistory.push({
      type,
      data,
      timestamp: Date.now()
    })
    
    // Trim history if too large
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize)
    }
  }

  private setupGlobalErrorHandling(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        // Only handle errors from our feature
        if (event.error?.featureId === 'redundancy-2n1') {
          this.emit('redundancy:state:error', {
            error: event.error,
            context: 'global'
          })
        }
      })
    }
  }

  // Debug methods (only in development)
  debug(): void {
    if (process.env.NODE_ENV === 'development') {
      console.group('[RedundancyEventBus] Debug Info')
      console.log('Enabled:', this.enabled)
      console.log('Total listeners:', this.getListenerCount())
      console.log('Registered events:', this.getRegisteredEvents())
      console.log('Event history size:', this.eventHistory.length)
      console.groupEnd()
    }
  }
}

// Singleton instance
export const redundancyEventBus = new RedundancyEventBus()

// Helper functions for common event patterns
export const redundancyEvents = {
  // State management helpers
  emitStateChange(state: RedundancyState): void {
    redundancyEventBus.emit('redundancy:state:changed', { state })
  },
  
  onStateChange(listener: (state: RedundancyState) => void): () => void {
    return redundancyEventBus.on('redundancy:state:changed', ({ state }) => listener(state))
  },
  
  // Substation helpers
  emitSubstationSelect(substation: SubstationData): void {
    redundancyEventBus.emit('redundancy:substation:selected', { substation })
  },
  
  onSubstationSelect(listener: (substation: SubstationData) => void): () => void {
    return redundancyEventBus.on('redundancy:substation:selected', ({ substation }) => 
      listener(substation)
    )
  },
  
  // Line helpers
  emitLineHover(line: LineData | null): void {
    redundancyEventBus.emit('redundancy:line:hover', { line })
  },
  
  onLineHover(listener: (line: LineData | null) => void): () => void {
    return redundancyEventBus.on('redundancy:line:hover', ({ line }) => listener(line))
  },
  
  // Panel helpers
  emitPanelToggle(isOpen: boolean): void {
    const event = isOpen ? 'redundancy:panel:opened' : 'redundancy:panel:closed'
    redundancyEventBus.emit(event, { timestamp: Date.now() })
  },
  
  // Animation helpers
  emitAnimationState(type: string, isStarted: boolean): void {
    const event = isStarted ? 'redundancy:animation:started' : 'redundancy:animation:completed'
    redundancyEventBus.emit(event, { type })
  }
}