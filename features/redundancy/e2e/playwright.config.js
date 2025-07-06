/**
 * Playwright Configuration for Redundancy Feature E2E Tests
 * Specialized configuration for end-to-end testing of the redundancy feature
 */

const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  // Test directory
  testDir: './tests',
  
  // Test files pattern
  testMatch: '**/*.e2e.{js,ts}',
  
  // Fullyparallel mode
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: './test-results/html-report' }],
    ['json', { outputFile: './test-results/results.json' }],
    ['junit', { outputFile: './test-results/junit.xml' }],
    process.env.CI ? ['github'] : ['list']
  ],
  
  // Global test configuration
  use: {
    // Base URL for tests
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Artifacts
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Timeouts
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    // Test specific options
    testIdAttribute: 'data-testid',
    
    // Custom headers for redundancy feature
    extraHTTPHeaders: {
      'X-Redundancy-Test': 'true',
      'X-Feature-Flag': 'redundancy-enabled'
    }
  },

  // Test timeout
  timeout: 60000,
  expect: {
    timeout: 10000
  },

  // Projects for different browser testing
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testDir: './tests/browser',
      testMatch: '**/*.chrome.e2e.{js,ts}'
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testDir: './tests/browser',
      testMatch: '**/*.firefox.e2e.{js,ts}'
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testDir: './tests/browser',
      testMatch: '**/*.safari.e2e.{js,ts}'
    },
    
    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testDir: './tests/mobile',
      testMatch: '**/*.mobile.e2e.{js,ts}'
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      testDir: './tests/mobile',
      testMatch: '**/*.mobile.e2e.{js,ts}'
    },

    // Feature-specific projects
    {
      name: 'redundancy-core',
      testDir: './tests/redundancy-core',
      use: {
        ...devices['Desktop Chrome'],
        // Feature-specific configuration
        storageState: './auth/redundancy-user.json',
        extraHTTPHeaders: {
          'X-Redundancy-Test': 'true',
          'X-Test-Category': 'core-functionality'
        }
      }
    },
    {
      name: 'redundancy-integration',
      testDir: './tests/redundancy-integration',
      use: {
        ...devices['Desktop Chrome'],
        extraHTTPHeaders: {
          'X-Redundancy-Test': 'true',
          'X-Test-Category': 'integration'
        }
      }
    },
    {
      name: 'redundancy-performance',
      testDir: './tests/redundancy-performance',
      use: {
        ...devices['Desktop Chrome'],
        extraHTTPHeaders: {
          'X-Redundancy-Test': 'true',
          'X-Test-Category': 'performance'
        }
      },
      timeout: 120000 // Longer timeout for performance tests
    }
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./setup/global-setup.js'),
  globalTeardown: require.resolve('./setup/global-teardown.js'),

  // Web server for local development
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
    env: {
      NEXT_PUBLIC_ENABLE_REDUNDANCY: 'true',
      NEXT_PUBLIC_E2E_TEST_MODE: 'true'
    }
  },

  // Output directory
  outputDir: './test-results/artifacts',

  // Metadata
  metadata: {
    feature: 'redundancy',
    version: '1.0.0',
    testSuite: 'e2e',
    environment: process.env.NODE_ENV || 'test'
  }
})