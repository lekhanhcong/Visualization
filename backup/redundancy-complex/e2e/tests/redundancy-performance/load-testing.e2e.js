/**
 * Load Testing E2E Tests
 * Performance tests for redundancy feature under various loads
 */

const { test, expect } = require('@playwright/test')
const { MainPage, RedundancyPage, PerformancePage } = require('../../helpers/page-objects')
const { assertions, wait, screenshot, debug, performance } = require('../../helpers/test-utils')

test.describe('Redundancy Feature - Performance Load Testing', () => {
  let mainPage
  let redundancyPage
  let performancePage

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page)
    redundancyPage = new RedundancyPage(page)
    performancePage = new PerformancePage(page)

    debug.step('Setting up performance testing environment')
    await mainPage.goto('/')
    await mainPage.waitForAppLoad()
    await mainPage.enableRedundancyFeature()
    await wait.forRedundancyLoad(page)
  })

  test('should handle initial load performance', async ({ page }) => {
    debug.step('Measuring initial page load performance')
    
    await performancePage.startPerformanceMonitoring()
    
    const loadMetrics = await performance.measurePageLoad(page)
    expect(loadMetrics.domContentLoaded).toBeLessThan(3000) // < 3 seconds
    expect(loadMetrics.loadComplete).toBeLessThan(5000) // < 5 seconds
    
    console.log('✅ Page load performance within acceptable limits')
    
    debug.step('Measuring redundancy feature initialization')
    const redundancyMetrics = await performance.measureRedundancyPerformance(page)
    console.log('Redundancy performance metrics:', redundancyMetrics)

    await performancePage.stopPerformanceMonitoring()
  })

  test('should handle overlay rendering performance', async ({ page }) => {
    debug.step('Measuring overlay rendering performance')
    
    await performancePage.startPerformanceMonitoring()
    
    const startTime = Date.now()
    await redundancyPage.showRedundancyOverlay()
    await wait.forOverlay(page)
    const renderTime = Date.now() - startTime

    expect(renderTime).toBeLessThan(2000) // Should render within 2 seconds
    console.log(`✅ Overlay rendered in ${renderTime}ms`)

    debug.step('Measuring animation performance')
    await wait.forAnimations(page)
    
    const animationMetrics = await performance.measureRedundancyPerformance(page)
    console.log('Animation performance:', animationMetrics)

    const metrics = await performancePage.stopPerformanceMonitoring()
    expect(metrics.totalTime).toBeLessThan(3000)

    debug.step('Taking screenshot of loaded overlay')
    await screenshot.overlay(page, 'performance-overlay-loaded')
  })

  test('should handle multiple rapid interactions', async ({ page }) => {
    debug.step('Setting up for rapid interaction testing')
    
    await redundancyPage.showRedundancyOverlay()
    await wait.forOverlay(page)
    
    await performancePage.startPerformanceMonitoring()

    debug.step('Performing rapid substation clicks')
    const interactions = []
    
    for (let i = 0; i < 10; i++) {
      const startTime = Date.now()
      await redundancyPage.clickSubstation('e2e-sub-001')
      await page.waitForTimeout(100)
      await redundancyPage.clickSubstation('e2e-sub-002')
      await page.waitForTimeout(100)
      
      const interactionTime = Date.now() - startTime
      interactions.push(interactionTime)
    }

    debug.step('Analyzing interaction performance')
    const avgInteractionTime = interactions.reduce((sum, time) => sum + time, 0) / interactions.length
    expect(avgInteractionTime).toBeLessThan(500) // Each interaction should be < 500ms
    console.log(`✅ Average interaction time: ${avgInteractionTime}ms`)

    const slowInteractions = interactions.filter(time => time > 1000)
    expect(slowInteractions.length).toBeLessThan(2) // Less than 20% slow interactions
    console.log(`Slow interactions: ${slowInteractions.length}/10`)

    await performancePage.stopPerformanceMonitoring()
  })

  test('should handle memory usage during extended operation', async ({ page }) => {
    debug.step('Testing memory usage during extended operation')
    
    await redundancyPage.showRedundancyOverlay()
    await wait.forOverlay(page)

    debug.step('Taking initial memory measurement')
    const initialMemory = await performance.checkMemory(page)
    
    debug.step('Performing extended operations')
    for (let i = 0; i < 50; i++) {
      // Simulate various interactions
      await redundancyPage.clickSubstation('e2e-sub-001')
      await page.waitForTimeout(50)
      await redundancyPage.hoverLine('e2e-line-001')
      await page.waitForTimeout(50)
      
      if (i % 10 === 0) {
        await redundancyPage.hideRedundancyOverlay()
        await wait.forOverlayHidden(page)
        await redundancyPage.showRedundancyOverlay()
        await wait.forOverlay(page)
      }
    }

    debug.step('Taking final memory measurement')
    const finalMemory = await performance.checkMemory(page)
    
    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize
      const memoryIncreasePercent = (memoryIncrease / initialMemory.usedJSHeapSize) * 100
      
      expect(memoryIncreasePercent).toBeLessThan(50) // Memory shouldn't increase by more than 50%
      console.log(`✅ Memory increase: ${memoryIncreasePercent.toFixed(1)}%`)
    }
  })

  test('should handle large dataset rendering', async ({ page }) => {
    debug.step('Testing with large dataset')
    
    // Inject large dataset
    await page.evaluate(() => {
      const largeDataset = {
        substations: Array.from({ length: 50 }, (_, i) => ({
          id: `perf-sub-${i}`,
          name: `Performance Test Station ${i}`,
          status: 'ACTIVE',
          position: { x: (i % 10) * 100, y: Math.floor(i / 10) * 100 },
          powerRating: 500
        })),
        lines: Array.from({ length: 100 }, (_, i) => ({
          id: `perf-line-${i}`,
          name: `Performance Test Line ${i}`,
          status: 'ACTIVE',
          path: [
            { x: (i % 10) * 100, y: Math.floor(i / 10) * 100 },
            { x: ((i + 1) % 10) * 100, y: Math.floor((i + 1) / 10) * 100 }
          ],
          powerFlow: 300,
          capacity: 500
        }))
      }
      
      if (window.redundancyAPI?.setTestData) {
        window.redundancyAPI.setTestData(largeDataset)
      }
    })

    await performancePage.startPerformanceMonitoring()

    debug.step('Rendering large dataset')
    const startTime = Date.now()
    await redundancyPage.showRedundancyOverlay()
    await wait.forOverlay(page)
    const renderTime = Date.now() - startTime

    expect(renderTime).toBeLessThan(5000) // Should render within 5 seconds even with large dataset
    console.log(`✅ Large dataset rendered in ${renderTime}ms`)

    debug.step('Verifying all elements are rendered')
    const substationCount = await redundancyPage.getSubstationCount()
    const lineCount = await redundancyPage.getLineCount()
    
    console.log(`Rendered ${substationCount} substations and ${lineCount} lines`)
    expect(substationCount).toBeGreaterThan(30) // Should render most substations
    expect(lineCount).toBeGreaterThan(50) // Should render most lines

    const metrics = await performancePage.stopPerformanceMonitoring()
    console.log('Large dataset rendering metrics:', metrics)

    debug.step('Taking screenshot of large dataset')
    await screenshot.overlay(page, 'large-dataset-rendering')
  })

  test('should handle concurrent animations smoothly', async ({ page }) => {
    debug.step('Testing concurrent animation performance')
    
    await redundancyPage.showRedundancyOverlay()
    await wait.forOverlay(page)

    debug.step('Starting performance monitoring for animations')
    await performancePage.startPerformanceMonitoring()

    debug.step('Triggering multiple animations simultaneously')
    await page.evaluate(() => {
      // Trigger multiple power flow animations
      const animations = document.querySelectorAll('.rdx-power-flow-animation')
      animations.forEach((anim, index) => {
        anim.style.animationDelay = `${index * 100}ms`
        anim.classList.add('rdx-animation-active')
      })
      
      // Trigger pulse animations on substations
      const substations = document.querySelectorAll('.rdx-substation-marker')
      substations.forEach((sub, index) => {
        setTimeout(() => {
          sub.classList.add('rdx-pulse-animation')
        }, index * 50)
      })
    })

    debug.step('Measuring animation frame rate')
    await page.waitForTimeout(5000) // Let animations run for 5 seconds
    
    const animationMetrics = await performance.measureRedundancyPerformance(page)
    console.log('Concurrent animation metrics:', animationMetrics)

    debug.step('Checking for dropped frames')
    const frameRate = await page.evaluate(() => {
      // Simple frame rate measurement
      let frameCount = 0
      let lastTime = performance.now()
      
      return new Promise(resolve => {
        function countFrames() {
          const now = performance.now()
          if (now - lastTime >= 1000) {
            resolve(frameCount)
          } else {
            frameCount++
            requestAnimationFrame(countFrames)
          }
        }
        requestAnimationFrame(countFrames)
      })
    })

    expect(frameRate).toBeGreaterThan(30) // Should maintain at least 30 FPS
    console.log(`✅ Animation frame rate: ${frameRate} FPS`)

    await performancePage.stopPerformanceMonitoring()
  })

  test('should handle stress test with rapid show/hide cycles', async ({ page }) => {
    debug.step('Running stress test with rapid show/hide cycles')
    
    await performancePage.startPerformanceMonitoring()
    
    const cycles = 20
    const timings = []

    for (let i = 0; i < cycles; i++) {
      const cycleStart = Date.now()
      
      debug.step(`Cycle ${i + 1}/${cycles}: Showing overlay`)
      await redundancyPage.showRedundancyOverlay()
      await wait.forOverlay(page)
      
      debug.step(`Cycle ${i + 1}/${cycles}: Hiding overlay`)
      await redundancyPage.hideRedundancyOverlay()
      await wait.forOverlayHidden(page)
      
      const cycleTime = Date.now() - cycleStart
      timings.push(cycleTime)
      
      // Brief pause between cycles
      await page.waitForTimeout(100)
    }

    debug.step('Analyzing stress test results')
    const avgCycleTime = timings.reduce((sum, time) => sum + time, 0) / timings.length
    const maxCycleTime = Math.max(...timings)
    const minCycleTime = Math.min(...timings)

    expect(avgCycleTime).toBeLessThan(3000) // Average cycle should be < 3 seconds
    expect(maxCycleTime).toBeLessThan(5000) // No cycle should take > 5 seconds
    
    console.log(`✅ Stress test completed:`)
    console.log(`  Average cycle time: ${avgCycleTime}ms`)
    console.log(`  Min/Max cycle time: ${minCycleTime}ms / ${maxCycleTime}ms`)

    const finalMetrics = await performancePage.stopPerformanceMonitoring()
    console.log('Stress test metrics:', finalMetrics)

    // Check for memory leaks
    const finalMemory = await performance.checkMemory(page)
    if (finalMemory) {
      console.log(`Final memory usage: ${Math.round(finalMemory.usedJSHeapSize / 1024 / 1024)}MB`)
    }
  })

  test.afterEach(async ({ page }) => {
    debug.step('Performance test cleanup')
    
    // Reset any test data
    await page.evaluate(() => {
      if (window.redundancyAPI?.resetTestData) {
        window.redundancyAPI.resetTestData()
      }
    })

    // Take screenshot if test failed
    if (test.info().status === 'failed') {
      await screenshot.fullPage(page, `failed-performance-${test.info().title}`)
      
      // Save performance data for debugging
      const performanceData = await performance.measureRedundancyPerformance(page)
      console.log('Performance data at failure:', performanceData)
    }
  })
})