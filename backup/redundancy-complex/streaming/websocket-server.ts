/**
 * WebSocket Server
 * Real-time data streaming server for redundancy feature
 */

import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { 
  WebSocketMessage, 
  RealTimeUpdate, 
  SubstationModel, 
  LineModel, 
  SystemHealthModel 
} from '../models/interfaces'

/**
 * WebSocket connection interface
 */
export interface WebSocketConnection {
  id: string
  ws: WebSocket
  userId?: string
  subscriptions: Set<string>
  lastPing: number
  metadata: {
    userAgent?: string
    ip?: string
    connectedAt: number
  }
}

/**
 * Subscription channels
 */
export enum StreamingChannel {
  SUBSTATIONS = 'substations',
  LINES = 'lines',
  SYSTEM_HEALTH = 'system-health',
  ALERTS = 'alerts',
  EVENTS = 'events',
  POWER_FLOWS = 'power-flows',
  ALL = 'all'
}

/**
 * WebSocket message types
 */
export enum MessageType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  UNSUBSCRIPTION = 'UNSUBSCRIPTION',
  UPDATE = 'UPDATE',
  ERROR = 'ERROR',
  HEARTBEAT = 'HEARTBEAT',
  AUTHENTICATION = 'AUTHENTICATION'
}

/**
 * WebSocket server configuration
 */
export interface WebSocketServerConfig {
  port?: number
  heartbeatInterval?: number
  connectionTimeout?: number
  maxConnections?: number
  enableCompression?: boolean
  authenticateConnections?: boolean
}

/**
 * Real-time WebSocket server
 */
export class RedundancyWebSocketServer {
  private wss: WebSocketServer | null = null
  private connections = new Map<string, WebSocketConnection>()
  private subscriptions = new Map<string, Set<string>>() // channel -> connection IDs
  private heartbeatInterval: NodeJS.Timeout | null = null
  private config: Required<WebSocketServerConfig>

  constructor(config: WebSocketServerConfig = {}) {
    this.config = {
      port: config.port || 8080,
      heartbeatInterval: config.heartbeatInterval || 30000, // 30 seconds
      connectionTimeout: config.connectionTimeout || 60000, // 1 minute
      maxConnections: config.maxConnections || 1000,
      enableCompression: config.enableCompression || true,
      authenticateConnections: config.authenticateConnections || false
    }
  }

  /**
   * Start the WebSocket server
   */
  async start(): Promise<void> {
    try {
      this.wss = new WebSocketServer({
        port: this.config.port,
        perMessageDeflate: this.config.enableCompression
      })

      this.wss.on('connection', this.handleConnection.bind(this))
      this.wss.on('error', this.handleServerError.bind(this))

      // Start heartbeat interval
      this.startHeartbeat()

      console.log(`🔄 WebSocket server started on port ${this.config.port}`)
      
    } catch (error) {
      console.error('❌ Failed to start WebSocket server:', error)
      throw error
    }
  }

  /**
   * Stop the WebSocket server
   */
  async stop(): Promise<void> {
    try {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval)
        this.heartbeatInterval = null
      }

      // Close all connections
      for (const connection of this.connections.values()) {
        this.closeConnection(connection.id, 1001, 'Server shutting down')
      }

      if (this.wss) {
        this.wss.close()
        this.wss = null
      }

