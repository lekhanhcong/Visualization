/**
 * Jest Configuration for Redundancy Components
 * Extended configuration specifically for testing redundancy features
 */

const baseConfig = require('../../../jest.config.js')

module.exports = {
  ...baseConfig,
  displayName: 'Redundancy Components',
  testMatch: [
    '<rootDir>/tests/unit/redundancy-*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/integration/redundancy-*.test.{js,jsx,ts,tsx}',
    '<rootDir>/features/redundancy/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/features/redundancy/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/features/redundancy/testing/__mocks__/',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/features/redundancy/testing/setup.js'
  ],
  moduleNameMapper: {
    ...baseConfig.moduleNameMapping,
    '^@redundancy/(.*)$': '<rootDir>/features/redundancy/$1',
    '^@redundancy-test/(.*)$': '<rootDir>/features/redundancy/testing/$1',
    '^@redundancy-utils/(.*)$': '<rootDir>/features/redundancy/utils/$1',
  },
  collectCoverageFrom: [
    ...baseConfig.collectCoverageFrom,
    'features/redundancy/**/*.{js,jsx,ts,tsx}',
    '!features/redundancy/**/*.d.ts',
    '!features/redundancy/**/*.stories.{js,jsx,ts,tsx}',
    '!features/redundancy/**/index.{js,jsx,ts,tsx}',
    '!features/redundancy/testing/**/*',
    '!features/redundancy/**/__mocks__/**/*',
  ],
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  coverageDirectory: '<rootDir>/coverage/redundancy',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'features/redundancy/components/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    'features/redundancy/providers/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'features/redundancy/utils/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    }
  },
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    html: '<html lang="en-US"><body><div id="root"></div></body></html>',
    url: 'http://localhost:3000',
    userAgent: 'node.js',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['next/dist/build/swc/jest-transformer'],
    '^.+\\.css$': '<rootDir>/features/redundancy/testing/cssTransform.js',
    '^.+\\.svg$': '<rootDir>/features/redundancy/testing/svgTransform.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@testing-library))'
  ],
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        moduleResolution: 'node',
        target: 'es2018',
        lib: ['es2018', 'dom', 'dom.iterable'],
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        incremental: true,
        isolatedModules: true,
        noEmit: true,
        resolveJsonModule: true,
      }
    }
  },
  testTimeout: 15000,
  maxWorkers: '50%',
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache/redundancy',
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  verbose: true,
  errorOnDeprecated: true,
  testFailureExitCode: 1,
  bail: false,
  forceExit: false,
  detectOpenHandles: true,
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/coverage/',
    '<rootDir>/.jest-cache/',
  ],
  // Performance monitoring
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '<rootDir>/coverage/redundancy',
      outputName: 'junit.xml',
      suiteName: 'Redundancy Components Test Suite'
    }],
    ['jest-html-reporters', {
      publicPath: '<rootDir>/coverage/redundancy/html',
      filename: 'report.html',
      openReport: false,
      pageTitle: 'Redundancy Components Test Report'
    }]
  ],
  // Custom test result processor
  testResultsProcessor: '<rootDir>/features/redundancy/testing/testResultsProcessor.js'
}