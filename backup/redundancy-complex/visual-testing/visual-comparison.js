/**
 * Visual Comparison Engine
 * Compares actual screenshots with baseline images
 */

const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs').promises
const pixelmatch = require('pixelmatch')
const PNG = require('pngjs').PNG
const visualConfig = require('./config/visual-config')

/**
 * Run visual regression tests
 */
async function runVisualTests() {
  console.log('🔍 Starting visual regression testing...')
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  })
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
    details: [],
    timestamp: new Date().toISOString()
  }
  
  try {
    // Ensure directories exist
    await ensureDirectories()
    
    // Run tests for each browser
    for (const [browserName, browserConfig] of Object.entries(visualConfig.playwright.browsers)) {
      console.log(`🌐 Testing ${browserName}...`)
      const browserResults = await testBrowser(browser, browserName, browserConfig)
      mergeResults(results, browserResults)
    }
    
    // Run mobile tests
    for (const [deviceName, deviceConfig] of Object.entries(visualConfig.playwright.mobile)) {
      console.log(`📱 Testing ${deviceName}...`)
      const mobileResults = await testMobileDevice(browser, deviceName, deviceConfig)
      mergeResults(results, mobileResults)
    }
    
    // Generate reports
    await generateReports(results)
    
    console.log(`✅ Visual testing completed: ${results.passed}/${results.total} passed`)
    
    if (results.failed > 0) {
      console.log(`❌ ${results.failed} tests failed`)
      if (visualConfig.ci.failOnDifference) {
        throw new Error(`Visual regression detected: ${results.failed} failed tests`)
      }
    }
    
    return results
    
  } catch (error) {
    console.error('❌ Error running visual tests:', error)
    throw error
  } finally {
    await browser.close()
  }
}

/**
 * Test a specific browser
 */
async function testBrowser(browser, browserName, browserConfig) {
  const context = await browser.newContext({
    viewport: browserConfig.viewport,
    deviceScaleFactor: browserConfig.deviceScaleFactor || 1,
    hasTouch: browserConfig.hasTouch || false,
    isMobile: browserConfig.isMobile || false
  })
  
  const page = await context.newPage()
  const results = { passed: 0, failed: 0, total: 0, details: [] }
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    // Test all scenario categories
    const categories = ['components', 'interactions', 'states', 'animations']
    
    for (const category of categories) {
      const scenarios = visualConfig.scenarios[category]
      for (const [scenarioName, scenario] of Object.entries(scenarios)) {
        const testResult = await testScenario(
          page, 
          scenarioName, 
          scenario, 
          `${browserName}-${browserConfig.viewport.width}x${browserConfig.viewport.height}`
        )
        
        results.details.push(testResult)
        results.total++
        
        if (testResult.passed) {
          results.passed++
        } else {
          results.failed++
        }
      }
    }
    
  } finally {
    await context.close()
  }
  
  return results
}

/**
 * Test mobile device
 */
async function testMobileDevice(browser, deviceName, deviceConfig) {
  const context = await browser.newContext({
    viewport: deviceConfig.viewport,
    deviceScaleFactor: deviceConfig.deviceScaleFactor,
    hasTouch: deviceConfig.hasTouch,
    isMobile: deviceConfig.isMobile
  })
  
  const page = await context.newPage()
  const results = { passed: 0, failed: 0, total: 0, details: [] }
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    // Test responsive scenarios
    const scenarios = visualConfig.scenarios.responsive
    for (const [scenarioName, scenario] of Object.entries(scenarios)) {
      const testResult = await testScenario(
        page, 
        scenarioName, 
        scenario, 
        `${deviceName}-${deviceConfig.viewport.width}x${deviceConfig.viewport.height}`
      )
      
      results.details.push(testResult)
      results.total++
      
      if (testResult.passed) {
        results.passed++
      } else {
        results.failed++
      }
    }
    
  } finally {
    await context.close()
  }
  
  return results
}

/**
 * Test individual scenario
 */