      console.log('🛑 WebSocket server stopped')
      
    } catch (error) {
      console.error('❌ Error stopping WebSocket server:', error)
    }
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket, request: IncomingMessage): void {
    try {
      // Check connection limit
      if (this.connections.size >= this.config.maxConnections) {
        ws.close(1013, 'Maximum connections exceeded')
        return
      }

      const connectionId = this.generateConnectionId()
      const connection: WebSocketConnection = {
        id: connectionId,
        ws,
        subscriptions: new Set(),
        lastPing: Date.now(),
        metadata: {
          userAgent: request.headers['user-agent'],
          ip: request.headers['x-forwarded-for'] as string || request.socket.remoteAddress,
          connectedAt: Date.now()
        }
      }

      this.connections.set(connectionId, connection)

      // Setup connection event handlers
      ws.on('message', (data) => this.handleMessage(connectionId, data))
      ws.on('close', (code, reason) => this.handleConnectionClose(connectionId, code, reason))
      ws.on('error', (error) => this.handleConnectionError(connectionId, error))
      ws.on('pong', () => this.handlePong(connectionId))

      // Send welcome message
      this.sendMessage(connectionId, {
        type: MessageType.HEARTBEAT,
        data: {
          connectionId,
          serverTime: new Date().toISOString(),
          availableChannels: Object.values(StreamingChannel)
        },
        timestamp: new Date().toISOString()
      })

      console.log(`🔗 New WebSocket connection: ${connectionId} from ${connection.metadata.ip}`)

    } catch (error) {
      console.error('❌ Error handling new connection:', error)
      ws.close(1011, 'Internal server error')
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(connectionId: string, data: Buffer | string): void {
    try {
      const connection = this.connections.get(connectionId)
      if (!connection) return

      const message = JSON.parse(data.toString()) as WebSocketMessage

      switch (message.type) {
        case MessageType.SUBSCRIPTION:
          this.handleSubscription(connectionId, message.channel!, message.data)
          break

        case MessageType.UNSUBSCRIPTION:
          this.handleUnsubscription(connectionId, message.channel!)
          break

        case MessageType.AUTHENTICATION:
          this.handleAuthentication(connectionId, message.data)
          break

        case MessageType.HEARTBEAT:
          this.handleHeartbeat(connectionId)
          break

        default:
          this.sendError(connectionId, `Unknown message type: ${message.type}`)
      }

    } catch (error) {
      console.error(`❌ Error handling message from ${connectionId}:`, error)
      this.sendError(connectionId, 'Invalid message format')
    }
  }

  /**
   * Handle subscription request
   */
  private handleSubscription(connectionId: string, channel: string, data?: any): void {
    try {
      const connection = this.connections.get(connectionId)
      if (!connection) return

      // Validate channel
      if (!Object.values(StreamingChannel).includes(channel as StreamingChannel)) {
        this.sendError(connectionId, `Invalid channel: ${channel}`)
        return
      }

      // Check authentication requirements
      if (this.config.authenticateConnections && !connection.userId) {
        this.sendError(connectionId, 'Authentication required for subscriptions')
        return
      }

      // Add subscription
      connection.subscriptions.add(channel)

      // Add to channel subscriptions
      if (!this.subscriptions.has(channel)) {
        this.subscriptions.set(channel, new Set())
      }
      this.subscriptions.get(channel)!.add(connectionId)

      // Send confirmation
      this.sendMessage(connectionId, {
        type: MessageType.SUBSCRIPTION,
        channel,
        data: { status: 'subscribed', channel },
        timestamp: new Date().toISOString()
      })

      console.log(`📡 Connection ${connectionId} subscribed to ${channel}`)

      // Send initial data if available
      this.sendInitialData(connectionId, channel)

    } catch (error) {
      console.error(`❌ Error handling subscription for ${connectionId}:`, error)
      this.sendError(connectionId, 'Subscription failed')
    }
  }

  /**
   * Handle unsubscription request
   */
  private handleUnsubscription(connectionId: string, channel: string): void {
    try {
      const connection = this.connections.get(connectionId)
      if (!connection) return

      // Remove subscription
      connection.subscriptions.delete(channel)

      // Remove from channel subscriptions
      const channelSubs = this.subscriptions.get(channel)
      if (channelSubs) {
        channelSubs.delete(connectionId)
        if (channelSubs.size === 0) {
          this.subscriptions.delete(channel)
        }
      }

      // Send confirmation
      this.sendMessage(connectionId, {
        type: MessageType.UNSUBSCRIPTION,
        channel,
        data: { status: 'unsubscribed', channel },
        timestamp: new Date().toISOString()
      })

      console.log(`📡 Connection ${connectionId} unsubscribed from ${channel}`)

    } catch (error) {
      console.error(`❌ Error handling unsubscription for ${connectionId}:`, error)
    }
  }

  /**
   * Handle authentication
   */
  private handleAuthentication(connectionId: string, data: any): void {
    try {
      const connection = this.connections.get(connectionId)
      if (!connection) return

      // In a real implementation, validate the token/credentials
      const { token } = data || {}
      
      if (!token) {
        this.sendError(connectionId, 'Authentication token required')
        return
      }

      // Mock authentication - replace with real JWT validation
      const userId = this.validateAuthToken(token)
      
      if (userId) {
        connection.userId = userId
        
        this.sendMessage(connectionId, {
          type: MessageType.AUTHENTICATION,
          data: { status: 'authenticated', userId },
          timestamp: new Date().toISOString()
        })

        console.log(`🔐 Connection ${connectionId} authenticated as user ${userId}`)
      } else {
        this.sendError(connectionId, 'Invalid authentication token')
      }

    } catch (error) {
      console.error(`❌ Error handling authentication for ${connectionId}:`, error)
      this.sendError(connectionId, 'Authentication failed')
    }
  }

  /**
   * Handle heartbeat
   */
  private handleHeartbeat(connectionId: string): void {
    const connection = this.connections.get(connectionId)
    if (!connection) return

    connection.lastPing = Date.now()

    this.sendMessage(connectionId, {
      type: MessageType.HEARTBEAT,
      data: { 
        status: 'alive', 
        serverTime: new Date().toISOString(),
        connectionId 
      },
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Handle connection close
   */
  private handleConnectionClose(connectionId: string, code: number, reason: Buffer): void {
    this.cleanupConnection(connectionId)
    console.log(`🔌 Connection ${connectionId} closed: ${code} ${reason.toString()}`)
  }

  /**
   * Handle connection error
   */
  private handleConnectionError(connectionId: string, error: Error): void {
    console.error(`❌ Connection ${connectionId} error:`, error)
    this.cleanupConnection(connectionId)
  }

  /**
   * Handle pong response
   */
  private handlePong(connectionId: string): void {
    const connection = this.connections.get(connectionId)
    if (connection) {
      connection.lastPing = Date.now()
    }
  }

  /**
   * Handle server error
   */
  private handleServerError(error: Error): void {
    console.error('❌ WebSocket server error:', error)
  }

  /**
   * Send message to specific connection
   */
  private sendMessage(connectionId: string, message: WebSocketMessage): void {
    try {
      const connection = this.connections.get(connectionId)
      if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
        return
      }

      const messageStr = JSON.stringify(message)
      connection.ws.send(messageStr)

    } catch (error) {
      console.error(`❌ Error sending message to ${connectionId}:`, error)
      this.cleanupConnection(connectionId)
    }
  }

  /**
   * Send error message
   */
  private sendError(connectionId: string, error: string): void {
    this.sendMessage(connectionId, {
      type: MessageType.ERROR,
      error,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Broadcast update to channel subscribers
   */
  public broadcastUpdate<T>(channel: StreamingChannel, update: RealTimeUpdate<T>): void {
    try {
      const subscribers = this.subscriptions.get(channel)
      if (!subscribers || subscribers.size === 0) return

      const message: WebSocketMessage = {
        type: MessageType.UPDATE,
        channel,
        data: update,
        timestamp: new Date().toISOString()
      }

      for (const connectionId of subscribers) {
        this.sendMessage(connectionId, message)
      }

      // Also send to 'all' channel subscribers
      if (channel !== StreamingChannel.ALL) {
        const allSubscribers = this.subscriptions.get(StreamingChannel.ALL)
        if (allSubscribers) {
          for (const connectionId of allSubscribers) {
            this.sendMessage(connectionId, message)
          }
        }
      }

      console.log(`📢 Broadcasted update to ${channel}: ${subscribers.size} subscribers`)

    } catch (error) {
      console.error(`❌ Error broadcasting to ${channel}:`, error)
    }
  }

  /**
   * Broadcast substation update
   */
  public broadcastSubstationUpdate(type: 'CREATE' | 'UPDATE' | 'DELETE', substation: SubstationModel): void {
    this.broadcastUpdate(StreamingChannel.SUBSTATIONS, {
      type,
      entity: 'substation',
      id: substation.id,
      data: substation,
      timestamp: new Date().toISOString(),
      source: 'api'
    })
  }

  /**
   * Broadcast line update
   */
  public broadcastLineUpdate(type: 'CREATE' | 'UPDATE' | 'DELETE', line: LineModel): void {
    this.broadcastUpdate(StreamingChannel.LINES, {
      type,
      entity: 'line',
      id: line.id,
      data: line,
      timestamp: new Date().toISOString(),
      source: 'api'
    })
  }

  /**
   * Broadcast system health update
   */
  public broadcastSystemHealthUpdate(health: SystemHealthModel): void {
    this.broadcastUpdate(StreamingChannel.SYSTEM_HEALTH, {
      type: 'UPDATE',
      entity: 'system-health',
      id: 'current',
      data: health,
      timestamp: new Date().toISOString(),
      source: 'monitoring'
    })
  }

  /**
   * Send initial data for new subscription
   */
  private async sendInitialData(connectionId: string, channel: string): Promise<void> {
    try {
      // In a real implementation, fetch current data from repositories
      // For now, send a placeholder
      const initialData = {
        channel,
        message: `Initial data for ${channel}`,
        timestamp: new Date().toISOString()
      }

      this.sendMessage(connectionId, {
        type: MessageType.UPDATE,
        channel,
        data: initialData,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error(`❌ Error sending initial data for ${channel}:`, error)
    }
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now()
      const deadConnections: string[] = []

      for (const [connectionId, connection] of this.connections) {
        const timeSinceLastPing = now - connection.lastPing

        if (timeSinceLastPing > this.config.connectionTimeout) {
          deadConnections.push(connectionId)
        } else if (connection.ws.readyState === WebSocket.OPEN) {
          // Send ping
          try {
            connection.ws.ping()
          } catch (error) {
            deadConnections.push(connectionId)
          }
        }
      }

      // Clean up dead connections
      for (const connectionId of deadConnections) {
        this.cleanupConnection(connectionId)
      }

    }, this.config.heartbeatInterval)
  }

  /**
   * Clean up connection
   */
  private cleanupConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId)
    if (!connection) return

    // Remove from all subscriptions
    for (const channel of connection.subscriptions) {
      const channelSubs = this.subscriptions.get(channel)
      if (channelSubs) {
        channelSubs.delete(connectionId)
        if (channelSubs.size === 0) {
          this.subscriptions.delete(channel)
        }
      }
    }

    // Close WebSocket if still open
    if (connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.close(1000, 'Connection cleanup')
    }

    // Remove connection
    this.connections.delete(connectionId)
  }

  /**
   * Close specific connection
   */
  private closeConnection(connectionId: string, code: number, reason: string): void {
    const connection = this.connections.get(connectionId)
    if (!connection) return

    try {
      connection.ws.close(code, reason)
    } catch (error) {
      console.error(`❌ Error closing connection ${connectionId}:`, error)
    }

    this.cleanupConnection(connectionId)
  }

  /**
   * Generate unique connection ID
   */
  private generateConnectionId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Validate authentication token (mock implementation)
   */
  private validateAuthToken(token: string): string | null {
    // In a real implementation, validate JWT token
    if (token === 'mock-token') {
      return 'user-123'
    }
    return null
  }

  /**
   * Get server statistics
   */
  public getStats(): {
    totalConnections: number
    authenticatedConnections: number
    totalSubscriptions: number
    subscriptionsByChannel: Record<string, number>
    uptime: number
  } {
    const authenticated = Array.from(this.connections.values()).filter(c => c.userId).length
    const subscriptionsByChannel: Record<string, number> = {}

    for (const [channel, subscribers] of this.subscriptions) {
      subscriptionsByChannel[channel] = subscribers.size
    }

    return {
      totalConnections: this.connections.size,
      authenticatedConnections: authenticated,
      totalSubscriptions: Array.from(this.connections.values()).reduce((sum, c) => sum + c.subscriptions.size, 0),
      subscriptionsByChannel,
      uptime: process.uptime()
    }
  }
}