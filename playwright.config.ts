import { defineConfig, devices } from '@playwright/test';

/**
 * Modern Playwright Configuration for 2N+1 Redundancy Testing
 * Supports unit, integration, E2E, accessibility, and performance tests
 */
export default defineConfig({
  testDir: './tests',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'test-results/playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['line']
  ],
  
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Set timeout for actions */
    actionTimeout: 10000,
    
    /* Set timeout for navigations */
    navigationTimeout: 30000,
  },
  
  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/config/global-setup.ts'),
  globalTeardown: require.resolve('./tests/config/global-teardown.ts'),
  
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/unit/**/*.test.{ts,tsx}', '**/e2e/**/*.spec.ts']
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: ['**/e2e/**/*.spec.ts']
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: ['**/e2e/**/*.spec.ts']
    },
    
    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: ['**/responsive/**/*.spec.ts', '**/e2e/**/*.spec.ts']
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      testMatch: ['**/responsive/**/*.spec.ts']
    },
    
    /* Integration tests */
    {
      name: 'integration',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/integration/**/*.test.ts']
    },
    
    /* Accessibility tests */
    {
      name: 'accessibility',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable accessibility testing
        contextOptions: {
          reducedMotion: 'reduce' // Test with reduced motion
        }
      },
      testMatch: ['**/accessibility/**/*.spec.ts']
    },
    
    /* Performance tests */
    {
      name: 'performance',
      use: { 
        ...devices['Desktop Chrome'],
        contextOptions: {
          // Performance testing configuration
          serviceWorkers: 'block'
        }
      },
      testMatch: ['**/performance/**/*.spec.ts']
    }
  ],
  
  /* Web server for tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
    env: {
      NEXT_PUBLIC_ENABLE_REDUNDANCY: 'true'
    }
  },
  
  /* Test timeouts */
  timeout: 30000,
  expect: {
    timeout: 10000,
    toHaveScreenshot: { mode: 'strict' },
    toMatchSnapshot: { threshold: 0.2 }
  },
  
  /* Test output directory */
  outputDir: 'test-results/artifacts/'
});