/**
 * Baseline Image Generator
 * Generates baseline screenshots for visual regression testing
 */

const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs').promises
const visualConfig = require('./config/visual-config')

/**
 * Generate baseline images for all test scenarios
 */
async function generateBaselines() {
  console.log('🎨 Starting baseline image generation...')
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  })
  
  try {
    // Ensure baseline directory exists
    await ensureDirectory(visualConfig.directories.baseline)
    
    // Generate baselines for each browser
    for (const [browserName, browserConfig] of Object.entries(visualConfig.playwright.browsers)) {
      console.log(`📱 Generating baselines for ${browserName}...`)
      await generateBrowserBaselines(browser, browserName, browserConfig)
    }
    
    // Generate mobile baselines
    for (const [deviceName, deviceConfig] of Object.entries(visualConfig.playwright.mobile)) {
      console.log(`📱 Generating baselines for ${deviceName}...`)
      await generateMobileBaselines(browser, deviceName, deviceConfig)
    }
    
    console.log('✅ Baseline generation completed successfully!')
    
  } catch (error) {
    console.error('❌ Error generating baselines:', error)
    throw error
  } finally {
    await browser.close()
  }
}

/**
 * Generate baselines for a specific browser
 */
async function generateBrowserBaselines(browser, browserName, browserConfig) {
  const context = await browser.newContext({
    viewport: browserConfig.viewport,
    deviceScaleFactor: browserConfig.deviceScaleFactor || 1,
    hasTouch: browserConfig.hasTouch || false,
    isMobile: browserConfig.isMobile || false
  })
  
  const page = await context.newPage()
  
  try {
    // Navigate to test app
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    // Generate baselines for each scenario category
    await generateComponentBaselines(page, browserName, browserConfig.viewport)
    await generateInteractionBaselines(page, browserName, browserConfig.viewport)
    await generateStateBaselines(page, browserName, browserConfig.viewport)
    await generateAnimationBaselines(page, browserName, browserConfig.viewport)
    
  } finally {
    await context.close()
  }
}

/**
 * Generate baselines for mobile devices
 */
async function generateMobileBaselines(browser, deviceName, deviceConfig) {
  const context = await browser.newContext({
    viewport: deviceConfig.viewport,
    deviceScaleFactor: deviceConfig.deviceScaleFactor,
    hasTouch: deviceConfig.hasTouch,
    isMobile: deviceConfig.isMobile
  })
  
  const page = await context.newPage()
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    // Generate responsive baselines
    const scenarios = visualConfig.scenarios.responsive
    for (const [scenarioName, scenario] of Object.entries(scenarios)) {
      await generateScenarioBaseline(
        page, 
        scenarioName, 
        scenario, 
        `${deviceName}-${deviceConfig.viewport.width}x${deviceConfig.viewport.height}`
      )
    }
    
  } finally {
    await context.close()
  }
}

/**
 * Generate component baselines
 */
async function generateComponentBaselines(page, browserName, viewport) {
  console.log(`  📦 Generating component baselines for ${browserName}...`)
  
  const scenarios = visualConfig.scenarios.components
  for (const [scenarioName, scenario] of Object.entries(scenarios)) {
    await generateScenarioBaseline(
      page, 
      scenarioName, 
      scenario, 
      `${browserName}-${viewport.width}x${viewport.height}`
    )
  }
}

/**
 * Generate interaction baselines
 */
async function generateInteractionBaselines(page, browserName, viewport) {
  console.log(`  🖱️ Generating interaction baselines for ${browserName}...`)
  
  const scenarios = visualConfig.scenarios.interactions
  for (const [scenarioName, scenario] of Object.entries(scenarios)) {
    await generateScenarioBaseline(
      page, 
      scenarioName, 
      scenario, 
      `${browserName}-${viewport.width}x${viewport.height}`
    )
  }
}

/**
 * Generate state baselines
 */
async function generateStateBaselines(page, browserName, viewport) {
  console.log(`  ⚡ Generating state baselines for ${browserName}...`)
  
  const scenarios = visualConfig.scenarios.states
  for (const [scenarioName, scenario] of Object.entries(scenarios)) {
    await generateScenarioBaseline(
      page, 
      scenarioName, 
      scenario, 
      `${browserName}-${viewport.width}x${viewport.height}`
    )
  }
}

/**
 * Generate animation baselines (static)
 */
