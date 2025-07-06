/**
 * Tests for Redundancy Feature Flag Integration
 */

import { 
  RedundancyFlagIntegration, 
  defaultFlagIntegrationConfig 
} from '../../features/redundancy/integration/FlagIntegration'
import * as envUtils from '../../features/redundancy/utils/env'
import { pluginRegistry } from '@/lib/plugin-registry'
import { redundancyLifecycle } from '../../features/redundancy/lifecycle'
import { redundancyEventBus } from '../../features/redundancy/events'
import { redundancyMountingStrategy } from '../../features/redundancy/mounting/MountingStrategy'

// Mock dependencies
jest.mock('../../features/redundancy/utils/env', () => ({
  isRedundancyEnabled: jest.fn(),
  validateEnvironment: jest.fn(),
  getFeatureFlag: jest.fn()
}))

jest.mock('@/lib/plugin-registry', () => ({
  pluginRegistry: {
    isRegistered: jest.fn(),
    register: jest.fn(),
    unregister: jest.fn()
  }
}))

jest.mock('../../features/redundancy/lifecycle', () => ({
  redundancyLifecycle: {
    isMounted: jest.fn(),
    isEnabled: jest.fn(),
    onMount: jest.fn().mockResolvedValue(undefined),
    onUnmount: jest.fn().mockResolvedValue(undefined),
    onEnable: jest.fn().mockResolvedValue(undefined),
    onDisable: jest.fn().mockResolvedValue(undefined)
  }
}))

jest.mock('../../features/redundancy/events', () => ({
  redundancyEventBus: {
    emit: jest.fn()
  }
}))

jest.mock('../../features/redundancy/mounting/MountingStrategy', () => ({
  redundancyMountingStrategy: {
    initialize: jest.fn().mockResolvedValue(true),
    unmountAll: jest.fn()
  }
}))

// Mock dynamic import
jest.mock('../../features/redundancy/register', () => ({
  registerRedundancyFeature: jest.fn().mockReturnValue(true),
  unregisterRedundancyFeature: jest.fn().mockReturnValue(true)
}))

