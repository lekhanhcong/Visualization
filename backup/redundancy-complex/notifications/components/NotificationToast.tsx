/**
 * Notification Toast
 * Toast notification component for displaying alerts
 */

import React, { useState, useEffect } from 'react'
import { NotificationModel, NotificationStatus } from '../notification-service'
import { Priority } from '../../models/interfaces'
import { withRedundancyFeature } from '../../providers/RedundancyProvider'

/**
 * Toast props
 */
interface NotificationToastProps {
  notification: NotificationModel
  onClose?: (id: string) => void
  onRead?: (id: string) => void
  autoClose?: boolean
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  showActions?: boolean
}

/**
 * Toast notification component
 */
export const NotificationToast = withRedundancyFeature<NotificationToastProps>(
  'NotificationToast',
  ({ 
    notification, 
    onClose, 
    onRead, 
    autoClose = true, 
    duration = 5000,
    position = 'top-right',
    showActions = true
  }) => {
    const [isVisible, setIsVisible] = useState(true)
    const [isRemoving, setIsRemoving] = useState(false)
    const [progress, setProgress] = useState(100)

    // Auto-close timer
    useEffect(() => {
      if (!autoClose || notification.priority === Priority.CRITICAL) return

      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100))
          if (newProgress <= 0) {
            handleAutoClose()
            return 0
          }
          return newProgress
        })
      }, 100)

      return () => clearInterval(interval)
    }, [autoClose, duration, notification.priority])

    /**
     * Handle auto close
     */
    const handleAutoClose = (): void => {
      setIsRemoving(true)
      setTimeout(() => {
        setIsVisible(false)
        onClose?.(notification.id)
      }, 300)
    }

    /**
     * Handle manual close
     */
    const handleClose = (): void => {
      setIsRemoving(true)
      setTimeout(() => {
        setIsVisible(false)
        onClose?.(notification.id)
      }, 300)
    }

    /**
     * Handle mark as read
     */
    const handleMarkAsRead = (): void => {
      onRead?.(notification.id)
    }

    /**
     * Get toast styles based on priority and status
     */
    const getToastStyles = (): string => {
      const baseStyles = `
        rdx-notification-toast
        fixed z-50 max-w-sm p-4 mb-4 rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out
        ${isRemoving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `

      // Position styles
      const positionStyles = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
        'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
      }

      // Priority color styles
      const priorityStyles = {
        [Priority.CRITICAL]: 'bg-red-900 border border-red-700 text-red-100',
        [Priority.HIGH]: 'bg-orange-900 border border-orange-700 text-orange-100',
        [Priority.MEDIUM]: 'bg-blue-900 border border-blue-700 text-blue-100',
        [Priority.LOW]: 'bg-gray-800 border border-gray-600 text-gray-100'
      }

      return `${baseStyles} ${positionStyles[position]} ${priorityStyles[notification.priority]}`
    }

    /**
     * Get priority icon
     */
    const getPriorityIcon = (): string => {
      switch (notification.priority) {
        case Priority.CRITICAL: return '🚨'
        case Priority.HIGH: return '⚠️'
        case Priority.MEDIUM: return 'ℹ️'
        case Priority.LOW: return '💡'
        default: return 'ℹ️'
      }
    }

    /**
     * Get progress bar color
     */
    const getProgressColor = (): string => {
      switch (notification.priority) {
        case Priority.CRITICAL: return 'bg-red-500'
        case Priority.HIGH: return 'bg-orange-500'
        case Priority.MEDIUM: return 'bg-blue-500'
        case Priority.LOW: return 'bg-gray-500'
        default: return 'bg-blue-500'
      }
    }

    if (!isVisible) return null

    return React.createElement('div', {
      className: getToastStyles(),
      'data-testid': `notification-toast-${notification.id}`,
      'data-priority': notification.priority,
      'data-type': notification.type
    }, [
      // Header
      React.createElement('div', {
        key: 'header',
        className: 'flex items-start justify-between'
      }, [
        React.createElement('div', {
          key: 'content',
          className: 'flex items-start space-x-2 flex-1'
        }, [
          React.createElement('span', {
            key: 'icon',
            className: 'text-lg flex-shrink-0'
          }, getPriorityIcon()),
          React.createElement('div', {
            key: 'text',
            className: 'flex-1 min-w-0'
          }, [
            React.createElement('h4', {
              key: 'title',
              className: 'text-sm font-semibold truncate'
            }, notification.title),
            React.createElement('p', {
              key: 'message',
              className: 'text-xs mt-1 opacity-90 line-clamp-2'
            }, notification.message)
          ])
        ]),
        showActions && React.createElement('div', {
          key: 'actions',
          className: 'flex items-center space-x-1 ml-2'
        }, [
          notification.status !== NotificationStatus.READ && React.createElement('button', {
            key: 'read',
            onClick: handleMarkAsRead,
            className: 'p-1 rounded hover:bg-white hover:bg-opacity-20 transition-colors',
            title: 'Mark as read'
          }, '👁️'),
          React.createElement('button', {
            key: 'close',
            onClick: handleClose,
            className: 'p-1 rounded hover:bg-white hover:bg-opacity-20 transition-colors',
            title: 'Close'
          }, '✕')
        ])
      ]),

      // Metadata
      notification.data && React.createElement('div', {
        key: 'metadata',
        className: 'mt-2 text-xs opacity-70'
      }, [
        notification.sourceType && React.createElement('span', {
          key: 'source',
          className: 'inline-block'
        }, `Source: ${notification.sourceType}`),
        notification.createdAt && React.createElement('span', {
          key: 'time',
          className: 'inline-block ml-2'
        }, new Date(notification.createdAt).toLocaleTimeString())
      ]),

      // Progress bar for auto-close
      autoClose && notification.priority !== Priority.CRITICAL && React.createElement('div', {
        key: 'progress',
        className: 'absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-20 rounded-b-lg overflow-hidden'
      }, [
        React.createElement('div', {
          key: 'progress-bar',
          className: `h-full transition-all duration-100 ease-linear ${getProgressColor()}`,
          style: { width: `${progress}%` }
        })
      ])
    ])
  }
)

