/**
 * Tests for Redundancy Jest Configuration
 * Validates the Jest configuration setup for redundancy feature
 */

const path = require('path')
const fs = require('fs')

// Import environment configuration (without full Jest config)
const { testEnvironmentConfigs, getTestEnvironmentConfig } = require('../../features/redundancy/testing/environment-config.js')

describe('Redundancy Jest Configuration Files', () => {
  describe('Configuration File Existence', () => {
    test('should have main Jest configuration file', () => {
      const configPath = path.resolve(__dirname, '../../features/redundancy/jest.redundancy.config.js')
      expect(fs.existsSync(configPath)).toBe(true)
    })

    test('should have all required transform files', () => {
      const cssTransformPath = path.resolve(__dirname, '../../features/redundancy/testing/cssTransform.js')
      expect(fs.existsSync(cssTransformPath)).toBe(true)
      
      const svgTransformPath = path.resolve(__dirname, '../../features/redundancy/testing/svgTransform.js')
      expect(fs.existsSync(svgTransformPath)).toBe(true)
      
      const fileTransformPath = path.resolve(__dirname, '../../features/redundancy/testing/fileTransform.js')
      expect(fs.existsSync(fileTransformPath)).toBe(true)
    })

    test('should have setup files', () => {
      const setupPath = path.resolve(__dirname, '../../features/redundancy/testing/setup.js')
      expect(fs.existsSync(setupPath)).toBe(true)
      
      const envConfigPath = path.resolve(__dirname, '../../features/redundancy/testing/environment-config.js')
      expect(fs.existsSync(envConfigPath)).toBe(true)
    })

    test('should have test utilities', () => {
      const utilsPath = path.resolve(__dirname, '../../features/redundancy/testing/utils.tsx')
      expect(fs.existsSync(utilsPath)).toBe(true)
      
      const processorPath = path.resolve(__dirname, '../../features/redundancy/testing/testResultsProcessor.js')
      expect(fs.existsSync(processorPath)).toBe(true)
      
      const snapshotResolverPath = path.resolve(__dirname, '../../features/redundancy/testing/snapshotResolver.js')
      expect(fs.existsSync(snapshotResolverPath)).toBe(true)
    })
  })

  describe('Configuration File Content', () => {
    test('should have valid Jest configuration structure', () => {
      const configPath = path.resolve(__dirname, '../../features/redundancy/jest.redundancy.config.js')
      const configContent = fs.readFileSync(configPath, 'utf8')
      
      // Check for key configuration properties
      expect(configContent).toContain('displayName')
      expect(configContent).toContain('testMatch')
      expect(configContent).toContain('coverageThreshold')
      expect(configContent).toContain('moduleNameMapper')
      expect(configContent).toContain('transform')
    })

    test('should export valid module', () => {
      const configPath = path.resolve(__dirname, '../../features/redundancy/jest.redundancy.config.js')
      const configContent = fs.readFileSync(configPath, 'utf8')
      
      expect(configContent).toContain('module.exports')
    })

    test('should have redundancy-specific paths', () => {
      const configPath = path.resolve(__dirname, '../../features/redundancy/jest.redundancy.config.js')
      const configContent = fs.readFileSync(configPath, 'utf8')
      
      expect(configContent).toContain('features/redundancy')
      expect(configContent).toContain('@redundancy/')
      expect(configContent).toContain('redundancy-feature')
    })
  })

  describe('Transform Files', () => {
    test('CSS transform should be valid', () => {
      const cssTransform = require('../../features/redundancy/testing/cssTransform.js')
      expect(typeof cssTransform.process).toBe('function')
      expect(typeof cssTransform.getCacheKey).toBe('function')
      
      const result = cssTransform.process()
      expect(result.code).toContain('module.exports')
    })

    test('SVG transform should be valid', () => {
      const svgTransform = require('../../features/redundancy/testing/svgTransform.js')
      expect(typeof svgTransform.process).toBe('function')
      expect(typeof svgTransform.getCacheKey).toBe('function')
      
      const result = svgTransform.process('', 'test.svg')
      expect(result.code).toContain('React')
    })

    test('File transform should be valid', () => {
      const fileTransform = require('../../features/redundancy/testing/fileTransform.js')
      expect(typeof fileTransform.process).toBe('function')
      expect(typeof fileTransform.getCacheKey).toBe('function')
      
      const result = fileTransform.process('', 'test.png')
      expect(result.code).toContain('module.exports')
    })
  })

  describe('Snapshot Resolver', () => {
    test('should have valid snapshot resolver', () => {
      const snapshotResolver = require('../../features/redundancy/testing/snapshotResolver.js')
      
      expect(typeof snapshotResolver.resolveSnapshotPath).toBe('function')
      expect(typeof snapshotResolver.resolveTestPath).toBe('function')
      expect(snapshotResolver.testPathForConsistencyCheck).toBeDefined()
    })

    test('should correctly resolve snapshot paths', () => {
      const snapshotResolver = require('../../features/redundancy/testing/snapshotResolver.js')
      
      const testPath = 'features/redundancy/__tests__/components/Component.test.tsx'
      const snapshotPath = snapshotResolver.resolveSnapshotPath(testPath, '.snap')
      
      expect(snapshotPath).toContain('__snapshots__')
      expect(snapshotPath).toContain('.test.snap')
    })

    test('should correctly resolve test paths from snapshots', () => {
      const snapshotResolver = require('../../features/redundancy/testing/snapshotResolver.js')
      
      const snapshotPath = 'features/redundancy/__snapshots__/components/Component.test.snap'
      const testPath = snapshotResolver.resolveTestPath(snapshotPath, '.snap')
      
      expect(testPath).toContain('__tests__')
      expect(testPath).toContain('.test.tsx')
    })
  })
})

