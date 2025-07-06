/**
 * Tests for Redundancy Dependency Manager
 */

import { 
  RedundancyDependencyManager,
  defaultDependencyConfig
} from '../../features/redundancy/dependencies/DependencyManager'
import type { 
  FeatureDependency, 
  DependencyManagerConfig 
} from '../../features/redundancy/dependencies/DependencyManager'

describe('RedundancyDependencyManager', () => {
  let manager: RedundancyDependencyManager
  
  beforeEach(() => {
    manager = new RedundancyDependencyManager()
  })

  afterEach(() => {
    manager.clear()
  })

  describe('Dependency Registration', () => {
    test('should register a single dependency', () => {
      const dependency: FeatureDependency = {
        id: 'test-dep',
        name: 'Test Dependency',
        required: true,
        loadOrder: 1,
        checkFunction: () => true
      }

      manager.registerDependency(dependency)
      
      expect(manager.isDependencyResolved('test-dep')).toBe(false) // Not resolved yet
    })

    test('should register multiple dependencies', () => {
      const dependencies: FeatureDependency[] = [
        {
          id: 'dep-1',
          name: 'Dependency 1',
          required: true,
          loadOrder: 1
        },
        {
          id: 'dep-2',
          name: 'Dependency 2',
          required: false,
          loadOrder: 2
        }
      ]

      manager.registerDependencies(dependencies)
      
      expect(manager.getResolvedCount()).toBe(0)
      expect(manager.getFailedCount()).toBe(0)
    })
  })

  describe('Dependency Resolution', () => {
    test('should resolve all dependencies successfully', async () => {
      const dependencies: FeatureDependency[] = [
        {
          id: 'dep-1',
          name: 'Dependency 1',
          required: true,
          loadOrder: 1,
          checkFunction: () => true
        },
        {
          id: 'dep-2',
          name: 'Dependency 2',
          required: false,
          loadOrder: 2,
          checkFunction: () => true
        }
      ]

      manager.registerDependencies(dependencies)
      const result = await manager.resolveAll()
      
      expect(result).toBe(true)
      expect(manager.areAllResolved()).toBe(true)
      expect(manager.getResolvedCount()).toBe(2)
      expect(manager.getFailedCount()).toBe(0)
    })

    test('should handle dependency resolution failures', async () => {
      const dependencies: FeatureDependency[] = [
        {
          id: 'failing-dep',
          name: 'Failing Dependency',
          required: false,
          loadOrder: 1,
          checkFunction: () => {
            throw new Error('Dependency check failed')
          }
        },
        {
          id: 'passing-dep',
          name: 'Passing Dependency',
          required: true,
          loadOrder: 2,
          checkFunction: () => true
        }
      ]

      manager.registerDependencies(dependencies)
      const result = await manager.resolveAll()
      
      expect(result).toBe(true) // Should continue with warn strategy
      expect(manager.getResolvedCount()).toBe(1)
      expect(manager.getFailedCount()).toBe(1)
      
      const failedResolution = manager.getDependencyResolution('failing-dep')
      expect(failedResolution?.resolved).toBe(false)
      expect(failedResolution?.error).toBe('Dependency check failed')
    })

    test('should handle required dependency failures', async () => {
      const failConfig: DependencyManagerConfig = {
        ...defaultDependencyConfig,
        failureStrategy: 'fail'
      }
      
      const failManager = new RedundancyDependencyManager(failConfig)
      
      const dependency: FeatureDependency = {
        id: 'required-failing',
        name: 'Required Failing Dependency',
        required: true,
        loadOrder: 1,
        checkFunction: () => false
      }

      failManager.registerDependency(dependency)
      
      await expect(failManager.resolveAll()).rejects.toThrow('Required dependency failed: required-failing')
    })

    test('should resolve in correct load order', async () => {
      const loadOrder: string[] = []
      
      const dependencies: FeatureDependency[] = [
        {
          id: 'dep-3',
          name: 'Dependency 3',
          required: true,
          loadOrder: 3,
          checkFunction: () => {
            loadOrder.push('dep-3')
            return true
          }
        },
        {
          id: 'dep-1',
          name: 'Dependency 1',
          required: true,
          loadOrder: 1,
          checkFunction: () => {
            loadOrder.push('dep-1')
            return true
          }
        },
        {
          id: 'dep-2',
          name: 'Dependency 2',
          required: true,
          loadOrder: 2,
          checkFunction: () => {
            loadOrder.push('dep-2')
            return true
          }
        }
      ]

      manager.registerDependencies(dependencies)
      await manager.resolveAll()
      
      expect(loadOrder).toEqual(['dep-1', 'dep-2', 'dep-3'])
    })
  })

  describe('Fallback Handling', () => {
    test('should use fallback when main resolution fails', async () => {
      let fallbackCalled = false
      
      const dependency: FeatureDependency = {
        id: 'fallback-dep',
        name: 'Fallback Dependency',
        required: true,
        loadOrder: 1,
        checkFunction: () => false,
        fallbackHandler: () => {
          fallbackCalled = true
        }
      }

      manager.registerDependency(dependency)
      const result = await manager.resolveAll()
      
      expect(result).toBe(true)
      expect(fallbackCalled).toBe(true)
      
      const resolution = manager.getDependencyResolution('fallback-dep')
      expect(resolution?.resolved).toBe(true)
      expect(resolution?.fallbackUsed).toBe(true)
    })

    test('should handle fallback failures', async () => {
      const dependency: FeatureDependency = {
        id: 'failing-fallback',
        name: 'Failing Fallback Dependency',
        required: false,
        loadOrder: 1,
        checkFunction: () => false,
        fallbackHandler: () => {
          throw new Error('Fallback failed')
        }
      }

      manager.registerDependency(dependency)
      const result = await manager.resolveAll()
      
      expect(result).toBe(true) // Should continue with warn strategy
      
      const resolution = manager.getDependencyResolution('failing-fallback')
      expect(resolution?.resolved).toBe(false)
      expect(resolution?.fallbackUsed).toBe(false)
    })
  })

  describe('Async Dependency Resolution', () => {
    test('should handle async check functions', async () => {
      const dependency: FeatureDependency = {
        id: 'async-dep',
        name: 'Async Dependency',
        required: true,
        loadOrder: 1,
        checkFunction: async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
          return true
        }
      }

      manager.registerDependency(dependency)
      const result = await manager.resolveAll()
      
      expect(result).toBe(true)
      expect(manager.isDependencyResolved('async-dep')).toBe(true)
      
      const resolution = manager.getDependencyResolution('async-dep')
      expect(resolution?.loadTime).toBeGreaterThan(90)
    })

    test('should handle async fallback handlers', async () => {
      let fallbackCalled = false
      
      const dependency: FeatureDependency = {
        id: 'async-fallback',
        name: 'Async Fallback Dependency',
        required: true,
        loadOrder: 1,
        checkFunction: () => false,
        fallbackHandler: async () => {
          await new Promise(resolve => setTimeout(resolve, 50))
          fallbackCalled = true
        }
      }

      manager.registerDependency(dependency)
      const result = await manager.resolveAll()
      
      expect(result).toBe(true)
      expect(fallbackCalled).toBe(true)
    })

    test('should respect timeout configuration', async () => {
      const timeoutManager = new RedundancyDependencyManager({
        timeout: 100,
        failureStrategy: 'warn'
      })
      
      const dependency: FeatureDependency = {
        id: 'timeout-dep',
        name: 'Timeout Dependency',
        required: false,
        loadOrder: 1,
        checkFunction: async () => {
          await new Promise(resolve => setTimeout(resolve, 200))
          return true
        }
      }

      timeoutManager.registerDependency(dependency)
      const result = await timeoutManager.resolveAll()
      
      expect(result).toBe(true) // Continues with warn strategy
      expect(timeoutManager.isDependencyResolved('timeout-dep')).toBe(false)
      
      const resolution = timeoutManager.getDependencyResolution('timeout-dep')
      expect(resolution?.error).toBe('Dependency resolution timeout')
    })
  })

  describe('Retry Logic', () => {
    test('should retry failed attempts', async () => {
      let attempts = 0
      
      const retryManager = new RedundancyDependencyManager({
        retryAttempts: 2,
        retryDelay: 10,
        failureStrategy: 'warn'
      })
      
      const dependency: FeatureDependency = {
        id: 'retry-dep',
        name: 'Retry Dependency',
        required: false,
        loadOrder: 1,
        checkFunction: () => {
          attempts++
          if (attempts < 3) {
            throw new Error('Not ready yet')
          }
          return true
        }
      }

      retryManager.registerDependency(dependency)
      const result = await retryManager.resolveAll()
      
      expect(result).toBe(true)
      expect(attempts).toBe(3) // Initial + 2 retries
      expect(retryManager.isDependencyResolved('retry-dep')).toBe(true)
    })

    test('should fail after max retries', async () => {
      let attempts = 0
      
      const retryManager = new RedundancyDependencyManager({
        retryAttempts: 2,
        retryDelay: 10,
        failureStrategy: 'warn'
      })
      
      const dependency: FeatureDependency = {
        id: 'always-fail',
        name: 'Always Fail Dependency',
        required: false,
        loadOrder: 1,
        checkFunction: () => {
          attempts++
          throw new Error('Always fails')
        }
      }

      retryManager.registerDependency(dependency)
      const result = await retryManager.resolveAll()
      
      expect(result).toBe(true) // Continues with warn strategy
      expect(attempts).toBe(3) // Initial + 2 retries
      expect(retryManager.isDependencyResolved('always-fail')).toBe(false)
    })
  })

  describe('State Management', () => {
    test('should track resolution state correctly', async () => {
      const dependency: FeatureDependency = {
        id: 'state-dep',
        name: 'State Dependency',
        required: true,
        loadOrder: 1,
        checkFunction: () => true
      }

      manager.registerDependency(dependency)
      
      expect(manager.areAllResolved()).toBe(false)
      expect(manager.getResolvedCount()).toBe(0)
      
      await manager.resolveAll()
      
      expect(manager.areAllResolved()).toBe(true)
      expect(manager.getResolvedCount()).toBe(1)
      expect(manager.getFailedCount()).toBe(0)
    })

    test('should prevent double resolution', async () => {
      let checkCount = 0
      
      const dependency: FeatureDependency = {
        id: 'double-resolve',
        name: 'Double Resolve Dependency',
        required: true,
        loadOrder: 1,
        checkFunction: () => {
          checkCount++
          return true
        }
      }

      manager.registerDependency(dependency)
      
      await manager.resolveAll()
      await manager.resolveAll() // Second call should be ignored
      
      expect(checkCount).toBe(1)
    })

    test('should clear state correctly', async () => {
      const dependency: FeatureDependency = {
        id: 'clear-test',
        name: 'Clear Test Dependency',
        required: true,
        loadOrder: 1,
        checkFunction: () => true
      }

      manager.registerDependency(dependency)
      await manager.resolveAll()
      
      expect(manager.getResolvedCount()).toBe(1)
      
      manager.clear()
      
      expect(manager.getResolvedCount()).toBe(0)
      expect(manager.areAllResolved()).toBe(false)
    })

    test('should reset resolution state', async () => {
      const dependency: FeatureDependency = {
        id: 'reset-test',
        name: 'Reset Test Dependency',
        required: true,
        loadOrder: 1,
        checkFunction: () => true
      }

      manager.registerDependency(dependency)
      await manager.resolveAll()
      
      expect(manager.getResolvedCount()).toBe(1)
      
      manager.reset()
      
      expect(manager.getResolvedCount()).toBe(0)
      expect(manager.areAllResolved()).toBe(false)
      
      // Should be able to resolve again
      await manager.resolveAll()
      expect(manager.getResolvedCount()).toBe(1)
    })
  })

  describe('Configuration Management', () => {
    test('should use custom configuration', () => {
      const customConfig = {
        timeout: 10000,
        retryAttempts: 5,
        failureStrategy: 'fail' as const
      }
      
      const customManager = new RedundancyDependencyManager(customConfig)
      const config = customManager.getConfig()
      
      expect(config.timeout).toBe(10000)
      expect(config.retryAttempts).toBe(5)
      expect(config.failureStrategy).toBe('fail')
    })

    test('should update configuration', () => {
      manager.updateConfig({ timeout: 8000 })
      
      const config = manager.getConfig()
      expect(config.timeout).toBe(8000)
    })
  })

  describe('Validation', () => {
    test('should validate dependencies successfully', () => {
      const dependencies: FeatureDependency[] = [
        {
          id: 'valid-dep-1',
          name: 'Valid Dependency 1',
          required: true,
          loadOrder: 1,
          checkFunction: () => true
        },
        {
          id: 'valid-dep-2',
          name: 'Valid Dependency 2',
          required: false,
          loadOrder: 2
        }
      ]

      manager.registerDependencies(dependencies)
      const validation = manager.validateDependencies()
      
      expect(validation.valid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    test('should detect duplicate load orders', () => {
      const dependencies: FeatureDependency[] = [
        {
          id: 'dup-1',
          name: 'Duplicate 1',
          required: true,
          loadOrder: 1
        },
        {
          id: 'dup-2',
          name: 'Duplicate 2',
          required: false,
          loadOrder: 1
        }
      ]

      manager.registerDependencies(dependencies)
      const validation = manager.validateDependencies()
      
      expect(validation.warnings).toContain('Dependencies dup-1 and dup-2 have same load order')
    })

    test('should warn about required dependencies without checks', () => {
      const dependency: FeatureDependency = {
        id: 'no-check',
        name: 'No Check Dependency',
        required: true,
        loadOrder: 1
        // No checkFunction or fallbackHandler
      }

      manager.registerDependency(dependency)
      const validation = manager.validateDependencies()
      
      expect(validation.warnings).toContain('Required dependency no-check has no check function or fallback')
    })
  })

  describe('Utility Methods', () => {
    test('should get unresolved required dependencies', async () => {
      const dependencies: FeatureDependency[] = [
        {
          id: 'required-pass',
          name: 'Required Pass',
          required: true,
          loadOrder: 1,
          checkFunction: () => true
        },
        {
          id: 'required-fail',
          name: 'Required Fail',
          required: true,
          loadOrder: 2,
          checkFunction: () => false
        },
        {
          id: 'optional-fail',
          name: 'Optional Fail',
          required: false,
          loadOrder: 3,
          checkFunction: () => false
        }
      ]

      manager.registerDependencies(dependencies)
      await manager.resolveAll()
      
      const unresolved = manager.getUnresolvedRequired()
      expect(unresolved).toHaveLength(1)
      expect(unresolved[0].id).toBe('required-fail')
    })

    test('should get all resolutions', async () => {
      const dependency: FeatureDependency = {
        id: 'all-resolutions',
        name: 'All Resolutions Test',
        required: true,
        loadOrder: 1,
        checkFunction: () => true
      }

      manager.registerDependency(dependency)
      await manager.resolveAll()
      
      const resolutions = manager.getAllResolutions()
      expect(resolutions).toHaveLength(1)
      expect(resolutions[0].dependency.id).toBe('all-resolutions')
      expect(resolutions[0].resolved).toBe(true)
    })
  })

  describe('Default Configuration', () => {
    test('should have correct default configuration', () => {
      expect(defaultDependencyConfig).toEqual({
        autoResolve: true,
        timeout: 5000,
        retryAttempts: 3,
        retryDelay: 1000,
        failureStrategy: 'warn'
      })
    })
  })
})