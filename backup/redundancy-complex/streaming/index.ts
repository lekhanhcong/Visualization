/**
 * Streaming Index
 * Central export point for all real-time streaming components
 */

// Export WebSocket server
export { 
  RedundancyWebSocketServer,
  StreamingChannel,
  MessageType
} from './websocket-server'

export type {
  WebSocketConnection,
  WebSocketServerConfig
} from './websocket-server'

// Export WebSocket client
export {
  RedundancyWebSocketClient,
  WebSocketClientFactory,
  ConnectionState,
  useWebSocket
} from './websocket-client'

export type {
  WebSocketClientConfig,
  EventHandler,
  ErrorHandler,
  StateChangeHandler
} from './websocket-client'

// Export data simulator
export {
  PowerGridDataSimulator,
  SimulationPattern
} from './data-simulator'

export type {
  SimulationConfig
} from './data-simulator'

/**
 * Streaming service configuration
 */
export interface StreamingServiceConfig {
  server?: {
    port?: number
    heartbeatInterval?: number
    maxConnections?: number
    enableCompression?: boolean
    authenticateConnections?: boolean
  }
  client?: {
    url?: string
    autoReconnect?: boolean
    reconnectDelay?: number
    maxReconnectAttempts?: number
  }
  simulation?: {
    enabled?: boolean
    interval?: number
    pattern?: SimulationPattern
    volatility?: number
  }
}

/**
 * Main streaming service
 */
export class RedundancyStreamingService {
  private server: RedundancyWebSocketServer | null = null
  private simulator: PowerGridDataSimulator | null = null
  private config: StreamingServiceConfig

  constructor(config: StreamingServiceConfig = {}) {
    this.config = {
      server: {
        port: 8080,
        heartbeatInterval: 30000,
        maxConnections: 1000,
        enableCompression: true,
        authenticateConnections: false,
        ...config.server
      },
      client: {
        url: 'ws://localhost:8080',
        autoReconnect: true,
        reconnectDelay: 3000,
        maxReconnectAttempts: 5,
        ...config.client
      },
      simulation: {
        enabled: true,
        interval: 2000,
        pattern: SimulationPattern.NORMAL,
        volatility: 0.1,
        ...config.simulation
      }
    }
  }

  /**
   * Start the streaming service
   */
  async start(): Promise<void> {
    try {
      // Start WebSocket server
      this.server = new RedundancyWebSocketServer(this.config.server)
      await this.server.start()

      // Start data simulator if enabled
      if (this.config.simulation?.enabled && this.server) {
        this.simulator = new PowerGridDataSimulator(this.server, this.config.simulation)
        this.simulator.start()
      }

      console.log('🚀 Redundancy streaming service started successfully')

    } catch (error) {
      console.error('❌ Failed to start streaming service:', error)
      throw error
    }
  }

  /**
   * Stop the streaming service
   */
  async stop(): Promise<void> {
    try {
      // Stop simulator
      if (this.simulator) {
        this.simulator.stop()
        this.simulator = null
      }

      // Stop server
      if (this.server) {
        await this.server.stop()
        this.server = null
      }

      console.log('🛑 Redundancy streaming service stopped')

    } catch (error) {
      console.error('❌ Error stopping streaming service:', error)
    }
  }

  /**
   * Get server instance
   */
  getServer(): RedundancyWebSocketServer | null {
    return this.server
  }

  /**
   * Get simulator instance
   */
  getSimulator(): PowerGridDataSimulator | null {
    return this.simulator
  }

  /**
   * Set simulation pattern
   */
  setSimulationPattern(pattern: SimulationPattern): void {
    if (this.simulator) {
      this.simulator.setPattern(pattern)
    }
  }

  /**
   * Get service statistics
   */
  getStats(): {
    server?: any
    simulator?: any
    config: StreamingServiceConfig
  } {
    return {
      server: this.server?.getStats(),
      simulator: this.simulator?.getStats(),
      config: this.config
    }
  }
}

/**
 * Default streaming service instance
 */
let defaultService: RedundancyStreamingService | null = null

/**
 * Get default streaming service instance
 */
export function getStreamingService(config?: StreamingServiceConfig): RedundancyStreamingService {
  if (!defaultService) {
    defaultService = new RedundancyStreamingService(config)
  }
  return defaultService
}

/**
 * Start default streaming service
 */
export async function startStreaming(config?: StreamingServiceConfig): Promise<RedundancyStreamingService> {
  const service = getStreamingService(config)
  await service.start()
  return service
}

/**
 * Stop default streaming service
 */
export async function stopStreaming(): Promise<void> {
  if (defaultService) {
    await defaultService.stop()
    defaultService = null
  }
}

/**
 * Client factory for easy access
 */