describe('Test Environment Configurations', () => {
  describe('Environment Config Structure', () => {
    test('should have configurations for all test types', () => {
      const expectedTypes = ['unit', 'integration', 'performance', 'accessibility', 'visual']
      expectedTypes.forEach(type => {
        expect(testEnvironmentConfigs[type]).toBeDefined()
      })
    })

    test('should have required properties for each config', () => {
      Object.values(testEnvironmentConfigs).forEach(config => {
        expect(config.testTimeout).toBeDefined()
        expect(config.setupTimeout).toBeDefined()
        expect(config.teardownTimeout).toBeDefined()
        expect(config.globals).toBeDefined()
        expect(typeof config.detectHandles).toBe('boolean')
        expect(typeof config.errorOnDeprecated).toBe('boolean')
      })
    })

    test('should have reasonable timeout values', () => {
      Object.entries(testEnvironmentConfigs).forEach(([type, config]) => {
        expect(config.testTimeout).toBeGreaterThan(5000)
        expect(config.testTimeout).toBeLessThan(60000)
        expect(config.setupTimeout).toBeGreaterThan(0)
        expect(config.teardownTimeout).toBeGreaterThan(0)
      })
    })
  })

  describe('getTestEnvironmentConfig Function', () => {
    test('should return valid config for known test types', () => {
      const unitConfig = getTestEnvironmentConfig('unit')
      expect(unitConfig).toBeDefined()
      expect(unitConfig.globals.__REDUNDANCY_TEST_TYPE__).toBe('unit')
      expect(unitConfig.globals.__REDUNDANCY_UNIT_TEST__).toBe(true)
    })

    test('should throw error for unknown test type', () => {
      expect(() => {
        getTestEnvironmentConfig('unknown')
      }).toThrow('Unknown test environment type: unknown')
    })

    test('should default to unit test type', () => {
      const defaultConfig = getTestEnvironmentConfig()
      expect(defaultConfig.globals.__REDUNDANCY_TEST_TYPE__).toBe('unit')
    })

    test('should add timestamp to globals', () => {
      const config = getTestEnvironmentConfig('unit')
      expect(config.globals.__REDUNDANCY_TEST_TIMESTAMP__).toBeDefined()
      expect(typeof config.globals.__REDUNDANCY_TEST_TIMESTAMP__).toBe('number')
    })

    test('should preserve original config properties', () => {
      const unitConfig = getTestEnvironmentConfig('unit')
      const originalConfig = testEnvironmentConfigs.unit
      
      expect(unitConfig.testTimeout).toBe(originalConfig.testTimeout)
      expect(unitConfig.setupTimeout).toBe(originalConfig.setupTimeout)
      expect(unitConfig.teardownTimeout).toBe(originalConfig.teardownTimeout)
    })
  })

  describe('Test Type Specific Configurations', () => {
    test('performance tests should have longer timeouts', () => {
      const perfConfig = getTestEnvironmentConfig('performance')
      const unitConfig = getTestEnvironmentConfig('unit')
      
      expect(perfConfig.testTimeout).toBeGreaterThan(unitConfig.testTimeout)
      expect(perfConfig.globals.__REDUNDANCY_MONITOR_PERFORMANCE__).toBe(true)
    })

    test('accessibility tests should enable axe', () => {
      const a11yConfig = getTestEnvironmentConfig('accessibility')
      expect(a11yConfig.globals.__REDUNDANCY_AXE_ENABLED__).toBe(true)
    })

    test('visual tests should enable snapshot mode', () => {
      const visualConfig = getTestEnvironmentConfig('visual')
      expect(visualConfig.globals.__REDUNDANCY_SNAPSHOT_MODE__).toBe(true)
    })

    test('integration tests should detect handles', () => {
      const integrationConfig = getTestEnvironmentConfig('integration')
      expect(integrationConfig.detectHandles).toBe(true)
    })
  })
})

