/**
 * Tests for environment variable functionality
 */

import {
  isRedundancyEnabled,
  getFeatureFlag,
  validateEnvironment,
} from '../../features/redundancy/utils/env'

describe('Environment Variable Tests', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('Flag ON test scenario', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY = 'true'
    })

    test('should return true when flag is enabled', () => {
      expect(isRedundancyEnabled()).toBe(true)
    })

    test('should return true flag value', () => {
      expect(getFeatureFlag()).toBe('true')
    })

    test('should validate as valid environment', () => {
      const result = validateEnvironment()
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Flag OFF test scenario', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY = 'false'
    })

    test('should return false when flag is disabled', () => {
      expect(isRedundancyEnabled()).toBe(false)
    })

    test('should return false flag value', () => {
      expect(getFeatureFlag()).toBe('false')
    })

    test('should validate as valid environment', () => {
      const result = validateEnvironment()
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Verify no core app modification', () => {
    test('should handle missing environment variable', () => {
      delete process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY

      expect(isRedundancyEnabled()).toBe(false)
      expect(getFeatureFlag()).toBeUndefined()

      const result = validateEnvironment()
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        'NEXT_PUBLIC_ENABLE_REDUNDANCY is not defined'
      )
    })

    test('should handle invalid environment variable values', () => {
      process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY = 'invalid'

      expect(isRedundancyEnabled()).toBe(false)

      const result = validateEnvironment()
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        'NEXT_PUBLIC_ENABLE_REDUNDANCY must be "true" or "false"'
      )
    })

    test('should not affect other environment variables', () => {
      const testVar = 'TEST_VAR'
      process.env[testVar] = 'test_value'
      process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY = 'true'

      expect(process.env[testVar]).toBe('test_value')
      expect(isRedundancyEnabled()).toBe(true)
    })
  })
})
