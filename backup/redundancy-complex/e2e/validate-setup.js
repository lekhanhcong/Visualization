/**
 * E2E Setup Validation Script
 * Validates that the Playwright E2E testing infrastructure is properly configured
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Validating E2E Test Setup...\n')

// Check required files
const requiredFiles = [
  'playwright.config.js',
  'setup/global-setup.js',
  'setup/global-teardown.js',
  'helpers/page-objects.js',
  'helpers/test-utils.js',
  'tests/framework-validation/playwright-setup.e2e.js',
  'tests/redundancy-core/basic-functionality.e2e.js',
  'tests/redundancy-integration/failover-scenarios.e2e.js',
  'tests/redundancy-performance/load-testing.e2e.js',
  'package.json',
  'README.md'
]

console.log('📁 Checking required files:')
let missingFiles = []

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`)
  } else {
    console.log(`  ❌ ${file} - MISSING`)
    missingFiles.push(file)
  }
})

// Check required directories
const requiredDirs = [
  'tests',
  'tests/redundancy-core',
  'tests/redundancy-integration', 
  'tests/redundancy-performance',
  'tests/framework-validation',
  'helpers',
  'setup'
]

console.log('\n📂 Checking required directories:')
let missingDirs = []

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`  ✅ ${dir}`)
  } else {
    console.log(`  ❌ ${dir} - MISSING`)
    missingDirs.push(dir)
  }
})

// Validate configuration file
console.log('\n⚙️  Validating Playwright configuration:')
try {
  const config = require('./playwright.config.js')
  
  if (config.testDir) {
    console.log(`  ✅ Test directory: ${config.testDir}`)
  } else {
    console.log(`  ❌ Test directory not configured`)
  }
  
  if (config.projects && config.projects.length > 0) {
    console.log(`  ✅ ${config.projects.length} browser projects configured`)
  } else {
    console.log(`  ❌ No browser projects configured`)
  }
  
  if (config.use && config.use.baseURL) {
    console.log(`  ✅ Base URL: ${config.use.baseURL}`)
  } else {
    console.log(`  ⚠️  Base URL not configured (will use default)`)
  }

} catch (error) {
  console.log(`  ❌ Configuration validation failed: ${error.message}`)
}

// Validate package.json
console.log('\n📦 Validating package.json:')
try {
  const pkg = require('./package.json')
  
  const requiredScripts = [
    'test',
    'test:core',
    'test:integration', 
    'test:performance',
    'test:framework'
  ]
  
  requiredScripts.forEach(script => {
    if (pkg.scripts && pkg.scripts[script]) {
      console.log(`  ✅ Script: ${script}`)
    } else {
      console.log(`  ❌ Script missing: ${script}`)
    }
  })
  
} catch (error) {
  console.log(`  ❌ Package.json validation failed: ${error.message}`)
}

// Test file syntax validation
console.log('\n🧪 Validating test file syntax:')
const testFiles = [
  'tests/framework-validation/playwright-setup.e2e.js',
  'tests/redundancy-core/basic-functionality.e2e.js',
  'tests/redundancy-integration/failover-scenarios.e2e.js',
  'tests/redundancy-performance/load-testing.e2e.js'
]

testFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8')
      
      // Basic syntax checks
      if (content.includes("require('@playwright/test')")) {
        console.log(`  ✅ ${file} - Playwright import`)
      } else {
        console.log(`  ❌ ${file} - Missing Playwright import`)
      }
      
      if (content.includes('test.describe')) {
        console.log(`  ✅ ${file} - Test structure`)
      } else {
        console.log(`  ❌ ${file} - Invalid test structure`)
      }
      
    } else {
      console.log(`  ❌ ${file} - File not found`)
    }
  } catch (error) {
    console.log(`  ❌ ${file} - Syntax error: ${error.message}`)
  }
})

// Check helper files
console.log('\n🛠️  Validating helper files:')
try {
  const pageObjects = require('./helpers/page-objects.js')
  if (pageObjects.MainPage && pageObjects.RedundancyPage) {
    console.log('  ✅ Page objects exported correctly')
  } else {
    console.log('  ❌ Page objects missing or incorrect export')
  }
} catch (error) {
  console.log(`  ❌ Page objects validation failed: ${error.message}`)
}

try {
  const testUtils = require('./helpers/test-utils.js')
  if (testUtils.assertions && testUtils.wait && testUtils.screenshot) {
    console.log('  ✅ Test utilities exported correctly')
  } else {
    console.log('  ❌ Test utilities missing or incorrect export')
  }
} catch (error) {
  console.log(`  ❌ Test utilities validation failed: ${error.message}`)
}

// Summary
console.log('\n📋 Setup Validation Summary:')
if (missingFiles.length === 0 && missingDirs.length === 0) {
  console.log('✅ All required files and directories present')
} else {
  console.log(`❌ Missing ${missingFiles.length} files and ${missingDirs.length} directories`)
}

console.log('\n🎯 Next Steps:')
console.log('1. Install Playwright: npm install @playwright/test')
console.log('2. Install browsers: npx playwright install')
console.log('3. Run framework validation: npm run test:framework')
console.log('4. Run core tests: npm run test:core')
console.log('5. View results: npm run report')

console.log('\n✨ E2E setup validation completed!')

// Exit with appropriate code
if (missingFiles.length > 0 || missingDirs.length > 0) {
  process.exit(1)
} else {
  process.exit(0)
}