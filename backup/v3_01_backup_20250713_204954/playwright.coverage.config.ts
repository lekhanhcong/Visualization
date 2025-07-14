import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration with Coverage Reporting
 * Specialized configuration for test coverage collection
 */

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Disable parallel for coverage collection
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for coverage
  timeout: 60 * 1000,
  expect: {
    timeout: 15 * 1000,
  },
  
  reporter: [
    ['html', { 
      open: 'never',
      outputFolder: 'coverage/playwright-report'
    }],
    ['json', { 
      outputFile: 'coverage/playwright-results.json' 
    }],
    ['line'],
  ],
  
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Coverage collection settings
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
    
    // Browser settings for coverage
    launchOptions: {
      args: [
        '--js-flags=--expose-gc',
        '--enable-precise-memory-info',
      ],
    },
  },
  
  outputDir: 'coverage/artifacts',
  
  globalSetup: require.resolve('./tests/config/global-setup.ts'),
  globalTeardown: require.resolve('./tests/config/global-teardown.ts'),
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_ENABLE_REDUNDANCY: 'true',
      // Enable V8 coverage collection
      NODE_V8_COVERAGE: 'coverage/v8',
    },
  },
  
  projects: [
    // Coverage collection for different test types
    {
      name: 'coverage-unit',
      testDir: './tests/unit',
      testMatch: '**/*.test.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Collect coverage data
        contextOptions: {
          recordVideo: { dir: 'coverage/videos' },
        },
      },
    },
    
    {
      name: 'coverage-integration', 
      testDir: './tests/integration',
      testMatch: '**/*.test.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    
    {
      name: 'coverage-e2e',
      testDir: './tests/e2e',
      testMatch: '**/*.spec.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
      dependencies: ['setup-database'],
    },
    
    {
      name: 'coverage-accessibility',
      testDir: './tests/accessibility',
      testMatch: '**/*.a11y.spec.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
      dependencies: ['setup-database'],
    },
    
    {
      name: 'coverage-performance',
      testDir: './tests/performance',
      testMatch: '**/*.perf.spec.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: [
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--js-flags=--expose-gc',
          ],
        },
      },
      dependencies: ['setup-database'],
    },
    
    {
      name: 'coverage-responsive',
      testDir: './tests/responsive',
      testMatch: '**/*.responsive.spec.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
      dependencies: ['setup-database'],
    },
    
    // Setup project
    {
      name: 'setup-database',
      testDir: './tests/setup',
      testMatch: '**/*.setup.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Chrome'],
      },
      teardown: 'cleanup-database',
    },
    
    // Cleanup project
    {
      name: 'cleanup-database',
      testDir: './tests/setup',
      testMatch: '**/*.cleanup.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
})