/**
 * WebSocket Client
 * Client-side WebSocket connection manager for real-time data
 */

import { 
  WebSocketMessage, 
  RealTimeUpdate 
} from '../models/interfaces'

/**
 * Connection states
 */
export enum ConnectionState {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR'
}

/**
 * WebSocket client configuration
 */
export interface WebSocketClientConfig {
  url?: string
  autoReconnect?: boolean
  reconnectDelay?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  connectionTimeout?: number
  authToken?: string
}

/**
 * Event handler types
 */
export type EventHandler<T = any> = (data: T) => void
export type ErrorHandler = (error: Error) => void
export type StateChangeHandler = (state: ConnectionState) => void

/**
 * WebSocket client for redundancy feature
 */
export class RedundancyWebSocketClient {
  private ws: WebSocket | null = null
  private config: Required<WebSocketClientConfig>
  private state: ConnectionState = ConnectionState.DISCONNECTED
  private subscriptions = new Set<string>()
  private eventHandlers = new Map<string, EventHandler[]>()
  private reconnectAttempts = 0
  private heartbeatInterval: number | null = null
  private reconnectTimeout: number | null = null

  constructor(config: WebSocketClientConfig = {}) {
    this.config = {
      url: config.url || `ws://localhost:8080`,
      autoReconnect: config.autoReconnect ?? true,
      reconnectDelay: config.reconnectDelay || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 5,
      heartbeatInterval: config.heartbeatInterval || 30000,
      connectionTimeout: config.connectionTimeout || 10000,
      authToken: config.authToken || ''
    }
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          resolve()
          return
        }

        this.setState(ConnectionState.CONNECTING)
        
        this.ws = new WebSocket(this.config.url)

