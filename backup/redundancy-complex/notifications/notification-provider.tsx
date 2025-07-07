/**
 * Notification Provider
 * React context provider for notification system
 */

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import { 
  NotificationService,
  NotificationModel,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  NotificationPreferences,
  getNotificationService
} from './notification-service'
import { Priority } from '../models/interfaces'
import { withRedundancyFeature } from '../providers/RedundancyProvider'

/**
 * Notification context state
 */
interface NotificationState {
  notifications: NotificationModel[]
  unreadCount: number
  preferences: NotificationPreferences | null
  isLoading: boolean
  error: string | null
}

/**
 * Notification actions
 */
type NotificationAction =
  | { type: 'SET_NOTIFICATIONS'; payload: NotificationModel[] }
  | { type: 'ADD_NOTIFICATION'; payload: NotificationModel }
  | { type: 'UPDATE_NOTIFICATION'; payload: NotificationModel }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_PREFERENCES'; payload: NotificationPreferences }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

/**
 * Notification context
 */
interface NotificationContextType {
  state: NotificationState
  service: NotificationService
  createNotification: (params: {
    type: NotificationType
    priority: Priority
    title: string
    message: string
    data?: any
    channels?: NotificationChannel[]
  }) => Promise<void>
  markAsRead: (id: string) => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void
  getNotificationsByType: (type: NotificationType) => NotificationModel[]
  getNotificationsByStatus: (status: NotificationStatus) => NotificationModel[]
  getUnreadNotifications: () => NotificationModel[]
  getCriticalNotifications: () => NotificationModel[]
}

/**
 * Initial state
 */
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  preferences: null,
  isLoading: false,
  error: null
}

/**
 * Notification reducer
 */
function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => n.status !== NotificationStatus.READ).length
      }

    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications]
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => n.status !== NotificationStatus.READ).length
      }

    case 'UPDATE_NOTIFICATION':
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload.id ? action.payload : n
      )
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => n.status !== NotificationStatus.READ).length
      }

    case 'REMOVE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload)
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => n.status !== NotificationStatus.READ).length
      }

    case 'MARK_AS_READ':
      const readNotifications = state.notifications.map(n =>
        n.id === action.payload 
          ? { ...n, status: NotificationStatus.READ, readAt: new Date().toISOString() }
          : n
      )
      return {
        ...state,
        notifications: readNotifications,
        unreadCount: readNotifications.filter(n => n.status !== NotificationStatus.READ).length
      }

    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      }

    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: action.payload
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      }

    default:
      return state
  }
}

/**
 * Create notification context
 */
const NotificationContext = createContext<NotificationContextType | null>(null)

/**
 * Notification provider props
 */
interface NotificationProviderProps {
  children: React.ReactNode
  userId?: string
  maxNotifications?: number
  autoRefreshInterval?: number
}

/**
 * Notification provider component
 */
