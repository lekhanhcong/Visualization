/**
 * Event System Index
 * Central export point for all event handling components
 */

// Export event bus
export {
  RedundancyEventBus,
  RedundancyEventType,
  getEventBus,
  EventBusFactory
} from './event-bus'

export type {
  RedundancyEvent,
  EventHandler,
  EventFilter,
  EventSubscription,
  EventBusStats
} from './event-bus'

// Export event handlers
export {
  AlertHandler,
  FailoverHandler,
  MaintenanceHandler,
  SystemHealthHandler,
  LoggingHandler,
  defaultHandlers,
  setupDefaultHandlers
} from './event-handlers'

// Export event triggers
export {
  BaseTrigger,
  SubstationStatusTrigger,
  SubstationLoadTrigger,
  LineStatusTrigger,
  SystemHealthTrigger,
  ThresholdTrigger,
  TriggerManager,
  defaultTriggerManager
} from './event-triggers'

export type {
  TriggerConfig
} from './event-triggers'

/**
 * Event system configuration
 */
export interface EventSystemConfig {
  eventBus?: {
    maxHistorySize?: number
    enableStatistics?: boolean
    enableLogging?: boolean
  }
  handlers?: {
    setupDefaults?: boolean
    enableAlerts?: boolean
    enableFailover?: boolean
    enableMaintenance?: boolean
    enableHealthMonitoring?: boolean
    enableLogging?: boolean
  }
  triggers?: {
    setupDefaults?: boolean
    enableStatusTriggers?: boolean
    enableLoadTriggers?: boolean
    enableHealthTriggers?: boolean
    enableThresholdTriggers?: boolean
  }
}

/**
 * Main event system orchestrator
 */
export class RedundancyEventSystem {
  private eventBus: import('./event-bus').RedundancyEventBus
  private triggerManager: import('./event-triggers').TriggerManager
  private config: Required<EventSystemConfig>
  private isInitialized = false

  constructor(config: EventSystemConfig = {}) {
    this.config = {
      eventBus: {
        maxHistorySize: config.eventBus?.maxHistorySize ?? 1000,
        enableStatistics: config.eventBus?.enableStatistics ?? true,
        enableLogging: config.eventBus?.enableLogging ?? true
      },
      handlers: {
        setupDefaults: config.handlers?.setupDefaults ?? true,
        enableAlerts: config.handlers?.enableAlerts ?? true,
        enableFailover: config.handlers?.enableFailover ?? true,
        enableMaintenance: config.handlers?.enableMaintenance ?? true,
        enableHealthMonitoring: config.handlers?.enableHealthMonitoring ?? true,
        enableLogging: config.handlers?.enableLogging ?? true
      },
      triggers: {
        setupDefaults: config.triggers?.setupDefaults ?? true,
        enableStatusTriggers: config.triggers?.enableStatusTriggers ?? true,
        enableLoadTriggers: config.triggers?.enableLoadTriggers ?? true,
        enableHealthTriggers: config.triggers?.enableHealthTriggers ?? true,
        enableThresholdTriggers: config.triggers?.enableThresholdTriggers ?? true
      }
    }

    const { getEventBus } = require('./event-bus')
    const { defaultTriggerManager } = require('./event-triggers')
    this.eventBus = getEventBus()
    this.triggerManager = defaultTriggerManager
  }

  /**
   * Initialize the event system
   */
  initialize(): void {
    if (this.isInitialized) return

    // Setup default handlers if enabled
    if (this.config.handlers.setupDefaults) {
      const { setupDefaultHandlers } = require('./event-handlers')
      setupDefaultHandlers()
    }

    // Setup custom handlers based on config
    this.setupCustomHandlers()

    // Configure trigger manager
    this.configureTriggerManager()

    this.isInitialized = true
    console.log('✅ Redundancy event system initialized')
  }

  /**
   * Setup custom handlers based on configuration
   */
  private setupCustomHandlers(): void {
    // Additional custom handler setup can be added here
    // For now, we rely on the default handlers setup
  }