async function testScenario(page, scenarioName, scenario, browserSuffix) {
  const result = {
    scenario: scenarioName,
    description: scenario.description,
    browser: browserSuffix,
    passed: false,
    diffPixels: 0,
    threshold: visualConfig.playwright.expect.threshold,
    actualPath: null,
    baselinePath: null,
    diffPath: null,
    error: null,
    timestamp: new Date().toISOString()
  }
  
  try {
    console.log(`    🔍 Testing ${scenarioName}...`)
    
    // Execute scenario actions
    await executeScenarioActions(page, scenario.actions)
    
    // Wait for elements
    if (scenario.waitFor) {
      await page.waitForSelector(scenario.waitFor, { timeout: 10000 })
    }
    
    await page.waitForTimeout(1000)
    
    // Set viewport if specified
    if (scenario.viewport) {
      await page.setViewportSize(scenario.viewport)
      await page.waitForTimeout(500)
    }
    
    // Take actual screenshot
    const filename = `${scenarioName}-${browserSuffix}.png`
    const actualPath = path.join(visualConfig.directories.actual, filename)
    const baselinePath = path.join(visualConfig.directories.baseline, filename)
    const diffPath = path.join(visualConfig.directories.diff, filename)
    
    result.actualPath = actualPath
    result.baselinePath = baselinePath
    result.diffPath = diffPath
    
    await page.screenshot({
      path: actualPath,
      fullPage: visualConfig.playwright.screenshot.mode === 'fullPage',
      animations: visualConfig.playwright.screenshot.animations,
      caret: visualConfig.playwright.screenshot.caret,
      scale: visualConfig.playwright.screenshot.scale,
      quality: visualConfig.playwright.screenshot.quality
    })
    
    // Compare with baseline
    const comparisonResult = await compareImages(baselinePath, actualPath, diffPath)
    
    result.diffPixels = comparisonResult.diffPixels
    result.passed = comparisonResult.diffPixels <= visualConfig.playwright.expect.maxDiffPixels &&
                   comparisonResult.diffPercent <= visualConfig.playwright.expect.threshold
    
    if (result.passed) {
      console.log(`    ✅ ${scenarioName} passed`)
      // Clean up diff file if test passed
      try {
        await fs.unlink(diffPath)
      } catch (error) {
        // Ignore cleanup errors
      }
    } else {
      console.log(`    ❌ ${scenarioName} failed (${comparisonResult.diffPixels} pixels, ${comparisonResult.diffPercent.toFixed(2)}%)`)
    }
    
  } catch (error) {
    result.error = error.message
    result.passed = false
    console.error(`    ❌ ${scenarioName} error:`, error.message)
  }
  
  return result
}

/**
 * Compare two images and generate diff
 */
async function compareImages(baselinePath, actualPath, diffPath) {
  try {
    // Check if baseline exists
    try {
      await fs.access(baselinePath)
    } catch (error) {
      throw new Error(`Baseline image not found: ${baselinePath}`)
    }
    
    // Load images
    const baseline = PNG.sync.read(await fs.readFile(baselinePath))
    const actual = PNG.sync.read(await fs.readFile(actualPath))
    
    // Check dimensions match
    if (baseline.width !== actual.width || baseline.height !== actual.height) {
      throw new Error(`Image dimensions don't match: baseline(${baseline.width}x${baseline.height}) vs actual(${actual.width}x${actual.height})`)
    }
    
    // Create diff image
    const diff = new PNG({ width: baseline.width, height: baseline.height })
    
    // Compare pixels
    const diffPixels = pixelmatch(
      baseline.data,
      actual.data,
      diff.data,
      baseline.width,
      baseline.height,
      {
        threshold: visualConfig.diff.options.threshold,
        includeAA: visualConfig.diff.options.includeAA,
        alpha: visualConfig.diff.options.alpha,
        aaColor: visualConfig.diff.options.aaColor,
        diffColor: visualConfig.diff.options.diffColor,
        diffColorAlt: visualConfig.diff.options.diffColorAlt
      }
    )
    
    const totalPixels = baseline.width * baseline.height
    const diffPercent = (diffPixels / totalPixels) * 100
    
    // Save diff image if there are differences
    if (diffPixels > 0) {
      await fs.writeFile(diffPath, PNG.sync.write(diff))
    }
    
    return {
      diffPixels,
      diffPercent,
      totalPixels
    }
    
  } catch (error) {
    throw new Error(`Image comparison failed: ${error.message}`)
  }
}

