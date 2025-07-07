import { defineConfig, devices } from '@playwright/test'

/**
 * Comprehensive Playwright configuration for cross-browser testing
 * Includes multiple browsers, devices, and test environments
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
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    // Desktop Browsers - Chromium
    {
      name: 'e2e-chromium',
      testDir: './tests/e2e',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable redundancy feature for testing
        contextOptions: {
          // Set environment variable for tests
        }
      },
    },

    // Desktop Browsers - Firefox
    {
      name: 'e2e-firefox',
      testDir: './tests/e2e',
      use: { 
        ...devices['Desktop Firefox'],
      },
    },

    // Desktop Browsers - WebKit (Safari)
    {
      name: 'e2e-webkit',
      testDir: './tests/e2e',
      use: { 
        ...devices['Desktop Safari'],
      },
    },

    // Mobile Testing
    {
      name: 'mobile-chrome',
      testDir: './tests/mobile',
      use: { 
        ...devices['Pixel 5'],
      },
    },

    {
      name: 'mobile-safari',
      testDir: './tests/mobile',
      use: { 
        ...devices['iPhone 12'],
      },
    },

    // Tablet Testing
    {
      name: 'tablet-chrome',
      testDir: './tests/mobile',
      use: { 
        ...devices['iPad Pro'],
      },
    },

    // Integration Tests (all browsers)
    {
      name: 'integration-chromium',
      testDir: './tests/integration',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'integration-firefox',
      testDir: './tests/integration',
      use: { 
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'integration-webkit',
      testDir: './tests/integration',
      use: { 
        ...devices['Desktop Safari'],
      },
    },

    // Performance Tests
    {
      name: 'performance-chrome',
      testDir: './tests/performance',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable performance monitoring
        contextOptions: {
          // Additional context options for performance testing
        }
      },
    },

    // Accessibility Tests
    {
      name: 'accessibility-tests',
      testDir: './tests/accessibility',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },

    // Visual Regression Tests
    {
      name: 'visual-regression',
      testDir: './tests/visual',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },

    // Unit Tests with Playwright
    {
      name: 'unit-tests',
      testDir: './tests/unit',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },

    // Responsive Testing
    {
      name: 'responsive-desktop',
      testDir: './tests/responsive',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    {
      name: 'responsive-laptop',
      testDir: './tests/responsive',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
      },
    },

    {
      name: 'responsive-tablet',
      testDir: './tests/responsive',
      use: { 
        ...devices['iPad Pro'],
      },
    },

    {
      name: 'responsive-mobile',
      testDir: './tests/responsive',
      use: { 
        ...devices['iPhone 12'],
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
    env: {
      // Enable redundancy feature for tests
      NEXT_PUBLIC_ENABLE_REDUNDANCY: 'true'
    }
  },

  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/config/global-setup.ts'),
  globalTeardown: require.resolve('./tests/config/global-teardown.ts'),

  /* Test timeout */
  timeout: 30 * 1000, // 30 seconds

  /* Expect timeout */
  expect: {
    timeout: 10 * 1000, // 10 seconds
  },
})