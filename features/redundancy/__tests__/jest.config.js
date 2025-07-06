/**
 * Jest Configuration for __tests__ Directory
 * Local test configuration for redundancy feature tests
 */

const path = require('path')
const baseConfig = require('../testing/jest.config.js')

module.exports = {
  ...baseConfig,
  displayName: 'Redundancy Feature Tests',
  rootDir: path.resolve(__dirname, '../../../'),
  testMatch: [
    '<rootDir>/features/redundancy/__tests__/**/*.test.{js,jsx,ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/features/redundancy/__tests__/e2e/', // E2E tests run separately
  ],
  collectCoverageFrom: [
    'features/redundancy/**/*.{js,jsx,ts,tsx}',
    '!features/redundancy/**/*.d.ts',
    '!features/redundancy/**/*.stories.{js,jsx,ts,tsx}',
    '!features/redundancy/**/index.{js,jsx,ts,tsx}',
    '!features/redundancy/testing/**/*',
    '!features/redundancy/__tests__/**/*',
  ],
  coverageDirectory: '<rootDir>/coverage/redundancy-feature',
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    }
  },
  // Test categorization
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: [
        '<rootDir>/features/redundancy/__tests__/components/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/features/redundancy/__tests__/providers/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/features/redundancy/__tests__/utils/**/*.test.{js,jsx,ts,tsx}',
      ],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        }
      }
    },
    {
      displayName: 'Integration Tests',
      testMatch: [
        '<rootDir>/features/redundancy/__tests__/integration/**/*.test.{js,jsx,ts,tsx}',
      ],
      testTimeout: 20000,
      coverageThreshold: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        }
      }
    },
    {
      displayName: 'Performance Tests',
      testMatch: [
        '<rootDir>/features/redundancy/__tests__/performance/**/*.test.{js,jsx,ts,tsx}',
      ],
      testTimeout: 30000,
      setupFilesAfterEnv: [
        '<rootDir>/features/redundancy/testing/setup.js',
        '<rootDir>/features/redundancy/__tests__/performance/setup.js'
      ]
    },
    {
      displayName: 'Accessibility Tests',
      testMatch: [
        '<rootDir>/features/redundancy/__tests__/accessibility/**/*.test.{js,jsx,ts,tsx}',
      ],
      setupFilesAfterEnv: [
        '<rootDir>/features/redundancy/testing/setup.js',
        '<rootDir>/features/redundancy/__tests__/accessibility/setup.js'
      ]
    },
    {
      displayName: 'Visual Tests',
      testMatch: [
        '<rootDir>/features/redundancy/__tests__/visual/**/*.test.{js,jsx,ts,tsx}',
      ],
      setupFilesAfterEnv: [
        '<rootDir>/features/redundancy/testing/setup.js'
      ]
    }
  ],
  // Test result grouping
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '<rootDir>/coverage/redundancy-feature',
      outputName: 'junit.xml',
      suiteName: 'Redundancy Feature Tests',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }],
    ['jest-html-reporters', {
      publicPath: '<rootDir>/coverage/redundancy-feature/html',
      filename: 'report.html',
      openReport: false,
      pageTitle: 'Redundancy Feature Test Report',
      logoImgPath: undefined,
      hideIcon: false,
      expand: false,
      testCommand: 'npm test',
      includeFailureMsg: true,
      includeSuiteFailure: true
    }]
  ]
}