/**
 * Execute scenario actions (copied from baseline-generator.js)
 */
async function executeScenarioActions(page, actions) {
  if (!actions || !Array.isArray(actions)) return
  
  for (const action of actions) {
    try {
      await executeAction(page, action)
      await page.waitForTimeout(200)
    } catch (error) {
      console.warn(`    ⚠️ Action ${action} failed:`, error.message)
    }
  }
}

/**
 * Execute individual action (copied from baseline-generator.js)
 */
async function executeAction(page, action) {
  const [actionType, actionParam] = action.split(':')
  
  switch (actionType) {
    case 'showRedundancyOverlay':
      await page.evaluate(() => {
        window.localStorage.setItem('redundancy-enabled', 'true')
      })
      await page.reload({ waitUntil: 'networkidle' })
      break
      
    case 'openInfoPanel':
      await page.click('.rdx-redundancy-button')
      break
      
    case 'hoverSubstation':
      await page.hover(`[data-substation-id="${actionParam}"]`)
      break
      
    case 'clickSubstation':
      await page.click(`[data-substation-id="${actionParam}"]`)
      break
      
    case 'hoverLine':
      await page.hover(`[data-line-id="${actionParam}"]`)
      break
      
    case 'setSystemState':
      await page.evaluate((state) => {
        window.dispatchEvent(new CustomEvent('redundancy-state-change', {
          detail: { systemState: state }
        }))
      }, actionParam)
      break
      
    case 'disableAnimations':
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
          .rdx-animation {
            animation: none !important;
          }
        `
      })
      break
      
    case 'triggerPulse':
      await page.evaluate((substationId) => {
        const element = document.querySelector(`[data-substation-id="${substationId}"]`)
        if (element) {
          element.classList.add('rdx-pulse')
        }
      }, actionParam)
      break
      
    default:
      console.warn(`Unknown action: ${action}`)
  }
}

/**
 * Ensure all directories exist
 */
async function ensureDirectories() {
  const dirs = [
    visualConfig.directories.actual,
    visualConfig.directories.diff,
    visualConfig.directories.reports
  ]
  
  for (const dir of dirs) {
    try {
      await fs.access(dir)
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(dir, { recursive: true })
      }
    }
  }
}

/**
 * Merge test results
 */
function mergeResults(mainResults, newResults) {
  mainResults.passed += newResults.passed
  mainResults.failed += newResults.failed
  mainResults.total += newResults.total
  mainResults.details.push(...newResults.details)
}

/**
 * Generate test reports
 */
async function generateReports(results) {
  console.log('📊 Generating test reports...')
  
  // HTML Report
  await generateHTMLReport(results)
  
  // JSON Report
  await generateJSONReport(results)
  
  // JUnit XML Report
  await generateJUnitReport(results)
}

/**
 * Generate HTML report
 */
async function generateHTMLReport(results) {
  const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${visualConfig.reporting.html.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { display: flex; gap: 20px; margin-bottom: 30px; }
        .stat { text-align: center; padding: 20px; border-radius: 5px; flex: 1; }
        .stat.passed { background: #d4edda; color: #155724; }
        .stat.failed { background: #f8d7da; color: #721c24; }
        .stat.total { background: #d1ecf1; color: #0c5460; }
        .test-result { border: 1px solid #ddd; margin: 10px 0; border-radius: 5px; overflow: hidden; }
        .test-header { padding: 15px; background: #f8f9fa; cursor: pointer; }
        .test-header.passed { background: #d4edda; }
        .test-header.failed { background: #f8d7da; }
        .test-details { padding: 15px; display: none; }
        .test-details.show { display: block; }
        .image-comparison { display: flex; gap: 10px; margin: 20px 0; }
        .image-box { flex: 1; text-align: center; }
        .image-box img { max-width: 100%; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${visualConfig.reporting.html.title}</h1>
        <p>Generated on: ${results.timestamp}</p>
    </div>
    
    <div class="summary">
        <div class="stat passed">
            <h3>${results.passed}</h3>
            <p>Passed</p>
        </div>
        <div class="stat failed">
            <h3>${results.failed}</h3>
            <p>Failed</p>
        </div>
        <div class="stat total">
            <h3>${results.total}</h3>
            <p>Total</p>
        </div>
    </div>
    
    <div class="results">
        ${results.details.map((result, index) => `
            <div class="test-result">
                <div class="test-header ${result.passed ? 'passed' : 'failed'}" onclick="toggleDetails(${index})">
                    <strong>${result.scenario}</strong> (${result.browser})
                    <span style="float: right;">${result.passed ? '✅ PASSED' : '❌ FAILED'}</span>
                    <br>
                    <small>${result.description}</small>
                    ${!result.passed ? `<br><small>Diff: ${result.diffPixels} pixels</small>` : ''}
                </div>
                <div class="test-details" id="details-${index}">
                    ${result.error ? `<p><strong>Error:</strong> ${result.error}</p>` : ''}
                    ${!result.passed && !result.error ? `
                        <div class="image-comparison">
                            <div class="image-box">
                                <h4>Baseline</h4>
                                <img src="${path.relative(visualConfig.directories.reports, result.baselinePath)}" alt="Baseline">
                            </div>
                            <div class="image-box">
                                <h4>Actual</h4>
                                <img src="${path.relative(visualConfig.directories.reports, result.actualPath)}" alt="Actual">
                            </div>
                            <div class="image-box">
                                <h4>Diff</h4>
                                <img src="${path.relative(visualConfig.directories.reports, result.diffPath)}" alt="Diff">
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('')}
    </div>
    
    <script>
        function toggleDetails(index) {
            const details = document.getElementById('details-' + index);
            details.classList.toggle('show');
        }
    </script>
</body>
</html>
  `
  
  await fs.writeFile(visualConfig.reporting.html.outputPath, template)
  console.log(`📄 HTML report: ${visualConfig.reporting.html.outputPath}`)
}

/**
 * Generate JSON report
 */
async function generateJSONReport(results) {
  const jsonReport = {
    ...results,
    config: {
      threshold: visualConfig.playwright.expect.threshold,
      maxDiffPixels: visualConfig.playwright.expect.maxDiffPixels
    }
  }
  
  await fs.writeFile(
    visualConfig.reporting.json.outputPath, 
    JSON.stringify(jsonReport, null, 2)
  )
  console.log(`📄 JSON report: ${visualConfig.reporting.json.outputPath}`)
}

/**
 * Generate JUnit XML report
 */
async function generateJUnitReport(results) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="${visualConfig.reporting.junit.suiteName}" 
           tests="${results.total}" 
           failures="${results.failed}" 
           time="0" 
           timestamp="${results.timestamp}">
  ${results.details.map(result => `
  <testcase name="${result.scenario}" classname="${result.browser}" time="0">
    ${!result.passed ? `
    <failure message="Visual regression detected">
      ${result.error || `Diff: ${result.diffPixels} pixels`}
    </failure>
    ` : ''}
  </testcase>
  `).join('')}
</testsuite>`
  
  await fs.writeFile(visualConfig.reporting.junit.outputPath, xml)
  console.log(`📄 JUnit report: ${visualConfig.reporting.junit.outputPath}`)
}

// CLI interface
if (require.main === module) {
  runVisualTests()
    .then(results => {
      if (results.failed > 0) {
        process.exit(1)
      } else {
        process.exit(0)
      }
    })
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = {
  runVisualTests,
  compareImages
}