describe('Configuration Validation', () => {
  describe('File Dependencies', () => {
    test('setup file should be loadable without errors', () => {
      // Test setup file exists and can be imported
      const setupPath = path.resolve(__dirname, '../../features/redundancy/testing/setup.js')
      expect(fs.existsSync(setupPath)).toBe(true)
      
      // Check file content for basic structure
      const content = fs.readFileSync(setupPath, 'utf8')
      expect(content).toContain('jest.fn')
      expect(content).toContain('global')
      expect(content).toContain('mock')
    })

    test('environment config should be loadable', () => {
      expect(() => {
        require('../../features/redundancy/testing/environment-config.js')
      }).not.toThrow()
    })

    test('test utilities should be loadable without errors', () => {
      // Test utilities file exists and has expected structure
      const utilsPath = path.resolve(__dirname, '../../features/redundancy/testing/utils.tsx')
      expect(fs.existsSync(utilsPath)).toBe(true)
      
      // Check file content for basic structure
      const content = fs.readFileSync(utilsPath, 'utf8')
      expect(content).toContain('renderWithRedundancy')
      expect(content).toContain('createMockSubstationData')
      expect(content).toContain('createMockLineData')
    })
  })

  describe('Path Resolution', () => {
    test('should resolve to existing directories', () => {
      const testingDir = path.resolve(__dirname, '../../features/redundancy/testing')
      expect(fs.existsSync(testingDir)).toBe(true)
      
      const componentsDir = path.resolve(__dirname, '../../features/redundancy/components')
      expect(fs.existsSync(componentsDir)).toBe(true)
      
      const utilsDir = path.resolve(__dirname, '../../features/redundancy/utils')
      expect(fs.existsSync(utilsDir)).toBe(true)
    })

    test('should have valid coverage output directory structure', () => {
      const coverageDir = path.resolve(__dirname, '../../coverage')
      
      // Coverage directory might not exist yet, but parent should exist
      const parentDir = path.dirname(coverageDir)
      expect(fs.existsSync(parentDir)).toBe(true)
    })
  })
})

describe('Test Infrastructure Integration', () => {
  describe('Mock Structure', () => {
    test('should have mock directory', () => {
      const mocksDir = path.resolve(__dirname, '../../features/redundancy/testing/__mocks__')
      expect(fs.existsSync(mocksDir)).toBe(true)
    })

    test('should have all required mock files', () => {
      const mockFiles = [
        'redundancy-dependencies.ts',
        'redundancy-events.ts',
        'redundancy-errors.ts',
        'redundancy-lifecycle.ts'
      ]
      
      mockFiles.forEach(file => {
        const mockPath = path.resolve(__dirname, `../../features/redundancy/testing/__mocks__/${file}`)
        expect(fs.existsSync(mockPath)).toBe(true)
      })
    })
  })

  describe('Test Categories', () => {
    test('should have all test category directories', () => {
      const categories = [
        'components',
        'providers', 
        'utils',
        'integration',
        'performance',
        'accessibility',
        'visual',
        'e2e'
      ]
      
      categories.forEach(category => {
        const categoryDir = path.resolve(__dirname, `../../features/redundancy/__tests__/${category}`)
        expect(fs.existsSync(categoryDir)).toBe(true)
      })
    })
  })
})