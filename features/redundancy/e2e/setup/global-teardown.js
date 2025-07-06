/**
 * Playwright Global Teardown
 * Global teardown for redundancy E2E tests
 */

const fs = require('fs')
const path = require('path')

async function globalTeardown(config) {
  console.log('🧹 Starting global teardown for redundancy E2E tests...')

  try {
    // Cleanup mock servers
    if (global.mockServer) {
      global.mockServer.close()
      console.log('🎭 Mock servers shut down')
    }

    // Cleanup temporary files if specified
    if (process.env.CLEANUP_TEMP_FILES === 'true') {
      await cleanupTempFiles()
    }

    // Generate test summary
    await generateTestSummary()

    // Archive test results if on CI
    if (process.env.CI) {
      await archiveTestResults()
    }

    console.log('✅ Global teardown completed successfully')
  } catch (error) {
    console.error('❌ Error during global teardown:', error)
    throw error
  }
}

/**
 * Cleanup temporary files
 */
async function cleanupTempFiles() {
  const tempDirs = [
    './auth',
    './data'
  ]

  for (const dir of tempDirs) {
    const fullPath = path.resolve(__dirname, '..', dir)
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true })
      console.log(`🗑️  Cleaned up: ${dir}`)
    }
  }
}

/**
 * Generate test summary
 */
async function generateTestSummary() {
  const resultsPath = path.resolve(__dirname, '../test-results/results.json')
  
  if (fs.existsSync(resultsPath)) {
    try {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'))
      
      const summary = {
        timestamp: new Date().toISOString(),
        totalTests: results.stats?.total || 0,
        passed: results.stats?.passed || 0,
        failed: results.stats?.failed || 0,
        skipped: results.stats?.skipped || 0,
        duration: results.stats?.duration || 0,
        feature: 'redundancy',
        environment: process.env.NODE_ENV || 'test'
      }

      const summaryPath = path.resolve(__dirname, '../test-results/summary.json')
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2))
      
      console.log('📊 Test summary generated:')
      console.log(`   Total: ${summary.totalTests}`)
      console.log(`   Passed: ${summary.passed}`)
      console.log(`   Failed: ${summary.failed}`)
      console.log(`   Duration: ${Math.round(summary.duration / 1000)}s`)
      
    } catch (error) {
      console.warn('⚠️  Could not generate test summary:', error.message)
    }
  }
}

/**
 * Archive test results for CI
 */
async function archiveTestResults() {
  console.log('📦 Archiving test results for CI...')
  
  // In a real implementation, you might:
  // - Upload results to S3/Azure/GCS
  // - Send results to a test reporting service
  // - Create artifacts for CI system
  
  const resultsDir = path.resolve(__dirname, '../test-results')
  if (fs.existsSync(resultsDir)) {
    console.log(`📁 Test results available at: ${resultsDir}`)
  }
}

module.exports = globalTeardown