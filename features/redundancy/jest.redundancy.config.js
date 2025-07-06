/**
 * Redundancy Feature Jest Configuration
 * Comprehensive Jest configuration specifically for redundancy feature testing
 */

const path = require('path')
const baseConfig = require('../../jest.config.js')

// Feature-specific configuration
const redundancyConfig = {
  ...baseConfig,
  
  // Display name for this test suite
  displayName: {
    name: '2N+1 Redundancy Feature',
    color: 'blue'
  },
  
  // Root directory for redundancy tests
  rootDir: path.resolve(__dirname, '../../'),
  
  // Test file patterns specific to redundancy feature
  testMatch: [
    '<rootDir>/features/redundancy/**/__tests__/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/features/redundancy/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/unit/redundancy-*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/integration/redundancy-*.test.{js,jsx,ts,tsx}',
  ],
  
  // Ignore E2E tests in Jest (they run separately with Playwright)
  testPathIgnorePatterns: [
    ...baseConfig.testPathIgnorePatterns,
    '<rootDir>/features/redundancy/**/__tests__/e2e/',
    '<rootDir>/features/redundancy/**/e2e/',
  ],
  
  // Setup files specific to redundancy testing
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/features/redundancy/testing/setup.js'
  ],
  
  // Module name mapping for redundancy-specific imports
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@redundancy/(.*)$': '<rootDir>/features/redundancy/$1',
    '^@redundancy-test/(.*)$': '<rootDir>/features/redundancy/testing/$1',
    '^@redundancy-utils/(.*)$': '<rootDir>/features/redundancy/utils/$1',
    '^@redundancy-components/(.*)$': '<rootDir>/features/redundancy/components/$1',
    '^@redundancy-providers/(.*)$': '<rootDir>/features/redundancy/providers/$1',
    '^@redundancy-types/(.*)$': '<rootDir>/features/redundancy/types/$1',
  },
  
  // Coverage collection specific to redundancy feature
  collectCoverageFrom: [
    'features/redundancy/**/*.{js,jsx,ts,tsx}',
    '!features/redundancy/**/*.d.ts',
    '!features/redundancy/**/*.stories.{js,jsx,ts,tsx}',
    '!features/redundancy/**/index.{js,jsx,ts,tsx}',
    '!features/redundancy/testing/**/*',
    '!features/redundancy/**/__tests__/**/*',
    '!features/redundancy/**/__mocks__/**/*',
    '!features/redundancy/**/e2e/**/*',
    '!features/redundancy/**/*.config.{js,ts}',
  ],
  
  // Coverage output directory
  coverageDirectory: '<rootDir>/coverage/redundancy-feature',
  
  // Coverage thresholds for redundancy feature
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    'features/redundancy/components/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'features/redundancy/providers/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    'features/redundancy/utils/': {
      branches: 88,
      functions: 88,
      lines: 88,
      statements: 88,
    },
    'features/redundancy/composition/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    }
  },
  
  // Test environment configuration
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    html: '<html lang="en-US"><body><div id="redundancy-test-root"></div></body></html>',
    url: 'http://localhost:3000',
    userAgent: 'Jest Test Environment',
    pretendToBeVisual: true,
    resources: 'usable'
  },
  
  // Transform configuration for redundancy assets
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['next/dist/build/swc/jest-transformer'],
    '^.+\\.css$': '<rootDir>/features/redundancy/testing/cssTransform.js',
    '^.+\\.svg$': '<rootDir>/features/redundancy/testing/svgTransform.js',
    '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp)$': '<rootDir>/features/redundancy/testing/fileTransform.js'
  },
  
  // Global variables for redundancy tests
  globals: {
    __REDUNDANCY_FEATURE_ENABLED__: true,
    __REDUNDANCY_TEST_MODE__: true,
    __REDUNDANCY_MOCK_DEPENDENCIES__: true,
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        moduleResolution: 'node',
        target: 'es2020',
        lib: ['es2020', 'dom', 'dom.iterable'],
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        resolveJsonModule: true,
        isolatedModules: true,
        incremental: true
      }
    }
  },
  
  // Test timeout configuration
  testTimeout: 15000,
  
  // Performance configuration
  maxWorkers: '50%',
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache/redundancy',
  
  // Mock configuration
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Error handling
  verbose: true,
  errorOnDeprecated: true,
  bail: false,
  forceExit: false,
  detectOpenHandles: true,
  
  // Watch mode configuration
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/coverage/',
    '<rootDir>/.jest-cache/',
    '<rootDir>/features/redundancy/testing/__mocks__/'
  ],
  
  // Reporters configuration
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '<rootDir>/coverage/redundancy-feature',
      outputName: 'junit-redundancy.xml',
      suiteName: '2N+1 Redundancy Feature Tests',
      classNameTemplate: 'Redundancy.{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true,
      addFileAttribute: true
    }],
    ['jest-html-reporters', {
      publicPath: '<rootDir>/coverage/redundancy-feature/html',
      filename: 'redundancy-test-report.html',
      openReport: false,
      pageTitle: '2N+1 Redundancy Feature Test Report',
      logoImgPath: undefined,
      hideIcon: false,
      expand: true,
      testCommand: 'npm run test:redundancy',
      includeFailureMsg: true,
      includeSuiteFailure: true,
      includeConsoleLog: false
    }],
    ['jest-sonar-reporter', {
      outputDirectory: '<rootDir>/coverage/redundancy-feature',
      outputName: 'sonar-report.xml',
      reportedFilePath: 'relative'
    }]
  ],
  
  // Custom test result processor
  testResultsProcessor: '<rootDir>/features/redundancy/testing/testResultsProcessor.js',
  
  // Snapshot configuration
  snapshotFormat: {
    printBasicPrototype: false,
    escapeRegex: true
  },
  
  // Custom matchers and extensions
  snapshotResolver: '<rootDir>/features/redundancy/testing/snapshotResolver.js'
}

module.exports = redundancyConfig