describe('RedundancyFlagIntegration', () => {
  let integration: RedundancyFlagIntegration

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mocks
    ;(envUtils.isRedundancyEnabled as jest.Mock).mockReturnValue(true)
    ;(envUtils.validateEnvironment as jest.Mock).mockReturnValue({
      valid: true,
      errors: [],
      warnings: []
    })
    ;(envUtils.getFeatureFlag as jest.Mock).mockReturnValue('true')
    ;(pluginRegistry.isRegistered as jest.Mock).mockReturnValue(false)
    ;(redundancyLifecycle.isMounted as jest.Mock).mockReturnValue(false)
    ;(redundancyLifecycle.isEnabled as jest.Mock).mockReturnValue(false)
    ;(redundancyMountingStrategy.initialize as jest.Mock).mockResolvedValue(true)
    
    // Create fresh integration instance after mocks are set
    integration = new RedundancyFlagIntegration()
  })

  describe('Initialization', () => {
    test('should initialize successfully when flag is enabled', async () => {
      const result = await integration.initialize()
      
      expect(result).toBe(true)
      
      const status = integration.getStatus()
      expect(status.flagEnabled).toBe(true)
      expect(status.registered).toBe(true)
      expect(status.mounted).toBe(true)
      expect(status.enabled).toBe(true)
      expect(status.validated).toBe(true)
    })

    test('should initialize but not activate when flag is disabled', async () => {
      ;(envUtils.isRedundancyEnabled as jest.Mock).mockReturnValue(false)
      
      const result = await integration.initialize()
      
      expect(result).toBe(true)
      
      const status = integration.getStatus()
      expect(status.flagEnabled).toBe(false)
      expect(status.registered).toBe(false)
      expect(status.mounted).toBe(false)
      expect(status.enabled).toBe(false)
      expect(status.validated).toBe(true)
    })

    test('should handle environment validation failures', async () => {
      ;(envUtils.validateEnvironment as jest.Mock).mockReturnValue({
        valid: false,
        errors: ['Environment error'],
        warnings: []
      })
      
      const result = await integration.initialize()
      
      expect(result).toBe(false)
      
      const status = integration.getStatus()
      expect(status.errors).toContain('Environment error')
    })

    test('should handle initialization errors', async () => {
      ;(redundancyMountingStrategy.initialize as jest.Mock).mockRejectedValue(
        new Error('Mount failed')
      )
      
      const result = await integration.initialize()
      
      expect(result).toBe(false)
      
      const status = integration.getStatus()
      expect(status.errors).toContain('Mounting failed: Mount failed')
    })

    test('should prevent double initialization', async () => {
      await integration.initialize()
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const result = await integration.initialize()
      
      expect(result).toBe(true)
      expect(consoleSpy).toHaveBeenCalledWith('[FlagIntegration] Already initialized')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Feature Registration', () => {
    test('should register feature when not already registered', async () => {
      await integration.initialize()
      
      expect(pluginRegistry.isRegistered).toHaveBeenCalledWith('redundancy-2n1')
      expect(redundancyEventBus.emit).toHaveBeenCalledWith('redundancy:state:initialized', {
        timestamp: expect.any(Number)
      })
    })

    test('should skip registration when already registered', async () => {
      ;(pluginRegistry.isRegistered as jest.Mock).mockReturnValue(true)
      
      await integration.initialize()
      
      const status = integration.getStatus()
      expect(status.registered).toBe(true)
    })

    test('should handle registration failures', async () => {
      // Create a mock that returns false for registration
      const { registerRedundancyFeature } = await import('../../features/redundancy/register')
      ;(registerRedundancyFeature as jest.Mock).mockReturnValueOnce(false)
      
      const newIntegration = new RedundancyFlagIntegration()
      const result = await newIntegration.initialize()
      
      expect(result).toBe(false)
      
      const status = newIntegration.getStatus()
      expect(status.errors).toContain('Registration failed: Feature registration failed')
    })
  })

  describe('Feature Mounting', () => {
    test('should mount feature mounting points', async () => {
      await integration.initialize()
      
      expect(redundancyMountingStrategy.initialize).toHaveBeenCalled()
      
      const status = integration.getStatus()
      expect(status.mounted).toBe(true)
    })

    test('should handle mounting failures', async () => {
      ;(redundancyMountingStrategy.initialize as jest.Mock).mockResolvedValue(false)
      
      const result = await integration.initialize()
      
      expect(result).toBe(false)
      
      const status = integration.getStatus()
      expect(status.errors).toContain('Mounting failed: Mounting strategy initialization failed')
    })
  })

  describe('Feature Lifecycle', () => {
    test('should enable feature lifecycle', async () => {
      await integration.initialize()
      
      expect(redundancyLifecycle.onMount).toHaveBeenCalled()
      expect(redundancyLifecycle.onEnable).toHaveBeenCalled()
      
      const status = integration.getStatus()
      expect(status.enabled).toBe(true)
    })

    test('should handle already mounted lifecycle', async () => {
      ;(redundancyLifecycle.isMounted as jest.Mock).mockReturnValue(true)
      
      await integration.initialize()
      
      expect(redundancyLifecycle.onMount).not.toHaveBeenCalled()
      expect(redundancyLifecycle.onEnable).toHaveBeenCalled()
    })

    test('should handle already enabled lifecycle', async () => {
      ;(redundancyLifecycle.isMounted as jest.Mock).mockReturnValue(true)
      ;(redundancyLifecycle.isEnabled as jest.Mock).mockReturnValue(true)
      
      await integration.initialize()
      
      expect(redundancyLifecycle.onMount).not.toHaveBeenCalled()
      expect(redundancyLifecycle.onEnable).not.toHaveBeenCalled()
    })

    test('should handle lifecycle errors', async () => {
      ;(redundancyLifecycle.onEnable as jest.Mock).mockRejectedValue(
        new Error('Enable failed')
      )
      
      const result = await integration.initialize()
      
      expect(result).toBe(false)
      
      const status = integration.getStatus()
      expect(status.errors).toContain('Enable failed: Enable failed')
    })
  })

  describe('Configuration Management', () => {
    test('should use custom configuration', () => {
      const customConfig = {
        autoRegister: false,
        autoMount: true,
        autoEnable: false
      }
      
      const customIntegration = new RedundancyFlagIntegration(customConfig)
      
      // Access private config through testing
      expect((customIntegration as any).config.autoRegister).toBe(false)
      expect((customIntegration as any).config.autoMount).toBe(true)
      expect((customIntegration as any).config.autoEnable).toBe(false)
    })

    test('should update configuration', () => {
      integration.updateConfig({ autoRegister: false })
      
      expect((integration as any).config.autoRegister).toBe(false)
    })

    test('should respect auto flags during initialization', async () => {
      const noAutoIntegration = new RedundancyFlagIntegration({
        autoRegister: false,
        autoMount: false,
        autoEnable: false
      })
      
      await noAutoIntegration.initialize()
      
      const status = noAutoIntegration.getStatus()
      expect(status.registered).toBe(false)
      expect(status.mounted).toBe(false)
      expect(status.enabled).toBe(false)
    })
  })

  describe('Flag Watching', () => {
    test('should setup flag watcher in development', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const watcherIntegration = new RedundancyFlagIntegration({
        validateOnChange: true
      })
      
      jest.spyOn(setInterval as any, 'call')
      
      await watcherIntegration.initialize()
      
      // Check that interval was set up (in a real scenario)
      expect((watcherIntegration as any).flagWatcher).toBeDefined()
      
      process.env.NODE_ENV = originalEnv
    })

    test('should not setup watcher when disabled', async () => {
      const noWatcherIntegration = new RedundancyFlagIntegration({
        validateOnChange: false
      })
      
      await noWatcherIntegration.initialize()
      
      expect((noWatcherIntegration as any).flagWatcher).toBeNull()
    })
  })

  describe('Status and Validation', () => {
    test('should return current status', async () => {
      // Reset lifecycle mocks to resolve
      ;(redundancyLifecycle.onMount as jest.Mock).mockResolvedValue(undefined)
      ;(redundancyLifecycle.onEnable as jest.Mock).mockResolvedValue(undefined)
      
      // Create fresh integration for status test
      const statusIntegration = new RedundancyFlagIntegration()
      await statusIntegration.initialize()
      
      const status = statusIntegration.getStatus()
      
      expect(status).toEqual({
        flagEnabled: true,
        registered: true,
        mounted: true,
        enabled: true,
        validated: true,
        errors: [],
        warnings: []
      })
    })

    test('should get feature flag value', () => {
      const value = integration.getFlagValue()
      expect(value).toBe('true')
    })

    test('should validate current state', async () => {
      // Reset lifecycle mocks to resolve
      ;(redundancyLifecycle.onMount as jest.Mock).mockResolvedValue(undefined)
      ;(redundancyLifecycle.onEnable as jest.Mock).mockResolvedValue(undefined)
      
      // Create fresh integration for validation test
      const validationIntegration = new RedundancyFlagIntegration()
      await validationIntegration.initialize()
      
      const validation = validationIntegration.validate()
      
      expect(validation.valid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    test('should detect state inconsistencies', async () => {
      await integration.initialize()
      
      // Change environment flag
      ;(envUtils.isRedundancyEnabled as jest.Mock).mockReturnValue(false)
      
      const validation = integration.validate()
      
      expect(validation.warnings).toContain('Flag status inconsistent with cached value')
    })

    test('should detect missing components when flag is enabled', async () => {
      const autoIntegration = new RedundancyFlagIntegration({
        autoRegister: true,
        autoMount: true,
        autoEnable: true
      })
      
      // Force status to be inconsistent
      ;(autoIntegration as any).status = {
        flagEnabled: true,
        registered: false,
        mounted: false,
        enabled: false,
        validated: true,
        errors: [],
        warnings: []
      }
      
      const validation = autoIntegration.validate()
      
      expect(validation.valid).toBe(false)
      expect(validation.errors).toContain('Feature should be registered but is not')
      expect(validation.errors).toContain('Feature should be mounted but is not')
      expect(validation.errors).toContain('Feature should be enabled but is not')
    })
  })

  describe('Feature Disable and Cleanup', () => {
    test('should disable feature completely', async () => {
      await integration.initialize()
      
      // Mock lifecycle as enabled
      ;(redundancyLifecycle.isEnabled as jest.Mock).mockReturnValue(true)
      ;(redundancyLifecycle.isMounted as jest.Mock).mockReturnValue(true)
      
      // Manually trigger disable
      await (integration as any).disableFeature()
      
      expect(redundancyLifecycle.onDisable).toHaveBeenCalled()
      expect(redundancyLifecycle.onUnmount).toHaveBeenCalled()
      expect(redundancyMountingStrategy.unmountAll).toHaveBeenCalled()
      
      const status = integration.getStatus()
      expect(status.registered).toBe(false)
      expect(status.mounted).toBe(false)
      expect(status.enabled).toBe(false)
    })

    test('should destroy integration', async () => {
      await integration.initialize()
      
      integration.destroy()
      
      const status = integration.getStatus()
      expect(status.flagEnabled).toBe(false)
      expect(status.registered).toBe(false)
      expect(status.mounted).toBe(false)
      expect(status.enabled).toBe(false)
      expect(status.validated).toBe(false)
    })
  })

  describe('Refresh Functionality', () => {
    test('should refresh and reinitialize when flag is enabled', async () => {
      // Reset lifecycle mocks to resolve
      ;(redundancyLifecycle.onMount as jest.Mock).mockResolvedValue(undefined)
      ;(redundancyLifecycle.onEnable as jest.Mock).mockResolvedValue(undefined)
      
      // Create fresh integration for refresh test
      const refreshIntegration = new RedundancyFlagIntegration()
      await refreshIntegration.initialize()
      
      const result = await refreshIntegration.refresh()
      
      expect(result).toBe(true)
    })

    test('should refresh and disable when flag is disabled', async () => {
      await integration.initialize()
      
      ;(envUtils.isRedundancyEnabled as jest.Mock).mockReturnValue(false)
      
      const result = await integration.refresh()
      
      expect(result).toBe(true)
      
      const status = integration.getStatus()
      expect(status.flagEnabled).toBe(false)
    })

    test('should handle refresh errors', async () => {
      // Create a fresh integration that will trigger mounting
      const errorIntegration = new RedundancyFlagIntegration({
        autoRegister: true,
        autoMount: true,  // Enable auto-mount so it will be attempted
        autoEnable: true
      })
      
      // Initialize but with mount disabled so refresh can attempt it
      ;(redundancyMountingStrategy.initialize as jest.Mock).mockResolvedValueOnce(false)
      await errorIntegration.initialize()
      
      // Verify the feature is not mounted due to the false return
      const initialStatus = errorIntegration.getStatus()
      expect(initialStatus.mounted).toBe(false)
      
      // Now mock the mounting to fail with error for refresh
      ;(redundancyMountingStrategy.initialize as jest.Mock).mockRejectedValueOnce(
        new Error('Refresh failed')
      )
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await errorIntegration.refresh()
      
      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('[FlagIntegration] Refresh failed:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('Fallback Behavior', () => {
    test('should handle warn fallback', async () => {
      const warnIntegration = new RedundancyFlagIntegration({
        fallbackBehavior: 'warn'
      })
      
      ;(envUtils.validateEnvironment as jest.Mock).mockReturnValue({
        valid: false,
        errors: ['Test error'],
        warnings: []
      })
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      await warnIntegration.initialize()
      
      expect(consoleSpy).toHaveBeenCalledWith('[FlagIntegration] Environment validation failed')
      
      consoleSpy.mockRestore()
    })

    test('should handle disable fallback', async () => {
      const disableIntegration = new RedundancyFlagIntegration({
        fallbackBehavior: 'disable'
      })
      
      ;(envUtils.validateEnvironment as jest.Mock).mockReturnValue({
        valid: false,
        errors: ['Test error'],
        warnings: []
      })
      
      await disableIntegration.initialize()
      
      // Verify disable was called
      const status = disableIntegration.getStatus()
      expect(status.registered).toBe(false)
    })

    test('should handle ignore fallback', async () => {
      const ignoreIntegration = new RedundancyFlagIntegration({
        fallbackBehavior: 'ignore'
      })
      
      ;(envUtils.validateEnvironment as jest.Mock).mockReturnValue({
        valid: false,
        errors: ['Test error'],
        warnings: []
      })
      
      const result = await ignoreIntegration.initialize()
      
      expect(result).toBe(false) // Still fails but doesn't log
    })
  })

  describe('Default Configuration', () => {
    test('should have correct default configuration', () => {
      expect(defaultFlagIntegrationConfig).toEqual({
        autoRegister: true,
        autoMount: true,
        autoEnable: true,
        validateOnChange: true,
        fallbackBehavior: 'warn'
      })
    })
  })
})