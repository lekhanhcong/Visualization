'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { Theme } from '@/types'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'button' | 'dropdown' | 'radio'
  showLabel?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function ThemeToggle({
  className = '',
  size = 'md',
  variant = 'button',
  showLabel = false,
  position = 'top-right',
}: ThemeToggleProps) {
  const { theme, setTheme, isDarkMode, systemTheme } = useTheme()
  const [isOpen, setIsOpen] = React.useState(false)

  // Size configurations
  const sizes = {
    sm: {
      button: 'w-8 h-8',
      icon: 16,
      text: 'text-xs',
    },
    md: {
      button: 'w-10 h-10',
      icon: 20,
      text: 'text-sm',
    },
    lg: {
      button: 'w-12 h-12',
      icon: 24,
      text: 'text-base',
    },
  }

  // Position configurations
  const positions = {
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4',
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
  }

  const currentSize = sizes[size]

  // Get theme icon and label
  const getThemeIcon = (themeType: Theme) => {
    switch (themeType) {
      case 'light':
        return Sun
      case 'dark':
        return Moon
      case 'system':
        return Monitor
      default:
        return Sun
    }
  }

  const getThemeLabel = (themeType: Theme) => {
    switch (themeType) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'system':
        return `System (${systemTheme})`
      default:
        return 'Light'
    }
  }

  // Animation variants
  const buttonVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1.05, rotate: 5 },
    tap: { scale: 0.95, rotate: -5 },
  }

  const iconVariants = {
    initial: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 90, scale: 0.8 },
    enter: { opacity: 1, rotate: 0, scale: 1 },
  }

  // Cycle through themes
  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex]!)
  }

  // Button variant
  if (variant === 'button') {
    const CurrentIcon = getThemeIcon(theme)

    return (
      <motion.button
        className={`
          ${currentSize.button} 
          ${positions[position]}
          z-50
          bg-white dark:bg-slate-800 
          border border-gray-200 dark:border-slate-700
          rounded-full 
          shadow-lg 
          flex items-center justify-center
          hover:bg-gray-50 dark:hover:bg-slate-700
          transition-colors duration-200
          ${className}
        `}
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        onClick={cycleTheme}
        aria-label={`Switch to ${getThemeLabel(theme)} theme`}
        title={`Current: ${getThemeLabel(theme)}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            variants={iconVariants}
            initial="exit"
            animate="enter"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <CurrentIcon
              size={currentSize.icon}
              className={`${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}
            />
          </motion.div>
        </AnimatePresence>

        {/* Theme indicator dot */}
        <div className="absolute -bottom-1 -right-1">
          <div
            className={`w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
              theme === 'light'
                ? 'bg-yellow-400'
                : theme === 'dark'
                  ? 'bg-blue-600'
                  : 'bg-gray-500'
            }`}
          />
        </div>
      </motion.button>
    )
  }

  // Dropdown variant
  if (variant === 'dropdown') {
    const themes: Theme[] = ['light', 'dark', 'system']

    return (
      <div className={`relative ${className}`}>
        <motion.button
          className={`
            ${currentSize.button}
            bg-white dark:bg-slate-800 
            border border-gray-200 dark:border-slate-700
            rounded-lg 
            shadow-sm
            flex items-center justify-center
            hover:bg-gray-50 dark:hover:bg-slate-700
            transition-colors duration-200
          `}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Theme selector"
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              variants={iconVariants}
              initial="exit"
              animate="enter"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {React.createElement(getThemeIcon(theme), {
                size: currentSize.icon,
                className: isDarkMode ? 'text-slate-200' : 'text-slate-700',
              })}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute top-full mt-2 right-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg py-2 min-w-[120px] z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {themes.map((themeOption) => {
                const Icon = getThemeIcon(themeOption)
                const isSelected = theme === themeOption

                return (
                  <button
                    key={themeOption}
                    className={`
                      w-full px-3 py-2 text-left flex items-center gap-2
                      ${currentSize.text}
                      hover:bg-gray-50 dark:hover:bg-slate-700
                      ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'}
                      transition-colors duration-150
                    `}
                    onClick={() => {
                      setTheme(themeOption)
                      setIsOpen(false)
                    }}
                  >
                    <Icon size={currentSize.icon} />
                    <span>{getThemeLabel(themeOption)}</span>
                    {isSelected && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-blue-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Radio variant
  if (variant === 'radio') {
    const themes: Theme[] = ['light', 'dark', 'system']

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && (
          <span
            className={`${currentSize.text} font-medium text-gray-700 dark:text-slate-300`}
          >
            Theme:
          </span>
        )}
        <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
          {themes.map((themeOption) => {
            const Icon = getThemeIcon(themeOption)
            const isSelected = theme === themeOption

            return (
              <motion.button
                key={themeOption}
                className={`
                  relative px-3 py-1.5 rounded-md flex items-center gap-2
                  ${currentSize.text}
                  transition-all duration-200
                  ${
                    isSelected
                      ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 shadow-sm'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                  }
                `}
                onClick={() => setTheme(themeOption)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={currentSize.icon} />
                {showLabel && <span>{getThemeLabel(themeOption)}</span>}

                {isSelected && (
                  <motion.div
                    className="absolute inset-0 bg-blue-500/10 rounded-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    layoutId="theme-selector"
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  return null
}
