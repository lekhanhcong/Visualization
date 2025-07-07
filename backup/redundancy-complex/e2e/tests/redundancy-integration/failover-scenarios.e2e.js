/**
 * Failover Scenarios E2E Tests
 * Integration tests for redundancy failover functionality
 */

const { test, expect } = require('@playwright/test')
const { MainPage, RedundancyPage } = require('../../helpers/page-objects')
const { assertions, wait, screenshot, debug, testData } = require('../../helpers/test-utils')

test.describe('Redundancy Feature - Failover Scenarios', () => {
  let mainPage
  let redundancyPage
  let testScenarios

  test.beforeAll(async () => {
    testScenarios = testData.getScenarios()
  })

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page)
    redundancyPage = new RedundancyPage(page)

    debug.step('Setting up failover test environment')
    await mainPage.goto('/')
    await mainPage.waitForAppLoad()
    await mainPage.enableRedundancyFeature()
    await wait.forRedundancyLoad(page)
    
    debug.step('Showing redundancy overlay for testing')
    await redundancyPage.showRedundancyOverlay()
    await wait.forOverlay(page)
  })

  test('should display normal operation state initially', async ({ page }) => {
    debug.step('Verifying initial system state')
    
    const systemHealth = await redundancyPage.getSystemHealth()
    expect(systemHealth).toContain('HEALTHY')
    console.log(`✅ System health: ${systemHealth}`)

    const redundancyLevel = await redundancyPage.getRedundancyLevel()
    expect(redundancyLevel).toBeTruthy()
    console.log(`✅ Redundancy level: ${redundancyLevel}`)

    const alertCount = await redundancyPage.getAlertCount()
    expect(alertCount).toBeLessThanOrEqual(2) // Normal operation should have minimal alerts
    console.log(`✅ Alert count: ${alertCount}`)

    debug.step('Taking screenshot of normal operation')
    await screenshot.overlay(page, 'normal-operation')
  })

  test('should execute automatic failover on substation failure', async ({ page }) => {
    debug.step('Simulating substation failure')
    
    // Trigger failure by clicking primary substation and selecting fault option
    await redundancyPage.clickSubstation('e2e-sub-001')
    await page.waitForTimeout(500)

    // Look for fault simulation option (this would be implementation-specific)
    const faultButton = '[data-testid="simulate-fault-button"]'
    if (await page.isVisible(faultButton)) {
      await page.click(faultButton)
    } else {
      // Alternative: use direct API call to simulate fault
      await page.evaluate(() => {
        window.redundancyAPI?.simulateSubstationFault('e2e-sub-001')
      })
    }

    debug.step('Waiting for automatic failover to complete')
    await page.waitForTimeout(3000) // Wait for failover animation

    debug.step('Verifying failover occurred')
    const systemHealth = await redundancyPage.getSystemHealth()
    console.log(`System health after failover: ${systemHealth}`)

    // Verify backup substation is now active
    await assertions.assertAttribute(
      page,
      '[data-testid="substation-e2e-sub-002"]',
      'data-status',
      'ACTIVE',
      'Backup substation is now active'
    )

    // Verify failed substation is marked as faulted
    await assertions.assertAttribute(
      page,
      '[data-testid="substation-e2e-sub-001"]',
      'data-status',
      'FAULT',
      'Primary substation is marked as faulted'
    )

    debug.step('Taking screenshot of post-failover state')
    await screenshot.overlay(page, 'post-automatic-failover')

    debug.step('Verifying alert count increased')
    const alertCount = await redundancyPage.getAlertCount()
    expect(alertCount).toBeGreaterThan(0)
    console.log(`✅ Alerts generated: ${alertCount}`)
  })

  test('should execute manual failover', async ({ page }) => {
    debug.step('Initiating manual failover')
    
    await redundancyPage.triggerFailover('e2e-sub-001', 'e2e-sub-002')

    debug.step('Verifying manual failover completed')
    await page.waitForTimeout(2000)

    // Verify power transfer occurred
    await assertions.assertAttribute(
      page,
      '[data-testid="substation-e2e-sub-002"]',
      'data-status',
      'ACTIVE',
      'Target substation is now active'
    )

    await assertions.assertAttribute(
      page,
      '[data-testid="substation-e2e-sub-001"]',
      'data-status',
      'STANDBY',
      'Source substation is now on standby'
    )

    debug.step('Taking screenshot of manual failover result')
    await screenshot.overlay(page, 'manual-failover-result')

    debug.step('Verifying failover metrics')
    const infoPanelData = await redundancyPage.verifyInfoPanelData()
    expect(infoPanelData.systemHealth).toBeTruthy()
    console.log('✅ Manual failover completed successfully')
  })

  test('should handle multiple simultaneous failures', async ({ page }) => {
    debug.step('Simulating multiple failures scenario')
    
    // Simulate failure of primary substation
    await page.evaluate(() => {
      window.redundancyAPI?.simulateSubstationFault('e2e-sub-001')
    })

    await page.waitForTimeout(1000)

    // Simulate line failure
    await page.evaluate(() => {
      window.redundancyAPI?.simulateLineFault('e2e-line-001')
    })

    debug.step('Waiting for system response to multiple failures')
    await page.waitForTimeout(5000)

    debug.step('Verifying system degradation handling')
    const systemHealth = await redundancyPage.getSystemHealth()
    console.log(`System health with multiple failures: ${systemHealth}`)

    const alertCount = await redundancyPage.getAlertCount()
    expect(alertCount).toBeGreaterThan(1)
    console.log(`✅ Multiple alerts generated: ${alertCount}`)

    debug.step('Taking screenshot of multiple failure scenario')
    await screenshot.overlay(page, 'multiple-failures')

    debug.step('Verifying redundancy level degradation')
    const redundancyLevel = await redundancyPage.getRedundancyLevel()
    expect(redundancyLevel).toBeTruthy()
    console.log(`Degraded redundancy level: ${redundancyLevel}`)
  })

  test('should show failover timing metrics', async ({ page }) => {
    debug.step('Measuring failover performance')
    
    // Start timing measurement
    const startTime = Date.now()
    
    // Trigger failover
    await redundancyPage.triggerFailover('e2e-sub-001', 'e2e-sub-002')
    
    // Wait for completion
    await page.waitForSelector('[data-testid="failover-complete"]', { timeout: 10000 })
    
    const endTime = Date.now()
    const failoverTime = endTime - startTime

    debug.step(`Failover completed in ${failoverTime}ms`)
    expect(failoverTime).toBeLessThan(5000) // Should complete within 5 seconds
    console.log(`✅ Failover time: ${failoverTime}ms`)

    debug.step('Verifying failover timing is displayed')
    await assertions.assertVisible(
      page,
      '[data-testid="failover-timing"]',
      'Failover timing is displayed'
    )
  })

  test('should maintain power flow continuity during failover', async ({ page }) => {
    debug.step('Monitoring power flow during failover')
    
    // Verify initial power flow
    await assertions.assertVisible(
      page,
      '.rdx-power-flow-animation',
      'Initial power flow is visible'
    )

    debug.step('Initiating failover while monitoring power flow')
    await redundancyPage.triggerFailover('e2e-sub-001', 'e2e-sub-002')

    debug.step('Verifying power flow continues during transition')
    await page.waitForTimeout(1000) // Mid-failover
    
    await assertions.assertVisible(
      page,
      '.rdx-power-flow-animation',
      'Power flow maintained during failover'
    )

    debug.step('Waiting for failover completion')
    await page.waitForTimeout(2000)

    debug.step('Verifying power flow after failover')
    await assertions.assertVisible(
      page,
      '.rdx-power-flow-animation',
      'Power flow restored after failover'
    )

    debug.step('Taking screenshot of continuous power flow')
    await screenshot.element(page, '.rdx-power-flow-animation', 'continuous-power-flow')
  })

  test('should handle failover rollback scenario', async ({ page }) => {
    debug.step('Testing failover rollback capability')
    
    // Initial failover
    await redundancyPage.triggerFailover('e2e-sub-001', 'e2e-sub-002')
    await page.waitForTimeout(2000)

    debug.step('Initiating rollback to original configuration')
    await redundancyPage.triggerFailover('e2e-sub-002', 'e2e-sub-001')
    await page.waitForTimeout(2000)

    debug.step('Verifying rollback completed')
    await assertions.assertAttribute(
      page,
      '[data-testid="substation-e2e-sub-001"]',
      'data-status',
      'ACTIVE',
      'Original substation is active again'
    )

    await assertions.assertAttribute(
      page,
      '[data-testid="substation-e2e-sub-002"]',
      'data-status',
      'STANDBY',
      'Backup substation is on standby again'
    )

    debug.step('Taking screenshot of rollback state')
    await screenshot.overlay(page, 'failover-rollback')

    console.log('✅ Failover rollback completed successfully')
  })

  test('should display failover history and logs', async ({ page }) => {
    debug.step('Performing multiple failovers to generate history')
    
    // First failover
    await redundancyPage.triggerFailover('e2e-sub-001', 'e2e-sub-002')
    await page.waitForTimeout(2000)

    // Second failover (rollback)
    await redundancyPage.triggerFailover('e2e-sub-002', 'e2e-sub-001')
    await page.waitForTimeout(2000)

    debug.step('Opening settings to view failover history')
    await redundancyPage.openSettings()

    debug.step('Navigating to history tab')
    const historyTab = '[data-testid="history-tab"]'
    if (await page.isVisible(historyTab)) {
      await page.click(historyTab)
      
      debug.step('Verifying failover history is displayed')
      await assertions.assertVisible(
        page,
        '[data-testid="failover-history"]',
        'Failover history is visible'
      )

      debug.step('Verifying history entries')
      const historyEntries = await page.locator('[data-testid^="history-entry-"]').count()
      expect(historyEntries).toBeGreaterThanOrEqual(2)
      console.log(`✅ Found ${historyEntries} history entries`)

      debug.step('Taking screenshot of failover history')
      await screenshot.element(page, '[data-testid="failover-history"]', 'failover-history')
    }

    await redundancyPage.closeSettings()
  })

  test.afterEach(async ({ page }) => {
    debug.step('Failover test cleanup')
    
    // Reset system to normal state if possible
    await page.evaluate(() => {
      if (window.redundancyAPI?.resetToNormalOperation) {
        window.redundancyAPI.resetToNormalOperation()
      }
    })

    // Take screenshot if test failed
    if (test.info().status === 'failed') {
      await screenshot.fullPage(page, `failed-failover-${test.info().title}`)
    }
  })
})