/**
 * Test Runner for Redundancy Feature
 * Orchestrates different types of tests
 */

const { spawn } = require('child_process')
const path = require('path')

const testCategories = {
  unit: {
    name: 'Unit Tests',
    pattern: '__tests__/{components,providers,utils}/**/*.test.{js,jsx,ts,tsx}',
    timeout: 10000
  },
  integration: {
    name: 'Integration Tests', 
    pattern: '__tests__/integration/**/*.test.{js,jsx,ts,tsx}',
    timeout: 20000
  },
  performance: {
    name: 'Performance Tests',
    pattern: '__tests__/performance/**/*.test.{js,jsx,ts,tsx}',
    timeout: 30000
  },
  accessibility: {
    name: 'Accessibility Tests',
    pattern: '__tests__/accessibility/**/*.test.{js,jsx,ts,tsx}',
    timeout: 15000
  },
  visual: {
    name: 'Visual Tests',
    pattern: '__tests__/visual/**/*.test.{js,jsx,ts,tsx}',
    timeout: 10000
  }
}

function runTests(categories = Object.keys(testCategories), options = {}) {
  const {
    coverage = true,
    watch = false,
    verbose = true,
    bail = false
  } = options

  console.log(`🧪 Running Redundancy Feature Tests`)
  console.log(`📂 Categories: ${categories.join(', ')}`)
  
  const promises = categories.map(category => {
    return new Promise((resolve, reject) => {
      const config = testCategories[category]
      if (!config) {
        reject(new Error(`Unknown test category: ${category}`))
        return
      }

      console.log(`\n🔄 Running ${config.name}...`)
      
      const args = [
        'test',
        '--config', path.join(__dirname, 'jest.config.js'),
        '--testPathPattern', config.pattern,
        '--testTimeout', config.timeout.toString()
      ]

      if (coverage) args.push('--coverage')
      if (watch) args.push('--watch')
      if (verbose) args.push('--verbose')
      if (bail) args.push('--bail')

      const child = spawn('npm', args, {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '../../../')
      })

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${config.name} completed successfully`)
          resolve({ category, success: true })
        } else {
          console.log(`❌ ${config.name} failed`)
          reject(new Error(`${config.name} failed with code ${code}`))
        }
      })

      child.on('error', (error) => {
        console.error(`❌ ${config.name} error:`, error)
        reject(error)
      })
    })
  })

  return Promise.allSettled(promises).then(results => {
    console.log('\n📊 Test Results Summary:')
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    
    console.log(`✅ Successful: ${successful}`)
    console.log(`❌ Failed: ${failed}`)
    
    if (failed > 0) {
      console.log('\n❌ Failed Categories:')
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.log(`   • ${categories[index]}: ${result.reason.message}`)
        }
      })
    }

    return { successful, failed, total: results.length }
  })
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2)
  const categories = args.length > 0 ? args : Object.keys(testCategories)
  
  const options = {
    coverage: !process.argv.includes('--no-coverage'),
    watch: process.argv.includes('--watch'),
    verbose: !process.argv.includes('--silent'),
    bail: process.argv.includes('--bail')
  }

  runTests(categories, options)
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0)
    })
    .catch(error => {
      console.error('❌ Test runner failed:', error)
      process.exit(1)
    })
}

module.exports = { runTests, testCategories }