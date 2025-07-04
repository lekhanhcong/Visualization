import { FullConfig } from '@playwright/test'
import fs from 'fs'
import path from 'path'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global test teardown...')
  
  try {
    // Clean up test artifacts if needed
    console.log('📊 Processing test results...')
    
    // Generate test summary
    const resultsPath = path.join(process.cwd(), 'test-results')
    if (fs.existsSync(resultsPath)) {
      const files = fs.readdirSync(resultsPath)
      console.log(`📁 Found ${files.length} test result files`)
      
      // You could add custom report processing here
      // For example, uploading results to a dashboard, sending notifications, etc.
    }
    
    // Clean up any temporary test data
    console.log('🗑️ Cleaning up temporary test data...')
    
    // Performance metrics summary
    console.log('📈 Test execution summary:')
    console.log(`   Configuration: ${config.projects.length} browser projects`)
    console.log(`   Workers: ${config.workers}`)
    console.log(`   Retries: ${config.projects[0]?.retries || 0}`)
    
  } catch (error) {
    console.error('❌ Global teardown error:', error)
    // Don't throw here as teardown failures shouldn't fail the test run
  }
  
  console.log('✨ Global teardown completed')
}

export default globalTeardown