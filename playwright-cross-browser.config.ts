import { defineConfig, devices } from '@playwright/test';

/**
 * Cross-Browser Playwright Configuration for Comprehensive Testing
 * Tests across Chrome, Firefox, Safari, and Edge
 */
export default defineConfig({
  testDir: './tests',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'test-results/cross-browser-report' }],
    ['json', { outputFile: 'test-results/cross-browser-results.json' }],
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
    
    /* Set timeout for actions */
    actionTimeout: 15000,
    
    /* Set navigation timeout */
    navigationTimeout: 30000,
  },
  
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        hasTouch: true
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        hasTouch: false
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        hasTouch: false
      },
    },
    {
      name: 'edge',
      use: { 
        ...devices['Desktop Edge'],
        hasTouch: true
      },
    },
    
    /* Mobile testing */
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        hasTouch: true
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        hasTouch: true
      },
    },
  ],
  
  /* Test timeouts */
  timeout: 60000,
  expect: {
    timeout: 15000,
  },
  
  /* Test output directory */
  outputDir: 'test-results/cross-browser-artifacts/',
  
  /* Global setup */
  globalSetup: require.resolve('./tests/global-setup.ts'),
});