export const NotificationProvider = withRedundancyFeature<NotificationProviderProps>(
  'NotificationProvider',
  ({ children, userId, maxNotifications = 100, autoRefreshInterval = 30000 }) => {
    const [state, dispatch] = useReducer(notificationReducer, initialState)
    const serviceRef = useRef<NotificationService>(getNotificationService())
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // Initialize and cleanup
    useEffect(() => {
      const service = serviceRef.current

      // Load initial notifications
      loadNotifications()

      // Load user preferences
      if (userId) {
        const preferences = service.getUserPreferences(userId)
        dispatch({ type: 'SET_PREFERENCES', payload: preferences })
      }

      // Setup auto-refresh
      if (autoRefreshInterval > 0) {
        intervalRef.current = setInterval(loadNotifications, autoRefreshInterval)
      }

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }, [userId, autoRefreshInterval])

    /**
     * Load notifications from service
     */
    const loadNotifications = async (): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        
        const notifications = serviceRef.current.getUserNotifications(userId || 'system', {
          limit: maxNotifications
        })
        
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications })
        dispatch({ type: 'SET_ERROR', payload: null })
        
      } catch (error) {
        console.error('Failed to load notifications:', error)
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load notifications' })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    /**
     * Create new notification
     */
    const createNotification = async (params: {
      type: NotificationType
      priority: Priority
      title: string
      message: string
      data?: any
      channels?: NotificationChannel[]
    }): Promise<void> => {
      try {
        const notifications = await serviceRef.current.createNotification({
          ...params,
          userId
        })

        // Add in-app notifications to state
        notifications.forEach(notification => {
          if (notification.channel === NotificationChannel.IN_APP) {
            dispatch({ type: 'ADD_NOTIFICATION', payload: notification })
          }
        })

      } catch (error) {
        console.error('Failed to create notification:', error)
        dispatch({ type: 'SET_ERROR', payload: 'Failed to create notification' })
      }
    }

    /**
     * Mark notification as read
     */
    const markAsRead = (id: string): void => {
      const success = serviceRef.current.markAsRead(id)
      if (success) {
        dispatch({ type: 'MARK_AS_READ', payload: id })
      }
    }

    /**
     * Delete notification
     */
    const deleteNotification = (id: string): void => {
      const success = serviceRef.current.deleteNotification(id)
      if (success) {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
      }
    }

    /**
     * Clear all notifications
     */
    const clearAll = (): void => {
      if (userId) {
        serviceRef.current.clearUserNotifications(userId)
      }
      dispatch({ type: 'CLEAR_ALL' })
    }

    /**
     * Update user preferences
     */
    const updatePreferences = (preferences: Partial<NotificationPreferences>): void => {
      if (!userId) return

      serviceRef.current.setUserPreferences(userId, preferences)
      const updated = serviceRef.current.getUserPreferences(userId)
      dispatch({ type: 'SET_PREFERENCES', payload: updated })
    }

    /**
     * Get notifications by type
     */
    const getNotificationsByType = (type: NotificationType): NotificationModel[] => {
      return state.notifications.filter(n => n.type === type)
    }

    /**
     * Get notifications by status
     */
    const getNotificationsByStatus = (status: NotificationStatus): NotificationModel[] => {
      return state.notifications.filter(n => n.status === status)
    }

    /**
     * Get unread notifications
     */
    const getUnreadNotifications = (): NotificationModel[] => {
      return state.notifications.filter(n => n.status !== NotificationStatus.READ)
    }

    /**
     * Get critical notifications
     */
    const getCriticalNotifications = (): NotificationModel[] => {
      return state.notifications.filter(n => n.priority === Priority.CRITICAL)
    }

    const contextValue: NotificationContextType = {
      state,
      service: serviceRef.current,
      createNotification,
      markAsRead,
      deleteNotification,
      clearAll,
      updatePreferences,
      getNotificationsByType,
      getNotificationsByStatus,
      getUnreadNotifications,
      getCriticalNotifications
    }

    return React.createElement(
      NotificationContext.Provider,
      { value: contextValue },
      children
    )
  }
)

/**
 * Hook to use notification context
 */
export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

/**
 * Hook for notification creation shortcuts
 */
export function useNotificationHelpers() {
  const { createNotification } = useNotifications()

  const showAlert = (title: string, message: string, priority: Priority = Priority.MEDIUM) => {
    return createNotification({
      type: NotificationType.ALERT,
      priority,
      title,
      message
    })
  }

  const showSuccess = (title: string, message: string) => {
    return createNotification({
      type: NotificationType.CUSTOM,
      priority: Priority.LOW,
      title,
      message,
      data: { variant: 'success' }
    })
  }

  const showError = (title: string, message: string) => {
    return createNotification({
      type: NotificationType.ALERT,
      priority: Priority.HIGH,
      title,
      message,
      data: { variant: 'error' }
    })
  }

  const showWarning = (title: string, message: string) => {
    return createNotification({
      type: NotificationType.ALERT,
      priority: Priority.MEDIUM,
      title,
      message,
      data: { variant: 'warning' }
    })
  }

  const showInfo = (title: string, message: string) => {
    return createNotification({
      type: NotificationType.CUSTOM,
      priority: Priority.LOW,
      title,
      message,
      data: { variant: 'info' }
    })
  }

  return {
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}