export const createStreamingClient = {
  /**
   * Create WebSocket client with default configuration
   */
  default: (overrides?: Partial<WebSocketClientConfig>) => {
    return new RedundancyWebSocketClient({
      url: 'ws://localhost:8080',
      autoReconnect: true,
      reconnectDelay: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      ...overrides
    })
  },

  /**
   * Create WebSocket client for production
   */
  production: (overrides?: Partial<WebSocketClientConfig>) => {
    return new RedundancyWebSocketClient({
      url: process.env.NEXT_PUBLIC_WS_URL || 'wss://api.example.com/ws',
      autoReconnect: true,
      reconnectDelay: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      authToken: process.env.NEXT_PUBLIC_WS_TOKEN,
      ...overrides
    })
  },

  /**
   * Create WebSocket client for testing
   */
  test: (overrides?: Partial<WebSocketClientConfig>) => {
    return new RedundancyWebSocketClient({
      url: 'ws://localhost:8080',
      autoReconnect: false,
      reconnectDelay: 1000,
      maxReconnectAttempts: 1,
      heartbeatInterval: 10000,
      ...overrides
    })
  }
}

/**
 * Streaming utilities
 */
export const streamingUtils = {
  /**
   * Validate streaming channel
   */
  isValidChannel: (channel: string): boolean => {
    return Object.values(StreamingChannel).includes(channel as StreamingChannel)
  },

  /**
   * Get available channels
   */
  getAvailableChannels: (): StreamingChannel[] => {
    return Object.values(StreamingChannel)
  },

  /**
   * Format channel name for display
   */
  formatChannelName: (channel: StreamingChannel): string => {
    return channel.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  },

  /**
   * Create channel subscription manager
   */
  createSubscriptionManager: () => {
    const subscriptions = new Set<string>()
    
    return {
      subscribe: (channel: string) => {
        subscriptions.add(channel)
        return subscriptions.has(channel)
      },
      unsubscribe: (channel: string) => {
        return subscriptions.delete(channel)
      },
      isSubscribed: (channel: string) => {
        return subscriptions.has(channel)
      },
      getSubscriptions: () => {
        return Array.from(subscriptions)
      },
      clear: () => {
        subscriptions.clear()
      }
    }
  },

  /**
   * Create message handler registry
   */
  createMessageHandlerRegistry: () => {
    const handlers = new Map<string, EventHandler[]>()
    
    return {
      on: <T = any>(event: string, handler: EventHandler<T>) => {
        if (!handlers.has(event)) {
          handlers.set(event, [])
        }
        handlers.get(event)!.push(handler)
      },
      off: <T = any>(event: string, handler?: EventHandler<T>) => {
        const eventHandlers = handlers.get(event)
        if (!eventHandlers) return
        
        if (handler) {
          const index = eventHandlers.indexOf(handler)
          if (index > -1) {
            eventHandlers.splice(index, 1)
          }
        } else {
          handlers.set(event, [])
        }
      },
      emit: <T = any>(event: string, data?: T) => {
        const eventHandlers = handlers.get(event)
        if (eventHandlers) {
          eventHandlers.forEach(handler => {
            try {
              handler(data)
            } catch (error) {
              console.error(`Error in handler for ${event}:`, error)
            }
          })
        }
      },
      clear: () => {
        handlers.clear()
      }
    }
  }
}

/**
 * Environment-specific configurations
 */
export const streamingPresets = {
  development: {
    server: {
      port: 8080,
      heartbeatInterval: 10000,
      maxConnections: 100,
      enableCompression: false,
      authenticateConnections: false
    },
    client: {
      url: 'ws://localhost:8080',
      autoReconnect: true,
      reconnectDelay: 1000,
      maxReconnectAttempts: 3
    },
    simulation: {
      enabled: true,
      interval: 1000,
      pattern: SimulationPattern.NORMAL,
      volatility: 0.2
    }
  },

  production: {
    server: {
      port: parseInt(process.env.WS_PORT || '8080'),
      heartbeatInterval: 30000,
      maxConnections: 10000,
      enableCompression: true,
      authenticateConnections: true
    },
    client: {
      url: process.env.NEXT_PUBLIC_WS_URL || 'wss://api.example.com/ws',
      autoReconnect: true,
      reconnectDelay: 5000,
      maxReconnectAttempts: 10
    },
    simulation: {
      enabled: false,
      interval: 5000,
      pattern: SimulationPattern.NORMAL,
      volatility: 0.05
    }
  },

  testing: {
    server: {
      port: 8081,
      heartbeatInterval: 5000,
      maxConnections: 10,
      enableCompression: false,
      authenticateConnections: false
    },
    client: {
      url: 'ws://localhost:8081',
      autoReconnect: false,
      reconnectDelay: 500,
      maxReconnectAttempts: 1
    },
    simulation: {
      enabled: true,
      interval: 500,
      pattern: SimulationPattern.NORMAL,
      volatility: 0.1
    }
  }
}

/**
 * Initialize streaming with environment-based preset
 */
export function initializeStreaming(environment: keyof typeof streamingPresets = 'development'): Promise<RedundancyStreamingService> {
  const config = streamingPresets[environment]
  return startStreaming(config)
}