/**
 * Toast container component
 */
interface NotificationToastContainerProps {
  notifications: NotificationModel[]
  onClose?: (id: string) => void
  onRead?: (id: string) => void
  maxToasts?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  autoClose?: boolean
  duration?: number
}

export const NotificationToastContainer = withRedundancyFeature<NotificationToastContainerProps>(
  'NotificationToastContainer',
  ({ 
    notifications, 
    onClose, 
    onRead, 
    maxToasts = 5,
    position = 'top-right',
    autoClose = true,
    duration = 5000
  }) => {
    // Filter and limit notifications to show as toasts
    const toastNotifications = notifications
      .filter(n => 
        n.status !== NotificationStatus.READ && 
        n.status !== NotificationStatus.EXPIRED &&
        n.channel === 'IN_APP'
      )
      .slice(0, maxToasts)
      .sort((a, b) => {
        // Sort by priority first, then by creation time
        const priorityOrder = { 
          [Priority.CRITICAL]: 4, 
          [Priority.HIGH]: 3, 
          [Priority.MEDIUM]: 2, 
          [Priority.LOW]: 1 
        }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

    if (toastNotifications.length === 0) return null

    return React.createElement('div', {
      className: 'rdx-notification-toast-container fixed z-50 pointer-events-none',
      'data-testid': 'notification-toast-container',
      'data-position': position
    }, 
      toastNotifications.map((notification, index) =>
        React.createElement(NotificationToast, {
          key: notification.id,
          notification,
          onClose,
          onRead,
          position,
          autoClose,
          duration: duration + (index * 1000), // Stagger auto-close times
          style: {
            pointerEvents: 'auto',
            zIndex: 1000 - index // Ensure proper stacking
          }
        })
      )
    )
  }
)