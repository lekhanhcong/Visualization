import { defineConfig, devices } from '@playwright/test';

/**
 * Simple Playwright Configuration for Testing
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
    ['html', { outputFolder: 'test-results/playwright-report' }],
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
    actionTimeout: 10000,
  },
  
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        hasTouch: true
      },
    }
  ],
  
  /* Test timeouts */
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  
  /* Test output directory */
  outputDir: 'test-results/artifacts/'
});