async function generateAnimationBaselines(page, browserName, viewport) {
  console.log(`  🎬 Generating animation baselines for ${browserName}...`)
  
  const scenarios = visualConfig.scenarios.animations
  for (const [scenarioName, scenario] of Object.entries(scenarios)) {
    await generateScenarioBaseline(
      page, 
      scenarioName, 
      scenario, 
      `${browserName}-${viewport.width}x${viewport.height}`
    )
  }
}

/**
 * Generate baseline for a specific scenario
 */
async function generateScenarioBaseline(page, scenarioName, scenario, browserSuffix) {
  try {
    console.log(`    📸 Capturing ${scenarioName}...`)
    
    // Execute scenario actions
    await executeScenarioActions(page, scenario.actions)
    
    // Wait for elements to be ready
    if (scenario.waitFor) {
      await page.waitForSelector(scenario.waitFor, { timeout: 10000 })
    }
    
    // Additional wait for animations to settle
    await page.waitForTimeout(1000)
    
    // Take screenshot with scenario-specific viewport if provided
    if (scenario.viewport) {
      await page.setViewportSize(scenario.viewport)
      await page.waitForTimeout(500) // Wait for resize
    }
    
    const filename = `${scenarioName}-${browserSuffix}.png`
    const filepath = path.join(visualConfig.directories.baseline, filename)
    
    await page.screenshot({
      path: filepath,
      fullPage: visualConfig.playwright.screenshot.mode === 'fullPage',
      animations: visualConfig.playwright.screenshot.animations,
      caret: visualConfig.playwright.screenshot.caret,
      scale: visualConfig.playwright.screenshot.scale,
      quality: visualConfig.playwright.screenshot.quality
    })
    
    console.log(`    ✅ Generated ${filename}`)
    
  } catch (error) {
    console.error(`    ❌ Failed to generate ${scenarioName}:`, error.message)
    // Continue with other scenarios
  }
}

/**
 * Execute scenario actions
 */
async function executeScenarioActions(page, actions) {
  if (!actions || !Array.isArray(actions)) return
  
  for (const action of actions) {
    try {
      await executeAction(page, action)
      await page.waitForTimeout(200) // Small delay between actions
    } catch (error) {
      console.warn(`    ⚠️ Action ${action} failed:`, error.message)
    }
  }
}

/**
 * Execute individual action
 */
async function executeAction(page, action) {
  const [actionType, actionParam] = action.split(':')
  
  switch (actionType) {
    case 'showRedundancyOverlay':
      // Enable redundancy feature
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
 * Ensure directory exists
 */
async function ensureDirectory(dirPath) {
  try {
    await fs.access(dirPath)
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dirPath, { recursive: true })
      console.log(`📁 Created directory: ${dirPath}`)
    } else {
      throw error
    }
  }
}

/**
 * Clean existing baselines
 */
async function cleanBaselines() {
  console.log('🧹 Cleaning existing baselines...')
  
  try {
    const baselineDir = visualConfig.directories.baseline
    const files = await fs.readdir(baselineDir)
    
    for (const file of files) {
      if (file.endsWith('.png')) {
        await fs.unlink(path.join(baselineDir, file))
      }
    }
    
    console.log(`✅ Cleaned ${files.length} baseline files`)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('❌ Error cleaning baselines:', error)
    }
  }
}

/**
 * Generate manifest file
 */
async function generateManifest() {
  console.log('📋 Generating baseline manifest...')
  
  const baselineDir = visualConfig.directories.baseline
  const files = await fs.readdir(baselineDir)
  const pngFiles = files.filter(file => file.endsWith('.png'))
  
  const manifest = {
    generatedAt: new Date().toISOString(),
    totalImages: pngFiles.length,
    images: pngFiles.map(file => ({
      filename: file,
      path: path.join(baselineDir, file),
      size: null // Will be populated below
    }))
  }
  
  // Get file sizes
  for (const image of manifest.images) {
    try {
      const stats = await fs.stat(image.path)
      image.size = stats.size
    } catch (error) {
      image.size = 0
    }
  }
  
  const manifestPath = path.join(baselineDir, 'manifest.json')
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
  
  console.log(`✅ Generated manifest with ${manifest.totalImages} images`)
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2]
  
  switch (command) {
    case 'clean':
      cleanBaselines()
        .then(() => process.exit(0))
        .catch(error => {
          console.error(error)
          process.exit(1)
        })
      break
      
    case 'generate':
    default:
      generateBaselines()
        .then(() => generateManifest())
        .then(() => {
          console.log('🎉 Baseline generation complete!')
          process.exit(0)
        })
        .catch(error => {
          console.error(error)
          process.exit(1)
        })
  }
}

module.exports = {
  generateBaselines,
  cleanBaselines,
  generateManifest
}