        // Set up event listeners
        this.ws.onopen = () => {
          this.setState(ConnectionState.CONNECTED)
          this.reconnectAttempts = 0
          this.startHeartbeat()
          
          // Authenticate if token provided
          if (this.config.authToken) {
            this.authenticate(this.config.authToken)
          }

          // Resubscribe to channels
          this.resubscribe()
          
          this.emit('connected')
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        this.ws.onclose = (event) => {
          this.handleClose(event.code, event.reason)
        }

        this.ws.onerror = (event) => {
          this.handleError(new Error('WebSocket connection error'))
          reject(new Error('WebSocket connection failed'))
        }

        // Connection timeout
        setTimeout(() => {
          if (this.state === ConnectionState.CONNECTING) {
            this.ws?.close()
            reject(new Error('Connection timeout'))
          }
        }, this.config.connectionTimeout)

      } catch (error) {
        this.setState(ConnectionState.ERROR)
        reject(error)
      }
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.config.autoReconnect = false
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }

    this.setState(ConnectionState.DISCONNECTED)
    this.emit('disconnected')
  }

  /**
   * Subscribe to a channel
   */
  subscribe(channel: string): void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.add(channel)
      
      if (this.isConnected()) {
        this.sendMessage({
          type: 'SUBSCRIPTION',
          channel,
          timestamp: new Date().toISOString()
        })
      }
    }
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channel: string): void {
    if (this.subscriptions.has(channel)) {
      this.subscriptions.delete(channel)
      
      if (this.isConnected()) {
        this.sendMessage({
          type: 'UNSUBSCRIPTION',
          channel,
          timestamp: new Date().toISOString()
        })
      }
    }
  }

  /**
   * Authenticate with server
   */
  authenticate(token: string): void {
    this.config.authToken = token
    
    if (this.isConnected()) {
      this.sendMessage({
        type: 'AUTHENTICATION',
        data: { token },
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Add event handler
   */
  on<T = any>(event: string, handler: EventHandler<T>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler)
  }

  /**
   * Add one-time event handler
   */
  once<T = any>(event: string, handler: EventHandler<T>): void {
    const oneTimeHandler = (data: T) => {
      handler(data)
      this.off(event, oneTimeHandler)
    }
    this.on(event, oneTimeHandler)
  }

  /**
   * Remove event handler
   */
  off<T = any>(event: string, handler?: EventHandler<T>): void {
    const handlers = this.eventHandlers.get(event)
    if (!handlers) return

    if (handler) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    } else {
      this.eventHandlers.set(event, [])
    }
  }

  /**
   * Add state change handler
   */
  onStateChange(handler: StateChangeHandler): void {
    this.on('stateChange', handler)
  }

  /**
   * Add error handler
   */
  onError(handler: ErrorHandler): void {
    this.on('error', handler)
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED && 
           this.ws && 
           this.ws.readyState === WebSocket.OPEN
  }

  /**
   * Get current state
   */
  getState(): ConnectionState {
    return this.state
  }

  /**
   * Get subscribed channels
   */
  getSubscriptions(): string[] {
    return Array.from(this.subscriptions)
  }

  /**
   * Handle incoming message
   */
  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data)

      switch (message.type) {
        case 'UPDATE':
          this.handleUpdate(message)
          break

        case 'SUBSCRIPTION':
          this.emit('subscribed', { channel: message.channel, data: message.data })
          break

        case 'UNSUBSCRIPTION':
          this.emit('unsubscribed', { channel: message.channel, data: message.data })
          break

        case 'AUTHENTICATION':
          this.emit('authenticated', message.data)
          break

        case 'HEARTBEAT':
          this.emit('heartbeat', message.data)
          break

        case 'ERROR':
          this.emit('error', new Error(message.error || 'Server error'))
          break

        default:
          console.warn('Unknown message type:', message.type)
      }

    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
      this.emit('error', new Error('Invalid message format'))
    }
  }

  /**
   * Handle real-time update
   */
  private handleUpdate(message: WebSocketMessage): void {
    const update = message.data as RealTimeUpdate<any>
    
    // Emit channel-specific event
    if (message.channel) {
      this.emit(`update:${message.channel}`, update)
    }

    // Emit entity-specific event
    if (update.entity) {
      this.emit(`update:${update.entity}`, update)
    }

    // Emit general update event
    this.emit('update', update)
  }

  /**
   * Handle connection close
   */
  private handleClose(code: number, reason: string): void {
    this.setState(ConnectionState.DISCONNECTED)
    this.stopHeartbeat()

    this.emit('disconnected', { code, reason })

    // Auto-reconnect if enabled
    if (this.config.autoReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect()
    }
  }

  /**
   * Handle connection error
   */
  private handleError(error: Error): void {
    this.setState(ConnectionState.ERROR)
    this.emit('error', error)
  }

  /**
   * Schedule reconnection
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) return

    this.setState(ConnectionState.RECONNECTING)
    this.reconnectAttempts++

    const delay = this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectTimeout = null
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error)
        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
          this.scheduleReconnect()
        } else {
          this.setState(ConnectionState.ERROR)
          this.emit('error', new Error('Max reconnection attempts reached'))
        }
      })
    }, delay)

    this.emit('reconnecting', { attempt: this.reconnectAttempts, delay })
  }

  /**
   * Resubscribe to all channels
   */
  private resubscribe(): void {
    for (const channel of this.subscriptions) {
      this.sendMessage({
        type: 'SUBSCRIPTION',
        channel,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()
    
    this.heartbeatInterval = window.setInterval(() => {
      if (this.isConnected()) {
        this.sendMessage({
          type: 'HEARTBEAT',
          timestamp: new Date().toISOString()
        })
      }
    }, this.config.heartbeatInterval)
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * Send message to server
   */
  private sendMessage(message: WebSocketMessage): void {
    if (!this.isConnected()) {
      console.warn('Cannot send message: not connected')
      return
    }

    try {
      this.ws!.send(JSON.stringify(message))
    } catch (error) {
      console.error('Error sending message:', error)
      this.emit('error', new Error('Failed to send message'))
    }
  }

  /**
   * Set connection state
   */
  private setState(state: ConnectionState): void {
    if (this.state !== state) {
      const previousState = this.state
      this.state = state
      this.emit('stateChange', { state, previousState })
    }
  }

  /**
   * Emit event to handlers
   */
  private emit<T = any>(event: string, data?: T): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }
  }
}

/**
 * WebSocket client factory
 */
export class WebSocketClientFactory {
  private static instances = new Map<string, RedundancyWebSocketClient>()

  /**
   * Get or create WebSocket client instance
   */
  static getInstance(config: WebSocketClientConfig = {}): RedundancyWebSocketClient {
    const key = config.url || 'default'
    
    if (!this.instances.has(key)) {
      this.instances.set(key, new RedundancyWebSocketClient(config))
    }

    return this.instances.get(key)!
  }

  /**
   * Remove client instance
   */
  static removeInstance(url?: string): void {
    const key = url || 'default'
    const client = this.instances.get(key)
    
    if (client) {
      client.disconnect()
      this.instances.delete(key)
    }
  }

  /**
   * Get all active instances
   */
  static getAllInstances(): RedundancyWebSocketClient[] {
    return Array.from(this.instances.values())
  }

  /**
   * Disconnect all instances
   */
  static disconnectAll(): void {
    for (const client of this.instances.values()) {
      client.disconnect()
    }
    this.instances.clear()
  }
}

/**
 * React hook for WebSocket connection
 */
export function useWebSocket(config?: WebSocketClientConfig) {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return {
      client: null,
      isConnected: false,
      state: ConnectionState.DISCONNECTED,
      connect: () => Promise.resolve(),
      disconnect: () => {},
      subscribe: () => {},
      unsubscribe: () => {},
      on: () => {},
      off: () => {}
    }
  }

  const client = WebSocketClientFactory.getInstance(config)

  return {
    client,
    isConnected: client.isConnected(),
    state: client.getState(),
    connect: () => client.connect(),
    disconnect: () => client.disconnect(),
    subscribe: (channel: string) => client.subscribe(channel),
    unsubscribe: (channel: string) => client.unsubscribe(channel),
    on: <T = any>(event: string, handler: EventHandler<T>) => client.on(event, handler),
    off: <T = any>(event: string, handler?: EventHandler<T>) => client.off(event, handler)
  }
}