  /**
   * Configure trigger manager based on configuration
   */
  private configureTriggerManager(): void {
    // Enable/disable triggers based on config
    if (!this.config.triggers.enableStatusTriggers) {
      this.triggerManager.removeTrigger('substation-status')
    }
    
    if (!this.config.triggers.enableLoadTriggers) {
      this.triggerManager.removeTrigger('substation-load')
    }
    
    if (!this.config.triggers.enableHealthTriggers) {
      this.triggerManager.removeTrigger('system-health')
    }
    
    if (!this.config.triggers.enableThresholdTriggers) {
      this.triggerManager.removeTrigger('threshold')
    }
  }

  /**
   * Get event bus instance
   */
  getEventBus(): import('./event-bus').RedundancyEventBus {
    return this.eventBus
  }

  /**
   * Get trigger manager instance
   */
  getTriggerManager(): import('./event-triggers').TriggerManager {
    return this.triggerManager
  }

  /**
   * Shutdown the event system
   */
  shutdown(): void {
    this.eventBus.clearSubscriptions()
    this.triggerManager.setEnabled(false)
    this.isInitialized = false
    console.log('🛑 Redundancy event system shut down')
  }

  /**
   * Get system statistics
   */
  getStats(): {
    eventBus: import('./event-bus').EventBusStats
    triggers: Record<string, any>
    config: Required<EventSystemConfig>
  } {
    return {
      eventBus: this.eventBus.getStats(),
      triggers: this.triggerManager.getStats(),
      config: this.config
    }
  }
}

/**
 * Default event system instance
 */
let defaultEventSystem: RedundancyEventSystem | null = null

/**
 * Get default event system instance
 */
export function getEventSystem(config?: EventSystemConfig): RedundancyEventSystem {
  if (!defaultEventSystem) {
    defaultEventSystem = new RedundancyEventSystem(config)
  }
  return defaultEventSystem
}

/**
 * Initialize default event system
 */
export function initializeEventSystem(config?: EventSystemConfig): RedundancyEventSystem {
  const system = getEventSystem(config)
  system.initialize()
  return system
}

/**
 * Event system presets for different environments
 */
export const eventSystemPresets = {
  development: {
    eventBus: {
      maxHistorySize: 500,
      enableStatistics: true,
      enableLogging: true
    },
    handlers: {
      setupDefaults: true,
      enableAlerts: true,
      enableFailover: true,
      enableMaintenance: true,
      enableHealthMonitoring: true,
      enableLogging: true
    },
    triggers: {
      setupDefaults: true,
      enableStatusTriggers: true,
      enableLoadTriggers: true,
      enableHealthTriggers: true,
      enableThresholdTriggers: true
    }
  },

  production: {
    eventBus: {
      maxHistorySize: 2000,
      enableStatistics: true,
      enableLogging: true
    },
    handlers: {
      setupDefaults: true,
      enableAlerts: true,
      enableFailover: true,
      enableMaintenance: true,
      enableHealthMonitoring: true,
      enableLogging: true
    },
    triggers: {
      setupDefaults: true,
      enableStatusTriggers: true,
      enableLoadTriggers: true,
      enableHealthTriggers: true,
      enableThresholdTriggers: true
    }
  },

  testing: {
    eventBus: {
      maxHistorySize: 100,
      enableStatistics: false,
      enableLogging: false
    },
    handlers: {
      setupDefaults: false,
      enableAlerts: false,
      enableFailover: false,
      enableMaintenance: false,
      enableHealthMonitoring: false,
      enableLogging: false
    },
    triggers: {
      setupDefaults: false,
      enableStatusTriggers: false,
      enableLoadTriggers: false,
      enableHealthTriggers: false,
      enableThresholdTriggers: false
    }
  }
}

/**
 * Quick setup functions for common scenarios
 */
export const eventSystemUtils = {
  /**
   * Setup event system for development
   */
  setupDevelopment: () => {
    return initializeEventSystem(eventSystemPresets.development)
  },

  /**
   * Setup event system for production
   */
  setupProduction: () => {
    return initializeEventSystem(eventSystemPresets.production)
  },

  /**
   * Setup event system for testing
   */
  setupTesting: () => {
    return initializeEventSystem(eventSystemPresets.testing)
  },

  /**
   * Create event system with minimal configuration
   */
  createMinimal: () => {
    return new RedundancyEventSystem({
      handlers: { setupDefaults: false },
      triggers: { setupDefaults: false }
    })
  }
}