/**
 * Playwright Global Setup
 * Global setup for redundancy E2E tests
 */

const { chromium } = require('@playwright/test')
const path = require('path')
const fs = require('fs')

async function globalSetup(config) {
  console.log('🚀 Starting global setup for redundancy E2E tests...')

  // Create directories
  const dirs = [
    './test-results',
    './test-results/screenshots',
    './test-results/videos',
    './test-results/traces',
    './test-results/html-report',
    './auth'
  ]

  dirs.forEach(dir => {
    const fullPath = path.resolve(__dirname, '..', dir)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
      console.log(`📁 Created directory: ${dir}`)
    }
  })

  // Setup browser for authentication if needed
  if (process.env.SETUP_AUTH !== 'false') {
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()

    try {
      // Navigate to application
      const baseURL = config.use?.baseURL || 'http://localhost:3000'
      await page.goto(baseURL)

      // Wait for app to load
      await page.waitForSelector('body', { timeout: 30000 })

      // Enable redundancy feature if not already enabled
      await page.evaluate(() => {
        localStorage.setItem('redundancy-feature-enabled', 'true')
        localStorage.setItem('redundancy-debug-mode', 'true')
        localStorage.setItem('e2e-test-mode', 'true')
      })

      // Save authenticated state
      await context.storageState({ path: path.resolve(__dirname, '../auth/redundancy-user.json') })
      console.log('✅ Authentication state saved')

    } catch (error) {
      console.warn('⚠️  Could not setup authentication state:', error.message)
    } finally {
      await browser.close()
    }
  }

  // Setup test data
  await setupTestData()

  // Setup mock servers if needed
  if (process.env.SETUP_MOCKS !== 'false') {
    await setupMockServers()
  }

  console.log('✅ Global setup completed successfully')
}

/**
 * Setup test data
 */
async function setupTestData() {
  const testDataPath = path.resolve(__dirname, '../data')
  
  if (!fs.existsSync(testDataPath)) {
    fs.mkdirSync(testDataPath, { recursive: true })
  }

  // Create test data files
  const testData = {
    substations: [
      {
        id: 'e2e-sub-001',
        name: 'E2E Test Substation Alpha',
        status: 'ACTIVE',
        position: { x: 200, y: 200 },
        powerRating: 500,
        redundancyLevel: '2N+1'
      },
      {
        id: 'e2e-sub-002',
        name: 'E2E Test Substation Beta',
        status: 'STANDBY',
        position: { x: 400, y: 200 },
        powerRating: 500,
        redundancyLevel: '2N+1'
      }
    ],
    lines: [
      {
        id: 'e2e-line-001',
        name: 'E2E Test Line 1',
        status: 'ACTIVE',
        path: [{ x: 200, y: 200 }, { x: 400, y: 200 }],
        powerFlow: 300,
        capacity: 500
      }
    ],
    scenarios: {
      normal: {
        name: 'Normal Operation',
        description: 'Standard operating conditions for E2E testing'
      },
      failover: {
        name: 'Failover Test',
        description: 'Simulated failover scenario for E2E testing'
      },
      maintenance: {
        name: 'Maintenance Mode',
        description: 'Maintenance scenario for E2E testing'
      }
    }
  }

  fs.writeFileSync(
    path.join(testDataPath, 'e2e-test-data.json'),
    JSON.stringify(testData, null, 2)
  )

  console.log('📊 Test data files created')
}

/**
 * Setup mock servers
 */
async function setupMockServers() {
  // Mock server setup would go here
  // For now, we'll just log that we're setting up mocks
  console.log('🎭 Mock servers setup (placeholder)')
  
  // You could setup MSW (Mock Service Worker) or similar here
  // Example:
  // const { setupServer } = require('msw/node')
  // global.mockServer = setupServer(...handlers)
  // global.mockServer.listen()
}

module.exports = globalSetup