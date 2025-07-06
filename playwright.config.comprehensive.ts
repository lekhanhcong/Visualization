import { defineConfig, devices, PlaywrightTestConfig } from '@playwright/test'

/**
 * Comprehensive Playwright Configuration for Next.js 15 React 19 Application
 * Supports: Unit, Integration, E2E, Accessibility, Performance, and Responsive Testing
 */

// Base configuration
const baseConfig: PlaywrightTestConfig = {
  // Test execution settings
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 1,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60 * 1000, // 60 seconds for complex tests
  expect: {
    timeout: 15 * 1000,
  },
  
  // Reporting configuration
  reporter: [
    ['html', { 
      open: 'never',
      outputFolder: 'test-results/html-report'
    }],
    ['json', { 
      outputFile: 'test-results/results.json' 
    }],
    ['junit', { 
      outputFile: 'test-results/results.xml' 
    }],
    ['list'],
    ['github'], // For GitHub Actions
    ['line'], // For CI/CD
  ],
  
  // Global test settings
  use: {
    // Base URL for the application
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    // Tracing and debugging
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Timeouts
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
    
    // Browser settings
    launchOptions: {
      slowMo: process.env.PLAYWRIGHT_SLOW_MO ? parseInt(process.env.PLAYWRIGHT_SLOW_MO) : 0,
    },
    
    // Ignore HTTPS errors for local development
    ignoreHTTPSErrors: true,
    
    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'UTC',
    
    // Permissions
    permissions: ['clipboard-read', 'clipboard-write'],
    
    // Accessibility
    colorScheme: 'light',
    
    // Performance
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },
  
  // Output directories
  outputDir: 'test-results/artifacts',
  
  // Global setup and teardown
  globalSetup: require.resolve('./tests/config/global-setup.ts'),
  globalTeardown: require.resolve('./tests/config/global-teardown.ts'),
  
  // Web server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_ENABLE_REDUNDANCY: 'true',
    },
  },
}

export default defineConfig({
  ...baseConfig,
  
  projects: [
    // ============= UNIT TESTS =============
    {
      name: 'unit-tests',
      testDir: './tests/unit',
      testMatch: '**/*.test.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Chrome'],
        viewport: null, // Use default viewport for unit tests
      },
      dependencies: [], // No dependencies for unit tests
    },
    
    // ============= INTEGRATION TESTS =============
    {
      name: 'integration-tests',
      testDir: './tests/integration',
      testMatch: '**/*.test.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
      dependencies: [], // No dependencies for integration tests
    },
    
    // ============= E2E TESTS - DESKTOP =============
    {
      name: 'e2e-chromium',
      testDir: './tests/e2e',
      testMatch: '**/*.spec.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
      dependencies: ['setup-database'], // Depends on setup
    },
    
    {
      name: 'e2e-firefox',
      testDir: './tests/e2e',
      testMatch: '**/*.spec.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
      dependencies: ['setup-database'],
    },
    
    {
      name: 'e2e-webkit',
      testDir: './tests/e2e',
      testMatch: '**/*.spec.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
      dependencies: ['setup-database'],
    },
    
    // ============= MOBILE E2E TESTS =============
    {
      name: 'e2e-mobile-chrome',
      testDir: './tests/e2e',
      testMatch: '**/*.mobile.spec.{js,jsx,ts,tsx}',
      use: {
        ...devices['Pixel 5'],
      },
      dependencies: ['setup-database'],
    },
    
    {
      name: 'e2e-mobile-safari',
      testDir: './tests/e2e',
      testMatch: '**/*.mobile.spec.{js,jsx,ts,tsx}',
      use: {
        ...devices['iPhone 12'],
      },
      dependencies: ['setup-database'],
    },
    
    // ============= ACCESSIBILITY TESTS =============
    {
      name: 'accessibility-tests',
      testDir: './tests/accessibility',
      testMatch: '**/*.a11y.spec.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Enhanced accessibility testing settings
        reducedMotion: 'reduce',
        forcedColors: 'active',
      },
      dependencies: ['setup-database'],
    },
    
    // ============= PERFORMANCE TESTS =============
    {
      name: 'performance-tests',
      testDir: './tests/performance',
      testMatch: '**/*.perf.spec.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Performance testing specific settings
        launchOptions: {
          args: [
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
          ],
        },
      },
      dependencies: ['setup-database'],
      // Longer timeout for performance tests
      timeout: 90 * 1000,
    },
    
    // ============= RESPONSIVE DESIGN TESTS =============
    {
      name: 'responsive-small',
      testDir: './tests/responsive',
      testMatch: '**/*.responsive.spec.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 667 }, // Small mobile
      },
      dependencies: ['setup-database'],
    },
    
    {
      name: 'responsive-tablet',
      testDir: './tests/responsive',
      testMatch: '**/*.responsive.spec.{js,jsx,ts,tsx}',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 768 }, // Tablet
      },
      dependencies: ['setup-database'],
    },
    
    {
      name: 'responsive-desktop',
      testDir: './tests/responsive',
      testMatch: '**/*.responsive.spec.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }, // Desktop
      },
      dependencies: ['setup-database'],
    },
    
    {
      name: 'responsive-wide',
      testDir: './tests/responsive',
      testMatch: '**/*.responsive.spec.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 2560, height: 1440 }, // Wide desktop
      },
      dependencies: ['setup-database'],
    },
    
    // ============= VISUAL REGRESSION TESTS =============
    {
      name: 'visual-regression',
      testDir: './tests/visual',
      testMatch: '**/*.visual.spec.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
      dependencies: ['setup-database'],
    },
    
    // ============= SETUP PROJECT =============
    {
      name: 'setup-database',
      testDir: './tests/setup',
      testMatch: '**/*.setup.{js,jsx,ts,tsx}',
      use: {
        ...devices['Desktop Chrome'],
      },
      teardown: 'cleanup-database',
    },
    
    // ============= CLEANUP PROJECT =============
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